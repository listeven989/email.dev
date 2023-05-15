import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000, // Add this line to set a connection timeout
});

export async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (email, password)
    VALUES ($1, $2)
    RETURNING id, email;
  `;
  const values = [email, hashedPassword];

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error: any) {
    console.error("Error creating user:", error.message);
    throw error;
  }
}

export async function login(email: string, password: string) {
  const query = `
    SELECT id, email, password
    FROM users
    WHERE email = $1;
  `;
  const values = [email];

  try {
    const result = await pool.query(query, values);
    const user = result.rows[0];

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      "your-secret-key",
      {
        expiresIn: "1h",
      }
    );

    return { user: { id: user.id, email: user.email }, token };
  } catch (error: any) {
    console.error("Error logging in:", error.message);
    throw error;
  }
}
