import { z } from 'zod'
import { createRouter, publicQuery } from './middleware'
import { getDb } from './queries/connection'
import { certificates } from '../db/schema'
import { desc, eq, like, and, or, sql } from 'drizzle-orm'

// Simulated AI verification engine
function simulateAIAnalysis(
  fileName: string,
  _certificateType?: string
): {
  aiVisualIntegrity: number
  aiDataPlausibility: number
  aiAnomaly: number
  aiInstitution: number
  aiSecurityFeatures: number
  aiConfidence: number
  aiVerdict: string
  aiReasoning: string
  aiFlags: string
  ruleScore: number
  ruleFlags: string
  trustScore: number
  verdict: string
} {
  // Randomize slightly but keep consistent for demo
  const isFake = fileName.toLowerCase().includes('fake') || Math.random() < 0.25
  const isGenuine = !isFake && (fileName.toLowerCase().includes('genuine') || fileName.toLowerCase().includes('real') || Math.random() < 0.6)

  if (isGenuine) {
    return {
      aiVisualIntegrity: 85 + Math.floor(Math.random() * 15),
      aiDataPlausibility: 90 + Math.floor(Math.random() * 10),
      aiAnomaly: 5 + Math.floor(Math.random() * 10),
      aiInstitution: 95 + Math.floor(Math.random() * 5),
      aiSecurityFeatures: 80 + Math.floor(Math.random() * 15),
      aiConfidence: 85 + Math.floor(Math.random() * 15),
      aiVerdict: 'AUTHENTIC',
      aiReasoning: 'Certificate demonstrates consistent typography, proper institutional formatting and seal placement, plausible data distribution consistent with program. All security features present and valid.',
      aiFlags: JSON.stringify([]),
      ruleScore: 90 + Math.floor(Math.random() * 10),
      ruleFlags: JSON.stringify([]),
      trustScore: 85 + Math.floor(Math.random() * 15),
      verdict: 'VERIFIED',
    }
  } else if (isFake) {
    return {
      aiVisualIntegrity: 20 + Math.floor(Math.random() * 15),
      aiDataPlausibility: 25 + Math.floor(Math.random() * 15),
      aiAnomaly: 80 + Math.floor(Math.random() * 20),
      aiInstitution: 35 + Math.floor(Math.random() * 15),
      aiSecurityFeatures: 10 + Math.floor(Math.random() * 15),
      aiConfidence: 75 + Math.floor(Math.random() * 15),
      aiVerdict: 'LIKELY_FAKE',
      aiReasoning: 'Multiple critical flags detected: font inconsistencies in the grades section, registration number format does not match expected pattern, and statistically implausible grade distribution. Certificate shows clear signs of digital manipulation.',
      aiFlags: JSON.stringify([
        { type: 'FONT_INCONSISTENCY', severity: 'HIGH', field: 'grades', description: 'Font weight and spacing inconsistent across grades column' },
        { type: 'REGISTRATION_FORMAT_INVALID', severity: 'CRITICAL', field: 'reg_number', description: 'Registration number does not match expected format pattern' },
        { type: 'IMPLAUSIBLE_GRADES', severity: 'MEDIUM', field: 'grades', description: `${8 + Math.floor(Math.random() * 2)} A1 grades statistically very rare (0.3% probability)` },
        { type: 'MISSING_SECURITY_FEATURE', severity: 'HIGH', field: 'seal', description: 'Official watermark absent or poorly replicated' },
      ]),
      ruleScore: 30 + Math.floor(Math.random() * 15),
      ruleFlags: JSON.stringify([
        { rule: 'RegNumberFormatRule', description: 'Registration number format invalid', penalty: 25 },
        { rule: 'GradeDistributionRule', description: 'Statistically implausible grade pattern', penalty: 20 },
      ]),
      trustScore: 15 + Math.floor(Math.random() * 20),
      verdict: 'LIKELY_FAKE',
    }
  }

  // Suspicious
  return {
    aiVisualIntegrity: 50 + Math.floor(Math.random() * 20),
    aiDataPlausibility: 55 + Math.floor(Math.random() * 15),
    aiAnomaly: 40 + Math.floor(Math.random() * 20),
    aiInstitution: 60 + Math.floor(Math.random() * 15),
    aiSecurityFeatures: 50 + Math.floor(Math.random() * 15),
    aiConfidence: 65 + Math.floor(Math.random() * 15),
    aiVerdict: 'SUSPICIOUS',
    aiReasoning: 'Some inconsistencies detected in document formatting and data plausibility. Further manual review recommended.',
    aiFlags: JSON.stringify([
      { type: 'FORMAT_MISMATCH', severity: 'MEDIUM', field: 'layout', description: 'Slight deviation from standard certificate layout' },
    ]),
    ruleScore: 55 + Math.floor(Math.random() * 15),
    ruleFlags: JSON.stringify([
      { rule: 'FormatCheckRule', description: 'Minor formatting deviation detected', penalty: 10 },
    ]),
    trustScore: 50 + Math.floor(Math.random() * 30),
    verdict: 'SUSPICIOUS',
  }
}

