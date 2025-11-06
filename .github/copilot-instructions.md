## Finara — Copilot / AI assistant instructions

This file gives focused, repository-specific guidance so an AI coding agent can be productive quickly.

1. Big picture
   - Next.js 15 app-directory project (TypeScript + React 19). Server- and client-components are used.
   - Authentication: NextAuth (credentials provider). Session checks happen via getServerSession in server code and via `next-auth` middleware (see `middleware.ts`).
   - Database: PostgreSQL with Prisma. DB schema in `prisma/schema.prisma`, client helper at `lib/prisma.ts`.
   - RBAC: role/permission table + helper at `lib/permissions.ts`. UI hides/show items using `hasPermission` (see `components/app-sidebar.tsx`).
   - Transaction flows: APIs create transactions using `prisma.$transaction` and a centralized id generator in `lib/transaction-number.ts` (used by `app/api/transaksi-*/*`).

2. Where to change authentication/authorization
   - Login/provider config: `lib/auth-options.ts` and `app/api/auth/[...nextauth]/route.ts`.
   - Global route protection is delegated to `middleware.ts` which re-exports `next-auth/middleware`.
   - Permission rules: edit `lib/permissions.ts` (trusted single source for role capabilities).

3. Server data patterns and API conventions
   - Server components and API routes call `getServerSession` + `authOptions` and then use `prisma` directly. See `app/(dashboard)/*/page.tsx` and `app/api/**/route.ts` for examples.
   - Use `prisma.$transaction` for multi-step DB changes; activity logs are written via `prisma.activityLog.create(...)` in many API routes.
   - Transaction IDs must come from `lib/transaction-number.ts` (do not hardcode formats).

4. Developer workflows & commands (exact)
   - Install: `npm install`
   - Dev server: `npm run dev` (Next dev)
   - DB: `npm run db:generate` (Prisma client), `npm run db:push`, `npm run db:seed` (uses `tsx prisma/seed.ts`)
   - Prisma UI: `npm run db:studio`
   - Build: `npm run build`; Start production: `npm start`
   - Lint: `npm run lint`
   - Important env keys: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (edit `.env` from `.env.example`).

5. Project-specific conventions to follow
   - Route grouping: protected dashboard pages live under `app/(dashboard)` — follow this when adding new protected pages.
   - API routes are organised under `app/api/<kebab-case>`; mirror that structure when adding endpoints.
   - Server-side checks: prefer `getServerSession` + permission checks server-side. Client UI may call `hasPermission` to hide controls, but server must validate.
   - Use `lib/*` helpers for cross-cutting logic (auth-options, prisma client, permissions, transaction-number).
   - UI components use shadcn/ui primitives located under `components/ui/` — prefer reusing them.

6. Integration & testing notes for agents
   - Seeding: database seed creates default users (see `prisma/seed.ts`) — run after pushing schema.
   - To test auth-protected APIs locally, run `npm run dev` and ensure `NEXTAUTH_URL` points to `http://localhost:3000` and `NEXTAUTH_SECRET` is set.
   - There are no automated tests present; small manual smoke checks: visit `/login`, sign in with seeded credentials, exercise API routes via the app UI or curl with cookies.

7. Files to inspect first when changing behavior
   - `lib/auth-options.ts` — NextAuth options & credentials provider
   - `middleware.ts` — high-level route protection
   - `lib/permissions.ts` — RBAC rules
   - `lib/prisma.ts` & `prisma/schema.prisma` — DB client and schema
   - `lib/transaction-number.ts` — transaction id formats
   - `app/api/**/route.ts` — canonical API examples (transaksi-kasir, transaksi-masuk, transaksi-keluar, barang, lokasi)
   - `components/providers.tsx`, `components/app-sidebar.tsx`, `components/header.tsx` — session and UI hooks

If anything here is unclear or you'd like the instructions to emphasize more (tests, CI, or scaffolding new modules), tell me which area to expand and I'll iterate. Thank you — ready to update further based on feedback.
