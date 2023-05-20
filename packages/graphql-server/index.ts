import { ApolloServer, gql } from "apollo-server";
import { Pool } from "pg";
import { createTransport } from "nodemailer"; // Add this line
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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
  type User {
    id: ID!
    email: String!
    password: String!
    created_at: String!
    updated_at: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type EmailAccount {
    id: ID!
    user_id: ID!
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
    user_id: ID!
    name: String!
    subject: String!
    text_content: String
    html_content: String
    created_at: String!
    updated_at: String!
  }

  type Campaign {
    id: ID!
    user_id: ID!
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
    read: Int!
    read_at: String!
  }

  type RecipientReadInfo {
    email_address: String!
    read_count: Int!
  }

  type Query {
    emailAccounts: [EmailAccount]
    emailTemplates: [EmailTemplate]
    campaigns: [Campaign]
    campaign(id: ID!): Campaign
    recipientEmails(campaignId: ID!): [RecipientEmail]
    emailTemplateByCampaignId(campaignId: ID!): EmailTemplate
    emailTemplate(id: ID!): EmailTemplate
    recipientsWhoReadEmail(campaignId: ID!): [RecipientReadInfo]
  }

  type Mutation {
    signUp(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    sendTestEmail(
      emailTemplateId: ID!
      recipientEmail: String!
      emailAccountId: ID
      campaignId: ID
    ): String

    addRecipientEmails(
      campaign_id: ID!
      email_addresses: [String!]!
    ): [RecipientEmail]

    createEmailAccount(
      email_address: String!
      display_name: String
      smtp_host: String!
      smtp_port: Int!
      username: String!
      password: String!
    ): EmailAccount

    updateCampaignStatus(id: ID!, status: String!): Campaign
    updateCampaignTemplate(id: ID!, email_template_id: ID!): Campaign

    createEmailTemplate(
      name: String!
      subject: String!
      text_content: String
      html_content: String
    ): EmailTemplate

    editEmailTemplate(
      id: ID!
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

    editCampaign(
      id: ID!
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
    recipientsWhoReadEmail: async (_: any, { campaignId }: any, context: { user: any }) => {
      checkAuth(context);
  
      const campaignResult = await pool.query(
        "SELECT id FROM campaigns WHERE id = $1 AND user_id = $2",
        [campaignId, context.user.id]
      );
  
      if (campaignResult.rowCount === 0) {
        throw new Error("Campaign not found or not authorized");
      }
  
      // read greater than 0
      const result = await pool.query(
        `SELECT email_address, read as read_count
         FROM recipient_emails
         WHERE campaign_id = $1 AND read > 0`,
        [campaignId]
      );
  
      return result.rows;
    },
    emailTemplate: async (_: any, { id }: any, context: { user: any }) => {
      checkAuth(context);
      const result = await pool.query(
        "SELECT * FROM email_templates WHERE id = $1 AND user_id = $2",
        [id, context.user.id]
      );
      const emailTemplate = result.rows[0];

      if (!emailTemplate) {
        throw new Error("Email template not found or not authorized");
      }

      return emailTemplate;
    },
    campaign: async (_: any, { id }: any, context: { user: any }) => {
      checkAuth(context);
      const result = await pool.query(
        "SELECT * FROM campaigns WHERE id = $1 AND user_id = $2",
        [id, context.user.id]
      );
      const campaign = result.rows[0];

      if (!campaign) {
        throw new Error("Campaign not found or not authorized");
      }

      return campaign;
    },

    emailTemplateByCampaignId: async (
      _: any,
      { campaignId }: any,
      context: { user: any }
    ) => {
      checkAuth(context);
      const campaignResult = await pool.query(
        "SELECT email_template_id FROM campaigns WHERE id = $1 AND user_id = $2",
        [campaignId, context.user.id]
      );

      if (campaignResult.rowCount === 0) {
        throw new Error("Campaign not found or not authorized");
      }

      const templateId = campaignResult.rows[0].email_template_id;
      console.log({ campaign: campaignResult.rows[0] });

      const result = await pool.query(
        "SELECT * FROM email_templates WHERE id = $1 AND user_id = $2",
        [templateId, context.user.id]
      );
      const emailTemplate = result.rows[0];

      if (!emailTemplate) {
        throw new Error("Email template not found or not authorized");
      }

      return emailTemplate;
    },
    recipientEmails: async (
      _: any,
      { campaignId }: any,
      context: { user: any }
    ) => {
      checkAuth(context);

      const campaignResult = await pool.query(
        "SELECT id FROM campaigns WHERE id = $1 AND user_id = $2",
        [campaignId, context.user.id]
      );

      if (campaignResult.rowCount === 0) {
        throw new Error("Campaign not found or not authorized");
      }

      const result = await pool.query(
        "SELECT * FROM recipient_emails WHERE campaign_id = $1",
        [campaignId]
      );
      return result.rows;
    },
    emailAccounts: async (_: any, __: any, context: { user: any }) => {
      checkAuth(context);
      const result = await pool.query(
        "SELECT * FROM email_accounts WHERE user_id = $1",
        [context.user.id]
      );
      return result.rows;
    },
    emailTemplates: async (_: any, __: any, context: { user: any }) => {
      checkAuth(context);
      const result = await pool.query(
        "SELECT * FROM email_templates WHERE user_id = $1 ORDER BY created_at DESC",
        [context.user.id]
      );
      return result.rows;
    },

    campaigns: async (_: any, __: any, context: { user: any }) => {
      checkAuth(context);
      const result = await pool.query(
        "SELECT * FROM campaigns WHERE user_id = $1 ORDER BY created_at DESC",
        [context.user.id]
      );
      return result.rows;
    },
  },
  Mutation: {
    signUp: async (_: any, { email, password }: any) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
        [email, hashedPassword]
      );
      const user = result.rows[0];

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "30d",
        }
      );

      return { token, user };
    },

    login: async (_: any, { email, password }: any) => {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
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
        process.env.JWT_SECRET as string,
        {
          expiresIn: "30d",
        }
      );

      return { token, user };
    },
    async sendTestEmail(
      _: any,
      { emailTemplateId, recipientEmail, campaignId, emailAccountId }: any
    ) {
      // query the email template
      const result = await pool.query(
        "SELECT * FROM email_templates WHERE id = $1",
        [emailTemplateId]
      );
      const emailTemplate = result.rows[0];

      if (!emailTemplate) {
        throw new Error("Email template not found");
      }

      // query the email account
      const emailAccountResult = await pool.query(
        "SELECT display_name, email_address, smtp_host, username, password, smtp_port  FROM email_accounts WHERE id = $1",
        [emailAccountId]
      );
      const emailAccount = emailAccountResult.rows[0];

      if (!emailAccount) {
        throw new Error("Email account not found");
      }

      const transporter = createTransport({
        host: emailAccount.smtp_host,
        port: emailAccount.smtp_port,
        secure: false,
        auth: {
          user: emailAccount.username,
          pass: emailAccount.password,
        },
      });

      const mailOptions = {
        from: emailAccount.display_name + `<${emailAccount.email_address}>`,
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
      }: any,
      context: { user: any }
    ) => {
      checkAuth(context);
      const result = await pool.query(
        "INSERT INTO email_accounts (user_id, email_address, display_name, smtp_host, smtp_port, username, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          context.user.id,
          email_address,
          display_name,
          smtp_host,
          smtp_port,
          username,
          password,
        ]
      );
      return result.rows[0];
    },
    createEmailTemplate: async (
      _: any,
      { name, subject, text_content, html_content }: any,
      context: { user: any }
    ) => {
      checkAuth(context);
      const result = await pool.query(
        "INSERT INTO email_templates (user_id, name, subject, text_content, html_content) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [context.user.id, name, subject, text_content, html_content]
      );
      return result.rows[0];
    },
    addRecipientEmails: async (
      _: any,
      { campaign_id, email_addresses }: any,
      context: { user: any }
    ) => {
      checkAuth(context);

      // TODO - make this a setting in the UI
      let allowMultiCampaignRecipients = false;

      let query;
      let values;
      if (!allowMultiCampaignRecipients) {
        // If setting is off, don't insert email addresses that already exist
        query = `
          INSERT INTO recipient_emails (campaign_id, email_address)
          SELECT $1, email
          FROM unnest($2::varchar[]) AS t(email)
          LEFT JOIN recipient_emails re ON re.email_address = t.email
          WHERE re.email_address IS NULL
          RETURNING *;
        `;
        values = [campaign_id, email_addresses];
      } else {
        // Generate the bulk insert query and values
        query = `
        INSERT INTO recipient_emails (campaign_id, email_address)
        VALUES ${email_addresses
          .map((_: any, i: number) => `($1, $${i + 2})`)
          .join(", ")}
        ON CONFLICT ON CONSTRAINT unique_campaign_email DO NOTHING
        RETURNING *;
        `;
        values = [campaign_id, ...email_addresses];
      }

      // Execute the query
      const result = await pool.query(query, values);

      // Return the inserted rows
      return result.rows;
    },
    editEmailTemplate: async (
      _: any,
      { id, name, subject, text_content, html_content }: any,
      context: { user: any }
    ) => {
      checkAuth(context);
      const result = await pool.query(
        "UPDATE email_templates SET user_id = $1, name= $2, subject= $3, text_content= $4, html_content= $5 WHERE id=$6 RETURNING *",
        [context.user.id, name, subject, text_content, html_content, id]
      );
      return result.rows[0];
    },
    editCampaign: async (
      _: any,
      {
        id,
        email_account_id,
        name,
        reply_to_email_address,
        daily_limit = 0,
        status = "paused",
      }: any,
      context: { user: any }
    ) => {
      checkAuth(context);

      // if daily limit is 0, set it to 50
      if (daily_limit === 0) {
        daily_limit = 50;
      }

      const result = await pool.query(
        "UPDATE campaigns SET user_id = $1, email_account_id= $2, name= $3, reply_to_email_address= $4, daily_limit= $5, status= $6 WHERE id = $7 RETURNING *",
        [
          context.user.id,
          email_account_id,
          name,
          reply_to_email_address,
          daily_limit,
          status,
          id,
        ]
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
      }: any,
      context: { user: any }
    ) => {
      checkAuth(context);

      // if daily limit is 0, set it to 50
      if (daily_limit === 0) {
        daily_limit = 50;
      }

      const result = await pool.query(
        "INSERT INTO campaigns (user_id, email_account_id, email_template_id, name, reply_to_email_address, daily_limit, emails_sent_today, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [
          context.user.id,
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
    updateCampaignTemplate: async (_: any, { id, email_template_id }: any) => {
      const result = await pool.query(
        "UPDATE campaigns SET email_template_id = $1 WHERE id = $2 RETURNING *",
        [email_template_id, id]
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
    // console.log("Success:", response.data);
  }
  return response;
};

export function checkAuth(context: { user: any }) {
  if (!context.user) {
    throw new Error("Authentication required");
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    await logRequest(req);

    const token = req.headers.authorization || "";
    const secret = process.env.JWT_SECRET;

    // if secret is missing throw an error
    if (!secret) {
      throw new Error("Missing jwt secret environment variable");
    }

    try {
      if (token) {
        const decodedToken = jwt.verify(token.replace("Bearer ", ""), secret);
        const user = decodedToken; // Add user data to the context
        return { user, pool };
      }
    } catch (error: any) {
      console.error("Error verifying token:", error.message);
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
