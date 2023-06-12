import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useMutation, useQuery, gql } from "@apollo/client";
import { useState, useRef } from "react";
import CreateTemplateDropdown from "@/components/campaigns/create-template-dropdown";
import ViewTemplate from "@/components/ViewTemplate";
import EmailRecipientsInput from "@/components/campaigns/email-recipients-input";



const ADD_RECIPIENTS = gql`
  mutation AddRecipients(
    $campaignId: ID!
    $emailAddresses: [String!]!
  ) {
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
  const [addRecipients] = useMutation(ADD_RECIPIENTS);

  const [emailAddresses, setEmailAddresses] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addRecipients({
      variables: {
        campaignId,
        emailAddresses: emailAddresses.split("\n"),
      },
    });
    router.push(`/campaigns`);
  };

  return (
    <Container maxW="container.md" py={12}>
      <VStack as="form" onSubmit={handleSubmit} spacing={6} align="start">

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
