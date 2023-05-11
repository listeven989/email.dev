Based on your provided SQL schema, I'll guide you through setting up a GraphQL server using Apollo Server and `pg` library to connect to your PostgreSQL database.

1. First, create a new directory for your GraphQL server (if you haven't already):

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
npm install apollo-server graphql pg
```

4. Create a new file named `index.js` in the `graphql-server` directory.

5. Add the following code to `index.js`:

```javascript
const { ApolloServer, gql } = require('apollo-server');
const { Pool } = require('pg');

// Replace these values with your PostgreSQL connection details
const pool = new Pool({
  user: 'your_user',
  host: 'your_host',
  database: 'your_database',
  password: 'your_password',
  port: your_port,
});

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
`;

const resolvers = {
  Query: {
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
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

Replace the PostgreSQL connection details in the `pool` configuration with your own.

This code sets up a basic GraphQL server with queries to fetch all records from the `email_accounts`, `email_templates`, `campaigns`, and `recipient_emails` tables. You can extend this with more queries, mutations, and types as needed.

Now you have a GraphQL server that connects to your PostgreSQL database and fetches data based on your provided SQL schema. You can use this GraphQL server with your Next.js app as described in my previous responses.