import React, { useState } from "react";
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
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import EmailRecipientsInput from "@/components/campaigns/email-recipients-input";
import { GET_RECIPIENTS } from "./recipients";

type Props = {};

const ADD_RECIPIENTS = gql`
  mutation AddRecipients($campaignId: ID!, $emailAddresses: [String!]!) {
    addRecipientEmails(
      campaign_id: $campaignId
      email_addresses: $emailAddresses
    ) {
      id
    }
  }
`;
function splitStringOnCarriageAndComma(input: string): string[] {
  const lines = input.split('\n');
  const result: string[] = [];

  lines.forEach((line) => {
    const emails = line.split(',');
    emails.forEach((email) => {
      const trimmedEmail = email.trim();
      if (trimmedEmail !== '') {
        result.push(trimmedEmail);
      }
    });
  });

  return result;
}

export default function AddRecipients({}: Props) {
  const router = useRouter();

  const { id: campaignId } = router.query;
  const [emailAddresses, setEmailAddresses] = useState("");
  const [addRecipients] = useMutation(ADD_RECIPIENTS, {
    refetchQueries: [
      {
        query: GET_RECIPIENTS,
        variables: { campaignId },
      },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   const splitEmails = splitStringOnCarriageAndComma(emailAddresses);
  
    await addRecipients({
      variables: {
        campaignId,
        emailAddresses: splitEmails
      },
    });
    router.push(`/campaigns/${campaignId}/recipients`);
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
}
