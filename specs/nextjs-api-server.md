I have broken down the code into several Next.js API endpoints as requested:

1. Create a campaign:

```typescript
// pages/api/createCampaign.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import { connectionString } from './utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaignName, emailAccountId } = req.body;

  try {
    const client = new Client(connectionString);
    await client.connect();

    const campaignResult = await client.query(`
      INSERT INTO campaigns (email_account_id, name, subject, daily_limit)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [emailAccountId, campaignName, 'Campaign Subject', 20]);
    const campaignId = campaignResult.rows[0].id;

    await client.end();

    res.status(200).json({ message: 'Campaign created.', campaignId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating campaign:', error });
  }
}
```

2. Add emails to an already created campaign:

```typescript
// pages/api/addEmails.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import { connectionString } from './utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaignId, recipientEmails } = req.body;

  try {
    const client = new Client(connectionString);
    await client.connect();

    for (const email of recipientEmails) {
      await client.query(`
        INSERT INTO recipient_emails (campaign_id, email_address)
        VALUES ($1, $2)
      `, [campaignId, email]);
    }

    await client.end();

    res.status(200).json({ message: 'Emails added to the campaign.' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding emails to the campaign:', error });
  }
}
```

3. Edit the email template associated with a campaign:

```typescript
// pages/api/editEmailTemplate.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import { connectionString } from './utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaignId, emailTemplateName, emailSubjectLine, emailHtmlContent } = req.body;

  try {
    const client = new Client(connectionString);
    await client.connect();

    await client.query(`
      UPDATE email_templates
      SET name = $1, subject = $2, html_content = $3
      WHERE id = (
        SELECT email_template_id FROM campaigns WHERE id = $4
      )
    `, [emailTemplateName, emailSubjectLine, emailHtmlContent, campaignId]);

    await client.end();

    res.status(200).json({ message: 'Email template updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating email template:', error });
  }
}
```

4. Show all the emails in a campaign:

```typescript
// pages/api/showEmails.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import { connectionString } from './utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaignId } = req.query;

  try {
    const client = new Client(connectionString);
    await client.connect();

    const result = await client.query(`
      SELECT email_address
      FROM recipient_emails
      WHERE campaign_id = $1
    `, [campaignId]);

    await client.end();

    res.status(200).json({ emails: result.rows });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emails:', error });
  }
}
```

5. Show the email template associated with a campaign:

```typescript
// pages/api/showEmailTemplate.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'pg';
import { connectionString } from './utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { campaignId } = req.query;

  try {
    const client = new Client(connectionString);
    await client.connect();

    const result = await client.query(`
      SELECT et.name, et.subject, et.html_content
      FROM email_templates et
      JOIN campaigns c ON c.email_template_id = et.id
      WHERE c.id = $1
    `, [campaignId]);

    await client.end();

    res.status(200).json({ emailTemplate: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching email template:', error });
  }
}
```

Don't forget to create a `utils/db.ts` file to export the `connectionString`:

```typescript
// pages/api/utils/db.ts
import * as dotenv from 'dotenv';

dotenv.config();

export const connectionString = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
};
```