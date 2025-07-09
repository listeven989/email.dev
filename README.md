# email.dev – Open-Source Email Outbound Platform

> Self-hosted or SaaS. Unlimited senders, limitless campaigns, and **code-level control** when you need that one extra feature your current tool won’t ship.

[Live Demo](https://emaildev.vercel.app)   |   Archived Repo (read-only)

---

## Why email.dev?

Commercial outbound tools lock you into missing/broken features, slow support, and zero source access.  
**email.dev** flips the model:

- **100 % open source.** Fork, audit, and extend at will.  
- **Own your infra.** Host anywhere (Docker/K8s, Render, Fly, etc.).  
- **Rapid iteration.** Ship a PR → merge → feature live. No vendor wait.

---

## Feature Matrix

| Area | Status |
|------|--------|
| Unlimited sender addresses | ✅ |
| Any SMTP provider (Zoho, Gmail, G-Suite, Yahoo, …) | ✅ |
| Unlimited outbound volume | ✅ |
| Campaign grouping & daily send limits | ✅ |
| Link-click + open tracking | ✅ |
| HTML & plain-text templates | ✅ |
| Newsletter / Mailchimp-style blasts | ✅ |
| Roadmap – see [Issues](../../issues) | 🚧 |

---

## Architecture

packages/
├─ email-service/ ⟵ crons, workers, DB migrations
├─ graphql-server/ ⟵ API consumed by web-app
├─ web-app/ ⟵ Next.js front-end (campaign UI)
└─ tracking-service/ ⟵ Express endpoints for opens / clicks


- **Data store:** PostgreSQL  
- **Queue / cron:** node-cron workers inside `email-service`  
- **Workspace:** pnpm monorepo

---

## Quick Start (local)

```bash
# 1. clone & install
git clone https://github.com/listeven989/email.dev.git
cd email.dev
pnpm install

# 2. configure environment
cp .env.example .env        # fill SMTP keys, DB URL, etc.

# 3. bootstrap database
pnpm --filter email-service setup:db

# 4. run all services (separate shells or tmux panes)
pnpm --filter email-service cron:all
pnpm --filter graphql-server start
pnpm --filter tracking-service start
pnpm --filter web-app dev   # http://localhost:3000
```

Production Build
```bash
# build binaries
pnpm --filter graphql-server build
pnpm --filter web-app build

# start
pnpm --filter graphql-server serve
pnpm --filter web-app start

```

Deploy anywhere that supports Node 18+ & PostgreSQL (Render, Fly, DigitalOcean, AWS, etc.).
Tip: rename tracking endpoint (newsletter-*.yourdomain.com) to dodge spam heuristics.

Run `pnpm test` (if you add unit tests).

Open a PR – include context, screenshots, and migration notes if DB changes.

Maintainers will review & merge; GitHub Actions auto-deploys the demo.

