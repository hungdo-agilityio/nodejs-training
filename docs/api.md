# API Documentation

Interactive Swagger docs are available at:

```
http://localhost:3000/api/docs
```

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require a Clerk JWT token:

```
Authorization: Bearer <clerk_jwt_token>
```

## Endpoints Overview

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
