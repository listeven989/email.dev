# Why?

You spent 2 weeks setting up campaigns on your favorite email outbound tool (instantly, replyio, lem something). 

Your email outbounds are running great. 

Then, you realize you need X feature. Or Y feature is broken in your current email tool. 

Html emails coming out horribly wrong anyone?

Opens tracking are horribly inaccurate. 

Link tracking is missing?

**Whack.**

Now you need to look for another email outbound alternative to do that X, Y, and Z feature or fix that A, B, C feature. _Again..._

You spend hours digging through sites and forums testing different ones out.

**Hours later.**

Ok, now you found one. 

Time to move all your campaigns to a new tool. 

Figure out which people you already emailed or haven't. 

Re-setup up all your campaigns...

- But wait.....

- Hold up......

- Wait a second....

**Here's a crazy idea.**

```

Why not just code that feature for your existing email tool?

```

That's what this is for. 

The completely open-sourced email outbound saas app. You own all the code and can change anything. You can host your own, or use our hosted version.

You can do email outbounds. You can do mailchimp like newsletters. And much, much more.

Best of all, if you need any features - just code it, open a PR, and _viola_ - once its merged to main - it's live.

You can use it here: https://emaildev.vercel.app. Or go ahead and host your own version.

## Current Features

- unlimited sender email addresses 
- support for any smtp email provider (e.g zoho mail, google suites, gmail, yahoo)
- unlimited outbound emails
- campaign support (group together email addresses and email templates to send out)
- campaign limits (configure how many emails you'd like to be sent out in each campaign each day)
- you can host this anywhere you'd like (the production version uses render.com)
- link click tracking, every link in an email is tracked and you can see which links are clicked by recipients
- email open tracking
- full support for html emails
- full support for text emails

## Upcoming features

See the Github `Issues` section for new features that are being added. Feel free to request more features there as well.

## Common commands

```bash
# development / setup
pnpm i

# development / running local
pnpm --filter email-service cron:all
pnpm --filter web-app dev
pnpm --filter graphql-server start
pnpm --filter tracking-service start

# new database migrations
pnpm --filter email-service setup:db

# production / build
pnpm --filter graphql-server build
pnpm --filter graphql-server serve

pnpm --filter web-app build
pnpm --filter web-app start
```

## Packages

email-service
- runs all the crons and background workers to ensure all the emails are sent out in a timely manner
- also contains the database migrations (setup.sql)

web-app
- web app for this tool you use this to create the campaigns, manage them etc

graphql-server
- backend for the web-app, creates campaigns, adds emails, etc

tracking-service
- express server with a couple of endpoints for tracking opens, link clicks etc
- when the email-service cron sends out emails it appends <img> tags with a link to the tracking service to track opens
- when deploy do a euphemism like newsletter-xxx.render.com instead of the name tracking-xxx or tracking-service-xxx (so google doesn't block it)
