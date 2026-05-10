import { z } from 'zod'
import { createRouter, authedQuery } from './middleware'
import { getDb } from './queries/connection'
import { users, walletTransactions } from '../db/schema'
import { desc, eq } from 'drizzle-orm'

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

  topup: authedQuery
    .input(
      z.object({
        amount: z.number().min(500),
        method: z.enum(['card', 'transfer']).default('card'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb()
      const balanceBefore = Number(ctx.user.walletBalance)
      const balanceAfter = balanceBefore + input.amount
      const reference = `SQUAD-${Date.now()}`

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
        description: `Wallet top-up via ${input.method === 'card' ? 'card payment' : 'bank transfer'}`,
        status: 'completed',
        metadata: { reference, method: input.method },
      })

      return {
        success: true,
        reference,
        amount: input.amount,
        balance: balanceAfter,
        status: 'completed',
      }
    }),
})
