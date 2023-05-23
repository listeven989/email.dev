I have separated the two forms into two different Next.js pages. Here are the two code blocks:

1. `pages/create-campaign.tsx`:

```typescript
import "../nyan-cat-background.css";
import { useState, FormEvent, useRef } from "react";
import axios from "axios";

const CreateCampaign = () => {
  const [campaignName, setCampaignName] = useState("");
  const [emailTemplateName, setEmailTemplateName] = useState("");
  const [emailSubjectLine, setEmailSubjectLine] = useState("");
  const [emailAccountId, setEmailAccountId] = useState(
    "c594b7eb-a1c3-42dc-94e7-8dc6fae1d26e"
  );
  const [emailHtmlContentFileName, setEmailHtmlContentFileName] = useState("");

  const emailHtmlContentInputRef = useRef<HTMLInputElement>(null);

  const handleEmailHtmlContentChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setEmailHtmlContentFileName(file.name);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const emailHtmlContentFile = emailHtmlContentInputRef.current?.files?.[0];

    if (!emailHtmlContentFile) {
      alert("Please select an Email HTML Content file.");
      return;
    }

    const emailHtmlContent = await emailHtmlContentFile.text();

    try {
      const response = await axios.post("/api/campaign", {
        campaignName,
        emailTemplateName,
        emailSubjectLine,
        emailHtmlContent,
        emailAccountId,
      });

      alert(response.data.message);
    } catch (error) {
      alert(`Error: ${error.response.data.message}`);
    }
  };

  // Render the form for creating a campaign
};

export default CreateCampaign;
```

2. `pages/add-recipients.tsx`:

```typescript
import "../nyan-cat-background.css";
import { useState, FormEvent, useRef } from "react";
import axios from "axios";
import Papa from "papaparse";

const AddRecipients = () => {
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [recipientEmailsFileName, setRecipientEmailsFileName] = useState("");

  const recipientEmailsInputRef = useRef<HTMLInputElement>(null);

  const handleRecipientEmailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecipientEmailsFileName(file.name);

      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log("stevendebug results", results);
          const emails = results.data.map((row: any) => row.Email);
          setRecipientEmails(emails);
        },
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const recipientEmailsFile = recipientEmailsInputRef.current?.files?.[0];

    if (!recipientEmailsFile) {
      alert("Please select a Recipient Emails file.");
      return;
    }

    const recipientEmailsText = await recipientEmailsFile.text();
    const recipientEmails = recipientEmailsText.split(",");

    // Add the logic for adding recipients to the campaign

  };

  // Render the form for adding recipients to the campaign
};

export default AddRecipients;
```

Now, you have two separate Next.js pages: `create-campaign.tsx` for creating the campaign and `add-recipients.tsx` for adding email recipients to the campaign. You can further customize the rendering and styling of these pages as needed.

Original

