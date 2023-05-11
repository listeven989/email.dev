// pages/api/campaign.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { NextResponse } from 'next/server';

dotenv.config();

const connectionString = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    campaignName,
    emailTemplateName,
    emailSubjectLine,
    emailHtmlContent: htmlContent,
    recipientEmails,
    emailAccountId,
  } = req.body;

  try {
    const client = new Client(connectionString);
    await client.connect();

    const campaignResult = await client.query(`
      INSERT INTO campaigns (email_account_id, name, subject, daily_limit)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [emailAccountId, campaignName, 'Campaign Subject', 20]);
    const campaignId = campaignResult.rows[0].id;

    const templateResult = await client.query(`
      INSERT INTO email_templates (name, subject, html_content)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [emailTemplateName, emailSubjectLine, htmlContent]);
    const templateId = templateResult.rows[0].id;

    await client.query(`
      UPDATE campaigns
      SET email_template_id = $1
      WHERE id = $2
    `, [templateId, campaignId]);

    for (const email of recipientEmails) {
      await client.query(`
        INSERT INTO recipient_emails (campaign_id, email_address)
        VALUES ($1, $2)
      `, [campaignId, email]);
    }

    await client.end();

    res.status(200).json({ message: 'HTML content has been loaded into the database.' });
  } catch (error) {
    res.status(500).json({ message: 'Error loading HTML content into the database:', error });
  }
}