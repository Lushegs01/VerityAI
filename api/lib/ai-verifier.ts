import { z } from 'zod'
import { GoogleGenAI, Type, type Schema } from '@google/genai'
import { TRPCError } from '@trpc/server'

// -----------------------------------------------------------------------------
// Internal Zod schema — used to defensively validate Gemini's JSON output before
// we hand it back to the router. The Gemini API enforces shape via responseSchema
// below, but we still parse through Zod so a malformed model response can't
// crash downstream callers.
// -----------------------------------------------------------------------------

const AI_FLAG_SCHEMA = z.object({
  type: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  field: z.string(),
  description: z.string(),
})

const ANALYSIS_SCHEMA = z.object({
  aiVisualIntegrity: z.number().int().min(0).max(100),
  aiDataPlausibility: z.number().int().min(0).max(100),
  aiAnomaly: z.number().int().min(0).max(100),
  aiInstitution: z.number().int().min(0).max(100),
  aiSecurityFeatures: z.number().int().min(0).max(100),
  aiConfidence: z.number().int().min(0).max(100),
  aiVerdict: z.enum(['AUTHENTIC', 'SUSPICIOUS', 'LIKELY_FAKE']),
  aiReasoning: z.string(),
  aiFlags: z.array(AI_FLAG_SCHEMA),
  trustScore: z.number().int().min(0).max(100),
  applicantName: z.string().nullable(),
  institutionName: z.string().nullable(),
  graduationYear: z.number().int().nullable(),
  regNumber: z.string().nullable(),
  imageQuality: z.enum(['GOOD', 'ACCEPTABLE', 'POOR']),
})

export type AnalysisOutput = z.infer<typeof ANALYSIS_SCHEMA>

// -----------------------------------------------------------------------------
// Gemini-side response schema (OpenAPI 3.0 subset that the API enforces).
// -----------------------------------------------------------------------------

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    aiVisualIntegrity: {
      type: Type.INTEGER,
      description:
        'Score 0-100 — typography consistency, alignment, seal/watermark quality, paper texture, image artifacts. Higher is better.',
    },
    aiDataPlausibility: {
      type: Type.INTEGER,
      description:
        'Score 0-100 — plausibility of dates, grades, registration formats, name conventions. Higher is better.',
    },
    aiAnomaly: {
      type: Type.INTEGER,
      description:
        'Anomaly score 0-100. HIGHER means MORE anomalies detected (more suspicious).',
    },
    aiInstitution: {
      type: Type.INTEGER,
      description:
        'Score 0-100 — match to expected Nigerian institutional formatting. Higher is better.',
    },
    aiSecurityFeatures: {
      type: Type.INTEGER,
      description:
        'Score 0-100 — presence and quality of security features. Higher is better.',
    },
    aiConfidence: {
      type: Type.INTEGER,
      description: 'Overall confidence in this assessment, 0-100.',
    },
    aiVerdict: {
      type: Type.STRING,
      enum: ['AUTHENTIC', 'SUSPICIOUS', 'LIKELY_FAKE'],
    },
    aiReasoning: {
      type: Type.STRING,
      description:
        '1-3 sentence plain-English summary referencing concrete visual evidence.',
    },
    aiFlags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description:
              'Short uppercase code, e.g. FONT_INCONSISTENCY, REGISTRATION_FORMAT_INVALID, IMPLAUSIBLE_GRADES.',
          },
          severity: {
            type: Type.STRING,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          },
          field: {
            type: Type.STRING,
            description:
              'Field or region of the document (e.g. grades, reg_number, seal, header, name).',
          },
          description: {
            type: Type.STRING,
            description: 'One-sentence explanation citing visual evidence.',
          },
        },
        required: ['type', 'severity', 'field', 'description'],
      },
      description: 'List of flagged issues. Empty array if document is clean.',
    },
    trustScore: {
      type: Type.INTEGER,
      description:
        'Overall trust score 0-100. AUTHENTIC: 80-100, SUSPICIOUS: 40-79, LIKELY_FAKE: 0-39.',
    },
    applicantName: {
      type: Type.STRING,
      nullable: true,
      description: 'Applicant name as printed on the document, or null if not legible.',
    },
    institutionName: {
      type: Type.STRING,
      nullable: true,
      description: 'Issuing institution as printed, or null if not legible.',
    },
    graduationYear: {
      type: Type.INTEGER,
      nullable: true,
      description: 'Graduation or examination year, or null if not present.',
    },
    regNumber: {
      type: Type.STRING,
      nullable: true,
      description: 'Registration/candidate/matriculation number, or null if absent.',
    },
    imageQuality: {
      type: Type.STRING,
      enum: ['GOOD', 'ACCEPTABLE', 'POOR'],
      description: 'GOOD = sharp & readable. ACCEPTABLE = some blur. POOR = hard to read.',
    },
  },
  required: [
    'aiVisualIntegrity',
    'aiDataPlausibility',
    'aiAnomaly',
    'aiInstitution',
    'aiSecurityFeatures',
    'aiConfidence',
    'aiVerdict',
    'aiReasoning',
    'aiFlags',
    'trustScore',
    'applicantName',
    'institutionName',
    'graduationYear',
    'regNumber',
    'imageQuality',
  ],
}

