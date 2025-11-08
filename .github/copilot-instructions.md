## Finara — Copilot / AI assistant instructions

This file gives focused, repository-specific guidance so an AI coding agent can be productive quickly in this retail/gudang management system.

### Rule key language
* **CRITICAL**: for all output to ui/ to user use bahasa indonesia (Indonesian language)
* for all teknisi code use best practices style code 
### 1. Big picture
- **Next.js 15.1.4 app-directory project** (TypeScript + React 19). Mix of server and client components.
- **Authentication**: NextAuth (credentials provider). Session checks via `getServerSession` in server code and `next-auth` middleware (see `middleware.ts`).
- **Database**: PostgreSQL with Prisma 6.1. Client at `lib/prisma.ts`, schema in `prisma/schema.prisma`.
- **RBAC**: role/permission helper at `lib/permissions.ts`. UI uses `hasPermission` (see `components/app-sidebar.tsx`).
- **Transaction flows**: APIs use `prisma.$transaction` and centralized ID generator `lib/transaction-number.ts` (KSR/MASUK/KELUAR prefixes).
- **Activity logging**: All mutations log to `ActivityLog` model for audit trails.
- **Multi-location**: Barang linked to Lokasi for warehouse management.

### 2. Where to change authentication/authorization
- **Login/provider**: `lib/auth-options.ts` and `app/api/auth/[...nextauth]/route.ts`.
- **Route protection**: `middleware.ts` (re-exports `next-auth/middleware` with matcher for dashboard routes).
- **Permission rules**: `lib/permissions.ts` (single source of truth for role capabilities).

### 3. Server vs Client component patterns
- **Server components**: Used for data fetching, authentication checks. Call `getServerSession` + `prisma` directly. Example: `app/(dashboard)/dashboard/page.tsx` (wrapper only).
- **Client components**: Mark with `"use client"` for interactivity, state, filters. Fetch data via API routes. Examples: `app/(dashboard)/dashboard/dashboard-client.tsx`, `app/(dashboard)/inventaris/page.tsx`, `app/(dashboard)/kasir/page.tsx`.
- **Pattern**: Server page → client component for UX. Dashboard uses server wrapper + client for filters; inventaris/kasir/transaksi are fully client-side.

### 4. API route conventions
- All API routes call `getServerSession(authOptions)`, then use `prisma` directly.
- Use `prisma.$transaction` for multi-step changes; write activity logs via `prisma.activityLog.create(...)`.
- Transaction IDs from `lib/transaction-number.ts` (never hardcode formats).
- **Date filtering**: Support `startDate`/`endDate` params for range queries (see `app/api/dashboard/route.ts`).
- **Sorting**: Client-side sorting with `useMemo` + `sort()` function (see inventaris/transaksi pages).
- Example APIs: `app/api/barang/route.ts`, `app/api/transaksi-kasir/route.ts`, `app/api/dashboard/route.ts`.

### 5. Developer workflows & commands
- **Install**: `npm install`
- **Dev**: `npm run dev` (Next.js dev server on localhost:3000)
- **DB**: `npm run db:generate` (Prisma client), `npm run db:push` (push schema), `npm run db:seed` (seed data)
- **Prisma Studio**: `npm run db:studio`
- **Build**: `npm run build`; **Production**: `npm start`
- **Lint**: `npm run lint` (ESLint with Next.js config)
- **Docker**: PostgreSQL runs in Docker (`docker start finara-postgres`). Credentials in `.env`: user=finara, password=finara123, db=finara_db.
- **Env vars**: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (see `.env`).

### 6. Project-specific conventions
- **Protected routes** under `app/(dashboard)` — follow this structure for new pages.
- **API routes** under `app/api/<kebab-case>`.
- **Always validate permissions** server-side; client UI may hide controls with `hasPermission` but server must enforce.
- **Use `lib/*` helpers**: auth-options, prisma, permissions, transaction-number.
- **shadcn/ui components** in `components/ui/` — reuse existing primitives.
- **Select components**: Use `value="ALL"` for "show all" filters, never empty string (see `app/(dashboard)/inventaris/page.tsx`).
- **Hydration**: Root layout has `suppressHydrationWarning` to prevent browser extension conflicts.
- **Sorting icons**: Use `ArrowUpDown`, `ArrowUp`, `ArrowDown` from lucide-react for table headers.
- **Statistics cards**: Grid layout with 4 columns on lg screens, responsive (see inventaris/transaksi pages).
- **Activity logging**: Log all mutations with user context: `prisma.activityLog.create({userId, userName, action, entity, entityId?, description})`.

