# Email outbound

Open sourced version of mailchimp, instantly, replyio - because why wait for these closed-sourced companies to support the features you need when you can just spin up a PR and get it immediately available?

Please feel free to add Github issues and pull requests. 

For Github issues, I will try to throw up a PR when I have time. Otherwise feel free to contribute with a PR and I will try to review within 24 hours.

# Features

- unlimited sender email addresses 
- support for any smtp email provider (e.g zoho mail, others)
- unlimited email sends
- campaign support (group together email addresses and email templates to send out)
- campaign limits (configure how many emails you'd like to be sent out in each campaign each day)
- you can host this anywhere you'd like (i use render.com)

## Upcoming features

See the Github `Issues` section for new features that are being added. Feel free to request more features there as well.

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
