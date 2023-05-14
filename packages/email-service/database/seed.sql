-- Insert a sample email account (replace the placeholder values with your Zoho email account information)
INSERT INTO email_accounts (email_address, display_name, smtp_host, smtp_port, username, password)
VALUES ('your_email@zoho.com', 'Your Name', 'smtp.zoho.com', 587, 'your_email@zoho.com', 'your_password');

-- Insert sample email templates
INSERT INTO email_templates (name, subject, text_content, html_content)
VALUES ('Welcome Email', 'Welcome to our site', 'Welcome to our site! We are glad to have you here.', '<h1>Welcome to our site!</h1><p>We are glad to have you here.</p>');

-- Get the IDs of the sample email account and template
DO $$ 
DECLARE 
    v_email_account_id UUID;
    v_email_template_id UUID;
BEGIN
    SELECT id INTO v_email_account_id FROM email_accounts WHERE email_address = 'your_email@zoho.com';
    SELECT id INTO v_email_template_id FROM email_templates WHERE name = 'Welcome Email';

    -- Insert a sample campaign
    INSERT INTO campaigns (email_account_id, email_template_id, name, reply_to_email_address)
    VALUES (v_email_account_id, v_email_template_id, 'Sample Campaign', 'your_email@zoho.com');

    -- Get the ID of the sample campaign
    DECLARE v_campaign_id UUID;
    SELECT id INTO v_campaign_id FROM campaigns WHERE name = 'Sample Campaign';

    -- Insert sample recipient emails
    INSERT INTO recipient_emails (campaign_id, email_address)
    VALUES (v_campaign_id, 'recipient1@example.com'),
           (v_campaign_id, 'recipient2@example.com'),
           (v_campaign_id, 'recipient3@example.com');
END $$;
