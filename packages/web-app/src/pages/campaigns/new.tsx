import { useState } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery, gql } from "@apollo/client";
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Container,
  Select,
} from "@chakra-ui/react";
import EmailAccountSelector from "@/components/campaigns/email-account-selector";

export const GET_EMAIL_ACCOUNTS = gql`
  query GetEmailAccounts {
    emailAccounts {
      id
      email_address
      smtp_host
    }
  }
`;

const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign(
    $email_account_ids: [ID!]!
    $name: String!
    $reply_to_email_address: String!
    $daily_limit: Int!
  ) {
    createCampaign(
      email_account_ids: $email_account_ids
      name: $name
      reply_to_email_address: $reply_to_email_address
      daily_limit: $daily_limit
    ) {
      id
    }
  }
`;

const NewCampaign = () => {
  const [selectedEmailAccountIds, setSelectedEmailAccountIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [replyToEmailAddress, setReplyToEmailAddress] = useState("");
  const [dailyLimit, setDailyLimit] = useState(0);
  const [createCampaign] = useMutation(CREATE_CAMPAIGN);
  const { loading, error, data } = useQuery(GET_EMAIL_ACCOUNTS);
  const [showEmailAccountsRequiredError, setShowEmailAccountsRequiredError] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (selectedEmailAccountIds.length <= 0) {
      setShowEmailAccountsRequiredError(true);
      return
    }

    setShowEmailAccountsRequiredError(false);

    const { data } = await createCampaign({
      variables: {
        email_account_ids: selectedEmailAccountIds,
        name,
        reply_to_email_address: replyToEmailAddress,
        daily_limit: dailyLimit,
      },
    });

    const campaignId = data.createCampaign.id;
    router.push(
      `/campaigns/${campaignId}/email-template?newCampaign=true`
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const emailAccounts = data.emailAccounts;

  return (
    <Container maxW="container.md" py={12}>
      <VStack spacing={6} align="start">
        <Heading as="h1" size="lg">
          Create New Campaign
        </Heading>
        <Box w="100%">
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl id="emailAccount">
                <FormLabel>Email Account</FormLabel>
                <EmailAccountSelector
                  selectedEmailAccountIds={selectedEmailAccountIds}
                  setSelectedEmailAccountIds={setSelectedEmailAccountIds}
                  emailAccounts={emailAccounts} />
              </FormControl>
              <FormControl id="name">
                <FormLabel>Campaign Name</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </FormControl>
              <FormControl id="replyToEmailAddress">
                <FormLabel>Reply To Email Address</FormLabel>
                <Input
                  type="email"
                  value={replyToEmailAddress}
                  onChange={(e) => setReplyToEmailAddress(e.target.value)}
                  placeholder="optional"
                />
              </FormControl>
              <FormControl id="dailyLimit">
                <FormLabel>Daily Limit</FormLabel>
                <Input
                  type="number"
                  value={dailyLimit ? dailyLimit : ""}
                  onChange={(e) => {
                    // if e is string parseInt
                    setDailyLimit(parseInt(e.target.value));
                  }}
                  placeholder="optional"
                />
              </FormControl>
              <Button type="submit" colorScheme="blue">
                Create Campaign
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};

export default NewCampaign;
