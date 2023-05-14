import { useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  VStack,
  Radio,
  RadioGroup,
  Stack,
  Input,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useMutation, useQuery, gql } from "@apollo/client";
import Papa from "papaparse";

const GET_EMAIL_TEMPLATES = gql`
  query GetEmailTemplates {
    emailTemplates {
      id
      name
    }
  }
`;

const ADD_TEMPLATE_AND_RECIPIENTS = gql`
  mutation AddTemplateAndRecipients(
    $campaignId: ID!
    $emailTemplateId: ID!
    $emailAddresses: [String!]!
  ) {
    updateCampaign(id: $campaignId, email_template_id: $emailTemplateId) {
      id
    }
    addRecipientEmails(campaign_id: $campaignId, email_addresses: $emailAddresses) {
      id
    }
  }
`;

const AddTemplateAndRecipients = () => {
  const router = useRouter();
  const { campaignId } = router.query;
  const { loading, error, data } = useQuery(GET_EMAIL_TEMPLATES);
  const [addTemplateAndRecipients] = useMutation(ADD_TEMPLATE_AND_RECIPIENTS);

  const [emailTemplateId, setEmailTemplateId] = useState("");
  const [emailAddresses, setEmailAddresses] = useState("");
  const [inputType, setInputType] = useState("text");
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const emails = results.data.map((row: any) => row.Email);
          setEmailAddresses(emails.join("\n"));
          setParsedEmails(emails);
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTemplateAndRecipients({
      variables: {
        campaignId,
        emailTemplateId,
        emailAddresses: emailAddresses.split("\n"),
      },
    });
    router.push(`/campaigns/${campaignId}`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const emailTemplates = data.emailTemplates;

  return (
    <Container maxW="container.md" py={12}>
      <VStack as="form" onSubmit={handleSubmit} spacing={6} align="start">
        <FormControl id="emailTemplate">
          <FormLabel>Email Template</FormLabel>
          <Select
            placeholder="Select email template"
            value={emailTemplateId}
            onChange={(e) => setEmailTemplateId(e.target.value)}
          >
            {emailTemplates.map((template: any) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl id="emailAddresses">
          <FormLabel>Email Recipients</FormLabel>
          <RadioGroup
            value={inputType}
            onChange={(value) => setInputType(value as string)}
          >
            <Stack direction="row">
              <Radio value="text">Text</Radio>
              <Radio value="csv">CSV</Radio>
            </Stack>
          </RadioGroup>
          {inputType === "text" ? (
            <Textarea
              placeholder="Enter email addresses, one per line"
              value={emailAddresses}
              onChange={(e) => setEmailAddresses(e.target.value)}
            />
          ) : (
            <>
              <Input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                display="none"
              />
              <Button
                colorScheme="blue"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose CSV File
              </Button>
              <List mt={4} spacing={2}>
                {parsedEmails.map((email, index) => (
                  <ListItem key={index}>
                    <Text>{email}</Text>
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </FormControl>
        <Button type="submit" colorScheme="blue">
          Add Template and Recipients
        </Button>
      </VStack>
    </Container>
  );
};

export default AddTemplateAndRecipients;