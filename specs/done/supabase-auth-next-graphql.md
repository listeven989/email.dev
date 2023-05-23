To handle authentication in your Next.js app with Supabase and the GraphQL server, you can follow these steps:

1. First, install the required dependencies for Supabase in your Next.js app:

```bash
npm install @supabase/supabase-js
```

2. Set up Supabase in your Next.js app. Create a new file named `supabaseClient.js` inside the `lib` folder (create the folder if it doesn't exist) in your project's root directory. Add the following code to `supabaseClient.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
```

Replace `https://your-supabase-url.supabase.co` and `your-supabase-anon-key` with your Supabase project's URL and public API key.

3. In your Next.js app, use the Supabase client to handle user authentication (signup, login, logout, etc.). Here's an example of a simple login function:

```javascript
import supabase from '../lib/supabaseClient';

async function login(email, password) {
  const { user, error } = await supabase.auth.signIn({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Error logging in:', error.message);
  } else {
    console.log('Logged in successfully:', user);
  }
}
```

4. To pass the authenticated user's token to your GraphQL server, modify the `apolloClient.js` file in your Next.js app to include the `Authorization` header:

```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import supabase from './supabaseClient';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/',
});

const authLink = setContext((_, { headers }) => {
  const token = supabase.auth.session()?.access_token;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
```

5. In your GraphQL server, you can use the `context` function in `ApolloServer` to verify the user's token and pass the user's data to your resolvers. First, install the `jsonwebtoken` package:

```bash
npm install jsonwebtoken
```

6. Update your `index.js` file in the `graphql-server` directory to include the `context` function:

```javascript
const { ApolloServer, gql } = require('apollo-server');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

// ... (rest of the code)

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization || '';
    const secret = 'your-supabase-jwt-secret';

    try {
      if (token) {
        const decodedToken = jwt.verify(token.replace('Bearer ', ''), secret);
        const user = decodedToken; // Add user data to the context
        return { user, pool };
      }
    } catch (error) {
      console.error('Error verifying token:', error.message);
    }

    return { pool };
  },
});

// ... (rest of the code)
```

Replace `your-supabase-jwt-secret` with your Supabase project's JWT secret.

7. Now, you can access the authenticated user's data in your resolvers using the `context` parameter:

```javascript
const resolvers = {
  Query: {
    emailAccounts: async (_, __, context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      const result = await context.pool.query('SELECT * FROM email_accounts');
      return result.rows;
    },
    // ... (rest of the resolvers)
  },
};
```

This setup allows you to handle user authentication in your Next.js app using Supabase and pass the authenticated user's token to your GraphQL server. You can then use the token to verify the user and access their data in your resolvers.