### 7. Prisma schema gotchas
- **Relation field names** matter: `TransaksiKasir.itemTransaksi` (not `items`), `ItemTransaksi.qty` (not `jumlah`), `ItemTransaksi.hargaSatuan` (not `harga`).
- **Always check** `prisma/schema.prisma` for exact field names before writing queries.
- **Use `prisma.barang.fields.stokMinimum`** for dynamic field comparisons.
- **Indexes**: Date fields indexed for performance (`@@index([tanggal])`).

### 8. Dashboard patterns (client-side with server API)
- **Server page** at `app/(dashboard)/dashboard/page.tsx` fetches session, renders client component.
- **Client component** at `dashboard-client.tsx` handles filters, API calls to `/api/dashboard`.
- **Filter periods**: today, yesterday, week, month, year, custom range (startDate/endDate).
- **API at `app/api/dashboard/route.ts`** supports date range queries, aggregations, groupBy patterns.
- **Custom date filtering**: Use `date-fns` functions like `startOfDay`, `endOfDay`, etc.

### 9. Table sorting & statistics patterns (client-side)
- **Client-side sorting**: Use `useMemo` with `sort()` function, state for `sortColumn` and `sortDirection`.
- **Sort function**: Handle strings, numbers, dates. For relations: `item.lokasi.namaLokasi`.
- **Sort icons**: Clickable table headers with visual indicators (`ArrowUpDown`/`ArrowUp`/`ArrowDown`).
- **Statistics cards**: 4-column grid showing totals, counts, averages. Use `toLocaleString("id-ID")` for currency formatting.
- **Date filtering**: Input type="date" with `max={format(new Date(), "yyyy-MM-dd")}` constraints.
- **Examples**: `app/(dashboard)/inventaris/page.tsx`, `app/(dashboard)/transaksi/page.tsx`.

### 10. Transaction patterns
- **POS transactions**: `TransaksiKasir` → `ItemTransaksi[]` (cart items), auto-deduct stock, calculate totals.
- **Stock movements**: `TransaksiMasuk`/`TransaksiKeluar` for warehouse transfers, update `Barang.stok`.
- **Transaction numbers**: Generated with prefixes (KSR/MASUK/KELUAR) + date + random suffix.
- **All transactions**: Use `prisma.$transaction` for atomicity, log to ActivityLog.

### 11. Common workflows
- **Adding feature to dashboard**: Update API route (`app/api/dashboard/route.ts`) first, then client component.
- **New CRUD module**: Create client page under `app/(dashboard)/`, API routes under `app/api/`, follow kasir/inventaris patterns.
- **Filter with Select**: Use "ALL" value for all items, check `!== "ALL"` before API param (see inventaris filters).
- **Adding sorting**: Add state variables, `useMemo` for sorted data, clickable headers with icons.
- **Adding statistics**: Create card grid above tables, calculate in component or API.
- **Adding transactions**: Use transaction numbers, prisma.$transaction, activity logging.

### 12. Files to inspect first
- `lib/auth-options.ts`, `middleware.ts`, `lib/permissions.ts` — auth & RBAC
- `lib/prisma.ts`, `prisma/schema.prisma` — database client & schema
- `lib/transaction-number.ts` — transaction ID formats
- `app/api/dashboard/route.ts` — date filtering, aggregations, groupBy patterns
- `app/(dashboard)/dashboard/dashboard-client.tsx` — client component with filters
- `app/(dashboard)/inventaris/page.tsx` — sorting, statistics, CRUD patterns
- `app/(dashboard)/transaksi/page.tsx` — tabs, sorting, date filtering
- `app/(dashboard)/kasir/page.tsx` — POS/cart patterns
- `components/providers.tsx`, `components/app-sidebar.tsx` — session & UI

### 13. Tech stack specifics
- **Next.js 15.1.4**: App directory, server/client components, middleware
- **React 19**: Latest hooks, concurrent features
- **Prisma 6.1**: Modern ORM with `$transaction`, field references
- **shadcn/ui**: Component library with Tailwind CSS
- **date-fns**: Date manipulation (not moment.js)
- **Lucide React**: Icons (ArrowUpDown, etc.)
- **Sonner**: Toast notifications
- **@tanstack/react-table**: Advanced table features (available but not yet used)

Ready to assist! Let me know if you need clarification on transaction patterns, activity logging, or multi-location inventory management.
