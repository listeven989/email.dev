import { promises as fs } from 'fs';
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
};

async function loadHtmlToDatabase() {
  try {
    // Read the index.html file
    const htmlContent = await fs.readFile('index.html', 'utf-8');

    // Connect to the PostgreSQL database
    const client = new Client(connectionString);
    await client.connect();

    // Insert the HTML content into the email_templates table
    await client.query(`
      INSERT INTO email_templates (name, subject, html_content)
      VALUES ('Index Page', 'Welcome to our site', $1);
    `, [htmlContent]);

    console.log('HTML content has been loaded into the database.');

    // Close the database connection
    await client.end();
  } catch (error) {
    console.error('Error loading HTML content into the database:', error);
  }
}

loadHtmlToDatabase();
