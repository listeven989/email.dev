import { ApolloServer, gql } from "apollo-server";
import { Pool } from "pg";
import { createTransport } from "nodemailer"; // Add this line
const jwt = require('jsonwebtoken');

// dotenv
require("dotenv").config();

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

pool.connect();

const typeDefs = gql`
  type EmailAccount {
    id: ID!
    email_address: String!
    display_name: String
    smtp_host: String!
    smtp_port: Int!
    username: String!
    password: String!
    created_at: String!
    updated_at: String!
  }

  type EmailTemplate {
    id: ID!
    name: String!
    subject: String!
    text_content: String
    html_content: String
    created_at: String!
    updated_at: String!
  }

  type Campaign {
    id: ID!
    email_account_id: ID!
    email_template_id: ID
    name: String!
    reply_to_email_address: String
    created_at: String!
    updated_at: String!
    daily_limit: Int
    emails_sent_today: Int
    status: String!
  }

  type RecipientEmail {
    id: ID!
    campaign_id: ID!
    email_address: String!
    sent: Boolean!
    sent_at: String
    created_at: String!
    updated_at: String!
  }

  type Query {
    emailAccounts: [EmailAccount]
    emailTemplates: [EmailTemplate]
    campaigns: [Campaign]
    campaign(id: ID!): Campaign
    recipientEmails: [RecipientEmail]
  }

  type Mutation {
    sendTestEmail(
      emailTemplateId: ID!
      recipientEmail: String!
    ): String

    createEmailAccount(
      email_address: String!
      display_name: String
      smtp_host: String!
      smtp_port: Int!
      username: String!
      password: String!
    ): EmailAccount

    updateCampaignStatus(id: ID!, status: String!): Campaign

    createEmailTemplate(
      name: String!
      subject: String!
      text_content: String
      html_content: String
    ): EmailTemplate

    createCampaign(
      email_account_id: ID!
      email_template_id: ID
      name: String!
      reply_to_email_address: String
      daily_limit: Int
      emails_sent_today: Int
      status: String
    ): Campaign

    createRecipientEmail(
      campaign_id: ID!
      email_address: String!
      sent: Boolean!
      sent_at: String
    ): RecipientEmail
  }
`;

const resolvers = {
  Query: {
    emailAccounts: async () => {
      const result = await pool.query("SELECT * FROM email_accounts");
      return result.rows;
    },
    emailTemplates: async () => {
      const result = await pool.query("SELECT * FROM email_templates ORDER BY created_at DESC");
      return result.rows;
    },
    campaigns: async () => {
      const result = await pool.query(
        "SELECT * FROM campaigns ORDER BY created_at DESC"
      );
      return result.rows;
    },
    // @ts-ignore
    campaign: async (_, { id }) => {
      const result = await pool.query('SELECT * FROM campaigns WHERE id = $1', [id]);
      return result.rows[0];
    },
    recipientEmails: async () => {
      const result = await pool.query("SELECT * FROM recipient_emails");
      return result.rows;
    },
  },
  Mutation: {
    // @ts-ignore
    async sendTestEmail(_, { emailTemplateId, recipientEmail }) {
      const result = await pool.query(
        "SELECT * FROM email_templates WHERE id = $1",
        [emailTemplateId]
      );
      const emailTemplate = result.rows[0];

      if (!emailTemplate) {
        throw new Error("Email template not found");
      }

      const transporter = createTransport({
        host: "your_email_host",
        port: 587,
        secure: false,
        auth: {
          user: "your_email_username",
          pass: "your_email_password",
        },
      });

      const mailOptions = {
        from: "your_email_address",
        to: recipientEmail,
        subject: emailTemplate.subject,
        text: emailTemplate.text_content,
        html: emailTemplate.html_content,
      };

      try {
        await transporter.sendMail(mailOptions);
        return "Test email sent successfully";
      } catch (error) {
        throw new Error(`Error sending test email: ${error}`);
      }
    },
    createEmailAccount: async (
      _: any,
      {
        email_address,
        display_name,
        smtp_host,
        smtp_port,
        username,
        password,
      }: any
    ) => {
      const result = await pool.query(
        "INSERT INTO email_accounts (email_address, display_name, smtp_host, smtp_port, username, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [email_address, display_name, smtp_host, smtp_port, username, password]
      );
      return result.rows[0];
    },
    createEmailTemplate: async (
      _: any,
      { name, subject, text_content, html_content }: any
    ) => {
      const result = await pool.query(
        "INSERT INTO email_templates (name, subject, text_content, html_content) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, subject, text_content, html_content]
      );
      return result.rows[0];
    },
    createCampaign: async (
      _: any,
      {
        email_account_id,
        email_template_id = null,
        name,
        reply_to_email_address,
        daily_limit = 50,
        emails_sent_today = 0,
        status = "paused",
      }: any
    ) => {
      // if daily limit is 0, set it to 50
      if (daily_limit === 0) {
        daily_limit = 50;
      }

      const result = await pool.query(
        "INSERT INTO campaigns (email_account_id, email_template_id, name, reply_to_email_address, daily_limit, emails_sent_today, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          email_account_id,
          email_template_id,
          name,
          reply_to_email_address,
          daily_limit,
          emails_sent_today,
          status,
        ]
      );
      return result.rows[0];
    },
    createRecipientEmail: async (
      _: any,
      { campaign_id, email_address, sent, sent_at }: any
    ) => {
      const result = await pool.query(
        "INSERT INTO recipient_emails (campaign_id, email_address, sent, sent_at) VALUES ($1, $2, $3, $4) RETURNING *",
        [campaign_id, email_address, sent, sent_at]
      );
      return result.rows[0];
    },
    updateCampaignStatus: async (_: any, { id, status }: any) => {
      const result = await pool.query(
        "UPDATE campaigns SET status = $1 WHERE id = $2 RETURNING *",
        [status, id]
      );
      return result.rows[0];
    },
  },
};

const logRequest = async (req: any) => {
  console.log("Request:", {
    query: req.body.query,
    variables: req.body.variables,
    operationName: req.body.operationName,
  });
};

const logResponse = (response: any) => {
  if (response.errors) {
    console.log("Error:", response.errors);
  } else {
    console.log("Success:", response.data);
  }
  return response;
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    await logRequest(req);

    const token = req.headers.authorization || '';
    const secret = 'your-secret-key';

    try {
      if (token) {
        const decodedToken = jwt.verify(token.replace('Bearer ', ''), secret);
        const user = decodedToken; // Add user data to the context
        return { user, pool };
      }
    } catch (error: any) {
      console.error('Error verifying token:', error.message);
    }

    return { pool };
  },
  formatResponse: (response) => {
    return logResponse(response);
  },
});


server.listen({ port: 8300 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
