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

const UPDATE_CAMPAIGN_STATUS = gql`
  mutation UpdateCampaignStatus($id: ID!, $status: String!) {
    updateCampaignStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const Campaigns = () => {
  const { loading, error, data } = useQuery(GET_CAMPAIGNS);
  const [updateCampaignStatus] = useMutation(UPDATE_CAMPAIGN_STATUS);

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
                <Th color="white" fontWeight="bold">
                  Name
                </Th>
                <Th color="white" fontWeight="bold">
                  Reply To
                </Th>
                <Th color="white" fontWeight="bold">
                  Daily Limit
                </Th>
                <Th color="white" fontWeight="bold">
                  Emails Sent Today
                </Th>
                <Th color="white" fontWeight="bold">
                  Status
                </Th>
                <Th color="white" fontWeight="bold">
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {campaigns.map((campaign: any) => (
                <Tr key={campaign.id}>
                  <Td>
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
                  <Td>{campaign.reply_to_email_address}</Td>
                  <Td>{campaign.daily_limit}</Td>
                  <Td>{campaign.emails_sent_today}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        campaign.status === "active" ? "green" : "red"
                      }
                      borderRadius="md"
                      px={2}
                      py={1}
                    >
                      {campaign.status}
                    </Badge>
                  </Td>
                  <Td>
                    {campaign.status !== "completed" && (
                      <Button
                        size="xs"
                        colorScheme={
                          campaign.status === "active" ? "red" : "green"
                        }
                        onClick={() => toggleCampaignStatus(campaign)}
                      >
                        {campaign.status === "active"
                          ? "Pause Campaign"
                          : "Resume Campaign"}
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
};

export default Campaigns;