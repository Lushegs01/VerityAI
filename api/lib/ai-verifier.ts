import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { TRPCError } from '@trpc/server'

const AI_FLAG_SCHEMA = z.object({
  type: z
    .string()
    .describe(
      'Short uppercase code, e.g. FONT_INCONSISTENCY, REGISTRATION_FORMAT_INVALID, IMPLAUSIBLE_GRADES, MISSING_SECURITY_FEATURE, LAYOUT_MISMATCH, INSTITUTION_MISMATCH',
    ),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  field: z
    .string()
    .describe(
      'Field or region of the document this flag concerns (e.g. grades, reg_number, seal, header, name, date)',
    ),
  description: z
    .string()
    .describe(
      'One-sentence human-readable explanation citing specific visual evidence',
    ),
})

const ANALYSIS_SCHEMA = z.object({
  aiVisualIntegrity: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'Score 0-100 — typography consistency, alignment, seal/watermark quality, paper texture, image artifacts. Higher is better.',
    ),
  aiDataPlausibility: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'Score 0-100 — plausibility of dates, grades, registration formats, name conventions. Higher is better.',
    ),
  aiAnomaly: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'Anomaly score 0-100 — HIGHER means MORE anomalies detected (more suspicious).',
    ),
  aiInstitution: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'Score 0-100 — match to expected Nigerian institutional formatting (header, layout, signatures). Higher is better.',
    ),
  aiSecurityFeatures: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'Score 0-100 — presence and quality of security features: official seal, watermark, hologram, signature, registration codes. Higher is better.',
    ),
  aiConfidence: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe('Overall confidence in this assessment, 0-100.'),
  aiVerdict: z.enum(['AUTHENTIC', 'SUSPICIOUS', 'LIKELY_FAKE']),
  aiReasoning: z
    .string()
    .describe(
      '1-3 sentence plain-English summary of the verdict, referencing concrete visual evidence.',
    ),
  aiFlags: z
    .array(AI_FLAG_SCHEMA)
    .describe('List of specific flagged issues. Empty array if document is clean.'),
  trustScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      'Overall trust score 0-100. AUTHENTIC: 80-100, SUSPICIOUS: 40-79, LIKELY_FAKE: 0-39.',
    ),
  applicantName: z
    .string()
    .nullable()
    .describe(
      'Applicant name as it appears on the document, or null if not legible.',
    ),
  institutionName: z
    .string()
    .nullable()
    .describe(
      'Issuing institution name as it appears on the document, or null if not legible.',
    ),
  graduationYear: z
    .number()
    .int()
    .nullable()
    .describe('Graduation or examination year, or null if not present/legible.'),
  regNumber: z
    .string()
    .nullable()
    .describe(
      'Registration / candidate / matriculation number as printed, or null if absent.',
    ),
  imageQuality: z
    .enum(['GOOD', 'ACCEPTABLE', 'POOR'])
    .describe(
      'Subjective image quality. GOOD = sharp, well-lit, readable. ACCEPTABLE = some blur/noise but readable. POOR = significant degradation, hard to read.',
    ),
})

export type ClaudeAnalysis = z.infer<typeof ANALYSIS_SCHEMA>

