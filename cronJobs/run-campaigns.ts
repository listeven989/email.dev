import * as dotenv from "dotenv";
import { Client } from "pg";
import { createTransport } from "nodemailer";
import * as cron from "node-cron";

dotenv.config();

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

async function sendCampaignEmails() {
  try {
    // Connect to the PostgreSQL database
    const client = new Client(connectionString);
    await client.connect();

    // Get active campaigns and their associated email templates and email accounts
    const campaignsQuery = `
        SELECT 
          campaigns.id AS campaign_id,
          campaigns.daily_limit,
          campaigns.emails_sent_today,
          email_templates.subject,
          email_templates.text_content,
          email_templates.html_content,
          email_accounts.email_address AS from_email,
          email_accounts.display_name,
          email_accounts.smtp_host,
          email_accounts.smtp_port,
          email_accounts.username,
          email_accounts.password
        FROM campaigns
        JOIN email_templates ON campaigns.email_template_id = email_templates.id
        JOIN email_accounts ON campaigns.email_account_id = email_accounts.id
        WHERE campaigns.status = 'active'
      `;
    const campaignsResult = await client.query(campaignsQuery);
    const campaigns = campaignsResult.rows;

    // Process each campaign
    for (const campaign of campaigns) {
      // Calculate the number of emails to send for the current campaign
      const emailsToSend = campaign.daily_limit - campaign.emails_sent_today;

      // Get recipient emails for the current campaign (with emails_sent_today < emailsToSend)
      const recipientsQuery = `
          SELECT recipient_emails.email_address
          FROM recipient_emails
          JOIN campaigns ON recipient_emails.campaign_id = campaigns.id
          WHERE recipient_emails.campaign_id = $1 AND campaigns.emails_sent_today < $2 AND recipient_emails.sent = false
        `;
      const recipientsResult = await client.query(recipientsQuery, [
        campaign.campaign_id,
        emailsToSend,
      ]);
      const recipients = recipientsResult.rows;

      // Configure the email transporter (using the email account's SMTP settings)
      const transporter = createTransport({
        host: campaign.smtp_host,
        port: campaign.smtp_port,
        secure: false,
        auth: {
          user: campaign.username,
          pass: campaign.password,
        },
      });

      // Send the email to each recipient
      for (const recipient of recipients) {
        await transporter.sendMail({
          from: `${campaign.display_name} <${campaign.from_email}>`,
          to: recipient.email_address,
          subject: campaign.subject,
          text: campaign.text_content,
          html: campaign.html_content,
        });

        // Update the emails_sent_today for the current campaign in the database
        const updateEmailsSentTodayQuery = `
            UPDATE campaigns
            SET emails_sent_today = emails_sent_today + 1
            WHERE id = $1
          `;
        await client.query(updateEmailsSentTodayQuery, [campaign.campaign_id]);

        // Update the recipient_emails table, set sent from false to true
        const updateRecipientEmailsQuery = `
          UPDATE recipient_emails
          SET sent = true, sent_at = NOW()
          WHERE email_address = $1 AND campaign_id = $2
        `;

        await client.query(updateRecipientEmailsQuery, [
          recipient.email_address,
          campaign.campaign_id,
        ]);

        console.log(
          `Sent email to ${recipient.email_address} for campaign ${campaign.campaign_id}`
        );
      }

      // Check if all recipient emails are sent for the current campaign
      const unsentEmailsQuery = `
        SELECT COUNT(*)
        FROM recipient_emails
        WHERE campaign_id = $1 AND sent = false
      `;
      const unsentEmailsResult = await client.query(unsentEmailsQuery, [
        campaign.campaign_id,
      ]);
      const unsentEmailsCount = parseInt(unsentEmailsResult.rows[0].count);

      // If all recipient emails are sent, set the campaign status to 'completed'
      if (unsentEmailsCount === 0) {
        const updateCampaignStatusQuery = `
          UPDATE campaigns
          SET status = 'completed'
          WHERE id = $1
        `;
        await client.query(updateCampaignStatusQuery, [campaign.campaign_id]);
        console.log(`Campaign ${campaign.campaign_id} is completed.`);
      }
    }

    // Close the database connection
    await client.end();
  } catch (error) {
    console.error("Error sending emails:", error);
  }
}

// Schedule the cron job to run every minute
cron.schedule("* * * * *", () => {
  console.log("Running email sender cron job every minute");
  sendCampaignEmails()
    .then(() => {
      console.log("Finished sending emails for this minute");
    })
    .catch((error) => {
      console.error("Error in email sender cron job:", error);
    });
});

// Optionally, you can uncomment the following line to immediately send emails when the script starts:
// sendCampaignEmails();
