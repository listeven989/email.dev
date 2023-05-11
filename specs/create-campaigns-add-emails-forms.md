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