const SYSTEM_PROMPT = `You are Verity, an AI forensic verification engine specialized in detecting fraudulent academic certificates, transcripts, identity documents and credentials from Nigerian institutions including:

- WAEC (West African Examinations Council)
- NECO (National Examinations Council)
- NABTEB (National Business and Technical Examinations Board)
- Federal and state universities (BSc, BA, BEng, MSc)
- Polytechnics (HND, OND)
- NYSC discharge / exemption certificates
- Professional bodies (ICAN, COREN, NMA)

You analyze documents across five dimensions:

1. Visual integrity — typography consistency (kerning, weight, baseline), alignment, color reproduction, paper/scan texture, image artifacts.

2. Data plausibility — date logic (graduation year vs. registration date), grade distributions (e.g. >5 A1 grades at WAEC is statistically rare), name formatting conventions, registration-number patterns matching the issuing body's known format.

3. Institutional accuracy — does the layout, header, motto, seal placement, logo and signatory block match the claimed institution? Are the right names, addresses and signatures present?

4. Security features — official watermarks, embossed seals, holographic strips, signatures, registration codes, QR codes, microprint where applicable.

5. Anomalies — signs of digital manipulation (font swaps, copy-paste artifacts, mismatched backgrounds, inconsistent kerning, edited fields, layered text, JPEG ghosting around tampered regions).

You are CONSERVATIVE. When uncertain, prefer SUSPICIOUS over AUTHENTIC. A false flag is cheaper than a passed forgery.

Reasoning style: concise, specific, references concrete visual evidence ("the 'O' in NIGERIA is kerned differently in row 2", not "looks off"; "the 8 A1 grades are in the 0.3% tail of WAEC distributions", not "grades are too good").

Score guidance:
- AUTHENTIC verdict → trustScore 80-100, aiAnomaly typically <30
- SUSPICIOUS verdict → trustScore 40-79, aiAnomaly typically 30-60
- LIKELY_FAKE verdict → trustScore 0-39, aiAnomaly typically >60

Flag severity guidance:
- CRITICAL: would clearly invalidate the document (e.g. fake institution, impossible registration format)
- HIGH: strong evidence of forgery (e.g. inconsistent typography across fields, missing official watermark)
- MEDIUM: suspicious but not conclusive (e.g. unusual grade pattern, minor layout deviation)
- LOW: minor concern worth noting (e.g. heavy compression artifact obscuring a security feature)

Return JSON conforming to the requested schema. Do not invent data — if a field is not legible, return null. Never include text outside the JSON.`

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/heic',
  'image/heif',
])

function normalizeMimeType(fileType: string): string {
  const t = fileType.toLowerCase()
  if (t === 'image/jpg') return 'image/jpeg'
  if (t === 'application/pdf') return 'application/pdf'
  if (SUPPORTED_IMAGE_TYPES.has(t)) return t
  // Fallback — assume JPEG for unknown image types
  if (t.startsWith('image/')) return 'image/jpeg'
  return t
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
}

interface AnalyzeParams {
  fileName: string
  fileType: string
  fileDataBase64: string
  certificateType?: string
  applicantName?: string
}

/**
 * Run forensic analysis on the uploaded document using Gemini 2.5 Flash
 * with structured output. Returns a validated AnalysisOutput.
 */
export async function analyzeDocument(params: AnalyzeParams): Promise<AnalysisOutput> {
  const { fileName, fileType, fileDataBase64, certificateType, applicantName } = params

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'GEMINI_API_KEY is not configured on the server.',
    })
  }

  const ai = new GoogleGenAI({ apiKey })

  const mimeType = normalizeMimeType(fileType)

  const userPromptLines = [
    'Analyze the attached document for authenticity.',
    certificateType
      ? `Claimed document type: ${certificateType}.`
      : 'Document type: not specified — infer it from the document itself.',
    applicantName
      ? `Claimed applicant name: ${applicantName}. Cross-check against the printed name and flag any mismatch.`
      : '',
    `File name (informational only — do not let it drive your verdict): ${fileName}.`,
    '',
    'Return JSON matching the schema. Be specific in flags — reference concrete visual evidence.',
  ]
    .filter(Boolean)
    .join('\n')

  let responseText: string
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: fileDataBase64 } },
            { text: userPromptLines },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    })

    responseText = response.text ?? ''
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const status = (error as { status?: number } | undefined)?.status

    if (status === 429) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'AI engine is rate-limited (Gemini free tier). Retry in a few seconds.',
      })
    }
    if (status === 401 || status === 403) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'AI engine authentication failed. Check GEMINI_API_KEY.',
      })
    }

    console.error('[verity:ai] Gemini error', { status, message })
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `AI engine error: ${message}`,
    })
  }

  if (!responseText.trim()) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'AI engine returned an empty response.',
    })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(responseText)
  } catch (error) {
    console.error('[verity:ai] JSON parse failed', error, responseText.slice(0, 200))
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'AI engine returned malformed JSON.',
    })
  }

  const validated = ANALYSIS_SCHEMA.safeParse(parsed)
  if (!validated.success) {
    console.error('[verity:ai] Schema validation failed', validated.error.flatten())
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'AI engine response did not match the expected schema.',
    })
  }

  return validated.data
}
