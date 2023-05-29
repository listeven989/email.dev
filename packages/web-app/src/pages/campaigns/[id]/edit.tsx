import { useEffect, useState } from "react";
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
  Text,
} from "@chakra-ui/react";
import { GET_EMAIL_ACCOUNTS } from "../new";
import EmailAccountSelector from "@/components/campaigns/email-account-selector";


const EDIT_CAMPAIGN = gql`
  mutation EditCampaign(
    $id: ID!
    $email_account_ids: [ID!]!
    $name: String!
    $reply_to_email_address: String!
    $daily_limit: Int!
    $status: String
  ) {
    editCampaign(
      id: $id
      email_account_ids: $email_account_ids
      name: $name
      reply_to_email_address: $reply_to_email_address
      daily_limit: $daily_limit
      status: $status
    ) {
      id
    }
  }
`;

const GET_CAMPAIGN = gql`
  query GetCampaign($id: ID!) {
    campaign(id: $id) {
      email_account_ids
      daily_limit
      name
      reply_to_email_address
      status
    }
}
`;

const EditCampaign = () => {

  const router = useRouter();

  const { id: campaignId } = router.query;

  const [selectedEmailAccountIds, setSelectedEmailAccountIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [replyToEmailAddress, setReplyToEmailAddress] = useState("");
  const [dailyLimit, setDailyLimit] = useState(0);
  const [status, setStatus] = useState("");
  const [showEmailAccountsRequiredError, setShowEmailAccountsRequiredError] = useState(false);

  const [editCampaign, { loading: editLoading }] = useMutation(EDIT_CAMPAIGN);
  const { loading, error, data } = useQuery(GET_EMAIL_ACCOUNTS);
  const { loading: campaignLoading, error: campaignError, data: campaignData } = useQuery(GET_CAMPAIGN, {
    variables: { id: campaignId },
  });


  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (selectedEmailAccountIds.length <= 0) {
      setShowEmailAccountsRequiredError(true);
      return
    }

    setShowEmailAccountsRequiredError(false);

    const { data } = await editCampaign({
      variables: {
        id: campaignId,
        email_account_ids: selectedEmailAccountIds,
        name,
        reply_to_email_address: replyToEmailAddress,
        daily_limit: dailyLimit,
        status
      },
    });

    if (data) {
      router.push(
        `/campaigns/${campaignId}`
      );
    }
  };


  useEffect(() => {
    if (campaignData) {
      const campaign = campaignData.campaign;
      setName(campaign.name);
      setReplyToEmailAddress(campaign.reply_to_email_address);
      setDailyLimit(campaign.daily_limit);
      setStatus(campaign.status);
      setSelectedEmailAccountIds(campaign.email_account_ids);
    }
  }, [campaignData]);

  if (loading || campaignLoading) return <p>Loading...</p>;
  if (error || campaignError) return <p>Error: {campaignError?.message || error?.message}</p>;

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

              <FormControl id="dailyLimit">
                <FormLabel>Status</FormLabel>
                <Select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                  }}
                >
                  <option>active</option>
                  <option>paused</option>
                </Select>
              </FormControl>
              {showEmailAccountsRequiredError && <Text color={"red"}>Please Select Email Accounts to Use</Text>}

              {editLoading ? <p>Loading...</p> :
                <Button type="submit" colorScheme="blue">
                  Update Campaign
                </Button>
              }
            </VStack>
          </form>
        </Box>
      </VStack>
    </Container>
  );
};

export default EditCampaign;
