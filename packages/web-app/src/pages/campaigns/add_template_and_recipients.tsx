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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useMutation, useQuery, gql } from "@apollo/client";
import Papa from "papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faRecycle } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef } from "react";

const GET_EMAIL_TEMPLATES = gql`
  query GetEmailTemplates {
    emailTemplates {
      id
      name
      subject
      text_content
      html_content
    }
  }
`;

const ADD_TEMPLATE_AND_RECIPIENTS = gql`
  mutation AddTemplateAndRecipients(
    $campaignId: ID!
    $emailTemplateId: ID!
    $emailAddresses: [String!]!
  ) {
    updateCampaign(id: $campaignId, email_template_id: $emailTemplateId) {
      id
    }
    addRecipientEmails(
      campaign_id: $campaignId
      email_addresses: $emailAddresses
    ) {
      id
    }
  }
`;

const CREATE_EMAIL_TEMPLATE = gql`
  mutation CreateEmailTemplate(
    $name: String!
    $subject: String!
    $textContent: String!
    $htmlContent: String!
  ) {
    createEmailTemplate(
      name: $name
      subject: $subject
      textContent: $textContent
      htmlContent: $htmlContent
    ) {
      id
      name
    }
  }
`;

const SEND_TEST_EMAIL = gql`
  mutation SendTestEmail(
    $emailTemplateId: ID!
    $recipientEmail: String!
  ) {
    sendTestEmail(
      emailTemplateId: $emailTemplateId
      recipientEmail: $recipientEmail
    )
  }
`;

