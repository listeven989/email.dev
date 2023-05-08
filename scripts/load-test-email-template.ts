import { promises as fs } from 'fs';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const EMAIL_FILE_PATH = 'scripts/email-templates/index.html';
const RECIPIENT_EMAILS = ['recipient1@example.com', 'recipient2@example.com', 'recipient3@example.com'];
const EMAIL_ACCOUNT_ID = 'c594b7eb-a1c3-42dc-94e7-8dc6fae1d26e' // 'your_email_account_id'

// Configure the PostgreSQL connection
const connectionString = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
};

async function loadHtmlToDatabase() {
  try {
    // Read the index.html file
    const htmlContent = await fs.readFile(EMAIL_FILE_PATH, 'utf-8');

    // Connect to the PostgreSQL database
    const client = new Client(connectionString);
    await client.connect();

    // Grab the first email 

    // Make a new campaign
    const campaignResult = await client.query(`
      INSERT INTO campaigns (email_account_id, name, subject)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [EMAIL_ACCOUNT_ID, 'New Campaign', 'Campaign Subject']);
    const campaignId = campaignResult.rows[0].id;

    // Insert the HTML content into the email_templates table and associate it with the new campaign
    const templateResult = await client.query(`
      INSERT INTO email_templates (name, subject, html_content)
      VALUES ($1, $2, $3)
      RETURNING id
    `, ['New Template', 'Template Subject', htmlContent]);
    const templateId = templateResult.rows[0].id;

    // Update the campaign with the email_template_id
    await client.query(`
      UPDATE campaigns
      SET email_template_id = $1
      WHERE id = $2
    `, [templateId, campaignId]);

    // Make a few dummy recipients
    for (const email of RECIPIENT_EMAILS) {
      await client.query(`
        INSERT INTO recipient_emails (campaign_id, email_address)
        VALUES ($1, $2)
      `, [campaignId, email]);
    }

    console.log('HTML content has been loaded into the database.');

    // Close the database connection
    await client.end();
  } catch (error) {
    console.error('Error loading HTML content into the database:', error);
  }
}

loadHtmlToDatabase();