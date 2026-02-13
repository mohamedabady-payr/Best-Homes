# Best Homes - Third-Party Integration Testing App

A standalone Next.js app that simulates a student housing platform for testing the Payr third-party integration flow.

## Features

- **Home page**: Rent payment schedule with installments (pending/paid status)
- **Checkout page**: "Pay with Payr" button that opens the Payr payment flow in a modal iframe
- **Feedback page**: Success/failure view after payment completion
- **Profile page**: Complete your profile (personal and tenant details) before paying with Payr
- **Server API**: Payr onboarding (`/api/payr-onboarding`) - onboard user to Payr and returns token/session_id for embedding

## Setup

1. Copy the env example and add your credentials:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your Best Homes institution Payr credentials:

```
PAYR_API_URL=https://stage-api.mypayr.co.uk
BEST_HOMES_INSTITUTION_EMAIL=your-institution-email@example.com
BEST_HOMES_INSTITUTION_PASSWORD=your-institution-password
```

The access token is obtained automatically via Payr auth/login and stored in `.payr-token.json` (created at runtime, gitignored).

3. Install dependencies and run:

```bash
pnpm install
pnpm dev
```

The app runs on **http://localhost:3001**.

## Testing Flow

1. Open Best Homes at http://localhost:3001
2. Go to Profile and complete your profile (personal and tenant details)
3. View the rent schedule on the home page
4. Click "Pay Rent" or go to Checkout
5. Click "Pay with Payr" (requires profile to be completed) - modal opens with Payr third-party page in iframe
6. Complete payment on Payr (card or APM)
7. Modal closes automatically, redirects to success/failure feedback
8. Click "Back to Schedule" - first pending installment shows as paid

## Architecture

- **Atomic design**: components in `atoms/`, `molecules/`, `organisms/`, `templates/`
- **API routes**: Next.js App Router API routes for Payr onboarding and mock schedule data

## Requirements

- `PAYR_API_URL`: Payr API (e.g. https://stage-api.mypayr.co.uk)
- `BEST_HOMES_INSTITUTION_EMAIL` and `BEST_HOMES_INSTITUTION_PASSWORD`: Institution credentials; token is fetched on 401 and stored in `.payr-token.json`