```typescript
"use client";

// pages/emailForm.tsx
import { useState, FormEvent, useRef } from "react";
import axios from "axios";
import Papa from "papaparse";

const EmailForm = () => {
  const [campaignName, setCampaignName] = useState("");
  const [emailTemplateName, setEmailTemplateName] = useState("");
  const [emailSubjectLine, setEmailSubjectLine] = useState("");
  const [recipientEmails, setRecipientEmails] = useState<string[]>([]);
  const [emailAccountId, setEmailAccountId] = useState(
    "c594b7eb-a1c3-42dc-94e7-8dc6fae1d26e"
  );
  const [emailHtmlContentFileName, setEmailHtmlContentFileName] = useState("");
  const [recipientEmailsFileName, setRecipientEmailsFileName] = useState("");

  const emailHtmlContentInputRef = useRef<HTMLInputElement>(null);
  const recipientEmailsInputRef = useRef<HTMLInputElement>(null);

  const handleRecipientEmailsChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecipientEmailsFileName(file.name);

      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log("stevendebug results", results);
          const emails = results.data.map((row: any) => row.Email);
          setRecipientEmails(emails);
        },
      });
    }
  };

  const handleEmailHtmlContentChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setEmailHtmlContentFileName(file.name);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const emailHtmlContentFile = emailHtmlContentInputRef.current?.files?.[0];
    const recipientEmailsFile = recipientEmailsInputRef.current?.files?.[0];

    if (!emailHtmlContentFile || !recipientEmailsFile) {
      alert(
        "Please select both Email HTML Content and Recipient Emails files."
      );
      return;
    }

    const emailHtmlContent = await emailHtmlContentFile.text();
    const recipientEmailsText = await recipientEmailsFile.text();
    const recipientEmails = recipientEmailsText.split(",");

    try {
      const response = await axios.post("/api/campaign", {
        campaignName,
        emailTemplateName,
        emailSubjectLine,
        emailHtmlContent,
        recipientEmails,
        emailAccountId,
      });

      alert(response.data.message);
    } catch (error) {
      alert(`Error: ${error.response.data.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6">Load HTML to Database</h2>
        <div className="mb-4">
          <label
            htmlFor="campaignName"
            className="block text-sm font-medium text-gray-700"
          >
            Campaign Name:
          </label>
          <input
            type="text"
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="emailTemplateName"
            className="block text-sm font-medium text-gray-700"
          >
            Email Template Name:
          </label>
          <input
            type="text"
            id="emailTemplateName"
            value={emailTemplateName}
            onChange={(e) => setEmailTemplateName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="emailSubjectLine"
            className="block text-sm font-medium text-gray-700"
          >
            Email Subject Line:
          </label>
          <input
            type="text"
            id="emailSubjectLine"
            value={emailSubjectLine}
            onChange={(e) => setEmailSubjectLine(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="emailHtmlContent"
            className="block text-sm font-medium text-gray-700"
          >
            Email HTML Content:
          </label>
          <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <input
              type="file"
              id="emailHtmlContent"
              ref={emailHtmlContentInputRef}
              className="sr-only"
              onChange={handleEmailHtmlContentChange}
            />
            <div className="text-center">
              <p className="mt-1 text-sm text-gray-600">
                {emailHtmlContentFileName || (
                  <label
                    htmlFor="emailHtmlContent"
                    className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
                  >
                    Upload a file
                  </label>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="recipientEmails"
            className="block text-sm font-medium text-gray-700"
          >
            Recipient Emails (comma-separated):
          </label>
          <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <input
              type="file"
              id="recipientEmails"
              ref={recipientEmailsInputRef}
              className="sr-only"
              onChange={handleRecipientEmailsChange}
            />
            <div className="text-center">
              <p className="mt-1 text-sm text-gray-600">
                {recipientEmailsFileName || (
                  <label
                    htmlFor="recipientEmails"
                    className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
                  >
                    Upload a file
                  </label>
                )}
              </p>
            </div>
          </div>
        </div>
        {/* Display extracted emails */}
        {recipientEmails.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Extracted Emails:
            </label>
            <div className="mt-1 bg-white border border-gray-300 rounded-md shadow-sm p-2 h-32 overflow-y-scroll">
              {recipientEmails.map((email, index) => (
                <p key={index} className="text-sm text-gray-600">
                  {email}
                </p>
              ))}
            </div>
          </div>
        )}
        <div className="mb-6">
          <label
            htmlFor="emailAccountId"
            className="block text-sm font-medium text-gray-700"
          >
            Email Account ID:
          </label>
          <input
            type="text"
            id="emailAccountId"
            value={emailAccountId}
            onChange={(e) => setEmailAccountId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold p-2 rounded-md hover:bg-indigo-500"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default EmailForm;
```

add_template_and_recipients.tsx

```typescript
import { useState, useRef } from "react";
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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useMutation, useQuery, gql } from "@apollo/client";
import Papa from "papaparse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faRecycle } from "@fortawesome/free-solid-svg-icons";

const GET_EMAIL_TEMPLATES = gql`
  query GetEmailTemplates {
    emailTemplates {
      id
      name
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const emailTemplates = data.emailTemplates;

  return (
    <Container maxW="container.md" py={12}>
      <VStack as="form" onSubmit={handleSubmit} spacing={6} align="start">
        <FormControl id="emailTemplate">
          <FormLabel>Email Template</FormLabel>
          <Select
            placeholder="Select email template"
            value={emailTemplateId}
            onChange={(e) => setEmailTemplateId(e.target.value)}
          >
            {emailTemplates.map((template: any) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
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
              <Textarea
                mt={4}
                value={parsedEmails.join("\n")}
                readOnly
                maxHeight="200px"
                overflowY="scroll"
              />
              <Button
                style={{ marginTop: "1rem" }}
                leftIcon={ fileName ? <FontAwesomeIcon icon={faRecycle} /> : <FontAwesomeIcon icon={faUpload} /> }
                colorScheme="blue"
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
    </Container>
  );
};

export default AddTemplateAndRecipients;
```