import { z } from 'zod'
import { createRouter, publicQuery } from './middleware'
import { getDb } from './queries/connection'
import { certificates, applicantSelfVerifies } from '../db/schema'
import { eq } from 'drizzle-orm'

export const publicRouter = createRouter({
  badge: publicQuery
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = getDb()

      const selfVerify = await db
        .select()
        .from(applicantSelfVerifies)
        .where(eq(applicantSelfVerifies.shareToken, input.token))
        .limit(1)

      if (!selfVerify[0]) return null

      const cert = await db
        .select()
        .from(certificates)
        .where(eq(certificates.id, selfVerify[0].certificateId))
        .limit(1)

      if (!cert[0]) return null

      return {
        applicantName: selfVerify[0].applicantName,
        certificateType: cert[0].certificateType,
        institutionName: cert[0].institutionName,
        trustScore: cert[0].trustScore,
        verdict: cert[0].verdict,
        verifiedAt: cert[0].completedAt,
        viewCount: selfVerify[0].viewCount,
        expiresAt: selfVerify[0].expiresAt,
      }
    }),

  stats: publicQuery.query(async () => {
    const db = getDb()
    const allCerts = await db.select().from(certificates)

    return {
      totalVerified: allCerts.length,
      fakesCaught: allCerts.filter(c => c.verdict === 'LIKELY_FAKE').length,
    }
  }),
})
