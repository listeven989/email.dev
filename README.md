# Email outbound

Open sourced version of mailchimp, instantly, replyio - because why wait for these closed-sourced companies to support the features you need when you can just spin up a PR and get it immediately available?

Please feel free to add GH issues and pull requests. 

For GH issues, I will try to throw up a PR when I have time, otherwise just throw up a PR and I will try to review within 24 hours.

# Features

- unlimited sender email addresses 
- support for any smtp email provider (e.g zoho mail, others)
- unlimited email sends
- you can host this anywhere you'd like (i use render.com)

# Setup

Grab a neon.tech postgres database (or anywhere else) and update the `.env`

Grab a email provider, any smtp provider will work, I use zoho since its only $12/yr for a custom domain.

Run

```bash
npm run setup:db
npm run cron:all
```

Add a row in the `email_accounts` with your email provider.

You should be able to insert data into the db directly and have the email campaigns run them.

If you have any questions or issues, feel free to throw a new Github issue and I will respond.

# Hosting

Grab a render.com account

Go to background workers

Connect this repo.
