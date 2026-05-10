import { getDb } from "../api/queries/connection";
import { users, certificates, walletTransactions, bulkJobs, applicantSelfVerifies, institutions } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding Verity demo data...");

  // Clear existing data
  await db.delete(applicantSelfVerifies);
  await db.delete(certificates);
  await db.delete(bulkJobs);
  await db.delete(walletTransactions);
  await db.delete(users);
  await db.delete(institutions);

  // Create demo employer
  const [employer] = await db.insert(users).values({
    unionId: "demo-verity-2024",
    name: "Demo Employer",
    email: "demo@verity.ng",
    role: "user",
    fullName: "Chinedu Okonkwo",
    companyName: "Sterling HR Solutions",
    companyType: "recruitment",
    phone: "+234 803 456 7890",
    walletBalance: "9000.00",
    plan: "pro",
    verificationCount: 52,
  });

  // Create wallet transactions
  await db.insert(walletTransactions).values([
    {
      employerId: employer.insertId,
      type: "topup",
      amount: "10000.00",
      balanceBefore: "0.00",
      balanceAfter: "10000.00",
      description: "Wallet top-up via Squad card payment",
      status: "completed",
    },
    {
      employerId: employer.insertId,
      type: "deduction",
      amount: "500.00",
      balanceBefore: "10000.00",
      balanceAfter: "9500.00",
      description: "Single certificate verification (VRT-A3KX8)",
      status: "completed",
    },
    {
      employerId: employer.insertId,
      type: "deduction",
      amount: "500.00",
      balanceBefore: "9500.00",
      balanceAfter: "9000.00",
      description: "Single certificate verification (VRT-B7MNP)",
      status: "completed",
    },
  ]);

  // Create demo certificates
  const now = new Date();

  // 1. A fake certificate (score 19)
  const [fakeCert] = await db.insert(certificates).values({
    publicId: "VRT-A3KX8",
    employerId: employer.insertId,
    originalFilename: "waec_result_ifeanyi_2022.jpg",
    fileType: "image",
    applicantName: "Ifeanyi Chukwu",
    applicantEmail: "ifeanyi.c@email.com",
    certificateType: "WAEC",
    institutionName: "West African Examinations Council",
    graduationYear: 2022,
    regNumber: "40123456/001/001",
    aiVisualIntegrity: 25,
    aiDataPlausibility: 30,
    aiAnomaly: 85,
    aiInstitution: 40,
    aiSecurityFeatures: 15,
    aiConfidence: 78,
    aiVerdict: "LIKELY_FAKE",
    aiReasoning: "Multiple critical flags detected: font inconsistencies in the grades column, registration number format does not match WAEC pattern, and 8 A1 grades is statistically extremely rare. Certificate shows signs of digital manipulation.",
    aiFlags: JSON.stringify([
      { type: "FONT_INCONSISTENCY", severity: "HIGH", field: "grades", description: "Font weight and spacing inconsistent across grades column" },
      { type: "REGISTRATION_FORMAT_INVALID", severity: "CRITICAL", field: "reg_number", description: "Reg number does not match WAEC format pattern" },
      { type: "IMPLAUSIBLE_GRADES", severity: "MEDIUM", field: "grades", description: "8 A1 grades statistically very rare (0.3% probability)" },
      { type: "MISSING_SECURITY_FEATURE", severity: "HIGH", field: "seal", description: "Official WAEC watermark absent or poorly replicated" },
    ]),
    ruleScore: 35,
    ruleFlags: JSON.stringify([
      { rule: "RegNumberFormatRule", description: "Registration number format invalid for WAEC", penalty: 25 },
      { rule: "GradeDistributionRule", description: "8 A1 grades exceeds plausible threshold", penalty: 20 },
      { rule: "InstitutionExistsRule", description: "WAEC is valid institution", penalty: 0 },
    ]),
    trustScore: 19,
    verdict: "LIKELY_FAKE",
    imageQuality: "ACCEPTABLE",
    status: "completed",
    processingTimeMs: 12400,
    costCharged: "500.00",
    completedAt: now,
  });

  // 2. A genuine certificate (score 91)
  const [genuineCert] = await db.insert(certificates).values({
    publicId: "VRT-B7MNP",
    employerId: employer.insertId,
    originalFilename: "unilag_bsc_adebayo_2021.jpg",
    fileType: "image",
    applicantName: "Adebayo Adeniran",
    applicantEmail: "adebayo.a@email.com",
    certificateType: "BSc",
    institutionName: "University of Lagos",
    graduationYear: 2021,
    regNumber: "160407502",
    aiVisualIntegrity: 92,
    aiDataPlausibility: 95,
    aiAnomaly: 5,
    aiInstitution: 98,
    aiSecurityFeatures: 88,
    aiConfidence: 94,
    aiVerdict: "AUTHENTIC",
    aiReasoning: "Certificate demonstrates consistent typography, proper UNILAG formatting and seal placement, plausible grade distribution consistent with Computer Science program. All security features present and valid.",
    aiFlags: JSON.stringify([]),
    ruleScore: 95,
    ruleFlags: JSON.stringify([]),
    trustScore: 91,
    verdict: "VERIFIED",
    imageQuality: "GOOD",
    status: "completed",
    processingTimeMs: 11200,
    costCharged: "500.00",
    completedAt: new Date(now.getTime() - 3600000),
  });

  // Create bulk job with 50 certificates
  const [bulkJob] = await db.insert(bulkJobs).values({
    publicId: "VRT-BLK-50",
    employerId: employer.insertId,
    totalCount: 50,
    processedCount: 50,
    verifiedCount: 38,
    suspiciousCount: 9,
    fakeCount: 3,
    failedCount: 0,
    cachedCount: 2,
    status: "completed",
    totalCost: "25000.00",
    startedAt: new Date(now.getTime() - 86400000),
    completedAt: new Date(now.getTime() - 82800000),
  });

  // Generate 50 certificates for the bulk job
  const certTypes = ["WAEC", "NECO", "BSc", "HND", "OND", "NYSC"] as const;
  const verdicts = ["VERIFIED", "SUSPICIOUS", "LIKELY_FAKE"] as const;
  const names = [
    "Amina Bello", "Tunde Bakare", "Ngozi Okafor", "Emeka Obi", "Fatima Ibrahim",
    "Olumide Adeyemi", "Chioma Eze", "Yusuf Garba", "Chidinma Nwosu", "Abdul Mohammed",
    "Blessing Akpan", "Samuel Ojo", "Peace Okon", "David Adeleke", "Grace John",
    "Ibrahim Suleiman", "Ruth Oyedele", "Daniel Ogundipe", "Precious Nnamdi",
    "Joseph Akintola", "Maryam Abdullahi", "Sunday Ogunleye", "Esther Agbo",
    "Michael Babatunde", "Aisha Lawal", "Peter Nwachukwu", "Comfort Bassey",
    "James Adewale", "Loveth Ibeh", "Paulinus Okeke", "Cynthia Madu",
    "Musa Danjuma", "Rebecca Adigun", "Favour Etim", "Matthew Akpan",
    "Janet Effiong", "Johnbull Udo", "Stella Essien", "Aliyu Abdulsalam",
    "Patience George", "Emmanuel Udoh", "Deborah Olayemi", "Timothy Ajayi",
    "Gloria Ani", "Stephen Edeh", "Vivian Onuoha", "Francis Odinaka",
    "Hope Emeka", "Samuel Ior",
  ];

  const bulkCerts = [];
  for (let i = 0; i < 50; i++) {
    const verdictDist = ["VERIFIED", "VERIFIED", "VERIFIED", "VERIFIED",
      "SUSPICIOUS", "SUSPICIOUS", "LIKELY_FAKE"][Math.floor(Math.random() * 7)];
    const certType = certTypes[Math.floor(Math.random() * certTypes.length)];
    const trustScore = verdictDist === "VERIFIED"
      ? 75 + Math.floor(Math.random() * 25)
      : verdictDist === "SUSPICIOUS"
        ? 50 + Math.floor(Math.random() * 34)
        : Math.floor(Math.random() * 49);

    bulkCerts.push({
      publicId: `VRT-BLK${String(i + 1).padStart(3, "0")}`,
      employerId: employer.insertId,
      bulkJobId: bulkJob.insertId,
      originalFilename: `cert_${i + 1}.jpg`,
      fileType: "image" as const,
      applicantName: names[i] || `Candidate ${i + 1}`,
      certificateType: certType,
      institutionName: certType === "WAEC" || certType === "NECO"
        ? "West African Examinations Council"
        : "University of Lagos",
      graduationYear: 2019 + Math.floor(Math.random() * 5),
      trustScore,
      verdict: verdictDist,
      imageQuality: "GOOD",
      status: "completed" as const,
      costCharged: "500.00",
      completedAt: new Date(now.getTime() - 82800000 + i * 30000),
    });
  }

  // Batch insert bulk certificates
  for (const cert of bulkCerts) {
    await db.insert(certificates).values(cert);
  }

  // Create self-verify badge
  const [selfVerify] = await db.insert(applicantSelfVerifies).values({
    shareToken: "DEMO-VRT-2024",
    applicantName: "Chioma Okonkwo",
    applicantEmail: "chioma.o@email.com",
    certificateId: genuineCert.insertId,
    amountPaid: "1000.00",
    expiresAt: new Date(now.getTime() + 7776000000),
    isActive: true,
  });

  // Create institutions
  await db.insert(institutions).values([
    { name: "University of Lagos", acronym: "UNILAG", type: "university", foundedYear: 1962, state: "Lagos", isVerifiedPartner: true, website: "https://unilag.edu.ng" },
    { name: "University of Ibadan", acronym: "UI", type: "university", foundedYear: 1948, state: "Oyo", isVerifiedPartner: true, website: "https://ui.edu.ng" },
    { name: "Obafemi Awolowo University", acronym: "OAU", type: "university", foundedYear: 1961, state: "Osun", isVerifiedPartner: true, website: "https://oauife.edu.ng" },
    { name: "University of Nigeria", acronym: "UNN", type: "university", foundedYear: 1960, state: "Enugu", isVerifiedPartner: true, website: "https://unn.edu.ng" },
    { name: "Covenant University", acronym: "CU", type: "university", foundedYear: 2002, state: "Ogun", isVerifiedPartner: true, website: "https://covenantuniversity.edu.ng" },
    { name: "Ahmadu Bello University", acronym: "ABU", type: "university", foundedYear: 1962, state: "Kaduna", isVerifiedPartner: true, website: "https://abu.edu.ng" },
    { name: "West African Examinations Council", acronym: "WAEC", type: "exam_body", foundedYear: 1951, state: "Lagos", isVerifiedPartner: true, website: "https://waec.org.ng" },
    { name: "National Examination Council", acronym: "NECO", type: "exam_body", foundedYear: 1999, state: "Niger", isVerifiedPartner: true, website: "https://neco.gov.ng" },
    { name: "Institute of Chartered Accountants", acronym: "ICAN", type: "professional_body", foundedYear: 1965, state: "Lagos", isVerifiedPartner: true, website: "https://ican.org.ng" },
    { name: "National Youth Service Corps", acronym: "NYSC", type: "professional_body", foundedYear: 1973, state: "Federal", isVerifiedPartner: true, website: "https://nysc.gov.ng" },
  ]);

  console.log("✅ Seeded successfully!");
  console.log("Demo login: demo@verity.ng (via OAuth)");
  console.log("Stats: 52 verifications, 2 individual + 50 bulk");
  console.log("Wallet balance: N9,000");
}

seed().catch(console.error);
