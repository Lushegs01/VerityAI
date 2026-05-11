import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { nanoid } from 'nanoid'
import { and, desc, eq, sql } from 'drizzle-orm'
import { createRouter, authedQuery, publicQuery } from './middleware'
import { getDb } from './queries/connection'
import { users, walletTransactions } from '../db/schema'
import { env } from './lib/env'
import {
  getSquadPublicKey,
  initiateTransaction,
  isSquadConfigured,
  verifyTransaction,
} from './lib/squad-client'

/**
 * Find a wallet transaction by its Squad reference for a specific user.
 * Uses MySQL's JSON_EXTRACT since the reference lives inside the `metadata`
 * JSON column.
 */
async function findTransactionByReference(
  employerId: number,
  reference: string,
) {
  const db = getDb()
  const rows = await db
    .select()
    .from(walletTransactions)
    .where(
      and(
        eq(walletTransactions.employerId, employerId),
        sql`JSON_UNQUOTE(JSON_EXTRACT(${walletTransactions.metadata}, '$.reference')) = ${reference}`,
      ),
    )
    .limit(1)
  return rows[0] ?? null
}

export const walletRouter = createRouter({
  balance: authedQuery.query(async ({ ctx }) => {
    return { balance: Number(ctx.user.walletBalance) }
  }),

  transactions: authedQuery
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb()
      const limit = input?.limit || 20

      return db
        .select()
        .from(walletTransactions)
        .where(eq(walletTransactions.employerId, ctx.user.id))
        .orderBy(desc(walletTransactions.createdAt))
        .limit(limit)
    }),

  /**
   * Returns the public Squad configuration so the frontend can decide whether
   * to mount the real Squad inline widget or fall back to the demo top-up.
   * Public key is safe to expose to the browser by design.
   */
  publicConfig: publicQuery.query(() => {
    return {
      squadConfigured: isSquadConfigured(),
      publicKey: getSquadPublicKey(),
    }
  }),

  /**
   * Demo / fallback top-up — instantly credits the wallet without going
   * through Squad. Used for the "bank transfer" tab and as a safety net when
   * Squad isn't configured. Card-method top-ups should prefer
   * `initiateSquadTopup` + `confirmSquadTopup`.
   */
  topup: authedQuery
    .input(
      z.object({
        amount: z.number().min(500),
        method: z.enum(['card', 'transfer']).default('transfer'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb()
      const balanceBefore = Number(ctx.user.walletBalance)
      const balanceAfter = balanceBefore + input.amount
      const reference = `DEMO-${Date.now()}`

      await db
        .update(users)
        .set({
          walletBalance: balanceAfter.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))

      await db.insert(walletTransactions).values({
        employerId: ctx.user.id,
        type: 'topup',
        amount: input.amount.toFixed(2),
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        description:
          input.method === 'card'
            ? 'Wallet top-up via card (simulated)'
            : 'Wallet top-up via bank transfer (demo)',
        status: 'completed',
        metadata: { reference, method: input.method, demo: true },
      })

      return {
        success: true,
        reference,
        amount: input.amount,
        balance: balanceAfter,
        status: 'completed' as const,
      }
    }),

  /**
   * Initiate a real Squad payment.
   *
   * Creates a pending walletTransactions row, calls Squad's /transaction/initiate,
   * and returns the parameters the frontend needs to launch the Squad inline
   * checkout widget. Wallet is NOT credited here — that happens in
   * `confirmSquadTopup` once Squad confirms the charge, with the webhook as a
   * safety net.
   */
  initiateSquadTopup: authedQuery
    .input(
      z.object({
        amount: z.number().min(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isSquadConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message:
            'Squad payments are not configured on this server. Set SQUAD_SECRET_KEY and SQUAD_PUBLIC_KEY.',
        })
      }

      const db = getDb()
      const balanceBefore = Number(ctx.user.walletBalance)
      const reference = `VRT-${nanoid(12).toUpperCase()}`

      // Insert pending tx first — gives us an audit trail even if Squad call fails.
      await db.insert(walletTransactions).values({
        employerId: ctx.user.id,
        type: 'topup',
        amount: input.amount.toFixed(2),
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceBefore.toFixed(2),
        description: 'Wallet top-up via Squad (pending)',
        status: 'pending',
        metadata: { reference, method: 'card', provider: 'squad' },
      })

      const email = ctx.user.email || `user-${ctx.user.id}@verity.app`
      const customerName = ctx.user.fullName || ctx.user.name || 'Verity User'
      const callbackUrl = env.appOrigin
        ? `${env.appOrigin}/wallet?squad_ref=${reference}`
        : undefined

      try {
        const result = await initiateTransaction({
          amountNgn: input.amount,
          email,
          reference,
          customerName,
          callbackUrl,
          metadata: {
            user_id: String(ctx.user.id),
            purpose: 'wallet-topup',
          },
        })

        return {
          reference,
          publicKey: getSquadPublicKey(),
          amount: input.amount,
          email,
          customerName,
          authorizationUrl: result.authorizationUrl,
        }
      } catch (error) {
        // Mark the pending tx as failed so the dashboard reflects reality.
        try {
          const pending = await findTransactionByReference(ctx.user.id, reference)
          if (pending) {
            await db
              .update(walletTransactions)
              .set({ status: 'failed' })
              .where(eq(walletTransactions.id, pending.id))
          }
        } catch {
          // best-effort cleanup
        }
        throw error
      }
    }),

  /**
   * Confirm a Squad top-up after the inline widget's success callback fires.
   *
   * Looks up the pending transaction, calls Squad's /transaction/verify, and
   * only credits the wallet if Squad confirms the charge succeeded.
   * Idempotent — safe to call multiple times for the same reference.
   */
  confirmSquadTopup: authedQuery
    .input(
      z.object({
        reference: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb()
      const tx = await findTransactionByReference(ctx.user.id, input.reference)

      if (!tx) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No transaction found with that reference.',
        })
      }

      // Idempotency — already settled.
      if (tx.status === 'completed') {
        return {
          status: 'already_completed' as const,
          reference: input.reference,
          amount: Number(tx.amount),
          balance: Number(ctx.user.walletBalance),
        }
      }
      if (tx.status === 'failed') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This payment previously failed verification.',
        })
      }

      if (!isSquadConfigured()) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Squad payments are not configured on this server.',
        })
      }

      const verified = await verifyTransaction(input.reference)

      if (!verified.succeeded) {
        await db
          .update(walletTransactions)
          .set({ status: 'failed' })
          .where(eq(walletTransactions.id, tx.id))
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Squad reports the transaction as "${verified.status}".`,
        })
      }

      const expectedKobo = Math.round(Number(tx.amount) * 100)
      if (verified.amountKobo !== expectedKobo) {
        await db
          .update(walletTransactions)
          .set({ status: 'failed' })
          .where(eq(walletTransactions.id, tx.id))
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Amount mismatch: expected ${expectedKobo} kobo, Squad confirmed ${verified.amountKobo} kobo.`,
        })
      }

      const balanceBefore = Number(ctx.user.walletBalance)
      const amount = Number(tx.amount)
      const balanceAfter = balanceBefore + amount

      await db
        .update(users)
        .set({
          walletBalance: balanceAfter.toFixed(2),
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))

      await db
        .update(walletTransactions)
        .set({
          status: 'completed',
          balanceAfter: balanceAfter.toFixed(2),
          description: 'Wallet top-up via Squad',
        })
        .where(eq(walletTransactions.id, tx.id))

      return {
        status: 'completed' as const,
        reference: input.reference,
        amount,
        balance: balanceAfter,
      }
    }),
})
