import * as cron from "node-cron";
import cronstrue from "cronstrue";
import { Client } from "pg";
import { createTransport } from "nodemailer";
import * as dotenv from "dotenv";
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';


dotenv.config();

function generateRandomWord(length: number) {
    var result = '';
    var characters = 'abcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 * 
 */
async function checkSpamEmails() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    await client.connect();

    // get sender email accounts
    const emailAccountsQuery = `
    SELECT 
    email_accounts.id,
    email_accounts.email_address AS from_email,
    email_accounts.display_name,
    email_accounts.smtp_host,
    email_accounts.smtp_port,
    email_accounts.username,
    email_accounts.password
    FROM email_accounts WHERE email_accounts.is_valid = true
    `;

    const emailAccounts = await client.query(emailAccountsQuery);


    // initialize the OAuth client with your credentials and refresh token
    const oauth2Client = new OAuth2Client(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI
    );
    oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const { token } = await oauth2Client.getAccessToken();

    console.log({ token })

    for (let i = 0; i < emailAccounts.rows.length; i++) {
        const emailAccount = emailAccounts.rows[i];

        try {
            const transporter = createTransport({
                host: emailAccount.smtp_host,
                port: emailAccount.smtp_port,
                secure: false,
                auth: {
                    user: emailAccount.username,
                    pass: emailAccount.password,
                },
            });


            const toEmail = "steven@trainingblockusa.com"
            const subject = "Hey " + generateRandomWord(5)
            const text = "Hello world?"

            await transporter.sendMail({
                from: `${emailAccount.display_name} <${emailAccount.from_email}>`,
                to: toEmail,
                subject,
                text,
            });

            // check if is in spam
            oauth2Client.setCredentials({ access_token: token });

            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

            const response = await gmail.users.messages.list({
                userId: 'me',
                q: `from:(${emailAccount.from_email}) subject:(${subject}) is:spam`,
            });

            if (response.data.messages && response.data.messages.length > 0) {
                console.log('Email ended up in the spam folder for:', emailAccount.from_email);

                // update email account to be invalid
                const updateEmailAccountSpamQuery = `
                UPDATE email_accounts SET spam = true , spam_updated_at = now()   
                WHERE email_accounts.id = $1
                `;
                await client.query(updateEmailAccountSpamQuery, [emailAccount.id]);

            } else {
                console.log('Email did not end up in the spam folder for:', emailAccount.from_email);

                const updateEmailAccountSpamQuery = `
                UPDATE email_accounts SET spam = false , spam_updated_at = now()   
                WHERE email_accounts.id = $1
                `;
                await client.query(updateEmailAccountSpamQuery, [emailAccount.id]);
            }


        } catch (error) {
            console.error("Error sending spam email check for:", emailAccount.from_email, error);
        }
    }

   await client.end();
}

const CRON_SCHEDULE = "0 0 * * *";

cron.schedule(CRON_SCHEDULE, () => {
    const now = new Date();
    const pdtDateTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles",
        dateStyle: "full",
        timeStyle: "long",
    }).format(now);

    const humanReadableCron = cronstrue.toString(CRON_SCHEDULE);
    console.log("\n\n\n\n");
    console.log(
        `${pdtDateTime}: Running check valid email accounts cron job ${humanReadableCron}`
    );


    checkSpamEmails()
        .then(() => {
            console.log("Finished checking spam email accounts for this " + humanReadableCron);
        })
        .catch((error) => {
            console.error("Error in check spam email accounts cron job:", error);
        });
});