export const verificationRouter = createRouter({
  process: publicQuery
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileData: z.string(),
        certificateType: z.string().optional(),
        applicantName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb()

      // Generate public ID
      const publicId = `VRT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

      const aiResult = simulateAIAnalysis(input.fileName, input.certificateType)

      const insertData: any = {
        publicId,
        employerId: 1,
        originalFilename: input.fileName,
        fileType: input.fileType.startsWith('image') ? 'image' : 'pdf',
        applicantName: input.applicantName || null,
        certificateType: (input.certificateType || 'other') as any,
        aiVisualIntegrity: aiResult.aiVisualIntegrity,
        aiDataPlausibility: aiResult.aiDataPlausibility,
        aiAnomaly: aiResult.aiAnomaly,
        aiInstitution: aiResult.aiInstitution,
        aiSecurityFeatures: aiResult.aiSecurityFeatures,
        aiConfidence: aiResult.aiConfidence,
        aiVerdict: aiResult.aiVerdict as any,
        aiReasoning: aiResult.aiReasoning,
        aiFlags: aiResult.aiFlags,
        ruleScore: aiResult.ruleScore,
        ruleFlags: aiResult.ruleFlags,
        trustScore: aiResult.trustScore,
        verdict: aiResult.verdict as any,
        status: 'completed',
        costCharged: '500.00',
        completedAt: new Date(),
      }

      const [result] = await db.insert(certificates).values(insertData)

      const insertedCert = await db
        .select()
        .from(certificates)
        .where(eq(certificates.id, result.insertId))
        .limit(1)

      return insertedCert[0]
    }),

  history: publicQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(15),
        verdict: z.string().optional(),
        certificateType: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = getDb()
      const offset = (input.page - 1) * input.limit

      const conditions = []
      if (input.verdict) {
        conditions.push(eq(certificates.verdict, input.verdict as any))
      }
      if (input.certificateType) {
        conditions.push(eq(certificates.certificateType, input.certificateType as any))
      }
      if (input.search) {
        conditions.push(
          or(
            like(certificates.applicantName, `%${input.search}%`),
            like(certificates.publicId, `%${input.search}%`),
            like(certificates.institutionName, `%${input.search}%`)
          )
        )
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined

      const items = await db
        .select()
        .from(certificates)
        .where(where)
        .orderBy(desc(certificates.createdAt))
        .limit(input.limit)
        .offset(offset)

      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(certificates)
        .where(where)

      const total = Number(countResult[0]?.count || 0)

      return {
        items,
        total,
        totalPages: Math.ceil(total / input.limit),
        page: input.page,
      }
    }),

  getById: publicQuery
    .input(z.object({ publicId: z.string() }))
    .query(async ({ input }) => {
      const db = getDb()
      const result = await db
        .select()
        .from(certificates)
        .where(eq(certificates.publicId, input.publicId))
        .limit(1)

      return result[0] || null
    }),
})
