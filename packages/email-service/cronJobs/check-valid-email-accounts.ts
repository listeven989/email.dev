import * as cron from "node-cron";
import cronstrue from "cronstrue";
import { Client } from "pg";
import { createTransport } from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();


/**
 * 
 */
async function checkValidEmailAccounts() {
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
    FROM email_accounts
    `;

    const emailAccounts = await client.query(emailAccountsQuery);


    emailAccounts.rows.forEach(async (emailAccount: any) => {

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


            await transporter.sendMail({
                from: `${emailAccount.display_name} <${emailAccount.from_email}>`,
                to: "test@example.com",
                subject: "Hey",
                text: "Hello world?",
            });
            console.log("sent test email from: ", emailAccount.from_email)

            const query = `UPDATE email_accounts SET is_valid=true WHERE id=$1 `;
            await client.query(query, [emailAccount.id]);

        } catch (error) {
            console.error("Error sending email for:", emailAccount.from_email, error);

            const query = `UPDATE email_accounts SET is_valid=false WHERE id=$1 `;
            await client.query(query, [emailAccount.id]);

            // set the campaigns that have only that email to paused
            const selectQuery = `SELECT cea.campaign_id FROM campaign_email_accounts AS cea
            JOIN campaigns ON cea.campaign_id = campaigns.id
            WHERE  cea.email_account_id=$1
            AND campaigns.status='active' `;
            const res = await client.query(selectQuery, [emailAccount.id]);

            // campaigns that have only 1 email will be set to paused
            res.rows.forEach(async (row: any) => {
                //check if it has multiple email accounts
                const selectQuery = `SELECT * FROM campaign_email_accounts WHERE campaign_id=$1`;
                const res = await client.query(selectQuery, [row.campaign_id]);

                if (res.rows.length === 1) {
                    // set the campaign to paused
                    const updateQuery = `UPDATE campaigns SET status='paused' WHERE id=$1`;
                    await client.query(updateQuery, [row.campaign_id]);
                }
            });

            // remove the email account from every campaign
            const deleteQuery = `DELETE FROM campaign_email_accounts WHERE email_account_id=$1`;
            await client.query(deleteQuery, [emailAccount.id]);

        }


    });
}


const CRON_SCHEDULE = "0 * * * *";
// const CRON_SCHEDULE = "* * * * *";

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


    checkValidEmailAccounts()
        .then(() => {
            console.log("Finished checking valid email accounts for this " + humanReadableCron);
        })
        .catch((error) => {
            console.error("Error in check valid email accounts cron job:", error);
        });
});
