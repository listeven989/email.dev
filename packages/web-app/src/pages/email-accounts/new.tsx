import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
  } from "@chakra-ui/react";
  import { useState } from "react";
  import { useMutation, gql } from "@apollo/client";
  
  const CREATE_EMAIL_ACCOUNT = gql`
    mutation CreateEmailAccount(
      $email_address: String!
      $display_name: String
      $smtp_host: String!
      $smtp_port: Int!
      $username: String!
      $password: String!
    ) {
      createEmailAccount(
        email_address: $email_address
        display_name: $display_name
        smtp_host: $smtp_host
        smtp_port: $smtp_port
        username: $username
        password: $password
      ) {
        id
        email_address
      }
    }
  `;
  
  const CreateEmailAccount = () => {
    const [createEmailAccount] = useMutation(CREATE_EMAIL_ACCOUNT);
    const [emailAddress, setEmailAddress] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [smtpHost, setSmtpHost] = useState("");
    const [smtpPort, setSmtpPort] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const toast = useToast();
  
    const handleCreateEmailAccount = async () => {
      try {
        await createEmailAccount({
          variables: {
            email_address: emailAddress,
            display_name: displayName,
            smtp_host: smtpHost,
            smtp_port: parseInt(smtpPort),
            username: username,
            password: password,
          },
        });
        toast({
          title: "Email account created successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error: any) {
        toast({
          title: "Error creating email account.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
  
    return (
      <Container maxW="container.md" py={12}>
        <VStack spacing={6} align="start">
          <FormControl id="emailAddress">
            <FormLabel>Email Address</FormLabel>
            <Input
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="Enter the email address"
            />
          </FormControl>
          <FormControl id="displayName">
            <FormLabel>Display Name</FormLabel>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter the display name (optional)"
            />
          </FormControl>
          <FormControl id="smtpHost">
            <FormLabel>SMTP Host</FormLabel>
            <Input
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="Enter the SMTP host"
            />
          </FormControl>
          <FormControl id="smtpPort">
            <FormLabel>SMTP Port</FormLabel>
            <Input
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              placeholder="Enter the SMTP port"
            />
          </FormControl>
          <FormControl id="username">
            <FormLabel>Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter the username"
            />
          </FormControl>
          <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the password"
            />
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={handleCreateEmailAccount}
            isDisabled={
              !emailAddress ||
              !smtpHost ||
              !smtpPort ||
              !username ||
              !password
            }
          >
            Create Email Account
          </Button>
        </VStack>
      </Container>
    );
  };
  
  export default CreateEmailAccount;