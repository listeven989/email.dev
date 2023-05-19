// pages/TestEmail.tsx
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    useToast,
    Text,
    Textarea,
  } from "@chakra-ui/react";
  import { useRouter } from "next/router";
  import { useState } from "react";
  import { useMutation, useQuery, gql } from "@apollo/client";
  
  const GET_EMAIL_TEMPLATES = gql`
    query GetEmailTemplates {
      emailTemplates {
        id
        name
        subject
        text_content
        html_content
      }
    }
  `;
  
  const GET_EMAIL_ACCOUNTS = gql`
    query GetEmailAccounts {
      emailAccounts {
        id
        email_address
        smtp_host
      }
    }
  `;
  
  const SEND_TEST_EMAIL = gql`
    mutation SendTestEmail(
      $emailTemplateId: ID!
      $recipientEmail: String!
      $campaignId: ID
      $emailAccountId: ID
    ) {
      sendTestEmail(
        emailTemplateId: $emailTemplateId
        recipientEmail: $recipientEmail
        campaignId: $campaignId
        emailAccountId: $emailAccountId
      )
    }
  `;
  
  const TestEmail = () => {
    const router = useRouter();
    const { campaignId, emailAccountId, emailTemplateId } = router.query;
    const [selectedEmailTemplateId, setSelectedEmailTemplateId] = useState(
      emailTemplateId || ""
    );
    const [selectedEmailAccountId, setSelectedEmailAccountId] = useState(
      emailAccountId || ""
    );
    const [recipientEmail, setRecipientEmail] = useState("");
    const [sendTestEmail] = useMutation(SEND_TEST_EMAIL);
    const toast = useToast();
  
    const {
      loading: templatesLoading,
      error: templatesError,
      data: templatesData,
    } = useQuery(GET_EMAIL_TEMPLATES);
    const {
      loading: accountsLoading,
      error: accountsError,
      data: accountsData,
    } = useQuery(GET_EMAIL_ACCOUNTS);
  
    const handleSendTestEmail = async () => {
      try {
        await sendTestEmail({
          variables: {
            emailTemplateId: selectedEmailTemplateId,
            recipientEmail,
            campaignId,
            emailAccountId: selectedEmailAccountId,
          },
        });
        toast({
          title: "Test email sent successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error: any) {
        toast({
          title: "Error sending test email.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
  
    if (templatesLoading || accountsLoading) return <p>Loading...</p>;
    if (templatesError || accountsError)
      return <p>Error: {templatesError?.message || accountsError?.message}</p>;
  
    const emailTemplates = templatesData.emailTemplates;
    const emailAccounts = accountsData.emailAccounts;
  
    const selectedTemplate = emailTemplates.find(
      (template: any) => template.id === selectedEmailTemplateId
    );
  
    const selectedAccount = emailAccounts.find(
      (account: any) => account.id === selectedEmailAccountId
    );
  
    return (
      <Container maxW="container.md" py={12}>
        <VStack spacing={6} align="start">
          <FormControl id="emailTemplate">
            <FormLabel>Email Template</FormLabel>
            <Select
              placeholder="Select email template"
              value={selectedEmailTemplateId}
              onChange={(e) => setSelectedEmailTemplateId(e.target.value)}
            >
              {emailTemplates.map((template: any) => (
                <option key={template.id} value={template.id}>
                  {template.name + " - " + template.id}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl id="emailAccount">
            <FormLabel>Email Account</FormLabel>
            <Select
              placeholder="Select email account"
              value={selectedEmailAccountId}
              onChange={(e) => setSelectedEmailAccountId(e.target.value)}
            >
              {emailAccounts.map((account: any) => (
                <option key={account.id} value={account.id}>
                  {account.email_address}
                </option>
              ))}
            </Select>
          </FormControl>
          {selectedTemplate && (
            <Box mt={4}>
              <Text fontWeight="bold">Subject:</Text>
              <Text>{selectedTemplate.subject}</Text>
              {/* <FormLabel mt={4}>Text Content</FormLabel>
              <Textarea disabled value={selectedTemplate.text_content} readOnly /> */}
              <FormLabel mt={4}>HTML Content</FormLabel>
              <Textarea value={selectedTemplate.html_content} readOnly />
            </Box>
          )}
          {selectedAccount && (
            <Box mt={4}>
              <Text fontWeight="bold">SMTP Provider:</Text>
              <Text>{selectedAccount.smtp_host}</Text>
              <Text fontWeight="bold" mt={4}>
                Email Address:
              </Text>
              <Text>{selectedAccount.email_address}</Text>
            </Box>
          )}
          <FormControl id="recipientEmail">
            <FormLabel>Recipient Email Address</FormLabel>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Enter the recipient's email address"
            />
          </FormControl>
          <Button
            colorScheme="blue"
            onClick={handleSendTestEmail}
            isDisabled={
              !recipientEmail ||
              !selectedEmailTemplateId ||
              !selectedEmailAccountId
            }
          >
            Send Test Email
          </Button>
        </VStack>
      </Container>
    );
  };
  
  export default TestEmail;
  