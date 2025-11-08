## Finara — Copilot / AI assistant instructions

This file gives focused, repository-specific guidance so an AI coding agent can be productive quickly in this retail/gudang management system with integrated accounting capabilities.

### Rule key language

- **CRITICAL**: for all output to ui/ to user use bahasa indonesia (Indonesian language)
- for all teknisi code use best practices style code

### Rule Of design principles

- **CRITICAL**: always follow existing project conventions and patterns
- **CRITICAL**: always follow existing file/folder structure and naming conventions
- prioritize code readability and maintainability
- write modular, reusable code with clear separation of concerns
- use TypeScript types and interfaces consistently
- handle errors and edge cases gracefully
- write unit tests for new features and bug fixes
- document complex logic with comments
- follow security best practices, especially for auth and data access
- optimize performance for data fetching and rendering large datasets
- use modern React/Next.js features and idioms
- leverage existing libraries and utilities in the codebase
- use PRINCIPLE OF LEAST SURPRISE: avoid introducing unexpected behaviors or side effects
- USE INDONESIAN LANGUAGE for all user-facing text, messages, labels, and UI components
- follow Indonesian localization conventions (date, currency, number formats)
- ensure accessibility (a11y) compliance for UI components
- simplify complex logic where possible without sacrificing clarity
- prioritize user experience (UX) in UI design and interactions
- alaways validate and sanitize user inputs
- ensure data integrity in all database operations
- always check lint and check types

### Financial Calculation Rules (CRITICAL - ZERO TOLERANCE)

