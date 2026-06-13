# Spendly

Spendly is a personal finance dashboard for tracking income, expenses, and spending patterns. It includes authentication, transaction management, analytics charts, smart spending insights, and a responsive dark dashboard UI.

## Features

- Email/password authentication with encrypted passwords
- Google OAuth sign-in through NextAuth
- Password reset flow with email delivery
- Protected dashboard, transactions, and analytics pages
- Add, view, filter, and delete income or expense transactions
- Summary cards for balance, income, and expenses
- Monthly bar charts, expense pie charts, balance trends, and category analytics
- Smart insights generated from transaction history
- Responsive sidebar/header layout with theme support

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui-style components
- NextAuth.js
- MongoDB with Mongoose
- Recharts
- Framer Motion
- Nodemailer
- Lucide React icons

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB database, local or hosted
- Google OAuth credentials if you want Google sign-in
- Gmail app password if you want password reset emails

### Installation

```bash
npm install
```

Create a `.env.local` file in the project root:

```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects signed-in users to `/dashboard` and signed-out users to `/login`.

## Available Scripts

```bash
npm run dev
```

Runs the local development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run start
```

Starts the production server after a build.

```bash
npm run lint
```

Runs ESLint.

## App Routes

| Route | Description |
| --- | --- |
| `/` | Redirects based on authentication state |
| `/login` | Sign-in page |
| `/signup` | Account registration page |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password from a reset token |
| `/dashboard` | Main financial overview |
| `/transactions` | Transaction table and management |
| `/analytics` | Spending analytics and charts |

## API Routes

| Route | Description |
| --- | --- |
| `/api/auth/[...nextauth]` | NextAuth credentials and Google OAuth handler |
| `/api/auth/register` | Creates a credentials-based user account |
| `/api/auth/forgot-password` | Generates a password reset token and sends email |
| `/api/auth/reset-password` | Updates a password using a valid reset token |
| `/api/transactions` | Lists and creates transactions |
| `/api/transactions/[id]` | Updates or deletes a transaction |
| `/api/insights` | Returns smart spending insights for a user |

## Project Structure

```text
src/
  app/                 App Router pages, layouts, and API routes
  components/          Dashboard, chart, form, navigation, and UI components
  context/             Theme context
  lib/                 Database, email, and utility helpers
  models/              Mongoose models for users and transactions
  proxy.ts             Route protection and auth redirects
public/                Static assets
```

## Data Models

`User` stores account details, OAuth metadata, password hashes, and reset tokens.

`Transaction` stores the user id, transaction type, category, amount, optional description, and date.

## Notes

- The app uses the `spendly` MongoDB database name in `src/lib/db.ts`.
- Email reset links use `NEXTAUTH_URL`, so keep it accurate for local development and production deployments.
