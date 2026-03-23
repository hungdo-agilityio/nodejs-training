# Deployment Guide

This document covers CI/CD pipelines, secret management with Doppler, Railway deployment, webhook configuration, and Docker Compose setup.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Docker Compose Files](#docker-compose-files)
- [Secret Management with Doppler](#secret-management-with-doppler)
- [CI Pipeline](#ci-pipeline)
- [CD Pipeline](#cd-pipeline)
- [Preview Deployments](#preview-deployments)
- [Railway Setup](#railway-setup)
- [Webhook Configuration](#webhook-configuration)
- [GitHub Secrets Reference](#github-secrets-reference)

## Architecture Overview

```
PR opened  ──► CI (lint, test, type-check, e2e) + Preview Deploy on Railway
PR merged  ──► CD: Build Docker image ──► Push to Docker Hub ──► Redeploy on Railway
```

- **CI** runs on every push and pull request
- **CD** runs on push to `dev`, `staging`, `main`
- **Preview Deploy** creates a temporary Railway environment per PR
- **Doppler** manages all secrets across environments
- **Railway** hosts the production server, pulling Docker images from Docker Hub

## Docker Compose Files

The Docker setup is split into three files:

| File | Purpose | Usage |
|------|---------|-------|
| `docker-compose.yml` | Base server image | `docker compose up` |
| `docker-compose.local.yml` | Local dev (postgres, client, ngrok) | `docker compose -f docker-compose.yml -f docker-compose.local.yml up` |
| `docker-compose.test.yml` | Test database (postgres on port 5433) | `docker compose -f docker-compose.test.yml up -d` |

### Local Development

```bash
# Create root .env with Doppler tokens
cat > .env <<EOF
DOPPLER_TOKEN_SERVER=dp.st.dev.xxxx
DOPPLER_TOKEN_CLIENT=dp.st.dev.yyyy
NGROK_AUTHTOKEN=your_ngrok_token
EOF

# Start everything
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

This starts:
- **postgres** on `localhost:5432` (data persisted in `pgdata` volume)
- **server** on `localhost:3000` (connects to local postgres, secrets from Doppler)
- **client** on `localhost:3001`
- **ngrok** tunnel on `localhost:4040` (for webhook testing)

### Running E2E Tests Locally

```bash
docker compose -f docker-compose.test.yml up -d
cd server
doppler run -- pnpm run test:e2e:run
docker compose -f docker-compose.test.yml down
```

## Secret Management with Doppler

All secrets are managed through [Doppler](https://www.doppler.com/). No `.env` files are needed in deployed environments.

### Doppler Project Structure

Set up the following configs in your Doppler project:

| Config | Purpose | Used By |
|--------|---------|---------|
| `dev` | Development secrets | Local dev, Railway dev environment |
| `staging` | Staging secrets | Railway staging environment |
| `production` | Production secrets | Railway production environment |
| `e2e` | E2E test secrets (Clerk/Stripe test keys) | CI e2e job |

### Required Doppler Secrets

#### Server Config (`dev` / `staging` / `production`)

| Secret | Description |
|--------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: `3000`) |
| `DATABASE_URL` | PostgreSQL connection URL (use Railway internal URL for deployed envs) |
| `CLERK_PUBLISHABLE_KEY` | From Clerk dashboard |
| `CLERK_SECRET_KEY` | From Clerk dashboard |
| `CLERK_WEBHOOK_SIGNING_SECRET` | From Clerk webhook endpoint (unique per environment) |
| `STRIPE_SECRET_KEY` | From Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook endpoint (unique per environment) |

#### E2E Config

Same as server config, plus:

| Secret | Description |
|--------|-------------|
| `CLERK_TEST_SESSION_TOKEN` | Bearer token for a signed-in test user |
| `CLERK_TEST_USER_ID` | Clerk user ID matching the test token |

> `DATABASE_URL` in the e2e config is overridden at runtime to point to the local test database.

### Creating Service Tokens

Generate service tokens for CI/CD and local dev:

```bash
# Prevent tokens from leaking in bash history
export HISTIGNORE='doppler*'

# For local development — scope to your project directory
echo 'dp.st.dev.xxxx' | doppler configure set token --scope /path/to/nodejs-training
```

### How `--preserve-env` Works

The server Dockerfile uses:

```dockerfile
ENTRYPOINT ["doppler", "run", "--preserve-env", "--"]
```

`--preserve-env` tells Doppler to skip any env var that's already set. This allows:
- Docker Compose to override `DATABASE_URL` for local development
- CI to inject `DATABASE_URL` pointing to the test database
- Railway env vars to take precedence over Doppler when needed

## CI Pipeline

**File:** `.github/workflows/ci.yml`

Triggers on every push and pull request.

### Jobs

| Job | What it does |
|-----|-------------|
| **Server CI** | Lint, format check, type check, unit tests |
| **Server E2E** | Starts test postgres via docker-compose, runs E2E tests with Doppler |
| **Client CI** | Lint, format check, type check |

All jobs run in parallel.

### E2E Test Details

The E2E job uses the `Development` GitHub environment and:

1. Starts `postgres-test` on port 5433 via `docker-compose.test.yml`
2. Uses `doppler run --preserve-env` to inject Clerk/Stripe test keys
3. Overrides `DATABASE_URL` to point to the local test database
4. Runs `pnpm test:e2e:run`

Required GitHub secret: `DOPPLER_TOKEN_E2E` (in the `Development` environment)

## CD Pipeline

**File:** `.github/workflows/api-cd.yml`

Triggers on push to `dev`, `staging`, or `main`.

### Flow

1. **Setup** — Determines environment and Docker tag from branch:

   | Branch | GitHub Environment | Docker Tag |
   |--------|--------------------|------------|
   | `dev` | Development | `dev` |
   | `staging` | Staging | `staging` |
   | `main` | Production | `latest` |

2. **Build & Push** — Builds the server Docker image and pushes to Docker Hub with two tags:
   - `<username>/salon-booking-server:<tag>` (e.g. `:dev`)
   - `<username>/salon-booking-server:<tag>-<sha>` (e.g. `:dev-abc1234`)

3. **Deploy to Railway** — Installs Railway CLI and runs `railway redeploy --service salon-booking-api --yes`

### Required Secrets (per GitHub environment)

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `RAILWAY_TOKEN` | Railway project token for the target environment |

## Preview Deployments

**File:** `.github/workflows/preview-deploy.yml`

Creates a temporary Railway environment for each pull request, similar to Vercel previews.

### How it Works

- **PR opened/updated** — Clones the `dev` Railway environment as `pr-<number>`, posts a comment on the PR with the preview URL
- **PR closed** — Deletes the preview environment

### Required Secrets (in `Development` GitHub environment)

| Secret | Description |
|--------|-------------|
| `RAILWAY_API_TOKEN` | Railway **account** API token (not a project token) |
| `RAILWAY_PROJECT_ID` | Railway project ID |

> Get `RAILWAY_API_TOKEN` from **Railway → Account Settings → Tokens**.
> Get `RAILWAY_PROJECT_ID` from **Railway → Project Settings → General**.

## Railway Setup

### 1. Create the Projects

- **API project** — contains the `salon-booking-api` service
- **Database project** (separate) — contains the PostgreSQL service. Keeping it separate prevents preview environments from creating duplicate database instances.

### 2. Configure the API Service

1. Go to **salon-booking-api → Settings → Source**
2. Set source to **Docker Image**
3. Enter your Docker Hub image reference (e.g. `your-username/salon-booking-server:dev`)
4. If the Docker Hub repo is **private**, add registry credentials under **Settings → Source → Registry Credentials**

### 3. Set Environment Variables

In the API service's **Variables** tab, set:

| Variable | Value |
|----------|-------|
| `DOPPLER_TOKEN` | Doppler service token for the corresponding environment |

> Do NOT set `DATABASE_URL` as a Railway variable — let Doppler inject it. Otherwise Railway's value will take precedence due to `--preserve-env`.

### 4. Generate Domain

Go to **salon-booking-api → Settings → Networking → Generate Domain** to get your public URL.

### 5. Create Project Tokens

For each environment (`dev`, `staging`, `production`):

1. Go to **Railway → Project Settings → Tokens**
2. Create a project token scoped to the environment
3. Add it as `RAILWAY_TOKEN` in the corresponding GitHub environment

## Webhook Configuration

### Clerk Webhooks

Each environment needs its own Clerk webhook endpoint with a unique signing secret.

1. Go to **Clerk dashboard → Webhooks → Add Endpoint**
2. Set the endpoint URL:
   ```
   https://<your-railway-url>/api/webhooks/clerk
   ```
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret**
5. Add it as `CLERK_WEBHOOK_SIGNING_SECRET` in the corresponding Doppler config

### Stripe Webhooks

Each environment needs its own Stripe webhook endpoint.

1. Go to **Stripe dashboard → Developers → Webhooks → Add Endpoint**
2. Set the endpoint URL:
   ```
   https://<your-railway-url>/api/webhooks/stripe
   ```
3. Select events:
   - `payment_intent.amount_capturable_updated` (payment authorized)
   - `payment_intent.succeeded` (payment captured)
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the **Signing Secret** (starts with `whsec_`)
5. Add it as `STRIPE_WEBHOOK_SECRET` in the corresponding Doppler config

### Local Webhook Testing

When running locally with Docker Compose, ngrok provides a tunnel:

1. Start the local stack:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.local.yml up
   ```
2. Open `http://localhost:4040` to get the ngrok tunnel URL
3. Create separate Clerk/Stripe webhook endpoints using the ngrok URL
4. Each local endpoint gets its own signing secret — update your local Doppler `dev` config accordingly

## GitHub Secrets Reference

### Repository Secrets

| Secret | Used By | Description |
|--------|---------|-------------|
| `RAILWAY_API_TOKEN` | Preview Deploy | Railway account-level API token |
| `RAILWAY_PROJECT_ID` | Preview Deploy | Railway project ID |

### Environment Secrets (per environment: Development / Staging / Production)

| Secret | Used By | Description |
|--------|---------|-------------|
| `DOCKERHUB_USERNAME` | API CD | Docker Hub username |
| `DOCKERHUB_TOKEN` | API CD | Docker Hub access token |
| `RAILWAY_TOKEN` | API CD | Railway project token (scoped to environment) |
| `DOPPLER_TOKEN_E2E` | CI (e2e job) | Doppler service token for e2e config (Development only) |
