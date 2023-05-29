# Why?

You spent 2 weeks setting up campaigns on your favorite email outbound tool (instantly, lem something, or something else) 

Your email outbounds are running great. 

Until you realize you need X feature. That feature could be HTML email support. Or link tracking. Or figuring out the exact person who clicked into that specific link in your spiffy new email copy.

Then you realize you are missing Y feature. Then, Z feature. And you _really_ need that one for that next campaign.

Poof. Now you need to look for another tool to do that X, Y, and Z feature. 

Ok you found one. Time to move all your campaigns to a new tool. Figure out which people you already emailed or haven't. Re-setup up all your campaigns...

But wait.

Hold up.

Wait a second.

There's a crazy idea:

`Why not just code that feature for your existing email tool?`

That's what this is for. The completely open sourced email outbound tool. You can use it here: https://email-outbound-ai-web-app.vercel.app

Ok, but you're not a dev you say? No problemo, just tell the devs to make that spiffy feature you need. Go to https://github.com/steven4354/email-outbound-ai/issues and make a request

If you ask nicely, the devs will *gasp* just build that X, Y, Z feature and tell you when its ready!

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
