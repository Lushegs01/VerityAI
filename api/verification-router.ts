import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { createRouter, authedQuery } from './middleware'
import { getDb } from './queries/connection'
import { certificates, users, walletTransactions, type InsertCertificate } from '../db/schema'
import { desc, eq, like, and, or, sql } from 'drizzle-orm'
import { analyzeDocument, isAiConfigured, type AnalysisOutput } from './lib/ai-verifier'

const certificateTypes = [
  'WAEC', 'NECO', 'NABTEB', 'HND', 'BSc', 'BA', 'BEng',
  'MSc', 'OND', 'NYSC', 'ICAN', 'COREN', 'NMA', 'other',
] as const
const verdicts = ['VERIFIED', 'SUSPICIOUS', 'LIKELY_FAKE'] as const

type CertificateType = (typeof certificateTypes)[number]
type Verdict = (typeof verdicts)[number]
type AiVerdict = 'AUTHENTIC' | 'SUSPICIOUS' | 'LIKELY_FAKE'
type AiFlag = {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  field: string
  description: string
}
type RuleFlag = {
  rule: string
  description: string
  penalty: number
}
type AnalysisResult = {
  aiVisualIntegrity: number
  aiDataPlausibility: number
  aiAnomaly: number
  aiInstitution: number
  aiSecurityFeatures: number
  aiConfidence: number
  aiVerdict: AiVerdict
  aiReasoning: string
  aiFlags: AiFlag[]
  ruleScore: number
  ruleFlags: RuleFlag[]
  trustScore: number
  verdict: Verdict
}

const certificateTypeSchema = z.enum(certificateTypes)
const verdictSchema = z.enum(verdicts)
const VERIFICATION_COST = 500

function verdictFromAi(ai: AnalysisOutput['aiVerdict']): Verdict {
  if (ai === 'AUTHENTIC') return 'VERIFIED'
  if (ai === 'LIKELY_FAKE') return 'LIKELY_FAKE'
  return 'SUSPICIOUS'
}

