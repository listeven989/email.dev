import * as dotenv from "dotenv";
import { Client } from "pg";
import { createTransport } from "nodemailer";
import * as cron from "node-cron";
import * as cheerio from "cheerio";
import cronstrue from "cronstrue";

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
      const emailsToSend = Math.min(
        campaign.daily_limit - campaign.emails_sent_today,
        1
      );

      // Get recipient emails for the current campaign (with emails_sent_today < emailsToSend)
      const recipientsQuery = `
          SELECT recipient_emails.id, recipient_emails.email_address
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
        console.log("Preparing to send email to " + recipient.email_address);

        const sendMailOpts: any = {
          from: `${campaign.display_name} <${campaign.from_email}>`,
          to: recipient.email_address,
          subject: campaign.subject,
        };

        const trackingPixelLink = `<img src="${process.env.TRACKING_SERVICE_URL}/newsletter-image/${recipient.id}" />`;

        const $ = cheerio.load(campaign.html_content);

        // replace all links in the html content with tracking links
        const links = $("a");

        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const originalUrl = $(link).attr("href");

          const query = `INSERT INTO link_clicks (url, recipient_email_id) VALUES ($1, $2) RETURNING id`;
          const result = await client.query(query, [originalUrl, recipient.id]);
          const linkClickId = result.rows[0].id;

          $(link).attr(
            "href",
            `${process.env.TRACKING_SERVICE_URL}/link/:${linkClickId}`
          );
        }

        // add the tracking pixel link into the html content
        let htmlContent = campaign.html_content;
        if ($("body").length > 0) {
          $("body").append(trackingPixelLink);
          htmlContent = $.html();
        } else {
          htmlContent = $.html();
          htmlContent.append(trackingPixelLink);
        }

        console.log({ htmlContent });

        if (campaign.html_content && campaign.text_content) {
          sendMailOpts["html"] = htmlContent;
          sendMailOpts["text"] = campaign.text_content;
        } else if (campaign.html_content) {
          sendMailOpts["html"] = htmlContent;
        } else {
          sendMailOpts["text"] = campaign.text_content;
        }

        await transporter.sendMail(sendMailOpts);

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

const CRON_LANG = "* * * * *";

// Schedule the cron job to run every minute
cron.schedule(CRON_LANG, () => {
  // Get date time in PDT time
  const now = new Date();
  const pdtDateTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "full",
    timeStyle: "long",
  }).format(now);

  // Convert CRON expression to human readable
  const cronExpression = "* * * * *";
  const humanReadableCron = cronstrue.toString(cronExpression);

  console.log(
    `${pdtDateTime}: Running email sender cron job ${humanReadableCron}`
  );

  // log TRACKING_SERVICE_URL
  if (!process.env.TRACKING_SERVICE_URL) {
    throw new Error(
      "TRACKING_SERVICE_URL environment variable must be set to run this cron"
    );
  }

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
