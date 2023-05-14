// apolloClient.ts
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:8300", // Replace with your GraphQL server URL
  cache: new InMemoryCache(),
});

export default client;