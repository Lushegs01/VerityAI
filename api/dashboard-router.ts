import { createRouter, authedQuery } from './middleware'
import { getDb } from './queries/connection'
import { certificates } from '../db/schema'
import { and, desc, eq, gte, sql } from 'drizzle-orm'

export const dashboardRouter = createRouter({
  stats: authedQuery.query(async ({ ctx }) => {
    const db = getDb()
    const allCerts = await db
      .select()
      .from(certificates)
      .where(eq(certificates.employerId, ctx.user.id))

    const totalVerified = allCerts.filter(c => c.verdict === 'VERIFIED').length
    const totalSuspicious = allCerts.filter(c => c.verdict === 'SUSPICIOUS').length
    const totalFake = allCerts.filter(c => c.verdict === 'LIKELY_FAKE').length

    return { totalVerified, totalSuspicious, totalFake }
  }),

  recent: authedQuery.query(async ({ ctx }) => {
    const db = getDb()
    return db
      .select()
      .from(certificates)
      .where(eq(certificates.employerId, ctx.user.id))
      .orderBy(desc(certificates.createdAt))
      .limit(10)
  }),

  activity: authedQuery.query(async ({ ctx }) => {
    const db = getDb()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const results = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(certificates)
      .where(and(
        eq(certificates.employerId, ctx.user.id),
        gte(certificates.createdAt, thirtyDaysAgo),
      ))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`)

    // Fill in missing dates
    const dateMap = new Map<string, number>()
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      dateMap.set(key, 0)
    }

    for (const r of results) {
      dateMap.set(r.date, r.count)
    }

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        count,
      }))
  }),
})
