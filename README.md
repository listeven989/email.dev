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

## Common commands

```bash
# development / local
pnpm --filter email-service cron:all
pnpm --filter web-app dev
pnpm --filter graphql-server start

# new database migrations
pnpm --filter email-service setup:db

# production / build
pnpm --filter graphql-server build
pnpm --filter graphql-server serve

pnpm --filter web-app build
pnpm --filter web-app start
```

logging file structure

```bash
#!/bin/bash

function list_files() {
  local indent="$1"
  local path="$2"

  for item in "$path"/*; do
    if [ -d "$item" ]; then
      echo "${indent}- $(basename "$item")"
      list_files "${indent}--" "$item"
    else
      echo "${indent}-- $(basename "$item")"
    fi
  done
}

list_files "-" "."
```

## Deployment

1. web-app is deployed on vercel
2. email-service is deployed on render.com as a background worker type
3. graphql-server is deployed on render.com as a web service type

## Packages

email-service
- runs all the crons and background workers to ensure all the emails are sent out in a timely manner
- also contains the database migrations (setup.sql)

web-app
- web app for this tool you use this to create the campaigns, manage them etc

graphql-server
- backend for the web-app, creates campaigns, adds emails, etc

