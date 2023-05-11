# Setup

Spin up postgres database (locally or you can get a hosted one - I use `neon.tech`).

Create/fill out the `.env` file from `.env.example`

Get an email account setup (preferrably with a custom domain). Any smtp provider will work, I use zoho since its only $12/yr for a custom domain.

Run

```bash
npm run setup:db
npm run cron:all
```

Add a row in the `email_accounts` with your email provider.

You should be able to insert data into the db directly and have the email campaigns run them. The `/cronJobs` does the outbound.

If you have any questions or issues, feel free to throw a new Github issue and I will respond (usually within 24 hours)

# Hosting

Grab a render.com account

Go to background workers

Connect this repo.
