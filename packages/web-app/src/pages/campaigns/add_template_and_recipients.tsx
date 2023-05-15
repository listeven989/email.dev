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
  Text,
  Collapse,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useMutation, useQuery, gql } from "@apollo/client";
import { useState, useRef } from "react";
import CreateTemplateDropdown from "@/components/campaigns/create-template-dropdown";
import ViewTemplate from "@/components/ViewTemplate";
import EmailRecipientsInput from "@/components/campaigns/email-recipients-input";

export const GET_EMAIL_TEMPLATES = gql`
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

const ADD_TEMPLATE_AND_RECIPIENTS = gql`
  mutation AddTemplateAndRecipients(
    $campaignId: ID!
    $emailTemplateId: ID!
    $emailAddresses: [String!]!
  ) {
    updateCampaignTemplate(
      id: $campaignId
      email_template_id: $emailTemplateId
    ) {
      id
    }
    addRecipientEmails(
      campaign_id: $campaignId
      email_addresses: $emailAddresses
    ) {
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

  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);

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

  const selectedTemplate = emailTemplates.find(
    (template: any) => template.id === emailTemplateId
  );

  return (
    <Container maxW="container.md" py={12}>
      <VStack as="form" onSubmit={handleSubmit} spacing={6} align="start">
        <FormControl id="emailTemplate">
          <FormLabel>Email Template</FormLabel>
          <Select
            placeholder="Select email template"
            value={emailTemplateId}
            onChange={(e) => {
              if (e.target.value === "create_new") {
                setShowNewTemplateForm(true);
              } else {
                setEmailTemplateId(e.target.value);
                setShowNewTemplateForm(false);
              }
            }}
          >
            {emailTemplates.map((template: any) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
            <option value="create_new">Create New Email Template</option>
          </Select>

          <CreateTemplateDropdown
            setShow={setShowNewTemplateForm}
            show={showNewTemplateForm}
          />

          {selectedTemplate && <ViewTemplate template={selectedTemplate} />}
        </FormControl>

        <EmailRecipientsInput
          setEmailAddresses={setEmailAddresses}
          emailAddresses={emailAddresses}
        />

        <Button type="submit" colorScheme="blue">
          Continue
        </Button>
      </VStack>
    </Container>
  );
};

export default AddTemplateAndRecipients;
