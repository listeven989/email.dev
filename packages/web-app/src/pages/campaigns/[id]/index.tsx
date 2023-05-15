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
} from "@chakra-ui/react";
import ViewTemplate from "@/components/ViewTemplate";

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
}
`;

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

  return (
    <Container maxW="container.md" py={12}>
      {campaign ? (
        <VStack spacing={6} align="left">
        <Heading as="h1" size="lg">Campaign Details</Heading>
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
            <Badge colorScheme={campaign.status === 'active' ? 'green' : 'red'}>
              {campaign.status}
            </Badge>
          </Box>
          <Box>
          <Text fontWeight="bold">Reply To:</Text>
          <Text>{campaign.reply_to_email_address || "n/a"}</Text>
        </Box>
        <Link href={`/campaigns/${id}/edit`} passHref>
            <Button as="a" colorScheme="blue">
              Edit Campaign
            </Button>
          </Link>
          <Link href={`/campaigns/${id}/email-template`} passHref>
            <Button as="a" colorScheme="blue">
              View / Change Email Template
            </Button>
          </Link>
          <Link href={`/campaigns/${id}/recipients`} passHref>
            <Button as="a" colorScheme="blue">
              Manage Recipients
            </Button>
          </Link>
        </VStack>
      ) : (
        <Text>No campaign found.</Text>
      )}
    </Container>
  );
};

export default Campaign;