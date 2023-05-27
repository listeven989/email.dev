# Email.dev

Imagine a world where open source sets you free from depending on closed-source companies like MailChimp and Reply.io. You wouldn't have to wait for them to add the features you need. Instead, you could just create a pull request or GitHub issue, and get what you want quickly.

Feel free to add GitHub issues and pull requests.

For GitHub issues, I'll try to make a PR when I have time. Or you can contribute with a PR, and I'll do my best to review it within 24 hours.

## Current Features

- unlimited sender email addresses 
- support for any smtp email provider (e.g zoho mail, google suites, gmail, yahoo)
- unlimited outbound emails
- campaign support (group together email addresses and email templates to send out)
- campaign limits (configure how many emails you'd like to be sent out in each campaign each day)
- you can host this anywhere you'd like (the production version uses render.com)
- link click tracking, every link in an email is tracked and you can see which links are clicked by recipients
- email open tracking
- full support for html emails, no formatting or other issues

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

logging database structure

```sql
SELECT
    table_schema,
    table_name,
    column_name,
    data_type
FROM
    information_schema.columns
WHERE
    table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY
    table_schema,
    table_name,
    column_name;
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

tracking-service
- express server with a couple of endpoints for tracking opens, link clicks etc
- when the email-service cron sends out emails it appends <img> tags with a link to the tracking service to track opens
- when deploy do a euphemism like newsletter-xxx.render.com instead of the name tracking-xxx or tracking-service-xxx (so google doesn't block it)
