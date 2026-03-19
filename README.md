# Salon Booking System

A full-stack salon booking application built with Express.js (backend) and Next.js (frontend). Customers can browse services, select time slots, and pay online or in-person. Staff can manage daily appointments through a dedicated dashboard.

## Tech Stack

**Backend**

- Express.js 5 + TypeScript
- TypeORM + PostgreSQL
- Clerk (JWT authentication)
- Stripe (payment authorization & capture)
- Swagger UI (`/api/docs`)
- Vitest (testing)

**Frontend**

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Clerk React SDK
- TanStack Query + Zustand
- Stripe React Elements

## Prerequisites

- Node.js 18+
- pnpm 10+
- Docker & Docker Compose (required for PostgreSQL, optional for full-stack runs)

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd nodejs-training
```

### 2. Backend Setup

```bash
cd server
pnpm install
cp .env.example .env
```

Fill in the `.env` file (see [Environment Variables](#environment-variables) below), then run migrations and seed:

```bash
pnpm run migration:run
pnpm run seed
pnpm run dev
```

The API will be available at `http://localhost:3000`.
Swagger docs: `http://localhost:3000/api/docs`

### 3. Frontend Setup

```bash
cd client
pnpm install
cp .env.example .env
```

Fill in the `.env` file, then start the dev server:

```bash
pnpm run dev
```

The app will be available at `http://localhost:3001`.

## Environment Variables

### Backend (`server/.env`)

| Variable                       | Required | Description                                                                                  |
| ------------------------------ | -------- | -------------------------------------------------------------------------------------------- |
| `NODE_ENV`                     | Yes      | `development` or `production`                                                                |
| `PORT`                         | Yes      | Server port (default: `3000`)                                                                |
| `DATABASE_URL`                 | Yes      | PostgreSQL connection URL (e.g. `postgres://postgres:postgres@localhost:5432/salon_booking`) |
| `CLERK_PUBLISHABLE_KEY`        | Yes      | Clerk publishable key (from Clerk dashboard)                                                 |
| `CLERK_SECRET_KEY`             | Yes      | Clerk secret key (from Clerk dashboard)                                                      |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Yes      | Clerk webhook signing secret (from Clerk dashboard → Webhooks)                               |
| `STRIPE_SECRET_KEY`            | Yes      | Stripe secret key (from Stripe dashboard)                                                    |
| `STRIPE_WEBHOOK_SECRET`        | Yes      | Stripe webhook signing secret (from Stripe dashboard → Webhooks)                             |

### Frontend (`client/.env`)

