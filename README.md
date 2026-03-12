# Salon Booking System

A full-stack salon booking application built with Express.js (backend) and Next.js (frontend). Customers can browse services, select time slots, and pay online or in-person. Staff can manage daily appointments through a dedicated dashboard.

## Tech Stack

**Backend**

- Express.js 5 + TypeScript
- TypeORM + SQLite
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
- Docker (optional, for containerized runs)

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

| Variable                       | Required | Description                                                      |
| ------------------------------ | -------- | ---------------------------------------------------------------- |
| `NODE_ENV`                     | Yes      | `development` or `production`                                    |
| `PORT`                         | Yes      | Server port (default: `3000`)                                    |
| `DATABASE_PATH`                | Yes      | SQLite file path (e.g. `./data/salon_booking.db`)                |
| `CLERK_PUBLISHABLE_KEY`        | Yes      | Clerk publishable key (from Clerk dashboard)                     |
| `CLERK_SECRET_KEY`             | Yes      | Clerk secret key (from Clerk dashboard)                          |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Yes      | Clerk webhook signing secret (from Clerk dashboard → Webhooks)   |
| `STRIPE_SECRET_KEY`            | Yes      | Stripe secret key (from Stripe dashboard)                        |
| `STRIPE_WEBHOOK_SECRET`        | Yes      | Stripe webhook signing secret (from Stripe dashboard → Webhooks) |

### Frontend (`client/.env`)

| Variable                             | Required | Description                                        |
| ------------------------------------ | -------- | -------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                | Yes      | Backend API URL (e.g. `http://localhost:3000/api`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`  | Yes      | Clerk publishable key                              |
| `CLERK_SECRET_KEY`                   | Yes      | Clerk secret key (for server-side auth)            |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes      | Stripe publishable key                             |
| `STRIPE_SECRET_KEY`                  | Yes      | Stripe secret key                                  |

## Database Setup

The backend uses SQLite. The database file is auto-created at the path set in `DATABASE_PATH`.

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

### Docker (Backend only)

```bash
cd server

# Build the image
docker build -t salon-booking-server .

# Run the container (mount your .env file)
docker run -p 3000:3000 -v $(pwd)/.env:/app/.env salon-booking-server
```

The server will be available at `http://localhost:3000`.

> **Note:** The SQLite database lives inside the container at `/app/data/`. To persist it across container restarts, mount a volume:
> ```bash
> docker run -p 3000:3000 \
>   -v $(pwd)/.env:/app/.env \
>   -v $(pwd)/data:/app/data \
>   salon-booking-server
> ```

### Other Commands

```bash
# Run tests
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
