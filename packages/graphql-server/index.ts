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

  type LinkClick {
    id: ID!
    click_count: Int!
    url: String
    email_address: String!
    last_clicked_at: String
    recipient_email: RecipientEmail!
    user_agent: String
    template_id: String
    template_subject: String
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
    is_valid: Boolean!
    spam: Boolean
    spam_updated_at : String
    error_message: String
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
    days_delay: Int
  }

  input EmailTemplateIdInput {
    id: ID!
    days_delay: Int
  }

  type Campaign {
    id: ID!
    user_id: ID!
    email_account_id: ID
    email_account_ids: [ID!]
    email_template_id: ID
    name: String!
    reply_to_email_address: String
    created_at: String!
    updated_at: String!
    daily_limit: Int
    emails_sent_today: Int
    status: String!
    error: String
  }

  type RecipientEmail {
    id: ID!
    campaign_id: ID!
    email_address: String
    sent: Boolean!
    sent_at: String
    created_at: String!
    updated_at: String!
    read: Int!
    read_at: String!
    sender_email_address: String
  }

  type RecipientReadInfo {
    email_address: String!
    read_count: Int!
    template_id: String
    template_subject: String
  }

  type Query {
    emailAccounts(all: Boolean): [EmailAccount]
    emailTemplates: [EmailTemplate]
    campaigns: [Campaign]
    campaign(id: ID!): Campaign
    recipientEmails(campaignId: ID!): [RecipientEmail]
    emailTemplatesByCampaignId(campaignId: ID!): [EmailTemplate]
    emailTemplate(id: ID!): EmailTemplate
    recipientsWhoReadEmail(campaignId: ID!): [RecipientReadInfo]
    linkClicksByCampaign(campaignId: ID!): [LinkClick]
  }

  type Mutation {
    signup(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    archiveCampaign(id: ID!): Campaign
    archiveEmailTemplate(id: ID!): EmailTemplate

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
    updateCampaignTemplate(id: ID!, email_template_ids: [EmailTemplateIdInput]!): Boolean

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
      email_account_ids: [ID!]!
      email_template_id: ID
      name: String!
      reply_to_email_address: String
      daily_limit: Int
      emails_sent_today: Int
      status: String
    ): Campaign

    editCampaign(
      id: ID!
      email_account_ids:[ID!]!
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

const checkAuthAndQuery = async (
  query: string,
  values: any[],
  context: { user: any }
) => {
  checkAuth(context);
  const result = await pool.query(query, values);
  return result;
};

const throwErrorIfNotFound = (rows: any[], errorMessage: string) => {
  if (rows.length === 0) {
    throw new Error(errorMessage);
  }
};

const resolvers = {
  Query: {
    campaigns: async (_: any, __: any, context: { user: any }) => {
      const query = `
        SELECT * FROM campaigns
        WHERE user_id = $1 AND archive = FALSE
        ORDER BY created_at DESC
      `;
      const result = await checkAuthAndQuery(query, [context.user.id], context);
      return result.rows;
    },

    emailTemplates: async (_: any, __: any, context: { user: any }) => {
      const query = `
        SELECT * FROM email_templates
        WHERE user_id = $1 AND archive = FALSE
        ORDER BY created_at DESC
      `;
      const result = await checkAuthAndQuery(query, [context.user.id], context);
      return result.rows;
    },

    recipientsWhoReadEmail: async (
      _: any,
      { campaignId }: any,
      context: { user: any }
    ) => {
      const campaignQuery = `
        SELECT id FROM campaigns WHERE id = $1 AND user_id = $2
      `;
      const campaignResult = await checkAuthAndQuery(
        campaignQuery,
        [campaignId, context.user.id],
        context
      );

      throwErrorIfNotFound(
        campaignResult.rows,
        "Campaign not found or not authorized"
      );

      const query = `
        SELECT re.email_address, se.read_count,et.subject AS template_subject,
        et.id AS  template_id
        FROM sent_emails AS se
        JOIN recipient_emails AS re ON se.recipient_id =  re.id
        JOIN email_templates AS et ON se.email_template_id = et.id
        WHERE se.campaign_id = $1 AND se.read_count > 0
      `;
      const result = await checkAuthAndQuery(query, [campaignId], context);
      return result.rows;
    },

    emailTemplate: async (_: any, { id }: any, context: { user: any }) => {
      const query =
        "SELECT * FROM email_templates WHERE id = $1 AND user_id = $2";
      const result = await checkAuthAndQuery(
        query,
        [id, context.user.id],
        context
      );
      throwErrorIfNotFound(
        result.rows,
        "Email template not found or not authorized"
      );
      return result.rows[0];
    },
    campaign: async (
      _: any,
      { id }: { id: string },
      context: { user: any }
    ) => {
      const query = "SELECT * FROM campaigns WHERE id = $1 AND user_id = $2";
      const result = await checkAuthAndQuery(
        query,
        [id, context.user.id],
        context
      );
      throwErrorIfNotFound(result.rows, "Campaign not found or not authorized");

      // get the email accounts
      const emailAccountIdsQuery = `
        SELECT email_account_id FROM campaign_email_accounts
        WHERE campaign_id = $1
      `;
      const emailAccountIdsResult = await checkAuthAndQuery(
        emailAccountIdsQuery,
        [id],
        context
      );

      return {
        ...result.rows[0],
        email_account_ids: emailAccountIdsResult.rows.map(
          (row: any) => row.email_account_id
        )
      };
    },

    emailTemplatesByCampaignId: async (
      _: any,
      { campaignId }: { campaignId: string },
      context: { user: any }
    ) => {
      const templates: any = []

      const campaignSequenceQuery =
        "SELECT email_template_id, days_delay FROM campaign_sequence WHERE campaign_id = $1 ORDER BY sequence_order ASC";

      const campaignSequenceResult = await checkAuthAndQuery(
        campaignSequenceQuery,
        [campaignId],
        context
      );

      for (let i = 0; i < campaignSequenceResult.rows.length; i++) {
        const campaignSequence = campaignSequenceResult.rows[i]

        const query =
          "SELECT * FROM email_templates WHERE id = $1";
        const result = await checkAuthAndQuery(
          query,
          [campaignSequence.email_template_id],
          context
        );
        if (result.rows.length === 0) continue
        templates.push({ ...result.rows[0], days_delay: campaignSequence.days_delay })
      }

      return templates
    },
    recipientEmails: async (
      _: any,
      { campaignId }: { campaignId: string },
      context: { user: any }
    ) => {
      const campaignQuery =
        "SELECT id FROM campaigns WHERE id = $1 AND user_id = $2";
      const campaignResult = await checkAuthAndQuery(
        campaignQuery,
        [campaignId, context.user.id],
        context
      );
      throwErrorIfNotFound(
        campaignResult.rows,
        "Campaign not found or not authorized"
      );

      const query = "SELECT re.*,ea.email_address AS sender_email_address FROM recipient_emails AS re LEFT JOIN email_accounts AS ea ON re.sender_email_account_id = ea.id  WHERE re.campaign_id = $1";
      const result = await checkAuthAndQuery(query, [campaignId], context);

      return result.rows;
    },
    emailAccounts: async (_: any, { all }: any, context: { user: any }) => {
      const query = all ? "SELECT * FROM email_accounts WHERE user_id = $1" : "SELECT * FROM email_accounts WHERE user_id = $1 AND is_valid=true"
      const result = await checkAuthAndQuery(query, [context.user.id], context);
      return result.rows;
    },
    linkClicksByCampaign: async (_: any, { campaignId }: any) => {
      const query = `
        SELECT lc.*,
        re.email_address,
        et.id AS template_id,
        et.subject AS template_subject
        FROM link_clicks AS lc
        JOIN recipient_emails AS re ON lc.recipient_email_id = re.id
        JOIN email_templates AS et ON et.id = lc.email_template_id
        WHERE re.campaign_id = $1 AND lc.url IS NOT NULL
      `;
      const { rows } = await pool.query(query, [campaignId]);
      return rows.filter((row: any) => row.click_count > 0);
    },
  },
  Mutation: {
    archiveCampaign: async (_: any, { id }: any, context: { user: any }) => {
      checkAuth(context);
      const result = await pool.query(
        "UPDATE campaigns SET archive = TRUE WHERE id = $1 AND user_id = $2 RETURNING *",
        [id, context.user.id]
      );
      return result.rows[0];
    },

    archiveEmailTemplate: async (
      _: any,
      { id }: any,
      context: { user: any }
    ) => {
      checkAuth(context);
      const result = await pool.query(
        "UPDATE email_templates SET archive = TRUE WHERE id = $1 AND user_id = $2 RETURNING *",
        [id, context.user.id]
      );
      return result.rows[0];
    },
    signup: async (_: any, { email, password }: any) => {

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
      // TODO(@steven4354): redo this by creating a throwaway campaign for test emails instead
      // throw new Error("Not implemented");

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

      // get the total number of template email that need to be sent to the recipients
      const campaignResult = await pool.query(`SELECT COUNT(*) FROM campaign_sequence WHERE campaign_id=$1`, [campaign_id]);

      let query;
      let values;
      if (!allowMultiCampaignRecipients) {
        // If setting is off, don't insert email addresses that already exist
        query = `
          INSERT INTO recipient_emails (campaign_id, email_address,total_to_send)
          SELECT $1, email, $3
          FROM unnest($2::varchar[]) AS t(email)
          LEFT JOIN recipient_emails re ON re.email_address = t.email
          WHERE re.email_address IS NULL
          RETURNING *;
        `;
        values = [campaign_id, email_addresses, campaignResult.rows[0].count];
      } else {
        // Generate the bulk insert query and values
        query = `
        INSERT INTO recipient_emails (campaign_id,total_to_send, email_address)
        VALUES ${email_addresses
            .map((_: any, i: number) => `($1,$2, $${i + 3})`)
            .join(", ")}
        ON CONFLICT ON CONSTRAINT unique_campaign_email DO NOTHING
        RETURNING *;
        `;
        values = [campaign_id, campaignResult.rows[0].count, ...email_addresses];
      }

      // Execute the query
      const result = await pool.query(query, values);

      // Change the campaign back to paused if the status is completed
      await pool.query(
        "UPDATE campaigns SET status = 'paused' WHERE id = $1 AND status = 'completed'",
        [campaign_id]
      );

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
        email_account_ids,
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
        "UPDATE campaigns SET user_id = $1, name= $2, reply_to_email_address= $3, daily_limit= $4, status= $5 WHERE id = $6 RETURNING *",
        [
          context.user.id,
          name,
          reply_to_email_address,
          daily_limit,
          status,
          id,
        ]
      );

      // Delete all email accounts for this campaign
      await pool.query(
        "DELETE FROM campaign_email_accounts WHERE campaign_id = $1",
        [id]
      );

      // Insert the email accounts
      if (email_account_ids && email_account_ids.length > 0) {
        await pool.query(
          `INSERT INTO campaign_email_accounts (campaign_id, email_account_id)
          SELECT $1, id
          FROM unnest($2::uuid[]) AS t(id)
          `,

          [result.rows[0].id, email_account_ids]
        );
      }

      return result.rows[0];
    },
    createCampaign: async (
      _: any,
      {
        email_account_ids,
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
        "INSERT INTO campaigns (user_id, email_template_id, name, reply_to_email_address, daily_limit, emails_sent_today, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          context.user.id,
          email_template_id,
          name,
          reply_to_email_address,
          daily_limit,
          emails_sent_today,
          status,
        ]
      );

      // Insert the email accounts
      if (email_account_ids && email_account_ids.length > 0) {
        await pool.query(
          `INSERT INTO campaign_email_accounts (campaign_id, email_account_id)
          SELECT $1, id
          FROM unnest($2::uuid[]) AS t(id)
          `,
          [result.rows[0].id, email_account_ids]
        );
      }


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

      if (status = 'active') {
        await pool.query(`  UPDATE campaigns SET error = '' WHERE id = $1`, [id]);
      }

      return result.rows[0];
    },
    updateCampaignTemplate: async (_: any, { id, email_template_ids }: any) => {
      //delete old templates
      const deletedResult = await pool.query(
        "DELETE FROM campaign_sequence WHERE campaign_id = $1 RETURNING id,email_template_id,sequence_order",
        [id]
      );

      const needToDeleteSentEmails: any[] = []

      // determine which templates have been removed from the sequence
      deletedResult.rows.forEach((deletedTemplate) => {
        if (email_template_ids[parseInt(deletedTemplate.sequence_order)].id !== deletedTemplate.email_template_id) {
          needToDeleteSentEmails.push(deletedTemplate)
        }
      })

      // delete all the needToDeleteSentEmails
      for (const deleteSentEmail of needToDeleteSentEmails) {
        await pool.query(
          "DELETE FROM sent_emails WHERE campaign_id = $1 AND email_template_id=$2",
          [id, deleteSentEmail.email_template_id]
        );
      }


      let emailTemplates = email_template_ids.map((email_template_id: any, i: number) => ({ ...email_template_id, sequence_order: i }))
      emailTemplates = emailTemplates.filter((emailTemplate: any) => emailTemplate.id !== '')

      for (let i = 0; i < emailTemplates.length; i++) {
        await pool.query(
          "INSERT INTO campaign_sequence (campaign_id,email_template_id,sequence_order,days_delay) VALUES ($1, $2, $3, $4)",
          [id, emailTemplates[i].id, emailTemplates[i].sequence_order, emailTemplates[i].days_delay]
        );
      }

      // update the recipients new total emails
      await pool.query("UPDATE recipient_emails SET total_to_send=$1 WHERE campaign_id=$2", [emailTemplates.length, id])

      return true;
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
