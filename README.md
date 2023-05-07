# Email outbound

Open sourced version of mailchimp, instantly, replyio - cause why wait for these closed-sourced companies to support the features you or your marketing team needs when you can just spin up a PR and get it immediately available?

Please feel free to add issues and pull requests. For GH issues, I will try to throw up a PR when I have time, otherwise just throw up a PR and I will try to review within 24 hours.

# Setup

Grab a neon.tech postgres database (or anywhere else)

Run `db.sql` on it

TODO: Set up the crons for running the email outbound automations. You should be able to insert data into the db directly and have the email campaigns run
