## Cursor Enforcement Rules

All development in this repository MUST follow:

/docs/CURSOR_RULES.md

When generating or modifying code:
- Do not expand scope.
- Do not introduce new architecture patterns.
- Keep implementations minimal.
- Break large features into smaller working steps.
- Avoid overengineering.

Before completing any major feature:
- Confirm build passes.
- Confirm TypeScript strict mode passes.
- Confirm no unused code.
- Confirm no feature drift.

--------------------------------------------------

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup (required for saving prospects)

Prospect create/update APIs require a reachable Postgres database.

### Local development

1. Start Postgres:
   - `docker compose up -d postgres`
2. Run migrations:
   - `npx prisma migrate deploy`
3. Start app:
   - `npm run dev`

### VPS deployment

1. Set `DATABASE_URL` to your VPS/hosted Postgres connection string (not `localhost` unless Postgres is on the same server).
2. Ensure SSL/query params are correct for your provider (for many managed DBs this includes `?sslmode=require`).
3. Run schema migrations on the server:
   - `npx prisma migrate deploy`
4. Restart the app process.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
