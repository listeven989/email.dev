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
} from "@chakra-ui/react";

const GET_CAMPAIGN = gql`
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
  }
`;

const Campaign = () => {
  const router = useRouter();
  const { id } = router.query;

  const { loading, error, data } = useQuery(GET_CAMPAIGN, {
    variables: { id },
    skip: !id,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (!data) return null;

  const campaign = data.campaign;

  return (
    <Container maxW="container.xl" py={12}>
      {campaign ? (
        <VStack spacing={6} align="start">
          <Heading as="h1" size="md">
            {campaign.name}
          </Heading>
          <Text>Reply To: {campaign.reply_to_email_address}</Text>
          <Text>Daily Limit: {campaign.daily_limit}</Text>
          <Text>Emails Sent Today: {campaign.emails_sent_today}</Text>
          <Text>Status: {campaign.status}</Text>
          <HStack spacing={4}>
            <Link href={`/campaigns/${id}/edit`} passHref>
              <Button as="a" colorScheme="blue">
                Edit Campaign
              </Button>
            </Link>
            <Link href={`/campaigns/${id}/email-template`} passHref>
              <Button as="a" colorScheme="blue">
                Change Email Template
              </Button>
            </Link>
            <Link href={`/campaigns/${id}/recipients`} passHref>
              <Button as="a" colorScheme="blue">
                Manage Recipients
              </Button>
            </Link>
          </HStack>
        </VStack>
      ) : (
        <Text>No campaign found.</Text>
      )}
    </Container>
  );
};

export default Campaign;