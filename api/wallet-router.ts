import { z } from 'zod'
import { createRouter, publicQuery } from './middleware'
import { getDb } from './queries/connection'
import { walletTransactions } from '../db/schema'
import { desc } from 'drizzle-orm'

export const walletRouter = createRouter({
  balance: publicQuery.query(async () => {
    // Return demo balance
    return { balance: 9000.00 }
  }),

  transactions: publicQuery
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ input }) => {
      const db = getDb()
      const limit = input?.limit || 20

      return db
        .select()
        .from(walletTransactions)
        .orderBy(desc(walletTransactions.createdAt))
        .limit(limit)
    }),

  topup: publicQuery
    .input(
      z.object({
        amount: z.number().min(500),
        method: z.enum(['card', 'transfer']).default('card'),
      })
    )
    .mutation(async ({ input }) => {
      // Simulate Squad payment processing
      return {
        success: true,
        reference: `SQUAD-${Date.now()}`,
        amount: input.amount,
        status: 'completed',
      }
    }),
})