| Variable                             | Required | Description                                        |
| ------------------------------------ | -------- | -------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                | Yes      | Backend API URL (e.g. `http://localhost:3000/api`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  | Yes      | Clerk publishable key                              |
| `CLERK_SECRET_KEY`                   | Yes      | Clerk secret key (for server-side auth)            |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes      | Stripe publishable key                             |
| `STRIPE_SECRET_KEY`                  | Yes      | Stripe secret key                                  |

## Secret Management with Doppler

This project uses [Doppler](https://www.doppler.com/) to manage secrets. No `.env` files are needed.

### 1. Install Doppler CLI

Follow the official installation guide: https://docs.doppler.com/docs/install-cli

### 2. Configure with a Persisted Service Token

Generate a service token from the Doppler dashboard for the target environment (e.g. `dev`, `staging`, `production`), then register it scoped to your project directory:

```bash
# Prevent configure command being leaked in bash history
export HISTIGNORE='doppler*'

# Scope to location of application directory
echo 'dp.st.prd.xxxx' | doppler configure set token --scope /path/to/nodejs-training
```

This persists across machine restarts and restricts which directory secrets can be fetched from.

### 3. Run with Doppler

Doppler injects all environment variables at runtime:

```bash
# Backend
cd server
doppler run -- pnpm run dev        # development
doppler run -- pnpm run start      # production

# Migrations & seeds
doppler run -- pnpm run migration:run
doppler run -- pnpm run seed

# Frontend
cd client
doppler run -- pnpm run dev
```

> **Note:** The `dotenv` library in the server will silently skip loading if no `.env` file is present. When using Doppler, you don't need `.env` files at all.

## Database Setup

The backend uses PostgreSQL. Start the database via Docker Compose:

```bash
docker compose up -d postgres
```

This starts PostgreSQL at `localhost:5432` with default credentials matching the `DATABASE_URL` fallback.

**Run migrations** (creates all tables):

```bash
cd server
pnpm run migration:run
```

**Seed the database** (inserts default services):

```bash
pnpm run seed
```

**Generate a new migration** (after entity changes):

```bash
pnpm run migration:generate -- src/shared/database/migrations/MigrationName
```

**Rollback last migration:**

```bash
pnpm run migration:revert
```

## Running the App

### Development

```bash
# Backend (http://localhost:3000)
cd server && pnpm run dev

# Frontend (http://localhost:3001)
cd client && pnpm run dev
```

### Production

```bash
# Backend
cd server && pnpm run build && pnpm run start

# Frontend
cd client && pnpm run build && pnpm run start
```

### Docker (Full Stack)

Each container runs the Doppler CLI internally to fetch its own secrets.

#### 1. Set up environment

Create a root `.env` file for Docker Compose:

```bash
# .env (root)
DOPPLER_TOKEN_SERVER=dp.st.dev.xxxx    # Server service token from Doppler dashboard
DOPPLER_TOKEN_CLIENT=dp.st.dev.yyyy    # Client service token from Doppler dashboard
NGROK_AUTHTOKEN=your_ngrok_token       # From ngrok dashboard
```

#### 2. Run

```bash
docker compose up --build
```

The Compose stack includes a PostgreSQL container. The server's `DATABASE_URL` is automatically set to the Compose postgres service. All other secrets are fetched by Doppler inside each container. The client token is also used at build time to inline `NEXT_PUBLIC_*` vars. Data is persisted in the `pgdata` Docker volume.

| Service         | URL                            | Description             |
| --------------- | ------------------------------ | ----------------------- |
| Frontend        | http://localhost:3001          | Next.js UI              |
| Backend API     | http://localhost:3000          | Express API             |
| Swagger docs    | http://localhost:3000/api/docs | API docs                |
| ngrok inspector | http://localhost:4040          | Tunnel URL for webhooks |

Use the tunnel URL from http://localhost:4040 for your Clerk and Stripe webhook configs.

### Running E2E Tests

E2E tests use a separate PostgreSQL instance on port 5433 (via the `test` profile):

```bash
docker compose --profile test up -d postgres-test
cd server
doppler run -- pnpm run test:e2e:run
```

### Other Commands

```bash
# Run unit tests
cd server && pnpm run test
cd server && pnpm run test:coverage

# Lint & format
pnpm run lint
pnpm run format

# Type check (frontend)
cd client && pnpm run type-check
```

## API Documentation

Interactive Swagger docs are available at:

```
http://localhost:3000/api/docs
```

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected endpoints require a Clerk JWT token:

```
Authorization: Bearer <clerk_jwt_token>
```

### Endpoints Overview

| Method | Endpoint                  | Auth | Role  | Description                            |
| ------ | ------------------------- | ---- | ----- | -------------------------------------- |
| GET    | `/health`                 | No   | -     | Health check                           |
| GET    | `/users/me`               | Yes  | Any   | Get current user profile               |
| GET    | `/services`               | No   | -     | List all active services               |
| GET    | `/slots`                  | No   | -     | Get available time slots               |
| GET    | `/bookings`               | Yes  | USER  | Get user's bookings                    |
| GET    | `/bookings/:id`           | Yes  | USER  | Get booking details                    |
| POST   | `/bookings`               | Yes  | USER  | Create a booking                       |
| POST   | `/bookings/:id/cancel`    | Yes  | USER  | Cancel a booking                       |
| POST   | `/payments/create-intent` | Yes  | USER  | Create Stripe PaymentIntent            |
| POST   | `/payments/authorize`     | Yes  | USER  | Authorize payment for existing booking |
| POST   | `/webhooks/stripe`        | No   | -     | Stripe webhook handler                 |
| GET    | `/bookings/daily`         | Yes  | STAFF | Get daily bookings                     |
| POST   | `/bookings/:id/check-in`  | Yes  | STAFF | Check in a customer                    |
| POST   | `/bookings/:id/complete`  | Yes  | STAFF | Mark service as complete               |
| POST   | `/bookings/:id/no-show`   | Yes  | STAFF | Mark customer as no-show               |

## Booking Status Flow

```
Card payment flow:
  POST /payments/create-intent
       ↓
  POST /bookings  →  AUTHORIZED
       ↓
  [staff] check-in  →  CHECKED_IN  (Stripe payment captured)
       ↓
  [staff] complete  →  DONE

Cash payment flow:
  POST /bookings  →  CONFIRMED
       ↓
  [staff] check-in  →  CHECKED_IN
       ↓
  [staff] complete  →  DONE

Cancellation:
  CONFIRMED / AUTHORIZED  →  cancel  →  CANCELLED
  (card: Stripe PaymentIntent cancelled or refunded)

No-show:
  CONFIRMED / AUTHORIZED  →  no-show  →  NO_SHOW

Payment failure (via webhook):
  PENDING_PAYMENT  →  PAYMENT_FAILED
```

## Project Structure

```
nodejs-training/
├── docker-compose.yml          # Full-stack Docker setup (server + client + ngrok)
├── .env                        # Root env (Doppler tokens only)
├── server/                     # Express.js backend
│   ├── Dockerfile              # Multi-stage Docker build
│   ├── .dockerignore
│   └── src/
│       ├── modules/            # Feature modules
│       │   ├── auth/           # Clerk webhook sync
│       │   ├── bookings/       # Booking lifecycle
│       │   ├── health/         # Health check
│       │   ├── payments/       # Stripe integration
│       │   ├── services/       # Salon services catalog
│       │   ├── slots/          # Slot availability
│       │   └── users/          # User management
│       └── shared/
│           ├── constants/      # Business hours, env vars
│           ├── database/       # TypeORM config, migrations, seeds
│           ├── errors/         # ApiError class
│           ├── middleware/     # Auth, role guards, error handler
│           ├── swagger/        # Swagger config
│           └── types/          # Shared enums and interfaces
│
└── client/                     # Next.js frontend
    ├── Dockerfile              # Multi-stage Docker build
    ├── .dockerignore
    └── src/
        ├── app/                # App Router pages
        │   ├── (auth)/         # Sign-in, sign-up
        │   ├── (users)/        # Customer pages
        │   └── staff/          # Staff dashboard
        ├── components/         # Shared UI components
        ├── hooks/              # React Query hooks
        ├── stores/             # Zustand stores
        └── types/              # TypeScript types
```