const AddTemplateAndRecipients = () => {
  const router = useRouter();
  const { campaignId } = router.query;
  const { loading, error, data } = useQuery(GET_EMAIL_TEMPLATES);
  const [addTemplateAndRecipients] = useMutation(ADD_TEMPLATE_AND_RECIPIENTS);

  const [emailTemplateId, setEmailTemplateId] = useState("");
  const [emailAddresses, setEmailAddresses] = useState("");
  const [inputType, setInputType] = useState("text");
  const [parsedEmails, setParsedEmails] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateSubject, setNewTemplateSubject] = useState("");
  const [newTextContent, setNewTextContent] = useState("");
  const [newHtmlContent, setNewHtmlContent] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [createEmailTemplate] = useMutation(CREATE_EMAIL_TEMPLATE, {
    refetchQueries: [{ query: GET_EMAIL_TEMPLATES }],
  });

  const {
    isOpen: isPreviewDialogOpen,
    onOpen: onPreviewDialogOpen,
    onClose: onPreviewDialogClose,
  } = useDisclosure();
  const [previewType, setPreviewType] = useState("desktop");

  const handleCreateNewTemplate = async () => {
    await createEmailTemplate({
      variables: {
        name: newTemplateName,
        subject: newTemplateSubject,
        textContent: newTextContent,
        htmlContent: newHtmlContent,
      },
    });
    setShowNewTemplateForm(false);
    setNewTemplateName("");
    setNewTemplateSubject("");
    setNewTextContent("");
    setNewHtmlContent("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const emails = results.data.map((row: any) => row.Email);
          setEmailAddresses(emails.join("\n"));
          setParsedEmails(emails);
        },
        error: (error) => {
          alert(`Error parsing CSV file: ${error.message}`);
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTemplateAndRecipients({
      variables: {
        campaignId,
        emailTemplateId,
        emailAddresses: emailAddresses.split("\n"),
      },
    });
    router.push(`/campaigns/${campaignId}`);
  };

  const [sendTestEmail] = useMutation(SEND_TEST_EMAIL);
  const {
    isOpen: isTestEmailDialogOpen,
    onOpen: onTestEmailDialogOpen,
    onClose: onTestEmailDialogClose,
  } = useDisclosure();
  const [testEmailRecipient, setTestEmailRecipient] = useState("");

  const handleSendTestEmail = async () => {
    await sendTestEmail({
      variables: {
        emailTemplateId,
        recipientEmail: testEmailRecipient,
      },
    });
    onTestEmailDialogClose();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const emailTemplates = data.emailTemplates;

  const selectedTemplate = emailTemplates.find(
    (template: any) => template.id === emailTemplateId
  );

  return (
    <Container maxW="container.md" py={12}>
      <VStack as="form" onSubmit={handleSubmit} spacing={6} align="start">
      <FormControl id="emailTemplate">
          <FormLabel>Email Template</FormLabel>
          <Select
            placeholder="Select email template"
            value={emailTemplateId}
            onChange={(e) => {
              if (e.target.value === "create_new") {
                setShowNewTemplateForm(true);
              } else {
                setEmailTemplateId(e.target.value);
                setShowNewTemplateForm(false);
              }
            }}
          >
            {emailTemplates.map((template: any) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
            <option value="create_new">Create New Email Template</option>
          </Select>
          <Collapse in={showNewTemplateForm} animateOpacity>
            <VStack mt={4} spacing={4}>
              <FormControl id="newTemplateName">
                <FormLabel>New Template Name</FormLabel>
                <Input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </FormControl>
              <FormControl id="newTemplateSubject">
                <FormLabel>New Template Subject</FormLabel>
                <Input
                  value={newTemplateSubject}
                  onChange={(e) => setNewTemplateSubject(e.target.value)}
                />
              </FormControl>
              <FormControl id="newTextContent">
                <FormLabel>New Text Content</FormLabel>
                <Textarea
                  value={newTextContent}
                  onChange={(e) => setNewTextContent(e.target.value)}
                />
              </FormControl>
              <FormControl id="newHtmlContent">
                <FormLabel>New HTML Content</FormLabel>
                <Textarea
                  value={newHtmlContent}
                  onChange={(e) => setNewHtmlContent(e.target.value)}
                />
              </FormControl>
              <Button onClick={handleCreateNewTemplate}>
                Save New Template
              </Button>
            </VStack>
          </Collapse>
          {selectedTemplate && (
            <Box mt={4}>
              <FormLabel>Subject</FormLabel>
              <Input disabled value={selectedTemplate.subject} readOnly />
              <FormLabel mt={4}>Text Content</FormLabel>
              <Textarea disabled value={selectedTemplate.text_content} readOnly />
              <FormLabel mt={4}>HTML Content</FormLabel>
              <Textarea value={selectedTemplate.html_content} readOnly />
              {/* TODO: preview not actually displaying correctly */}
              {/* <Button
                mt={4}
                onClick={() => {
                  onPreviewDialogOpen();
                  setPreviewType("desktop");
                }}
              >
                Preview on Desktop
              </Button>
              <Button
                mt={4}
                ml={4}
                onClick={() => {
                  onPreviewDialogOpen();
                  setPreviewType("mobile");
                }}
              >
                Preview on Mobile
              </Button> */}
              <Button
                mt={4}
                onClick={onTestEmailDialogOpen}
              >
                Send Test Email
              </Button>
            </Box>
          )}
        </FormControl>
        <FormControl id="emailAddresses">
          <FormLabel>Email Recipients</FormLabel>
          <RadioGroup
            value={inputType}
            onChange={(value) => setInputType(value as string)}
          >
            <Stack direction="row">
              <Radio value="text">Text</Radio>
              <Radio value="csv">CSV</Radio>
            </Stack>
          </RadioGroup>
          {inputType === "text" ? (
            <Textarea
            style={{ marginTop: "1rem" }}
              placeholder="Enter email addresses, one per line"
              value={emailAddresses}
              onChange={(e) => setEmailAddresses(e.target.value)}
            />
          ) : (
            <>
              <Input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                display="none"
              />
              {fileName && (
                <Text mt={2} fontSize="sm">
                  File: {fileName}
                </Text>
              )}
              {fileName && <Textarea
                mt={4}
                value={parsedEmails.join("\n")}
                readOnly
                maxHeight="200px"
                overflowY="scroll"
              />}
              <Button
                style={{ marginTop: "1rem" }}
                leftIcon={ fileName ? <FontAwesomeIcon icon={faRecycle} /> : <FontAwesomeIcon icon={faUpload} /> }
                // colorScheme="blue"
                onClick={() => fileInputRef.current?.click()}
              >
                { fileName ? "Pick Another CSV" : "Upload CSV" }
              </Button>
              
            </>
          )}
        </FormControl>
        <Button type="submit" colorScheme="blue">
          Continue
        </Button>
      </VStack>

      <AlertDialog
        isOpen={isPreviewDialogOpen}
        onClose={onPreviewDialogClose}
        size={previewType === "desktop" ? "xl" : "xs"}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader>Preview</AlertDialogHeader>
          <AlertDialogBody>
            <Box
              dangerouslySetInnerHTML={{
                __html: selectedTemplate?.html_content || "",
              }}
            />
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onPreviewDialogClose}>Close</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

export default AddTemplateAndRecipients;
