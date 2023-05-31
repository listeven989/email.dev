import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
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
} from "@chakra-ui/react";
import Link from 'next/link';

type Props = {}

export const GET_RECIPIENTS = gql`
  query GetRecipients($campaignId: ID!) {
    recipientEmails(campaignId: $campaignId) {
      id
      email_address
      sent
      sent_at
      sender_email_address
    }
}
`;

export default function Recipients({ }: Props) {
    const router = useRouter()
    const { id: campaignId } = router.query
    const { loading, error, data } = useQuery(GET_RECIPIENTS, {
        variables: { campaignId },
    });

    const [recipients, setRecipients] = useState<any>([])


    useEffect(() => {
        if (data) {
            const recipientsCopy = [...data.recipientEmails];
            const sortedRecipients = recipientsCopy.sort((a: any, b: any) => {
                if (a.sent_at === null && b.sent_at === null) {
                    return 0;
                }
                if (a.sent_at === null) {
                    return 1;
                }
                if (b.sent_at === null) {
                    return -1;
                }
                return parseInt(a.sent_at) > parseInt(b.sent_at) ? -1 : 1;
            });

            setRecipients(sortedRecipients)
        }
    }, [data])

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    if (!data) return null;





    return (
        <Container maxW="container.xl" py={12}>
            <VStack spacing={6} align="start" w="100%">
                <Flex justifyContent="space-between" w="100%">
                    <Heading as="h1" size="lg">
                        Recipient Emails
                    </Heading>

                    <Link href={"/campaigns/" + campaignId + "/add-recipients"}>
                        <Button
                            as="a"
                            colorScheme="blue"
                            size="sm"
                            fontWeight="bold"
                            borderRadius="full"
                            px={6}
                            _hover={{ bg: "blue.600" }}
                        >
                            Add New Recipients
                        </Button>
                    </Link>
                </Flex>
                <Box w="100%">
                    <Table
                        variant="striped"
                        colorScheme="gray"
                        borderWidth="1px"
                        borderRadius="md"
                        overflow="hidden"
                    >
                        <Thead bg="gray.500">
                            <Tr>
                                <Th color="white" fontWeight="bold">
                                    Email Address
                                </Th>


                                <Th color="white" fontWeight="bold">
                                    Sent
                                </Th>
                                <Th color="white" fontWeight="bold">
                                    Sent By
                                </Th>

                                <Th color="white" fontWeight="bold">
                                    Sent At
                                </Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {recipients.map((recipient: any) => {
                                const sentDate = new Date(parseInt(recipient.sent_at)).toLocaleDateString('en-US', {
                                    timeZone: 'America/Los_Angeles',
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                    second: 'numeric'
                                });

                                return <Tr key={recipient.id}>
                                    <Td>{recipient.email_address}</Td>
                                    <Td>{recipient.sent && recipient.sent.toString()}</Td>
                                    <Td>{recipient.sender_email_address}</Td>
                                    <Td>{recipient.sent_at ? sentDate : "--"}</Td>
                                </Tr>
                            })}
                        </Tbody>
                    </Table>
                </Box>
            </VStack>
        </Container>
    )
}