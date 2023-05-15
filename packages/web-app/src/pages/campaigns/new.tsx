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

const GET_EMAIL_ACCOUNTS = gql`
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
    $email_account_id: ID!
    $name: String!
    $reply_to_email_address: String!
    $daily_limit: Int!
  ) {
    createCampaign(
      email_account_id: $email_account_id
      name: $name
      reply_to_email_address: $reply_to_email_address
      daily_limit: $daily_limit
    ) {
      id
    }
  }
`;

const NewCampaign = () => {
  const [emailAccountId, setEmailAccountId] = useState("");
  const [name, setName] = useState("");
  const [replyToEmailAddress, setReplyToEmailAddress] = useState("");
  const [dailyLimit, setDailyLimit] = useState(0);
  const [createCampaign] = useMutation(CREATE_CAMPAIGN);
  const { loading, error, data } = useQuery(GET_EMAIL_ACCOUNTS);
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { data } = await createCampaign({
      variables: {
        email_account_id: emailAccountId,
        name,
        reply_to_email_address: replyToEmailAddress,
        daily_limit: dailyLimit,
      },
    });

    const campaignId = data.createCampaign.id;
    router.push(
      `/campaigns/add_template_and_recipients?campaignId=${campaignId}`
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const emailAccounts = data.emailAccounts;
  const selectedEmailAccount = emailAccounts.find(
    (account: any) => account.id === emailAccountId
  );

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
                <Select
                  placeholder="Select email account"
                  value={emailAccountId}
                  onChange={(e) => setEmailAccountId(e.target.value)}
                  required
                >
                  {emailAccounts.map((account: any) => (
                    <option key={account.id} value={account.id}>
                      {account.email_address}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {selectedEmailAccount && (
                <Box>
                  <Box>
                    <strong>SMTP Host:</strong> {selectedEmailAccount.smtp_host}
                  </Box>
                  <Box>
                    <strong>Account ID:</strong> {selectedEmailAccount.id}
                  </Box>
                  <Box>
                    <strong>Email Address:</strong>{" "}
                    {selectedEmailAccount.email_address}
                  </Box>
                </Box>
              )}
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
