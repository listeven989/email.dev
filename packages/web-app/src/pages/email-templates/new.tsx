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
  import { useState } from "react";
  import { useMutation, gql } from "@apollo/client";
  
  const CREATE_EMAIL_TEMPLATE = gql`
    mutation CreateEmailTemplate(
      $name: String!
      $subject: String!
      $text_content: String!
      $html_content: String!
    ) {
      createEmailTemplate(
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
  
  const CreateEmailTemplate = () => {
    const [createEmailTemplate] = useMutation(CREATE_EMAIL_TEMPLATE);
    const [newTemplateName, setNewTemplateName] = useState("");
    const [newTemplateSubject, setNewTemplateSubject] = useState("");
    const [newTemplateTextContent, setNewTemplateTextContent] = useState("");
    const [newTemplateHtmlContent, setNewTemplateHtmlContent] = useState("");
    const toast = useToast();
  
    const handleCreateEmailTemplate = async () => {
      try {
        await createEmailTemplate({
          variables: {
            name: newTemplateName,
            subject: newTemplateSubject,
            text_content: newTemplateTextContent,
            html_content: newTemplateHtmlContent,
          },
        });
        toast({
          title: "Email template created successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // redirect to email templates
        window.location.href = "/email-templates";
      } catch (error: any) {
        toast({
          title: "Error creating email template.",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
  
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
            onClick={handleCreateEmailTemplate}
            isDisabled={
              !newTemplateName ||
              !newTemplateSubject ||
              !newTemplateTextContent ||
              !newTemplateHtmlContent
            }
          >
            Create Email Template
          </Button>
        </VStack>
      </Container>
    );
  };
  
  export default CreateEmailTemplate;