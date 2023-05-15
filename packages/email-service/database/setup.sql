-- Create the "uuid-ossp" extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the email_accounts table
CREATE TABLE IF NOT EXISTS email_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_address VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    smtp_host VARCHAR(255) NOT NULL,
    smtp_port INTEGER NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create the email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    text_content TEXT,
    html_content TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create the campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_account_id UUID NOT NULL REFERENCES email_accounts(id) ON DELETE CASCADE,
    email_template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL UNIQUE,
    reply_to_email_address VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create the recipient_emails table
CREATE TABLE IF NOT EXISTS recipient_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    email_address VARCHAR(255) NOT NULL,
    sent BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add daily_limit and emails_sent_today columns to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'daily_limit') THEN
    ALTER TABLE campaigns
    ADD COLUMN daily_limit INT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'emails_sent_today') THEN
    ALTER TABLE campaigns
    ADD COLUMN emails_sent_today INT DEFAULT 0;
  END IF;
END $$;

-- Update the sample campaign with daily limit
UPDATE campaigns
SET daily_limit = 20
WHERE name = 'Sample Campaign';

-- Create campaign_status ENUM type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
    CREATE TYPE campaign_status AS ENUM ('paused', 'active', 'completed');
  END IF;
END $$;

-- Add status column to campaigns table with campaign_status ENUM type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'status') THEN
    ALTER TABLE campaigns
    ADD COLUMN status campaign_status NOT NULL DEFAULT 'paused';
  END IF;
END $$;

-- Add daily_limit and emails_sent_today columns to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'daily_limit') THEN
    ALTER TABLE campaigns
    ADD COLUMN daily_limit INT DEFAULT 20;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'emails_sent_today') THEN
    ALTER TABLE campaigns
    ADD COLUMN emails_sent_today INT DEFAULT 0;
  END IF;
END $$;

-- Check if the UNIQUE constraint exists before dropping it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'email_templates_name_key'
      AND table_name = 'email_templates'
  ) THEN
    ALTER TABLE email_templates
    DROP CONSTRAINT email_templates_name_key;
  END IF;
END $$;

-- Delete the subject column in the campaigns table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'campaigns'
      AND column_name = 'subject'
  ) THEN
    ALTER TABLE campaigns
    DROP COLUMN subject;
  END IF;
END $$;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add user_id column to email_accounts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_accounts' AND column_name = 'user_id') THEN
    ALTER TABLE email_accounts
    ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id column to email_templates table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'email_templates' AND column_name = 'user_id') THEN
    ALTER TABLE email_templates
    ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id column to campaigns table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'user_id') THEN
    ALTER TABLE campaigns
    ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;
