import express from 'express';
import path from 'path';
import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();


const app = express();
const port = 8301;



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


app.get('/track-email-open/:emailId', async(req, res) => {
  let emailId = req.params.emailId
   emailId = emailId.replace(':','')
 
  console.log({emailId})

  if(emailId){
    try{
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

 // Connect to the PostgreSQL database
 const client = new Client(connectionString);
 await client.connect();

 const query = `
 UPDATE recipient_emails
 SET read = true, read_at = $1
 WHERE id = $2 AND read = false
`;

await client.query(query, [new Date(),emailId]);

} catch (error) {
  console.error("Error sending emails:", error);
}
  }

  // Serve the tracking pixel
  res.sendFile(path.join(__dirname, 'pixel.png'));
});