- **CRITICAL**: NEVER use floating point arithmetic for financial calculations (0.1 + 0.2 !== 0.3)
- **CRITICAL**: ALWAYS use integer cents/minor units for money calculations (multiply by 100, calculate, divide by 100)
- **CRITICAL**: Use BigInt or dedicated money libraries for precision-critical operations
- **CRITICAL**: Round financial amounts using proper rounding rules (banker's rounding for display)
- **CRITICAL**: Validate all calculations with checksums or redundant calculations
- **CRITICAL**: Store all monetary values as integers in database (cents/pence/sen)
- **CRITICAL**: Display formatting should NEVER affect stored values
- **CRITICAL**: Implement calculation audit trails for all financial operations
- **CRITICAL**: Use fixed-point arithmetic libraries (decimal.js, big.js) for complex calculations
- **CRITICAL**: Test all financial calculations with edge cases (overflow, underflow, division by zero)
- **CRITICAL**: Implement calculation result validation (debit = credit for double-entry bookkeeping)

### Software Engineering Principles (SOLID, KISS, DRY, YAGNI)

- **SOLID Principles**:
  - **Single Responsibility**: Each function/class has one reason to change
  - **Open/Closed**: Open for extension, closed for modification
  - **Liskov Substitution**: Subtypes must be substitutable for their base types
  - **Interface Segregation**: Clients shouldn't depend on methods they don't use
  - **Dependency Inversion**: Depend on abstractions, not concretions
- **KISS (Keep It Simple, Stupid)**: Prefer simple solutions over complex ones
- **DRY (Don't Repeat Yourself)**: Eliminate code duplication through abstraction
- **YAGNI (You Aren't Gonna Need It)**: Don't implement features until they're actually needed
- **Fail Fast**: Detect errors as early as possible, fail loudly with clear error messages
- **Composition over Inheritance**: Favor composition for code reuse
- **Explicit over Implicit**: Make dependencies and intentions clear
- **Defensive Programming**: Validate inputs, handle edge cases, provide meaningful errors

### 1. Big picture

- **Next.js 15.1.4 app-directory project** (TypeScript + React 19). Mix of server and client components.
- **Authentication**: NextAuth (credentials provider). Session checks via `getServerSession` in server code and `next-auth` middleware (see `middleware.ts`).
- **Database**: PostgreSQL with Prisma 6.1. Client at `lib/prisma.ts`, schema in `prisma/schema.prisma`.
- **RBAC**: role/permission helper at `lib/permissions.ts`. UI uses `hasPermission` (see `components/app-sidebar.tsx`).
- **Transaction flows**: APIs use `prisma.$transaction` and centralized ID generator `lib/transaction-number.ts` (KSR/MASUK/KELUAR prefixes).
- **Activity logging**: All mutations log to `ActivityLog` model for audit trails.
- **Multi-location**: Barang linked to Lokasi for warehouse management.
- **Accounting module**: Full double-entry bookkeeping with chart of accounts, journal entries, accounting periods, and financial reporting.

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

### 7. Accounting module patterns

- **Service layer**: `services/accounting/index.ts` — centralized API calls for accounting features.
- **Custom hooks**: `hooks/accounting/` — data fetching and state management (useJournals, useAccounts, useExpenses).
- **Types**: `types/accounting/index.ts` — comprehensive TypeScript interfaces for accounting entities.
- **API routes**: `app/api/akuntansi/` — RESTful endpoints for accounts, journals, periods, expenses.
- **Double-entry bookkeeping**: Journal entries require balanced debit/credit amounts.
- **Accounting periods**: Active periods control transaction posting; closed periods are read-only.
- **Chart of accounts**: Hierarchical structure with parent/child relationships and account types (ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE).

### 8. Hierarchical UI patterns (expandable views)

- **Expandable tables**: Use state management for `expandedPeriods` Set to track open/closed sections.
- **Period navigation**: Yearly → Monthly → Daily → Individual entries hierarchy.
- **Visual indicators**: Chevron icons (`ChevronRight`/`ChevronDown`) for expand/collapse states.
- **Nested rendering**: Parent rows show summary, child rows show details with `pl-8` indentation.
- **Example**: `JournalRecapitulation.tsx` — expandable period views with detailed breakdowns.

### 9. PDF export patterns

- **Libraries**: jsPDF v3.0.3 + jspdf-autotable v5.0.2 for professional reports.
- **Import pattern**: `import jsPDF from 'jspdf'` and `import autoTable from 'jspdf-autotable'`.
- **Table generation**: `autoTable(pdf, { head: [...], body: [...], startY: yPosition })`.
- **Formatting**: Indonesian locale for currency (`toLocaleString("id-ID")`), proper page headers/footers.
- **Multi-page**: Check `yPosition > 250` for page breaks, use `pdf.addPage()`.
- **Example**: `JournalRecapitulation.tsx` — detailed monthly/yearly/daily PDF exports.

### 10. Prisma schema gotchas

- **Relation field names** matter: `TransaksiKasir.itemTransaksi` (not `items`), `ItemTransaksi.qty` (not `jumlah`), `ItemTransaksi.hargaSatuan` (not `harga`).
- **Always check** `prisma/schema.prisma` for exact field names before writing queries.
- **Use `prisma.barang.fields.stokMinimum`** for dynamic field comparisons.
- **Indexes**: Date fields indexed for performance (`@@index([tanggal])`).
- **Accounting enums**: `TipeAkun` (ASSET/LIABILITY/EQUITY/REVENUE/EXPENSE), `KategoriAkun` for classification.
- **Journal relations**: `JurnalEntry.jurnalDetails` (not `details`), `JurnalDetail.akun` for account references.

### 11. Dashboard patterns (client-side with server API)

- **Server page** at `app/(dashboard)/dashboard/page.tsx` fetches session, renders client component.
- **Client component** at `dashboard-client.tsx` handles filters, API calls to `/api/dashboard`.
- **Filter periods**: today, yesterday, week, month, year, custom range (startDate/endDate).
- **API at `app/api/dashboard/route.ts`** supports date range queries, aggregations, groupBy patterns.
- **Custom date filtering**: Use `date-fns` functions like `startOfDay`, `endOfDay`, etc.

### 12. Table sorting & statistics patterns (client-side)

- **Client-side sorting**: Use `useMemo` with `sort()` function, state for `sortColumn` and `sortDirection`.
- **Sort function**: Handle strings, numbers, dates. For relations: `item.lokasi.namaLokasi`.
- **Sort icons**: Clickable table headers with visual indicators (`ArrowUpDown`/`ArrowUp`/`ArrowDown`).
- **Statistics cards**: 4-column grid showing totals, counts, averages. Use `toLocaleString("id-ID")` for currency formatting.
- **Date filtering**: Input type="date" with `max={format(new Date(), "yyyy-MM-dd")}` constraints.
- **Examples**: `app/(dashboard)/inventaris/page.tsx`, `app/(dashboard)/transaksi/page.tsx`.

### 13. Transaction patterns

- **POS transactions**: `TransaksiKasir` → `ItemTransaksi[]` (cart items), auto-deduct stock, calculate totals.
- **Stock movements**: `TransaksiMasuk`/`TransaksiKeluar` for warehouse transfers, update `Barang.stok`.
- **Transaction numbers**: Generated with prefixes (KSR/MASUK/KELUAR) + date + random suffix.
- **Journal entries**: Double-entry with balanced debits/credits, posted to accounting periods.
- **All transactions**: Use `prisma.$transaction` for atomicity, log to ActivityLog.

### 14. Accounting workflows

- **Chart of accounts**: Create hierarchical account structure before journal entries.
- **Accounting periods**: Set up periods before transaction posting; close periods for audit.
- **Journal entry process**: Select period → create balanced entry → post to ledger.
- **Financial reporting**: Use recapitulation views for period analysis, export detailed PDFs.
- **Expense tracking**: Categorize expenses (GAJI/UTILITAS/SEWA/etc.) with proper account mapping.

### 15. Financial Calculation Patterns (CRITICAL)

- **Money Storage**: Store as integers (sen/cents) in database: `hargaSatuan: 15000` (15,000 sen = Rp 150.00)
- **Calculation Example**:

  ```typescript
  // WRONG - Floating point precision issues
  const total = 14.99 + 15.01; // May result in 30.009999999999998

  // CORRECT - Integer arithmetic
  const price1 = 1499; // 14.99 in cents
  const price2 = 1501; // 15.01 in cents
  const total = price1 + price2; // 3000 cents = Rp 30.00
  const displayTotal = total / 100; // For display only
  ```

- **Rounding Rules**: Use banker's rounding for financial display, but store exact values
- **Validation**: Always verify calculations (sum of debits = sum of credits)
- **Audit Trail**: Log all calculation inputs, outputs, and intermediate steps
- **Error Handling**: Fail fast on calculation errors, never silently correct
- **Testing**: Unit test all financial calculations with known inputs/outputs

### 16. Common workflows

- **Adding accounting feature**: Create types → API route → service method → hook → component.
- **New CRUD module**: Create client page under `app/(dashboard)/`, API routes under `app/api/akuntansi/`, follow journals/accounts patterns.
- **Filter with Select**: Use "ALL" value for all items, check `!== "ALL"` before API param (see inventaris filters).
- **Adding sorting**: Add state variables, `useMemo` for sorted data, clickable headers with icons.
- **Adding statistics**: Create card grid above tables, calculate in component or API.
- **Adding PDF export**: Use jsPDF + autoTable, format with Indonesian locale, add page headers/footers.
- **Adding transactions**: Use transaction numbers, prisma.$transaction, activity logging.

### 17. Files to inspect first

- `lib/auth-options.ts`, `middleware.ts`, `lib/permissions.ts` — auth & RBAC
- `lib/prisma.ts`, `prisma/schema.prisma` — database client & schema
- `lib/transaction-number.ts` — transaction ID formats
- `app/api/dashboard/route.ts` — date filtering, aggregations, groupBy patterns
- `app/(dashboard)/dashboard/dashboard-client.tsx` — client component with filters
- `app/(dashboard)/inventaris/page.tsx` — sorting, statistics, CRUD patterns
- `app/(dashboard)/transaksi/page.tsx` — tabs, sorting, date filtering
- `app/(dashboard)/kasir/page.tsx` — POS/cart patterns
- `app/(dashboard)/akuntansi/page.tsx` — accounting module structure
- `components/accounting/JournalRecapitulation.tsx` — hierarchical expandable views
- `services/accounting/index.ts` — accounting service layer
- `types/accounting/index.ts` — accounting data structures

### 18. Tech stack specifics

- **Next.js 15.1.4**: App directory, server/client components, middleware
- **React 19**: Latest hooks, concurrent features
- **Prisma 6.1**: Modern ORM with `$transaction`, field references
- **shadcn/ui**: Component library with Tailwind CSS
- **date-fns**: Date manipulation (not moment.js)
- **Lucide React**: Icons (ArrowUpDown, etc.)
- **Sonner**: Toast notifications
- **jsPDF 3.0.3 + jspdf-autotable 5.0.2**: PDF generation for reports
- **@tanstack/react-table**: Advanced table features (available but not yet used)

Ready to assist! Let me know if you need clarification on accounting patterns, hierarchical UI components, PDF export, or double-entry bookkeeping implementation.
