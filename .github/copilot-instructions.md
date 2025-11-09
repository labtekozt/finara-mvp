# Finara — AI Assistant Instructions

Retail/warehouse management system with integrated accounting. Next.js 15 + React 19 + Prisma + PostgreSQL.

## Critical Rules

- **UI Language**: ALL user-facing text, labels, messages in **Indonesian** (Bahasa Indonesia)
- **Financial Math**: NEVER use floating point for money. Store as integers (cents/sen), calculate with integers, display with proper formatting
- **Double-Entry**: All accounting transactions must balance (debits = credits)
- **Audit Trail**: Log ALL mutations to ActivityLog with user context

## Architecture Overview

- **Frontend**: Next.js app router, server/client components, shadcn/ui + Tailwind
- **Backend**: Next.js API routes with Prisma ORM
- **Auth**: NextAuth.js with role-based permissions (ADMIN/KASIR/GUDANG/MANAJER)
- **Database**: PostgreSQL with transaction-wrapped operations
- **Modules**: POS (kasir), inventory (inventaris), transactions (masuk/keluar), accounting (akuntansi)
- **Accounting**: Double-entry journal entries, period closing, financial reports
- **PDF Export**: jsPDF + jspdf-autotable for reports
- **PRINSIPLE**: SOLID, DRY, KISS, YAGNI principles

## Key Patterns

- **Server Components**: Data fetching + auth checks; call `getServerSession` + `prisma` directly
- **Client Components**: `"use client"` for interactivity; fetch via API routes
- **API Routes**: `getServerSession(authOptions)`, `prisma.$transaction`, activity logging
- **Transaction IDs**: Generated via `lib/transaction-number.ts` (KSR/MASUK/KELUAR prefixes)
- **RBAC**: Check `hasPermission` in UI, enforce server-side via `lib/permissions.ts`
- **Accounting Service Layer**: `services/accounting/` → `hooks/accounting/` → components
- **Hierarchical UI**: Expandable tables with `expandedPeriods` Set, chevron icons, nested indentation
- **PDF Export**: jsPDF + jspdf-autotable, Indonesian locale, page breaks at y > 250

## Financial Calculations (ZERO TOLERANCE)

```typescript
// WRONG: Floating point precision loss
const total = 14.99 + 15.01; // May be 30.009999999999998

// CORRECT: Integer arithmetic
const price1 = 1499; // 14.99 in cents
const price2 = 1501; // 15.01 in cents
const total = price1 + price2; // 3000 cents = Rp 30.00
```

## Developer Workflows

- **Dev**: `npm run dev` (localhost:3000)
- **DB**: `npm run db:generate`, `npm run db:push`, `npm run db:seed`
- **Build**: `npm run build` (includes format + type-check)
- **Test**: `npm run test` (Jest with coverage)
- **Docker DB**: `docker start finara-postgres`

## Project Conventions

- **Routes**: Protected under `app/(dashboard)`, APIs under `app/api/<kebab-case>`
- **Components**: Reuse `components/ui/` primitives, custom in `components/`
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind classes, responsive with `lg:` breakpoints
- **Icons**: Lucide React (`ArrowUpDown`, `ChevronRight`, etc.)
- **Notifications**: Sonner toasts for feedback
- **Date Handling**: date-fns (not moment.js), `startOfDay`/`endOfDay` for ranges

## Common Workflows

- **New Accounting Feature**: Types → API route → service method → hook → component
- **CRUD Module**: Client page under `app/(dashboard)/`, API under `app/api/`, follow existing patterns
- **Filter Select**: Use `value="ALL"` for "show all", check `!== "ALL"` before API params
- **Table Sorting**: `useMemo` + `sort()`, state for `sortColumn`/`sortDirection`, clickable headers with icons
- **Statistics Cards**: 4-column grid above tables, `toLocaleString("id-ID")` for currency

## Essential Files

- `lib/auth-options.ts` + `middleware.ts` — Auth setup
- `lib/permissions.ts` — RBAC rules
- `prisma/schema.prisma` — Database models
- `lib/prisma.ts` + `lib/transaction-number.ts` — DB client + ID generation
- `services/accounting/index.ts` — Accounting API calls
- `hooks/accounting/` — Data fetching hooks
- `components/accounting/JournalRecapitulation.tsx` — Hierarchical expandable views
- `lib/financial-validator.ts` — Calculation validation
- `lib/audit-logger.ts` — Audit trail logging
- `lib/accounting-utils.ts` — Journal entry creation functions

## Accounting Integration Points

- **POS Transactions**: `app/api/transaksi-kasir/` → `createJournalEntryForCompleteSale()`
- **Inventory In**: `app/api/transaksi-masuk/` → `createJournalEntryForPurchase()`
- **Inventory Out**: `app/api/transaksi-keluar/` → `createJournalEntryForInventoryAdjustment()`
- **Expenses**: `app/api/pengeluaran/` → `createJournalEntryForExpense()`
- **Period Closing**: `app/api/akuntansi/periode/[id]/close/` → Revenue/expense closing entries

Ready to assist! Focus on Indonesian UI text, precise financial math, and following established patterns.