function ruleFlagsFromAi(flags: AnalysisOutput['aiFlags']): RuleFlag[] {
  // Promote HIGH/CRITICAL AI flags into the rule layer so the dashboard's
  // dual-engine view (AI + Rule) reflects the same high-severity findings.
  return flags
    .filter((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH')
    .map((f) => ({
      rule: f.type,
      description: f.description,
      penalty: f.severity === 'CRITICAL' ? 25 : 15,
    }))
}

function toAnalysisResult(ai: AnalysisOutput): AnalysisResult {
  const ruleFlags = ruleFlagsFromAi(ai.aiFlags)
  const totalPenalty = ruleFlags.reduce((sum, r) => sum + r.penalty, 0)
  const ruleScore = Math.max(0, Math.min(100, 100 - totalPenalty))
  return {
    aiVisualIntegrity: ai.aiVisualIntegrity,
    aiDataPlausibility: ai.aiDataPlausibility,
    aiAnomaly: ai.aiAnomaly,
    aiInstitution: ai.aiInstitution,
    aiSecurityFeatures: ai.aiSecurityFeatures,
    aiConfidence: ai.aiConfidence,
    aiVerdict: ai.aiVerdict,
    aiReasoning: ai.aiReasoning,
    aiFlags: ai.aiFlags,
    ruleScore,
    ruleFlags,
    trustScore: ai.trustScore,
    verdict: verdictFromAi(ai.aiVerdict),
  }
}

// Simulated AI verification engine
function simulateAIAnalysis(
  fileName: string,
  certificateType: CertificateType = 'other'
): AnalysisResult {
  const certificateLabel = certificateType === 'other' ? 'certificate' : certificateType
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
      aiReasoning: `${certificateLabel} demonstrates consistent typography, proper institutional formatting and seal placement, and plausible data distribution. All security features present and valid.`,
      aiFlags: [],
      ruleScore: 90 + Math.floor(Math.random() * 10),
      ruleFlags: [],
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
      aiReasoning: `Multiple critical flags detected in this ${certificateLabel}: font inconsistencies, registration number format issues, and statistically implausible grade distribution. Certificate shows clear signs of digital manipulation.`,
      aiFlags: [
        { type: 'FONT_INCONSISTENCY', severity: 'HIGH', field: 'grades', description: 'Font weight and spacing inconsistent across grades column' },
        { type: 'REGISTRATION_FORMAT_INVALID', severity: 'CRITICAL', field: 'reg_number', description: 'Registration number does not match expected format pattern' },
        { type: 'IMPLAUSIBLE_GRADES', severity: 'MEDIUM', field: 'grades', description: `${8 + Math.floor(Math.random() * 2)} A1 grades statistically very rare (0.3% probability)` },
        { type: 'MISSING_SECURITY_FEATURE', severity: 'HIGH', field: 'seal', description: 'Official watermark absent or poorly replicated' },
      ],
      ruleScore: 30 + Math.floor(Math.random() * 15),
      ruleFlags: [
        { rule: 'RegNumberFormatRule', description: 'Registration number format invalid', penalty: 25 },
        { rule: 'GradeDistributionRule', description: 'Statistically implausible grade pattern', penalty: 20 },
      ],
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
    aiReasoning: `Some inconsistencies detected in ${certificateLabel} formatting and data plausibility. Further manual review recommended.`,
    aiFlags: [
      { type: 'FORMAT_MISMATCH', severity: 'MEDIUM', field: 'layout', description: 'Slight deviation from standard certificate layout' },
    ],
    ruleScore: 55 + Math.floor(Math.random() * 15),
    ruleFlags: [
      { rule: 'FormatCheckRule', description: 'Minor formatting deviation detected', penalty: 10 },
    ],
    trustScore: 50 + Math.floor(Math.random() * 30),
    verdict: 'SUSPICIOUS',
  }
}

export const verificationRouter = createRouter({
  process: authedQuery
    .input(
      z.object({
        fileName: z.string().min(1),
        fileType: z.string().min(1),
        fileData: z.string().min(1),
        certificateType: certificateTypeSchema.optional(),
        applicantName: z.string().trim().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb()
      const balanceBefore = Number(ctx.user.walletBalance)

      if (balanceBefore < VERIFICATION_COST) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Insufficient wallet balance. Please top up before verifying.',
        })
      }

      // Generate public ID
      const publicId = `VRT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

      const aiStart = Date.now()
      let aiResult: AnalysisResult
      let inferredApplicantName: string | null = input.applicantName?.trim() || null
      let inferredInstitutionName: string | null = null
      let inferredGraduationYear: number | null = null
      let inferredRegNumber: string | null = null
      let inferredImageQuality: 'GOOD' | 'ACCEPTABLE' | 'POOR' | null = null

      if (isAiConfigured()) {
        const aiOutput = await analyzeDocument({
          fileName: input.fileName,
          fileType: input.fileType,
          fileDataBase64: input.fileData,
          certificateType: input.certificateType,
          applicantName: input.applicantName,
        })
        aiResult = toAnalysisResult(aiOutput)
        inferredApplicantName =
          inferredApplicantName || aiOutput.applicantName || null
        inferredInstitutionName = aiOutput.institutionName || null
        inferredGraduationYear = aiOutput.graduationYear || null
        inferredRegNumber = aiOutput.regNumber || null
        inferredImageQuality = aiOutput.imageQuality
      } else {
        // Fallback for environments without ANTHROPIC_API_KEY (CI, local dev,
        // first-time setup). Keeps the flow demoable but clearly identifies
        // the source in the reasoning string.
        aiResult = simulateAIAnalysis(input.fileName, input.certificateType)
        aiResult.aiReasoning = `[simulated — set GEMINI_API_KEY for real AI verification] ${aiResult.aiReasoning}`
      }

      const processingTimeMs = Date.now() - aiStart
      const balanceAfter = balanceBefore - VERIFICATION_COST

      const insertData: InsertCertificate = {
        publicId,
        employerId: ctx.user.id,
        originalFilename: input.fileName,
        fileSize: Math.ceil((input.fileData.length * 3) / 4),
        fileType: input.fileType.startsWith('image') ? 'image' : 'pdf',
        applicantName: inferredApplicantName,
        institutionName: inferredInstitutionName,
        graduationYear: inferredGraduationYear,
        regNumber: inferredRegNumber,
        imageQuality: inferredImageQuality,
        certificateType: input.certificateType || 'other',
        aiVisualIntegrity: aiResult.aiVisualIntegrity,
        aiDataPlausibility: aiResult.aiDataPlausibility,
        aiAnomaly: aiResult.aiAnomaly,
        aiInstitution: aiResult.aiInstitution,
        aiSecurityFeatures: aiResult.aiSecurityFeatures,
        aiConfidence: aiResult.aiConfidence,
        aiVerdict: aiResult.aiVerdict,
        aiReasoning: aiResult.aiReasoning,
        aiFlags: aiResult.aiFlags,
        ruleScore: aiResult.ruleScore,
        ruleFlags: aiResult.ruleFlags,
        trustScore: aiResult.trustScore,
        verdict: aiResult.verdict,
        status: 'completed',
        processingTimeMs,
        costCharged: VERIFICATION_COST.toFixed(2),
        completedAt: new Date(),
      }

      const [result] = await db.insert(certificates).values(insertData)

      await db
        .update(users)
        .set({
          walletBalance: balanceAfter.toFixed(2),
          verificationCount: ctx.user.verificationCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id))

      await db.insert(walletTransactions).values({
        employerId: ctx.user.id,
        type: 'deduction',
        amount: VERIFICATION_COST.toFixed(2),
        balanceBefore: balanceBefore.toFixed(2),
        balanceAfter: balanceAfter.toFixed(2),
        certificateId: result.insertId,
        description: `Certificate verification (${publicId})`,
        status: 'completed',
      })

      const insertedCert = await db
        .select()
        .from(certificates)
        .where(eq(certificates.id, result.insertId))
        .limit(1)

      return insertedCert[0]
    }),

  history: authedQuery
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(15),
        verdict: verdictSchema.optional(),
        certificateType: certificateTypeSchema.optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb()
      const offset = (input.page - 1) * input.limit

      const conditions = [eq(certificates.employerId, ctx.user.id)]
      if (input.verdict) {
        conditions.push(eq(certificates.verdict, input.verdict))
      }
      if (input.certificateType) {
        conditions.push(eq(certificates.certificateType, input.certificateType))
      }
      if (input.search) {
        const searchCondition = or(
          like(certificates.applicantName, `%${input.search}%`),
          like(certificates.publicId, `%${input.search}%`),
          like(certificates.institutionName, `%${input.search}%`)
        )
        if (searchCondition) conditions.push(searchCondition)
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

  getById: authedQuery
    .input(z.object({ publicId: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = getDb()
      const result = await db
        .select()
        .from(certificates)
        .where(and(
          eq(certificates.employerId, ctx.user.id),
          eq(certificates.publicId, input.publicId),
        ))
        .limit(1)

      return result[0] || null
    }),
})
