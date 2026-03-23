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

## Quick Start

```bash
# Clone
git clone <repo-url>
cd nodejs-training

# Backend
cd server && pnpm install && cp .env.example .env
pnpm run migration:run && pnpm run seed && pnpm run dev

# Frontend (in another terminal)
cd client && pnpm install && cp .env.example .env
pnpm run dev
```

Or run everything with Docker:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

| Service         | URL                            |
| --------------- | ------------------------------ |
| Frontend        | http://localhost:3001          |
| Backend API     | http://localhost:3000          |
| Swagger docs    | http://localhost:3000/api/docs |
| ngrok inspector | http://localhost:4040          |

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/api.md) | Endpoints, authentication, booking status flow |
| [Deployment Guide](docs/deployment.md) | CI/CD pipelines, Railway setup, Doppler secrets, webhooks, Docker Compose, GitHub secrets |

## Project Structure

```
nodejs-training/
├── docker-compose.yml          # Base server image
├── docker-compose.local.yml    # Local dev (postgres + client + ngrok)
├── docker-compose.test.yml     # Test database (postgres on port 5433)
├── docs/                       # Documentation
│   ├── api.md                  # API reference
│   └── deployment.md           # Deployment & CI/CD guide
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
