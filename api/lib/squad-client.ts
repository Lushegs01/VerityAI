/**
 * Squad Payments client.
 *
 * Docs: https://squadinc.gitbook.io/squad/payments/initiate-payment
 *
 * We use the inline checkout flow:
 *   1. Server calls /transaction/initiate to create a pending transaction at Squad
 *      and obtain a checkout URL / access code.
 *   2. Frontend launches the Squad inline widget with the same transaction_ref
 *      using the public key.
 *   3. On widget success (or via webhook), server calls /transaction/verify/{ref}
 *      and only credits the wallet if Squad confirms `transaction_status: Success`.
 *
 * Amounts on the Squad API are expressed in **kobo** (1 NGN = 100 kobo).
 */
import crypto from 'node:crypto'
import { TRPCError } from '@trpc/server'

const DEFAULT_BASE_URL = 'https://sandbox-api-d.squadco.com'

function getConfig() {
  const secretKey = process.env.SQUAD_SECRET_KEY ?? ''
  // Use `||` not `??` so an empty-string env var (common when the key is
  // declared without a value in Render) still falls back to the default —
  // otherwise fetch() tries to parse `/transaction/initiate` as an absolute
  // URL and throws "Failed to parse URL".
  const baseUrl = (process.env.SQUAD_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '')
  if (!secretKey) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'SQUAD_SECRET_KEY is not configured on the server.',
    })
  }
  return { secretKey, baseUrl }
}

export function isSquadConfigured(): boolean {
  return Boolean(process.env.SQUAD_SECRET_KEY)
}

export function getSquadPublicKey(): string {
  return process.env.SQUAD_PUBLIC_KEY ?? ''
}

interface InitiateParams {
  /** Amount in NGN (Naira). Will be converted to kobo for the Squad API. */
  amountNgn: number
  email: string
  reference: string
  customerName: string
  callbackUrl?: string
  metadata?: Record<string, unknown>
}

interface InitiateResult {
  authorizationUrl: string
  transactionRef: string
}

export async function initiateTransaction(params: InitiateParams): Promise<InitiateResult> {
  const { secretKey, baseUrl } = getConfig()

  const body = {
    amount: Math.round(params.amountNgn * 100),
    email: params.email,
    currency: 'NGN',
    initiate_type: 'inline',
    transaction_ref: params.reference,
    customer_name: params.customerName,
    callback_url: params.callbackUrl,
    metadata: params.metadata,
  }

  let resp: Response
  try {
    resp = await fetch(`${baseUrl}/transaction/initiate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Could not reach Squad: ${message}`,
    })
  }

  const text = await resp.text()
  if (!resp.ok) {
    console.error('[squad] initiate failed', resp.status, text.slice(0, 500))
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Squad initiate failed (${resp.status}).`,
    })
  }

  let json: {
    success?: boolean
    message?: string
    data?: {
      authorization_url?: string
      checkout_url?: string
      transaction_ref?: string
      access_code?: string
    }
  }
  try {
    json = JSON.parse(text)
  } catch {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Squad initiate returned non-JSON response.',
    })
  }

  const authorizationUrl =
    json.data?.authorization_url ?? json.data?.checkout_url ?? ''
  const transactionRef = json.data?.transaction_ref ?? params.reference

  if (!json.success || !authorizationUrl) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Squad initiate error: ${json.message ?? 'unknown'}.`,
    })
  }

  return { authorizationUrl, transactionRef }
}

export type SquadTransactionStatus = 'Success' | 'success' | 'Failed' | 'failed' | 'Pending' | 'pending'

export interface VerifyResult {
  /** Raw status string as returned by Squad. */
  status: string
  /** Normalised — true only when Squad confirmed a successful charge. */
  succeeded: boolean
  /** Transaction amount in **kobo** as returned by Squad. */
  amountKobo: number
  reference: string
  email: string | null
  raw: unknown
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const { secretKey, baseUrl } = getConfig()

  let resp: Response
  try {
    resp = await fetch(`${baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secretKey}` },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Could not reach Squad: ${message}`,
    })
  }

  const text = await resp.text()
  if (!resp.ok) {
    console.error('[squad] verify failed', resp.status, text.slice(0, 500))
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Squad verify failed (${resp.status}).`,
    })
  }

  let json: {
    success?: boolean
    message?: string
    data?: {
      transaction_status?: string
      transaction_amount?: number
      transaction_ref?: string
      email?: string
    }
  }
  try {
    json = JSON.parse(text)
  } catch {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Squad verify returned non-JSON response.',
    })
  }

  if (!json.success || !json.data) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Squad verify error: ${json.message ?? 'unknown'}.`,
    })
  }

  const status = json.data.transaction_status ?? ''
  return {
    status,
    succeeded: status.toLowerCase() === 'success',
    amountKobo: Number(json.data.transaction_amount ?? 0),
    reference: json.data.transaction_ref ?? reference,
    email: json.data.email ?? null,
    raw: json.data,
  }
}

/**
 * Verify a Squad webhook signature.
 *
 * Squad signs the raw request body with HMAC-SHA512 using your secret key and
 * sends the result (uppercase hex) in the `x-squad-encrypted-body` header.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null | undefined): boolean {
  if (!signatureHeader) return false
  const secretKey = process.env.SQUAD_SECRET_KEY
  if (!secretKey) return false

  const computed = crypto
    .createHmac('sha512', secretKey)
    .update(rawBody, 'utf8')
    .digest('hex')
    .toUpperCase()

  const provided = signatureHeader.toUpperCase()
  if (computed.length !== provided.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(provided, 'hex'))
  } catch {
    return false
  }
}
