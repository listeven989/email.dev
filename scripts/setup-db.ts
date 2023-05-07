import { existsSync, readFileSync } from "fs";
import { Client } from "pg";
import * as dotenv from "dotenv";

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

async function runSqlScript(fileName: string) {
  try {
    // Read the SQL script
    const sqlContent = readFileSync(fileName, "utf-8");

    // Connect to the PostgreSQL database
    const client = new Client(connectionString);
    await client.connect();

    // Run the SQL script
    await client.query(sqlContent);

    console.log(`Successfully executed ${fileName}`);

    // Close the database connection
    await client.end();
  } catch (error) {
    console.error(`Error executing ${fileName}:`, error);
  }
}

async function main() {
  await runSqlScript("database/setup.sql");
  const seedFileName = existsSync("database/private-seed.sql")
    ? "database/private-seed.sql"
    : "database/seed.sql";
  await runSqlScript(seedFileName);
}

main();
