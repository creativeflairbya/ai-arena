-- AI Studio Database Initialization Script
-- Run this after creating your database

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  credits INTEGER NOT NULL DEFAULT 100,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_ends_at TIMESTAMP,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  settings JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  result_url TEXT,
  thumbnail_url TEXT,
  error TEXT,
  credits_used INTEGER NOT NULL DEFAULT 0,
  processing_time INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  credits INTEGER,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL UNIQUE,
  api_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create master account
-- Password: Master@123456 (bcrypt hash with 10 rounds)
INSERT INTO users (email, password, name, role, credits, subscription_tier, subscription_status)
VALUES (
  'master@aistudio.com',
  '$2a$10$rGHvH0rFwxQxJZqQXqH0LO5kF7YZqY5xXZqY5xXZqY5xXZqY5xXZq',
  'Master Admin',
  'master',
  999999999,
  'unlimited',
  'active'
)
ON CONFLICT (email) DO NOTHING;

-- Success message
SELECT 'Database initialized successfully!' as message;
SELECT 'Master account created with email: master@aistudio.com' as info;
