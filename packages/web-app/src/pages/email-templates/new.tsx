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
import { markdownToEmailHTML } from "@/lib/markdown";

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
  const [newMarkdownContent, setNewMarkdownContent] = useState("");
  const [newTemplateHtmlContent, setNewTemplateHtmlContent] = useState("");
  const [contentFormat, setContentFormat] = useState("markdown");
  const toast = useToast();

  const handleCreateEmailTemplate = async () => {
    let htmlContent =
      contentFormat === "markdown"
        ? markdownToEmailHTML(newMarkdownContent)
        : newTemplateHtmlContent;

    try {
      // check if the htmlContent has a body tag any where
      // if not add <body></body> to it
      if (!htmlContent.includes("<body>")) {
        htmlContent = `<body>${htmlContent}</body>`;
      }

      await createEmailTemplate({
        variables: {
          name: newTemplateName,
          subject: newTemplateSubject,
          text_content: "",
          html_content: htmlContent,
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
        <FormControl id="newTemplateTextContent">
          <FormLabel>{contentFormat === "markdown" ? "Markdown" : "Html"} Content</FormLabel>
          {contentFormat === "markdown" ? (
            <Textarea
              value={newMarkdownContent}
              onChange={(e) => setNewMarkdownContent(e.target.value)}
              placeholder="Enter the template Markdown content"
            />
          ) : (
            <Textarea
              value={newTemplateHtmlContent}
              onChange={(e) => setNewTemplateHtmlContent(e.target.value)}
              placeholder="Enter the template HTML content"
            />
          )}
        </FormControl>
        <Button
          onClick={() =>
            setContentFormat(contentFormat === "markdown" ? "html" : "markdown")
          }
        >
          Switch to {contentFormat === "markdown" ? "HTML" : "Markdown"}
        </Button>
        {contentFormat === "markdown" && (
          <Box
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={4}
            mt={4}
            minHeight="200px"
            minWidth="100%"
            maxWidth="100%"
          >
            <pre
              style={{
                maxHeight: "200px",
                whiteSpace: "pre-wrap",
                overflow: "auto",
              }}
            >
              <code>{markdownToEmailHTML(newMarkdownContent)}</code>
            </pre>
          </Box>
        )}
        <Button
          colorScheme="blue"
          onClick={handleCreateEmailTemplate}
          isDisabled={
            !newTemplateName ||
            !newTemplateSubject ||
            (!newTemplateHtmlContent && !newMarkdownContent)
          }
        >
          Create Email Template
        </Button>
      </VStack>
    </Container>
  );
};

export default CreateEmailTemplate;
