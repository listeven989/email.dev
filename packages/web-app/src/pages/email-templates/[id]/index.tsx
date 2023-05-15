import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/router'
import React from 'react'
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
    HStack,
} from "@chakra-ui/react";
import ViewTemplate from '@/components/ViewTemplate';
import Link from 'next/link';

type Props = {}

const GET_TEMPLATE = gql`
  query GetTemplate($id: ID!) {
    emailTemplate(id: $id) {
      id
      name
      subject
      text_content
      html_content
  }
}
`;


const EmailTemplate = (props: Props) => {
    const router = useRouter()
    const { id } = router.query;

    const { loading, error, data } = useQuery(GET_TEMPLATE, {
        variables: { id },
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    if (!data) return null;

    const template = data.emailTemplate

    return (
        <Container maxW="container.xl" py={12}>

            <ViewTemplate template={template} />

            <HStack pt={8}>
                <Link href={`/email-templates/${id}/edit`} passHref>
                    <Button
                        href={`/`}
                        as="a" colorScheme="blue">
                        Edit Template
                    </Button>
                </Link>
            </HStack>
        </Container>
    )
}

export default EmailTemplate