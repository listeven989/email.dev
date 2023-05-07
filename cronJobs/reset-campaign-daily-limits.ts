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

async function resetEmailsSentToday() {
  try {
    // Connect to the PostgreSQL database
    const client = new Client(connectionString);
    await client.connect();

    // Reset the emails_sent_today column for all campaigns
    const resetQuery = `
        UPDATE campaigns
        SET emails_sent_today = 0
      `;
    await client.query(resetQuery);

    console.log("Reset emails_sent_today for all campaigns");

    // Close the database connection
    await client.end();
  } catch (error) {
    console.error("Error resetting emails_sent_today:", error);
  }
}

// Schedule the cron job to run daily at 00:00
cron.schedule("0 0 * * *", () => {
  console.log("Running daily emails_sent_today reset cron job");
  resetEmailsSentToday()
    .then(() => {
      console.log("Finished resetting emails_sent_today for today");
    })
    .catch((error) => {
      console.error("Error in daily emails_sent_today reset cron job:", error);
    });
});
