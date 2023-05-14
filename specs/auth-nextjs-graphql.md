If you want to use your own setup for authentication in your Next.js app with a GraphQL server, you can follow these steps:

1. First, install the required dependencies for authentication:

```bash
npm install bcryptjs jsonwebtoken
```

2. Create a new folder named `auth` in your project's root directory. Inside the `auth` folder, create a file named `auth.js`. Add the following code to `auth.js`:

```javascript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const users = []; // Replace this with your own user storage solution

export async function createUser(email, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { email, password: hashedPassword };
  users.push(user);
  return user;
}

export async function login(email, password) {
  const user = users.find((u) => u.email === email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ email: user.email }, 'your-secret-key', {
    expiresIn: '1h',
  });

  return { user, token };
}
```

Replace `'your-secret-key'` with your own secret key for JWT.

3. In your Next.js app, use the `login` and `createUser` functions from `auth.js` to handle user authentication (signup, login, etc.). Here's an example of a simple login function:

```javascript
import { login } from '../auth/auth';

async function handleLogin(email, password) {
  try {
    const { user, token } = await login(email, password);
    console.log('Logged in successfully:', user, token);
  } catch (error) {
    console.error('Error logging in:', error.message);
  }
}
```

4. To pass the authenticated user's token to your GraphQL server, modify the `apolloClient.js` file in your Next.js app to include the `Authorization` header:

```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');

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

5. In your GraphQL server, you can use the `context` function in `ApolloServer` to verify the user's token and pass the user's data to your resolvers. First, install the `jsonwebtoken` package if you haven't already:

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
    const secret = 'your-secret-key';

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

Replace `'your-secret-key'` with your own secret key for JWT.

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

This setup allows you to handle user authentication in your Next.js app using your own custom setup and pass the authenticated user's token to your GraphQL server. You can then use the token to verify the user and access their data in your resolvers.