// pages/_app.tsx
import { ApolloProvider } from "@apollo/client";
import type { AppProps } from "next/app";
import client from "../apolloClient";
import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/useAuth";

function MyApp({ Component, pageProps }: AppProps) {
  useAuth();

  return (
    <ApolloProvider client={client}>
      <ChakraProvider>
        <Navbar />
        <Component {...pageProps} />
      </ChakraProvider>
    </ApolloProvider>
  );
}

export default MyApp;
