import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GQL_SERVER,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken');

  // if (!token) {
  //   // direct to login page
  //   window.location.href = '/login';
  // }

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