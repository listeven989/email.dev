import * as dotenv from "dotenv";
import { Client } from "pg";
import { createTransport } from "nodemailer";
import * as cron from "node-cron";
import * as cheerio from "cheerio";
import cronstrue from "cronstrue";

dotenv.config();

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
  const client = new Client(connectionString);
  await client.connect();

  const campaigns = await getCampaigns(client);
  for (const campaign of campaigns) {
    console.log("Starting campaign: ", campaign.campaign_id);

    try {
      const emailsToSend = campaign.daily_limit - campaign.emails_sent_today;
      if (emailsToSend <= 0) {
        console.log("Campaign limit reached moving to next campaign.");
        continue;
      }

      const recipients = await getRecipients(client, campaign.campaign_id);
      const transporter = createTransport(getTransporterConfig(campaign));

      let errorOccurred = false;
      let delay = 0;
      for (const recipient of recipients) {
        console.log(
          "Campiagn id: ",
          campaign.campaign_id,
          " / ",
          "Sending email to: ",
          recipient.email_address
        );

        const sendMailOpts = await getSendMailOptions(
          client,
          campaign,
          recipient
        );
        await transporter.sendMail(sendMailOpts);

        await incrementEmailsSentToday(client, campaign.campaign_id);
        await updateRecipientEmails(client, recipient.email_address, campaign.campaign_id);

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = delay === 0 ? 1000 : delay * 2;
      }

      const unsentEmailsCount = await getUnsentEmailsCount(
        client,
        campaign.campaign_id
      );
      if (unsentEmailsCount === 0) {
        await updateCampaignStatus(client, campaign.campaign_id);
      }
    } catch (error) {
      console.error(`An error occurred during campaign ${campaign.campaign_id}:`, error);
      await pauseCampaignOnError(client, campaign.campaign_id, campaign.name);
    }
  }

  await client.end();
}

function getTransporterConfig(campaign: any) {
  return {
    host: campaign.smtp_host,
    port: campaign.smtp_port,
    secure: false,
    auth: {
      user: campaign.username,
      pass: campaign.password,
    },
  };
}

async function getSendMailOptions(
  client: Client,
  campaign: any,
  recipient: any
) {
  const sendMailOpts: any = {
    from: `${campaign.display_name} <${campaign.from_email}>`,
    to: recipient.email_address,
    subject: campaign.subject,
  };

  const trackingPixelLink = `<img src="${process.env.TRACKING_SERVICE_URL}/newsletter-image/${recipient.id}" />`;
  const $ = cheerio.load(campaign.html_content);

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

  if ($("body").length > 0) {
    $("body").append(trackingPixelLink);
    sendMailOpts["html"] = $.html();
  } else {
    sendMailOpts["html"] = $.html() + trackingPixelLink;
  }

  if (campaign.text_content) {
    sendMailOpts["text"] = campaign.text_content;
  }

  return sendMailOpts;
}

async function getCampaigns(client: Client) {
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
    WHERE campaigns.status = 'active' AND campaigns.archive = false
  `;
  const campaignsResult = await client.query(campaignsQuery);
  return campaignsResult.rows;
}

async function getRecipients(client: Client, campaignId: number) {
  const recipientsQuery = `
    SELECT recipient_emails.id, recipient_emails.email_address
    FROM recipient_emails
    JOIN campaigns ON recipient_emails.campaign_id = campaigns.id
    WHERE recipient_emails.campaign_id = $1 AND recipient_emails.sent = false
  `;
  const recipientsResult = await client.query(recipientsQuery, [campaignId]);
  return recipientsResult.rows;
}

async function incrementEmailsSentToday(client: Client, campaignId: number) {
  const updateEmailsSentTodayQuery = `
    UPDATE campaigns
    SET emails_sent_today = emails_sent_today + 1
    WHERE id = $1
    RETURNING *
  `;
  const result = await client.query(updateEmailsSentTodayQuery, [campaignId]);

  if (
    result.rowCount === 0 ||
    result.rows[0].emails_sent_today === null
  ) {
    throw new Error(
      `Failed to increment emails_sent_today for campaign: ${campaignId}`
    );
  }
}

// TODO: update the email_address to be email_account_id
async function updateRecipientEmails(client: Client, email_address: string, campaign_id: number) {
  const updateRecipientEmailsQuery = `
    UPDATE recipient_emails
    SET sent = true, sent_at = NOW()
    WHERE email_address = $1 AND campaign_id = $2
    RETURNING sent, sent_at
  `;
  const result = await client.query(updateRecipientEmailsQuery, [
    email_address,
    campaign_id,
  ]);

  console.log("Update recipient emails query result:", result);

  if (
    result.rowCount === 0 ||
    !result.rows[0].sent ||
    result.rows[0].sent_at === null
  ) {
    throw new Error(
      `Failed to update sent and sent_at for recipient: ${email_address}`
    );
  }
}

async function getUnsentEmailsCount(client: Client, campaignId: number) {
  const unsentEmailsQuery = `
    SELECT COUNT(*)
    FROM recipient_emails
    WHERE campaign_id = $1 AND sent = false
  `;
  const unsentEmailsResult = await client.query(unsentEmailsQuery, [
    campaignId,
  ]);
  return parseInt(unsentEmailsResult.rows[0].count);
}

async function updateCampaignStatus(client: Client, campaignId: number) {
  const updateCampaignStatusQuery = `
    UPDATE campaigns
    SET status = 'completed'
    WHERE id = $1
    RETURNING *
  `;
  const result = await client.query(updateCampaignStatusQuery, [campaignId]);

  if (
    result.rowCount === 0 ||
    !result.rows[0].status ||
    result.rows[0].status !== 'completed'
  ) {
    throw new Error(
      `Failed to update status to 'completed' for campaign: ${campaignId}`
    );
  }
}

async function pauseCampaignOnError(
  client: Client,
  campaignId: number,
  campaignName: string
) {
  const updateCampaignQuery = `
    UPDATE campaigns
    SET status = 'paused', name = $1
    WHERE id = $2
  `;
  await client.query(updateCampaignQuery, [
    `${campaignName} - AUTO PAUSED DUE TO ERROR`,
    campaignId,
  ]);
}

const CRON_SCHEDULE =
  process.env.ENVIRONMENT === "prod" ? "0 * * * *" : "* * * * *";

cron.schedule(CRON_SCHEDULE, () => {
  const now = new Date();
  const pdtDateTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "full",
    timeStyle: "long",
  }).format(now);

  const humanReadableCron = cronstrue.toString(CRON_SCHEDULE);
  console.log(
    `${pdtDateTime}: Running email sender cron job ${humanReadableCron}`
  );

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
