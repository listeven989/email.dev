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
    subject VARCHAR(255) NOT NULL,
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
SET daily_limit = 100
WHERE name = 'Sample Campaign';