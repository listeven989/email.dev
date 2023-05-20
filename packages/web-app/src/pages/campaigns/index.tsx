import Link from "next/link";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";

const GET_CAMPAIGNS = gql`
  query GetCampaigns {
    campaigns {
      id
      name
      reply_to_email_address
      daily_limit
      emails_sent_today
      status
      created_at
      updated_at
    }
  }
`;

const GET_RECIPIENT_EMAILS = gql`
  query GetRecipientEmails($campaignId: ID!) {
    recipientEmails(campaignId: $campaignId) {
      id
      sent
    }
  }
`;

const UPDATE_CAMPAIGN_STATUS = gql`
  mutation UpdateCampaignStatus($id: ID!, $status: String!) {
    updateCampaignStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const CampaignRow = ({
  campaign,
  toggleCampaignStatus,
  archiveCampaign,
}: {
  campaign: any;
  toggleCampaignStatus: any;
  archiveCampaign: any;
}) => {
  const { loading, error, data } = useQuery(GET_RECIPIENT_EMAILS, {
    variables: { campaignId: campaign.id },
  });

  if (loading)
    return (
      <Tr>
        <Td colSpan={7}>Loading...</Td>
      </Tr>
    );
  if (error)
    return (
      <Tr>
        <Td colSpan={7}>Error: {error.message}</Td>
      </Tr>
    );

  const recipientEmails = data.recipientEmails;

  return (
    <Tr key={campaign.id}>
      <Td textAlign={"center"}>
        <Link href={`/campaigns/${campaign.id}`} passHref>
          <Text
            as="a"
            color="blue.500"
            fontWeight="bold"
            _hover={{ textDecoration: "underline" }}
          >
            {campaign.name}
          </Text>
        </Link>
      </Td>
      <Td textAlign={"center"}>{campaign.reply_to_email_address}</Td>
      <Td textAlign={"center"}>{campaign.daily_limit}</Td>
      <Td textAlign={"center"}>{campaign.emails_sent_today}</Td>

      <Td textAlign={"center"}>{recipientEmails.length}</Td>
      <Td textAlign={"center"}>
        {recipientEmails.reduce(
          (count: number, email: any) => (email.sent ? count + 1 : count),
          0
        )}
      </Td>
      <Td textAlign={"center"}>
        <Badge
          colorScheme={
            campaign.status === "active"
              ? "green"
              : campaign.status === "completed"
              ? "purple"
              : "red"
          }
          borderRadius="md"
          px={2}
          py={1}
          width="100px"
        >
          {campaign.status}
        </Badge>
      </Td>
      <Td textAlign={"center"}>
        <VStack spacing={2}>
          {campaign.status !== "completed" && (
            <Button
              size="xs"
              colorScheme={campaign.status === "active" ? "red" : "green"}
              onClick={() => toggleCampaignStatus(campaign)}
              width="140px" // Set a fixed width
            >
              {campaign.status === "active"
                ? "Pause Campaign"
                : "Start Campaign"}
            </Button>
          )}
          <Button
            size="xs"
            colorScheme="gray"
            onClick={() => archiveCampaign(campaign.id)}
            width="140px" // Set a fixed width
          >
            Archive Campaign
          </Button>
        </VStack>
      </Td>
    </Tr>
  );
};

const Campaigns = () => {
  const { loading, error, data } = useQuery(GET_CAMPAIGNS);
  const [updateCampaignStatus] = useMutation(UPDATE_CAMPAIGN_STATUS);

  const ARCHIVE_CAMPAIGN = gql`
    mutation ArchiveCampaign($id: ID!) {
      archiveCampaign(id: $id) {
        id
        status
      }
    }
  `;

  const [archiveCampaignMutation] = useMutation(ARCHIVE_CAMPAIGN);

  const archiveCampaign = async (campaignId: string) => {
    await archiveCampaignMutation({
      variables: { id: campaignId },
      refetchQueries: [{ query: GET_CAMPAIGNS }],
    });
  };

  const toggleCampaignStatus = async (campaign: any) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    await updateCampaignStatus({
      variables: { id: campaign.id, status: newStatus },
      refetchQueries: [{ query: GET_CAMPAIGNS }],
    });
  };

  const bg = useColorModeValue("gray.50", "gray.900");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!data) return null;

  const campaigns = data.campaigns;

  return (
    <Container maxW="container.xl" py={12}>
      <VStack spacing={6} align="start" w="100%">
        <Flex justifyContent="space-between" w="100%">
          <Heading as="h1" size="lg">
            Campaigns
          </Heading>
          <Link href="/campaigns/new">
            <Button
              as="a"
              colorScheme="blue"
              size="sm"
              fontWeight="bold"
              borderRadius="full"
              px={6}
              _hover={{ bg: "blue.600" }}
            >
              Create New Campaign
            </Button>
          </Link>
        </Flex>
        <Box w="100%">
          <Table
            variant="simple"
            colorScheme="gray"
            borderWidth="1px"
            borderRadius="md"
            overflow="hidden"
            bg={bg}
          >
            <Thead bg="gray.500">
              <Tr>
                <Th color="white" fontWeight="bold" textAlign="center">
                  Name
                </Th>
                <Th color="white" fontWeight="bold" textAlign="center">
                  Reply To
                </Th>
                <Th color="white" fontWeight="bold" textAlign="center">
                  Daily Limit
                </Th>
                <Th color="white" fontWeight="bold" textAlign="center">
                  Sent Today
                </Th>
                <Th color="white" fontWeight="bold" textAlign="center">
                  Recipients
                </Th>
                <Th color="white" fontWeight="bold" textAlign="center">
                  Total Sent
                </Th>
                <Th color="white" fontWeight="bold" textAlign="center">
                  Status
                </Th>
                <Th color="white" fontWeight="bold" textAlign="center">
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {campaigns.map((campaign: any) => (
                <CampaignRow
                  campaign={campaign}
                  key={campaign.id}
                  toggleCampaignStatus={toggleCampaignStatus}
                  archiveCampaign={archiveCampaign}
                />
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
};

export default Campaigns;