const SYSTEM_PROMPT = `You are Verity, an AI forensic verification engine specialized in detecting fraudulent academic certificates, transcripts, identity documents and credentials from Nigerian institutions including:

- WAEC (West African Examinations Council)
- NECO (National Examinations Council)
- NABTEB (National Business and Technical Examinations Board)
- Federal and state universities (BSc, BA, BEng, MSc)
- Polytechnics (HND, OND)
- NYSC discharge / exemption certificates
- Professional bodies (ICAN, COREN, NMA)

You analyze documents across five dimensions:

1. **Visual integrity** — typography consistency (kerning, weight, baseline), alignment, color reproduction, paper/scan texture, image artifacts.

2. **Data plausibility** — date logic (graduation year vs. registration date), grade distributions (e.g. >5 A1 grades at WAEC is statistically rare), name formatting conventions, registration-number patterns matching the issuing body's known format.

3. **Institutional accuracy** — does the layout, header, motto, seal placement, logo and signatory block match the claimed institution? Are the right names, addresses and signatures present?

4. **Security features** — official watermarks, embossed seals, holographic strips, signatures, registration codes, QR codes, microprint where applicable.

5. **Anomalies** — signs of digital manipulation (font swaps, copy-paste artifacts, mismatched backgrounds, inconsistent kerning, edited fields, layered text, JPEG ghosting around tampered regions).

You are CONSERVATIVE. When uncertain, prefer SUSPICIOUS over AUTHENTIC. A false flag is cheaper than a passed forgery.

Reasoning style: concise, specific, and references concrete visual evidence ("the 'O' in NIGERIA is kerned differently in row 2", not "looks off"; "the 8 A1 grades are in the 0.3% tail of WAEC distributions", not "grades are too good").

Score guidance:
- AUTHENTIC verdict → trustScore 80-100, aiAnomaly typically <30
- SUSPICIOUS verdict → trustScore 40-79, aiAnomaly typically 30-60
- LIKELY_FAKE verdict → trustScore 0-39, aiAnomaly typically >60

Flag severity guidance:
- CRITICAL: would clearly invalidate the document (e.g. fake institution, impossible registration format)
- HIGH: strong evidence of forgery (e.g. inconsistent typography across fields, missing official watermark)
- MEDIUM: suspicious but not conclusive (e.g. unusual grade pattern, minor layout deviation)
- LOW: minor concern worth noting (e.g. heavy compression artifact obscuring a security feature)

You return strict JSON conforming to the requested schema. Never include text outside the JSON. Do not invent data — if a field is not legible, return null for it.`

const MEDIA_TYPE_MAP: Record<string, 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'> = {
  'image/png': 'image/png',
  'image/jpeg': 'image/jpeg',
  'image/jpg': 'image/jpeg',
  'image/webp': 'image/webp',
  'image/gif': 'image/gif',
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

interface AnalyzeParams {
  fileName: string
  fileType: string
  fileDataBase64: string
  certificateType?: string
  applicantName?: string
}

export async function analyzeWithClaude(params: AnalyzeParams): Promise<ClaudeAnalysis> {
  const { fileName, fileType, fileDataBase64, certificateType, applicantName } = params

  const client = new Anthropic()
  const isPdf = fileType.toLowerCase().startsWith('application/pdf')

  const documentBlock = isPdf
    ? ({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: fileDataBase64,
        },
      } as const)
    : ({
        type: 'image',
        source: {
          type: 'base64',
          media_type: MEDIA_TYPE_MAP[fileType.toLowerCase()] ?? 'image/jpeg',
          data: fileDataBase64,
        },
      } as const)

  const userPromptLines = [
    'Analyze the attached document for authenticity.',
    certificateType
      ? `Claimed document type: ${certificateType}.`
      : 'Document type: not specified — infer it from the document itself.',
    applicantName
      ? `Claimed applicant name: ${applicantName}. Cross-check against the name printed on the document and flag any mismatch.`
      : '',
    `File name (informational only — do not let the filename drive your verdict): ${fileName}.`,
    '',
    'Return your analysis as JSON matching the schema. Be specific in flags — reference concrete visual evidence.',
  ].filter(Boolean)

  try {
    const response = await client.messages.parse({
      model: 'claude-opus-4-7',
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      output_config: {
        format: zodOutputFormat(ANALYSIS_SCHEMA),
      },
      messages: [
        {
          role: 'user',
          content: [documentBlock, { type: 'text', text: userPromptLines.join('\n') }],
        },
      ],
    })

    if (!response.parsed_output) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'AI engine returned a response that did not match the expected schema.',
      })
    }

    return response.parsed_output
  } catch (error) {
    if (error instanceof TRPCError) throw error

    if (error instanceof Anthropic.RateLimitError) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'AI engine is rate-limited. Please try again in a few seconds.',
      })
    }
    if (error instanceof Anthropic.AuthenticationError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'AI engine authentication failed. Check ANTHROPIC_API_KEY.',
      })
    }
    if (error instanceof Anthropic.APIError) {
      if (error.status === 529) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'AI engine is temporarily overloaded. Please retry.',
        })
      }
      console.error('[verity:ai] API error', error.status, error.type, error.message)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `AI engine error: ${error.message}`,
      })
    }

    console.error('[verity:ai] Unexpected error', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Unexpected error during AI verification.',
    })
  }
}
