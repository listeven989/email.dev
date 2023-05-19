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
    SET read = true, read_at = $1
    WHERE id = $2 AND read = false
  `;

  try {
    await pool.query(query, [new Date(), emailId]);
  } catch (error) {
    console.error("Error updating email status:", error);
  }
};

app.get("/track-email-open/:recipientEmailId", async (req, res) => {
  let emailId = req.params.recipientEmailId;
  emailId = emailId.replace(":", "");

  console.log({ emailId });

  if (emailId) {
    await updateEmailStatus(emailId);
  }

  // Serve the tracking pixel
  res.sendFile(path.join(__dirname, "pixel.png"));
});