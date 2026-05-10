# Verity AI

Verity AI is a Vite, React, Hono, tRPC, and Drizzle application for Nigerian academic certificate verification. It includes Google OAuth sign-in, employer dashboards, certificate upload and scoring, verification history, public badge lookup, and wallet ledger flows.

## Scripts

```sh
npm install
npm run dev
npm run check
npm run lint
npm test
npm run build
```

Use `npm.cmd` instead of `npm` on Windows PowerShell if script execution policy blocks `npm.ps1`.

## Environment

Copy `.env.example` to `.env` and fill in the required values:

```sh
JWT_SECRET=
DATABASE_URL=
VITE_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
OWNER_UNION_ID=
```

## Database

```sh
npm run db:generate
npm run db:migrate
```

The demo seed script lives at `db/seed.ts`; run it with your preferred TypeScript runner after configuring `DATABASE_URL`.
