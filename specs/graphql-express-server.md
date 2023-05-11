To create a GraphQL server using `express-graphql` with the provided database schema, follow these steps:

1. First, create a new directory for your GraphQL server:

```bash
mkdir graphql-server
cd graphql-server
```

2. Initialize a new Node.js project:

```bash
npm init -y
```

3. Install the required dependencies:

```bash
npm install express express-graphql graphql pg
```

4. Create a new file named `index.js` in the `graphql-server` directory.

5. Add the following code to `index.js`:

```javascript
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { Pool } = require('pg');

// Replace with your PostgreSQL connection string
const connectionString = 'postgres://username:password@localhost/dbname';

const pool = new Pool({
  connectionString,
});

const schema = buildSchema(`
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
    subject: String!
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
`);

const root = {
  emailAccounts: async () => {
    const result = await pool.query('SELECT * FROM email_accounts');
    return result.rows;
  },
  emailTemplates: async () => {
    const result = await pool.query('SELECT * FROM email_templates');
    return result.rows;
  },
  campaigns: async () => {
    const result = await pool.query('SELECT * FROM campaigns');
    return result.rows;
  },
  recipientEmails: async () => {
    const result = await pool.query('SELECT * FROM recipient_emails');
    return result.rows;
  },
};

const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  }),
);

app.listen(4000, () => console.log('🚀 Server running at http://localhost:4000/graphql'));
```

Replace the `connectionString` variable with your PostgreSQL connection string.

Now you have a GraphQL server running at `http://localhost:4000/graphql` with queries for fetching email accounts, email templates, campaigns, and recipient emails.

You can extend the schema and root object to add more queries, mutations, and types as needed.