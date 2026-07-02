import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------- Enums ----------
export const userRoleEnum = pgEnum("user_role", [
  "master",
  "admin",
  "user",
]);

export const planEnum = pgEnum("plan", [
  "free",
  "pro",
  "studio",
  "enterprise",
]);

export const generationTypeEnum = pgEnum("generation_type", [
  "text_to_image",
  "text_to_video",
  "image_to_video",
  "video_enhance",
  "image_enhance",
]);

export const generationStatusEnum = pgEnum("generation_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "stripe",
  "jazzcash",
  "easypaisa",
  "bank_transfer",
  "manual",
]);

// ---------- Users ----------
export const users = pgTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: userRoleEnum("role").notNull().default("user"),
    plan: planEnum("plan").notNull().default("free"),
    credits: integer("credits").notNull().default(50),
    isUnlimited: boolean("is_unlimited").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    avatarColor: text("avatar_color").notNull().default("#6366f1"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
  }),
);

// ---------- Generations ----------
export const generations = pgTable(
  "generations",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: generationTypeEnum("type").notNull(),
    model: text("model").notNull().default("arena-pro"),
    prompt: text("prompt").notNull(),
    negativePrompt: text("negative_prompt"),
    inputImage: text("input_image"),
    settings: jsonb("settings").$type<Record<string, unknown>>(),
    status: generationStatusEnum("status").notNull().default("completed"),
    outputUrl: text("output_url"),
    outputMeta: jsonb("output_meta").$type<Record<string, unknown>>(),
    creditsUsed: integer("credits_used").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("generations_user_idx").on(t.userId),
    typeIdx: index("generations_type_idx").on(t.type),
  }),
);

// ---------- Subscriptions ----------
export const subscriptions = pgTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  plan: planEnum("plan").notNull(),
  status: text("status").notNull().default("active"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  creditsPerMonth: integer("credits_per_month").notNull().default(0),
  amountPaid: integer("amount_paid").notNull().default(0), // in PKR paisa
  currency: text("currency").notNull().default("PKR"),
});

// ---------- Transactions (Billing) ----------
export const transactions = pgTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    plan: planEnum("plan").notNull(),
    method: paymentMethodEnum("method").notNull(),
    status: transactionStatusEnum("status").notNull().default("pending"),
    amount: integer("amount").notNull(), // in smallest unit (paisa / cents)
    currency: text("currency").notNull().default("PKR"),
    reference: text("reference"),
    proofNote: text("proof_note"),
    creditsGranted: integer("credits_granted").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => ({
    userIdx: index("transactions_user_idx").on(t.userId),
  }),
);

// ---------- Sessions (server-side session tokens) ----------
export const sessions = pgTable("sessions", {
  id: text("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Generation = typeof generations.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
