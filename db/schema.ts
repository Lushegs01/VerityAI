import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  json,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Users (employers) ──────────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  fullName: varchar("full_name", { length: 255 }),
  companyName: varchar("company_name", { length: 255 }),
  companyType: mysqlEnum("company_type", [
    "bank", "insurance", "university", "government", "ngo",
    "corporate", "recruitment", "other",
  ]).default("other"),
  phone: varchar("phone", { length: 50 }),
  walletBalance: decimal("wallet_balance", { precision: 12, scale: 2 }).default("0.00").notNull(),
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"]).default("free").notNull(),
  verificationCount: int("verification_count").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Certificates ───────────────────────────────────────────────
export const certificates = mysqlTable("certificates", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 20 }).notNull().unique(),
  employerId: bigint("employer_id", { mode: "number", unsigned: true }).notNull(),
  bulkJobId: bigint("bulk_job_id", { mode: "number", unsigned: true }),

  // File info
  originalFilename: varchar("original_filename", { length: 255 }),
  fileUrl: text("file_url"),
  fileSize: int("file_size"),
  fileType: mysqlEnum("file_type", ["image", "pdf"]).default("image"),
  fileHash: varchar("file_hash", { length: 64 }),

  // Applicant info
  applicantName: varchar("applicant_name", { length: 255 }),
  applicantEmail: varchar("applicant_email", { length: 255 }),

  // Extracted metadata
  certificateType: mysqlEnum("certificate_type", [
    "WAEC", "NECO", "NABTEB", "HND", "BSc", "BA", "BEng",
    "MSc", "OND", "NYSC", "ICAN", "COREN", "NMA", "other",
  ]).default("other"),
  institutionName: varchar("institution_name", { length: 255 }),
  graduationYear: int("graduation_year"),
  regNumber: varchar("reg_number", { length: 100 }),
  grades: json("grades").$type<Record<string, string>>(),
  certificateSerial: varchar("certificate_serial", { length: 100 }),

  // AI Analysis
  aiVisualIntegrity: int("ai_visual_integrity").default(0),
  aiDataPlausibility: int("ai_data_plausibility").default(0),
  aiAnomaly: int("ai_anomaly").default(0),
  aiInstitution: int("ai_institution").default(0),
  aiSecurityFeatures: int("ai_security_features").default(0),
  aiConfidence: int("ai_confidence").default(0),
  aiVerdict: mysqlEnum("ai_verdict", ["AUTHENTIC", "SUSPICIOUS", "LIKELY_FAKE"]),
  aiReasoning: text("ai_reasoning"),
  aiFlags: json("ai_flags").$type<Array<{
    type: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    field: string;
    description: string;
  }>>(),

  // Rule engine
  ruleScore: int("rule_score").default(0),
  ruleFlags: json("rule_flags").$type<Array<{
    rule: string;
    description: string;
    penalty: number;
  }>>(),

  // Final
  trustScore: int("trust_score").default(0),
  verdict: mysqlEnum("verdict", ["VERIFIED", "SUSPICIOUS", "LIKELY_FAKE"]).default("SUSPICIOUS"),
  imageQuality: mysqlEnum("image_quality", ["GOOD", "ACCEPTABLE", "POOR"]).default("GOOD"),

  // Processing
  status: mysqlEnum("status", [
    "pending", "preprocessing", "ai_analysis", "rule_check",
    "scoring", "completed", "failed", "disputed",
  ]).default("pending"),
  processingTimeMs: int("processing_time_ms"),
  errorMessage: text("error_message"),
  costCharged: decimal("cost_charged", { precision: 8, scale: 2 }).default("0.00"),
  isCached: boolean("is_cached").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

// ─── Bulk Jobs ──────────────────────────────────────────────────
export const bulkJobs = mysqlTable("bulk_jobs", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 20 }).notNull().unique(),
  employerId: bigint("employer_id", { mode: "number", unsigned: true }).notNull(),
  totalCount: int("total_count").default(0),
  processedCount: int("processed_count").default(0),
  verifiedCount: int("verified_count").default(0),
  suspiciousCount: int("suspicious_count").default(0),
  fakeCount: int("fake_count").default(0),
  failedCount: int("failed_count").default(0),
  cachedCount: int("cached_count").default(0),
  status: mysqlEnum("status", [
    "queued", "processing", "completed", "cancelled", "failed",
  ]).default("queued"),
  totalCost: decimal("total_cost", { precision: 12, scale: 2 }).default("0.00"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BulkJob = typeof bulkJobs.$inferSelect;

// ─── Wallet Transactions ────────────────────────────────────────
export const walletTransactions = mysqlTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  employerId: bigint("employer_id", { mode: "number", unsigned: true }).notNull(),
  type: mysqlEnum("type", [
    "topup", "deduction", "refund",
  ]).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 12, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 2 }).notNull(),
  certificateId: bigint("certificate_id", { mode: "number", unsigned: true }),
  bulkJobId: bigint("bulk_job_id", { mode: "number", unsigned: true }),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("completed"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WalletTransaction = typeof walletTransactions.$inferSelect;

// ─── Institutions ───────────────────────────────────────────────
export const institutions = mysqlTable("institutions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  acronym: varchar("acronym", { length: 50 }),
  type: mysqlEnum("type", [
    "university", "polytechnic", "college_of_education",
    "monotechnic", "exam_body", "professional_body",
  ]),
  foundedYear: int("founded_year"),
  state: varchar("state", { length: 100 }),
  isVerifiedPartner: boolean("is_verified_partner").default(false),
  logoUrl: text("logo_url"),
  website: varchar("website", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Institution = typeof institutions.$inferSelect;

// ─── Applicant Self Verify ─────────────────────────────────────
export const applicantSelfVerifies = mysqlTable("applicant_self_verifies", {
  id: serial("id").primaryKey(),
  shareToken: varchar("share_token", { length: 20 }).notNull().unique(),
  applicantName: varchar("applicant_name", { length: 255 }),
  applicantEmail: varchar("applicant_email", { length: 255 }),
  certificateId: bigint("certificate_id", { mode: "number", unsigned: true }).notNull(),
  amountPaid: decimal("amount_paid", { precision: 8, scale: 2 }),
  viewCount: int("view_count").default(0),
  lastViewedAt: timestamp("last_viewed_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ApplicantSelfVerify = typeof applicantSelfVerifies.$inferSelect;
