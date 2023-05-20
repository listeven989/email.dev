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
  linkId = linkId.replace(":", "");

  // Get the original URL from the database
  const query = `
    UPDATE link_clicks SET click_count = click_count + 1 WHERE id = $1 RETURNING url;
  `;


  try {
    const result = await pool.query(query, [linkId]);
    let url = result.rows[0].url;

    // TODO INJECT CUSTOM URL QUERY PARAMETERS INTO THE URL
     url = new URL(url);
    //  VALUES CAN BE QUERIED FROM THE DATABASE 
    // url.searchParams.append('email_address', 'value1'); // append a query parameter
    // url.searchParams.append('param2', 'value2'); // append another query parameter

    res.redirect(url.toString());
  } catch (error) {
    res.sendStatus(404);
    console.error("Error redirecting url status:", error);
  }
});

app.get("/", async (req, res) => {
  res.json({
    message: "Newsletter service"
  })
})