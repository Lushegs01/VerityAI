import type { Context } from 'hono'
import { and, eq, sql } from 'drizzle-orm'
import { getDb } from './queries/connection'
import { users, walletTransactions } from '../db/schema'
import { verifyTransaction, verifyWebhookSignature } from './lib/squad-client'

/**
 * Hono handler for Squad webhook deliveries.
 *
 * - Verifies the HMAC-SHA512 signature in `x-squad-encrypted-body` against the
 *   raw request body using SQUAD_SECRET_KEY.
 * - Looks up the pending walletTransactions row by reference.
 * - Calls Squad's verify endpoint independently to confirm the charge.
 * - Credits the wallet (idempotent — no-op if already completed).
 *
 * Always returns 200 once authenticated so Squad doesn't redeliver indefinitely
 * for processing errors; we log + alert internally instead.
 */
export async function squadWebhookHandler(c: Context) {
  const rawBody = await c.req.text()
  const signature =
    c.req.header('x-squad-encrypted-body') ??
    c.req.header('X-Squad-Encrypted-Body') ??
    ''

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('[squad:webhook] invalid signature')
    return c.json({ error: 'invalid signature' }, 401)
  }

  let payload: {
    Event?: string
    TransactionRef?: string
    Body?: {
      transaction_ref?: string
      transaction_status?: string
      amount?: string | number
    }
    // Some Squad webhook flavours flatten the body.
    transaction_ref?: string
    transaction_status?: string
  }
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return c.json({ error: 'invalid json' }, 400)
  }

  const reference =
    payload.TransactionRef ??
    payload.Body?.transaction_ref ??
    payload.transaction_ref
  const statusFromPayload =
    payload.Body?.transaction_status ?? payload.transaction_status ?? ''

  if (!reference) {
    console.warn('[squad:webhook] missing transaction reference', payload)
    return c.json({ ok: true })
  }

  const db = getDb()

  // Look up by reference in metadata JSON column.
  const rows = await db
    .select()
    .from(walletTransactions)
    .where(
      sql`JSON_UNQUOTE(JSON_EXTRACT(${walletTransactions.metadata}, '$.reference')) = ${reference}`,
    )
    .limit(1)
  const tx = rows[0]

  if (!tx) {
    console.warn('[squad:webhook] no transaction found for ref', reference)
    return c.json({ ok: true })
  }

  // Idempotent — already settled.
  if (tx.status === 'completed' || tx.status === 'failed') {
    return c.json({ ok: true, status: tx.status })
  }

  // Independently verify with Squad (don't trust the webhook payload alone).
  let succeeded = false
  let amountKobo = 0
  try {
    const verified = await verifyTransaction(reference)
    succeeded = verified.succeeded
    amountKobo = verified.amountKobo
  } catch (e) {
    // If we can't verify but the payload says success, fail soft — let the
    // user-driven confirmSquadTopup path settle it instead.
    const message = e instanceof Error ? e.message : String(e)
    console.error('[squad:webhook] verify failed', message)
    return c.json({ ok: true, status: 'pending' })
  }

  const expectedKobo = Math.round(Number(tx.amount) * 100)

  if (!succeeded || statusFromPayload.toLowerCase() === 'failed') {
    await db
      .update(walletTransactions)
      .set({ status: 'failed' })
      .where(eq(walletTransactions.id, tx.id))
    return c.json({ ok: true, status: 'failed' })
  }

  if (amountKobo !== expectedKobo) {
    await db
      .update(walletTransactions)
      .set({ status: 'failed' })
      .where(eq(walletTransactions.id, tx.id))
    console.warn('[squad:webhook] amount mismatch', { reference, expectedKobo, amountKobo })
    return c.json({ ok: true, status: 'failed' })
  }

  // Credit the wallet. Re-read the user to avoid stale balance under races.
  const [userRow] = await db
    .select({ id: users.id, walletBalance: users.walletBalance })
    .from(users)
    .where(eq(users.id, tx.employerId))
    .limit(1)

  if (!userRow) {
    console.error('[squad:webhook] user not found for tx', tx.id)
    return c.json({ ok: true })
  }

  const balanceBefore = Number(userRow.walletBalance)
  const amount = Number(tx.amount)
  const balanceAfter = balanceBefore + amount

  await db
    .update(users)
    .set({ walletBalance: balanceAfter.toFixed(2), updatedAt: new Date() })
    .where(eq(users.id, tx.employerId))

  await db
    .update(walletTransactions)
    .set({
      status: 'completed',
      balanceBefore: balanceBefore.toFixed(2),
      balanceAfter: balanceAfter.toFixed(2),
      description: 'Wallet top-up via Squad',
    })
    .where(and(eq(walletTransactions.id, tx.id), eq(walletTransactions.status, 'pending')))

  return c.json({ ok: true, status: 'completed', reference })
}
