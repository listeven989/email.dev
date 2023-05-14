import { ApolloServer, gql } from 'apollo-server';
import { Client, Pool } from 'pg';

// dotenv
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

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
    recipientEmails: [RecipientEmail]
  }

  type Mutation {
    createEmailAccount(
      email_address: String!
      display_name: String
      smtp_host: String!
      smtp_port: Int!
      username: String!
      password: String!
    ): EmailAccount

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
      subject: String!
      reply_to_email_address: String
      daily_limit: Int
      emails_sent_today: Int
      status: String!
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
      const result = await client.query('SELECT * FROM email_accounts');
      return result.rows;
    },
    emailTemplates: async () => {
      const result = await client.query('SELECT * FROM email_templates');
      return result.rows;
    },
    campaigns: async () => {
      const result = await client.query('SELECT * FROM campaigns');
      return result.rows;
    },
    recipientEmails: async () => {
      const result = await client.query('SELECT * FROM recipient_emails');
      return result.rows;
    },
  },
  Mutation: {
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
      const result = await client.query(
        'INSERT INTO email_accounts (email_address, display_name, smtp_host, smtp_port, username, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [email_address, display_name, smtp_host, smtp_port, username, password]
      );
      return result.rows[0];
    },
    createEmailTemplate: async (
      _: any,
      { name, subject, text_content, html_content }: any
    ) => {
      const result = await client.query(
        'INSERT INTO email_templates (name, subject, text_content, html_content) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, subject, text_content, html_content]
      );
      return result.rows[0];
    },
    createCampaign: async (
      _: any,
      {
        email_account_id,
        email_template_id,
        name,
        subject,
        reply_to_email_address,
        daily_limit,
        emails_sent_today,
        status,
      }: any
    ) => {
      const result = await client.query(
        'INSERT INTO campaigns (email_account_id, email_template_id, name, subject, reply_to_email_address, daily_limit, emails_sent_today, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [
          email_account_id,
          email_template_id,
          name,
          subject,
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
      const result = await client.query(
        'INSERT INTO recipient_emails (campaign_id, email_address, sent, sent_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [campaign_id, email_address, sent, sent_at]
      );
      return result.rows[0];
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen({ port: 8300 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});