// pages/campaigns/[id].tsx
import { useRouter } from "next/router";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import {
  Container,
  Heading,
  VStack,
  Text,
  Button,
  HStack,
  Box,
  Badge,
  Flex,
  SimpleGrid,
  Stack,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";

export const GET_CAMPAIGN = gql`
  query GetCampaign($id: ID!) {
    campaign(id: $id) {
      id
      name
      reply_to_email_address
      daily_limit
      emails_sent_today
      status
      created_at
      updated_at
    }
    emailTemplateByCampaignId(campaignId: $id) {
      id
      name
      subject
      text_content
      html_content
    }
    recipientsWhoReadEmail(campaignId: $id) {
      email_address
      read_count
    }
    linkClicksByCampaign(campaignId: $id) {
      id
      click_count
      url
      last_clicked_at
      email_address
      user_agent
    }
  }
`;

const truncateText = (text: string, maxLength = 30) => {
  if (text?.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

const handleClick = (url: string) => {
  window.open(url, "_blank");
};

const Campaign = () => {
  const router = useRouter();
  const { id } = router.query;

  const { loading, error, data } = useQuery(GET_CAMPAIGN, {
    variables: { id },
  });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data) return null;

  const campaign = data.campaign;
  const totalOpened = data.recipientsWhoReadEmail.length;

  return (
    <Container maxW="container.md" py={12}>
      {campaign ? (
        <VStack spacing={6} align="left">
          <Heading as="h1" size="lg">
            Campaign Details
          </Heading>
          <Box
            borderWidth={1}
            borderRadius="lg"
            p={6}
            boxShadow="md"
            bg="white"
            w="100%"
          >
            <SimpleGrid columns={2} spacing={10}>
              <Box>
                <Text fontWeight="bold">Campaign Name:</Text>
                <Text>{campaign.name}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Daily Limit:</Text>
                <Text>{campaign.daily_limit}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Emails Sent Today:</Text>
                <Text>{campaign.emails_sent_today}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold">Status:</Text>
                <Badge
                  colorScheme={campaign.status === "active" ? "green" : "red"}
                >
                  {campaign.status}
                </Badge>
              </Box>
              <Box>
                <Text fontWeight="bold">Reply To:</Text>
                <Text>{campaign.reply_to_email_address || "n/a"}</Text>
              </Box>
            </SimpleGrid>
            <Stack direction="row" spacing={4} marginTop={6}>
              <Link href={`/campaigns/${id}/edit`} passHref>
                <Button as="a" colorScheme="blue" variant="solid">
                  Edit Campaign
                </Button>
              </Link>
              <Link href={`/campaigns/${id}/email-template`} passHref>
                <Button as="a" colorScheme="blue" variant="solid">
                  View / Edit Email Template
                </Button>
              </Link>
              <Link href={`/campaigns/${id}/recipients`} passHref>
                <Button as="a" colorScheme="blue" variant="solid">
                  Add / Edit Recipients
                </Button>
              </Link>
            </Stack>
          </Box>
          <Heading as="h2" size="md">
            Email Opens
          </Heading>
          <Box
            borderWidth={1}
            borderRadius="lg"
            p={6}
            boxShadow="md"
            bg="white"
            w="100%"
            overflow="auto"
          >
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Email Address</Th>
                  <Th>Open Count</Th>
                  <Th>Last Open Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.recipientsWhoReadEmail.map((recipient: any) => (
                  <Tr key={recipient.email_address}>
                    <Td>{recipient.email_address}</Td>
                    <Td>{recipient.read_count}</Td>
                    <Td>{"not yet available"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {data.recipientsWhoReadEmail.length == 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: "1rem",
                }}
              >
                <Text>No recipients opened your emails yet!</Text>
              </div>
            )}
          </Box>
          <Heading as="h2" size="md">
            Link Clicks
          </Heading>
          <Box
            borderWidth={1}
            borderRadius="lg"
            p={6}
            boxShadow="md"
            bg="white"
            w="100%"
            overflow="auto"
          >
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Email Address</Th>
                  <Th>URL</Th>
                  <Th>Click Count</Th>
                  <Th>Last Clicked At</Th>
                  <Th>User Agent</Th>

                </Tr>
              </Thead>
              <Tbody>
                {data.linkClicksByCampaign.map((linkClick: any) => (
                  <Tr key={linkClick.id}>
                    <Td>{linkClick.email_address}</Td>
                    {/* TODO: for long text just do a ... and make the link clickable */}
                    <Td onClick={() => handleClick(linkClick.url)} style={{ color: "blue", cursor: "pointer" }}>
                      {truncateText(linkClick.url)}
                    </Td>
                    <Td>{linkClick.click_count}</Td>
                    <Td>
                      {linkClick.last_clicked_at ? new Date(parseInt(linkClick.last_clicked_at)).toLocaleString() : "--"}
                    </Td>

                    <Td>{linkClick.user_agent}</Td>

                  </Tr>
                ))}
              </Tbody>
            </Table>
            {data.linkClicksByCampaign.length == 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: "1rem",
                }}
              >
                <Text>No link clicks yet!</Text>
              </div>
            )}
          </Box>
        </VStack>
      ) : (
        <Text>No campaign found.</Text>
      )}
    </Container>
  );
};

export default Campaign;
