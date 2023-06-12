import express from "express";
import path from "path";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 8301;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Database connection configuration
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

// Create a connection pool
const pool = new Pool(connectionString);

// Update email status in the database
const updateEmailStatus = async (emailId: string) => {
  const query = `
    UPDATE recipient_emails
    SET read = read + 1, read_at = $1
    WHERE id = $2 AND read >= 0
  `;

  try {
    await pool.query(query, [new Date(), emailId]);
  } catch (error) {
    console.error("Error updating email status:", error);
  }
};

// tracking endpoint but renamed to newsletter-image so that gmail doesn't block it
app.get("/newsletter-image/:recipientEmailId", async (req, res) => {
  let emailId = req.params.recipientEmailId;

  console.log({ emailId });

  if (emailId) {
    await updateEmailStatus(emailId);
  }

  // Serve the tracking pixel
  res.sendFile(path.join(__dirname, "pixel.png"));
});

app.get("/link/:linkId", async (req, res) => {
  let linkId = req.params.linkId;
  // TODO(@steven4354): remove this
  linkId = linkId.replace(":", "");

  const userAgent = req.headers['user-agent'];
  
  // Get the original URL from the database
  const query = `
    UPDATE link_clicks SET user_agent=$2, click_count = click_count + 1 WHERE id = $1 RETURNING url,recipient_email_id;
  `;

  try {
    // log preparing to redirect and id
    console.log("Preparing to redirect: ", linkId);
    const result = await pool.query(query, [linkId,userAgent]);
    let { url, recipient_email_id } = result.rows[0];

    // check if url has https:// otherwise append it
    if (!url.startsWith("https://") && !url.startsWith("http://") && !url.startsWith("mailto:")) {
      url = `https://${url}`;
    }

    console.log("Url acquired from database. Redirecting to: ", url);

    // inject email query parameter
    const recipientQuery = `SELECT email_address FROM recipient_emails WHERE id = $1`;

    const recipientResult = await pool.query(recipientQuery, [recipient_email_id]);
    let { email_address } = recipientResult.rows[0];

    url = new URL(url);
    url.searchParams.append('email_address', email_address);

    res.redirect(url.toString());
  } catch (error) {
    res.sendStatus(404);
    console.error("Error redirecting url status:", error);
  }
});

app.get("/", async (req, res) => {
  res.json({
    message: "Newsletter service",
  });
});
