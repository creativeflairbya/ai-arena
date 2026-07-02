import { pgTable, text, timestamp, integer, boolean, uuid, json, varchar, decimal } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('user'), // 'master', 'admin', 'user'
  credits: integer('credits').notNull().default(100),
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free'), // 'free', 'basic', 'pro', 'unlimited'
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('active'), // 'active', 'cancelled', 'expired'
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const generations = pgTable('generations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'image', 'video', 'text-to-video', 'image-to-video'
  provider: varchar('provider', { length: 50 }).notNull(), // 'seedance', 'veo', 'kling', 'flux', 'replicate'
  prompt: text('prompt').notNull(),
  negativePrompt: text('negative_prompt'),
  settings: json('settings'), // Store additional settings like aspect ratio, duration, etc.
  status: varchar('status', { length: 50 }).notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  resultUrl: text('result_url'),
  thumbnailUrl: text('thumbnail_url'),
  error: text('error'),
  creditsUsed: integer('credits_used').notNull().default(0),
  processingTime: integer('processing_time'), // in seconds
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // 'credit_purchase', 'subscription', 'refund'
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('USD'),
  credits: integer('credits'),
  paymentMethod: varchar('payment_method', { length: 50 }), // 'stripe', 'jazzcash', 'easypaisa', 'bank_transfer'
  paymentStatus: varchar('payment_status', { length: 50 }).notNull().default('pending'), // 'pending', 'completed', 'failed', 'refunded'
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  provider: varchar('provider', { length: 50 }).notNull().unique(), // 'seedance', 'veo', 'kling', 'flux', 'replicate'
  apiKey: text('api_key').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  usageCount: integer('usage_count').notNull().default(0),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Generation = typeof generations.$inferSelect;
export type NewGeneration = typeof generations.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
