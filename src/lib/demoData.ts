/**
 * In-memory demo data used when isDemo is true and the trpc backend
 * would otherwise 401. Stable, deterministic, and shaped to match the
 * real tRPC response types so the pages render identically.
 */

export const demoStats = {
  totalVerified: 184,
  totalSuspicious: 27,
  totalFake: 12,
}

export const demoActivity: { date: string; count: number }[] = [
  { date: 'Apr 14', count: 8 },
  { date: 'Apr 15', count: 14 },
  { date: 'Apr 16', count: 9 },
  { date: 'Apr 17', count: 22 },
  { date: 'Apr 18', count: 18 },
  { date: 'Apr 19', count: 11 },
  { date: 'Apr 20', count: 26 },
  { date: 'Apr 21', count: 31 },
  { date: 'Apr 22', count: 19 },
  { date: 'Apr 23', count: 14 },
  { date: 'Apr 24', count: 23 },
  { date: 'Apr 25', count: 28 },
]

export interface DemoCertificate {
  id: number
  publicId: string
  applicantName: string
  institutionName: string
  certificateType: string
  verdict: 'VERIFIED' | 'SUSPICIOUS' | 'LIKELY_FAKE'
  trustScore: number
  createdAt: Date
}

export const demoRecent: DemoCertificate[] = [
  {
    id: 1,
    publicId: 'VRT-A7K2P9',
    applicantName: 'Adebayo Adeniran',
    institutionName: 'University of Lagos',
    certificateType: 'BSc',
    verdict: 'VERIFIED',
    trustScore: 91,
    createdAt: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: 2,
    publicId: 'VRT-K2P8M4',
    applicantName: 'Chiamaka Okonkwo',
    institutionName: 'Covenant University',
    certificateType: 'MBA',
    verdict: 'VERIFIED',
    trustScore: 87,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: 3,
    publicId: 'VRT-92HD3T',
    applicantName: 'Tunde Bakare',
    institutionName: 'Ahmadu Bello University',
    certificateType: 'WAEC',
    verdict: 'SUSPICIOUS',
    trustScore: 54,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: 4,
    publicId: 'VRT-X4N7P2',
    applicantName: 'Funke Ojo',
    institutionName: 'Lagos Business School',
    certificateType: 'PGD',
    verdict: 'VERIFIED',
    trustScore: 94,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
  {
    id: 5,
    publicId: 'VRT-J3K9T7',
    applicantName: 'Ibrahim Yusuf',
    institutionName: 'Unknown Polytechnic',
    certificateType: 'HND',
    verdict: 'LIKELY_FAKE',
    trustScore: 18,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
]

export interface DemoTransaction {
  id: number
  type: 'credit' | 'debit'
  amount: number
  description: string
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  createdAt: Date
}

export const demoTransactions: DemoTransaction[] = [
  {
    id: 1,
    type: 'credit',
    amount: 5000,
    description: 'Wallet top-up via Squad',
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
  {
    id: 2,
    type: 'debit',
    amount: 500,
    description: 'Verification VRT-A7K2P9',
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: 3,
    type: 'debit',
    amount: 500,
    description: 'Verification VRT-K2P8M4',
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
  },
  {
    id: 4,
    type: 'credit',
    amount: 10000,
    description: 'Wallet top-up via Squad',
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50),
  },
]
