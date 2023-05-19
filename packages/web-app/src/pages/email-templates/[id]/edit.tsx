import React, { useEffect, useState } from 'react'
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Input,
    VStack,
    useToast,
    Textarea,
} from "@chakra-ui/react";
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';

type Props = {}


const EDIT_EMAIL_TEMPLATE = gql`
    mutation EditEmailTemplate(
        $id: ID!
      $name: String!
      $subject: String!
      $text_content: String!
      $html_content: String!
    ) {
      editEmailTemplate(
        id: $id
        name: $name
        subject: $subject
        text_content: $text_content
        html_content: $html_content
      ) {
        id
        name
      }
    }
  `;

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

export default function EditTemplate({ }: Props) {

    const router = useRouter()
    const { id } = router.query;
    const { loading, error, data } = useQuery(GET_TEMPLATE, {
        variables: { id },
    });

    const [createEmailTemplate] = useMutation(EDIT_EMAIL_TEMPLATE);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateSubject, setNewTemplateSubject] = useState("");
    const [newTemplateTextContent, setNewTemplateTextContent] = useState("");
    const [newTemplateHtmlContent, setNewTemplateHtmlContent] = useState("");

    const toast = useToast();

    const handleEditEmailTemplate = async () => {
        try {
            await createEmailTemplate({
                variables: {
                    id,
                    name: newTemplateName,
                    subject: newTemplateSubject,
                    text_content: newTemplateTextContent,
                    html_content: newTemplateHtmlContent,
                },
            });
            toast({
                title: "Email template updated successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // redirect to email templates
            window.location.href = "/email-templates/" + id;
        } catch (error: any) {
            toast({
                title: "Error updating email template.",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        if (data) {
            const template = data.emailTemplate
            setNewTemplateName(template.name)
            setNewTemplateSubject(template.subject)
            setNewTemplateTextContent(template.text_content)
            setNewTemplateHtmlContent(template.html_content)
        }
    }, [data])

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    if (!data) return null;





    return (
        <Container maxW="container.md" py={12}>
            <VStack spacing={6} align="start">
                <FormControl id="newTemplateName">
                    <FormLabel>Name</FormLabel>
                    <Input
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="Enter the template name"
                    />
                </FormControl>
                <FormControl id="newTemplateSubject">
                    <FormLabel>Subject</FormLabel>
                    <Input
                        value={newTemplateSubject}
                        onChange={(e) => setNewTemplateSubject(e.target.value)}
                        placeholder="Enter the template subject"
                    />
                </FormControl>
                {/* <FormControl id="newTemplateTextContent">
                    <FormLabel>Text Content</FormLabel>
                    <Textarea
                        value={newTemplateTextContent}
                        onChange={(e) => setNewTemplateTextContent(e.target.value)}
                        placeholder="Enter the template text content"
                    />
                </FormControl> */}
                <FormControl id="newTemplateHtmlContent">
                    <FormLabel>HTML Content</FormLabel>
                    <Textarea
                        value={newTemplateHtmlContent}
                        onChange={(e) => setNewTemplateHtmlContent(e.target.value)}
                        placeholder="Enter the template HTML content"
                    />
                </FormControl>
                <Button
                    colorScheme="blue"
                    onClick={handleEditEmailTemplate}
                    isDisabled={
                        !newTemplateName ||
                        !newTemplateSubject ||
                        !newTemplateTextContent ||
                        !newTemplateHtmlContent
                    }
                >
                    Update Email Template
                </Button>
            </VStack>
        </Container>
    )
}