# 🏗️ Architecture Documentation - FINARA

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │  Browser   │  │  Browser   │  │   Mobile   │  │   Tablet   ││
│  │  Desktop   │  │   Mobile   │  │  Browser   │  │  Browser   ││
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                    HTTPS / REST API
                            │
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER (Next.js)                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Frontend (React)                          ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   ││
│  │  │Dashboard │  │  Kasir   │  │Inventaris│  │Transaksi │   ││
│  │  │  Page    │  │  Page    │  │   Page   │  │   Page   │   ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   ││
│  │                                                              ││
│  │  ┌──────────────────────────────────────────────────────┐  ││
│  │  │         Shared Components (shadcn/ui)                 │  ││
│  │  │  Sidebar, Header, Forms, Tables, Dialogs, etc.       │  ││
│  │  └──────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                Middleware & Authentication                   ││
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐           ││
│  │  │ NextAuth   │  │    RBAC    │  │   Route    │           ││
│  │  │Middleware  │  │ Permission │  │ Protection │           ││
│  │  └────────────┘  └────────────┘  └────────────┘           ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    API Routes (Backend)                      ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   ││
│  │  │  Barang  │  │  Lokasi  │  │Transaksi │  │   Auth   │   ││
│  │  │   API    │  │   API    │  │   APIs   │  │   API    │   ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   ││
│  │                                                              ││
│  │  - Input Validation (Zod)                                   ││
│  │  - Error Handling                                           ││
│  │  - Authorization Checks                                     ││
│  │  - Business Logic                                           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                            │
                      Prisma ORM
                            │
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                    PostgreSQL Database                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Users   │  │  Barang  │  │  Lokasi  │  │Transaksi │       │
│  │          │  │          │  │          │  │  Kasir   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Item    │  │Transaksi │  │Transaksi │  │Activity  │       │
│  │Transaksi │  │  Masuk   │  │  Keluar  │  │   Log    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Page Components Hierarchy

```
App
├── RootLayout
│   ├── Providers (SessionProvider, Toaster)
│   └── {children}
│
├── LoginPage (Public)
│   ├── Card
│   ├── Form
│   └── Button
│
└── DashboardLayout (Protected)
    ├── SidebarProvider
    ├── AppSidebar
    │   ├── SidebarHeader
    │   ├── SidebarContent
    │   │   └── Navigation Menu Items
    │   └── SidebarFooter (User Info)
    │
    └── Main Content
        ├── Header (Title, Logout)
        └── Page Content
            │
            ├── Dashboard Page
            │   ├── Stats Cards
            │   ├── Recent Transactions Table
            │   └── Low Stock Alerts
            │
            ├── Kasir Page
            │   ├── Product Grid (Search, Filter)
            │   ├── Cart Sidebar
            │   │   ├── Cart Items
            │   │   ├── Totals
            │   │   └── Checkout Form
            │   └── Receipt Dialog
            │
            ├── Inventaris Page
            │   ├── Filters (Search, Category, Location)
            │   ├── Products Table
            │   └── Add/Edit Dialog
            │       └── Product Form
            │
            └── Transaksi Page
                ├── Action Buttons
                ├── Tabs (Masuk/Keluar)
                │   ├── Barang Masuk Table
                │   └── Barang Keluar Table
                ├── Barang Masuk Dialog
                └── Barang Keluar Dialog
```

## Data Flow Architecture

### 1. Authentication Flow

```
User → Login Page
  ↓
  Enter Credentials
  ↓
NextAuth Credentials Provider
  ↓
Query Database (Prisma)
  ↓
Validate Password (bcrypt)
  ↓
Generate JWT Token
  ↓
Set Session Cookie
  ↓
Redirect to Dashboard
  ↓
Middleware Checks Token on Each Request
```

### 2. Cashier Transaction Flow

```
Kasir Page
  ↓
Select Products → Add to Cart (Client State)
  ↓
Enter Payment Details
  ↓
Click "Bayar" Button
  ↓
POST /api/transaksi-kasir
  ↓
API Route:
  ├─ Validate Input (Zod)
  ├─ Check Stock Availability
  ├─ Start Database Transaction
  │   ├─ Create TransaksiKasir
  │   ├─ Create ItemTransaksi (for each item)
  │   ├─ Update Barang Stock (decrement)
  │   └─ Create ActivityLog
  ├─ Commit Transaction
  └─ Return Success
  ↓
Show Receipt Dialog
  ↓
Print Receipt (Optional)
  ↓
Clear Cart & Reset Form
```

### 3. Inventory Management Flow

```
Inventaris Page
  ↓
Load Products (GET /api/barang)
  ↓
Display in Table
  ↓
User Actions:
  ├─ Add New Product
  │   ↓
  │   Fill Form → POST /api/barang
  │   ↓
  │   Validate → Create in DB → Log Activity
  │   ↓
  │   Refresh List
  │
  ├─ Edit Product
  │   ↓
  │   Load Data → Update Form
  │   ↓
  │   Submit → PUT /api/barang/[id]
  │   ↓
  │   Validate → Update in DB → Log Activity
  │   ↓
  │   Refresh List
  │
  └─ Delete Product
      ↓
      Confirm → DELETE /api/barang/[id]
      ↓
      Remove from DB → Log Activity
      ↓
      Refresh List
```

### 4. Goods Transaction Flow (Masuk/Keluar)

```
Transaksi Page
  ↓
Tab: Barang Masuk
  ↓
Click "Barang Masuk" Button
  ↓
Fill Form:
  - Select Product
  - Enter Quantity
  - Enter Purchase Price
  - Enter Source
  - Select Location
  ↓
Submit → POST /api/transaksi-masuk
  ↓
API Route:
  ├─ Validate Input
  ├─ Start Transaction
  │   ├─ Create TransaksiMasuk
  │   ├─ Update Barang Stock (increment)
  │   ├─ Update Barang Purchase Price
  │   └─ Create ActivityLog
  └─ Commit Transaction
  ↓
Refresh Transaction History
  ↓
Show Success Toast

[Similar flow for Barang Keluar, but with stock decrement and validation]
```

## Database Entity Relationships

```
┌─────────────┐
│    User     │
│ (roles)     │
└─────────────┘
      │ 1
      │ has many
      ↓ *
┌─────────────┐
│ Transaksi   │
│   Kasir     │
└─────────────┘
      │ 1
      │ has many
      ↓ *
┌─────────────┐        ┌─────────────┐
│    Item     │ * ───→ │   Barang    │ 1
│  Transaksi  │ refers │ (products)  │
└─────────────┘        └─────────────┘
                             │ *
                             │ belongs to
                             ↓ 1
                       ┌─────────────┐
                       │   Lokasi    │
                       │ (locations) │
                       └─────────────┘
                             │ 1
                ┌────────────┼────────────┐
                │ has many   │ has many   │
                ↓ *          ↓ *          
        ┌─────────────┐  ┌─────────────┐
        │ Transaksi   │  │ Transaksi   │
        │   Masuk     │  │   Keluar    │
        └─────────────┘  └─────────────┘
                │ *          │ *
                │ refers     │ refers
                └────────────┴─────→ Barang
```

## State Management

### Client State (React Hooks)

```typescript
// Component-level state
const [loading, setLoading] = useState(false)
const [data, setData] = useState([])
const [formData, setFormData] = useState({})
const [dialogOpen, setDialogOpen] = useState(false)

// Effects for data fetching
useEffect(() => {
  fetchData()
}, [dependencies])
```

### Server State (API Calls)

```typescript
// Fetch from API
const response = await fetch('/api/endpoint')
const data = await response.json()

// Update via API
await fetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

### Global State (NextAuth Session)

```typescript
// Access session anywhere
const { data: session } = useSession()
const userRole = session?.user?.role

// Server-side session
const session = await getServerSession(authOptions)
```

## Security Architecture

### 1. Authentication Layer

```
Request
  ↓
Middleware (middleware.ts)
  ↓
Check Session Token
  ├─ Valid → Continue
  └─ Invalid → Redirect to /login
  ↓
NextAuth Session
  ↓
User Information Available
```

### 2. Authorization Layer

```
User Request
  ↓
Check User Role (from session)
  ↓
Check Permission (lib/permissions.ts)
  ├─ Has Permission → Allow
  └─ No Permission → Deny (404 or Hide UI)
  ↓
Execute Action
```

### 3. Input Validation

```
Client Side:
  HTML5 Validation
  ↓
  React Hook Form Validation
  ↓
  Zod Schema Validation

Server Side:
  API Route
  ↓
  Zod Schema Validation
  ↓
  Business Logic Validation
  ↓
  Prisma Type Validation
```

## API Architecture

### Request/Response Flow

```
Client
  ↓ HTTP Request
API Route (/app/api/*/route.ts)
  ↓
1. Get Session (Authorization)
2. Parse Request Body
3. Validate Input (Zod)
4. Business Logic
5. Database Operation (Prisma)
6. Log Activity
7. Return Response
  ↓ HTTP Response
Client
```

### Error Handling Strategy

```typescript
try {
  // Validation
  const validatedData = schema.parse(body)
  
  // Business logic
  const result = await performOperation(validatedData)
  
  // Success response
  return NextResponse.json(result, { status: 200 })
  
} catch (error) {
  if (error instanceof z.ZodError) {
    // Validation error
    return NextResponse.json(
      { error: "Validation error", details: error.errors },
      { status: 400 }
    )
  }
  
  // Other errors
  console.error(error)
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  )
}
```

## Performance Optimizations

### 1. Database Level
- Indexed columns for fast queries
- Efficient relationships
- Query optimization
- Connection pooling (Prisma)

### 2. Application Level
- Server-side rendering (Next.js)
- Automatic code splitting
- Lazy loading components
- Optimized re-renders

### 3. Network Level
- API response caching
- Minimized payload size
- Compressed assets
- CDN for static files (production)

## Deployment Architecture (Production)

```
┌─────────────────────────────────────────────────────────┐
│                     Load Balancer                        │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ↓                 ↓                 ↓
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Next.js App  │ │  Next.js App  │ │  Next.js App  │
│   Instance 1  │ │   Instance 2  │ │   Instance 3  │
└───────────────┘ └───────────────┘ └───────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │ PostgreSQL Database    │
              │  (Primary + Replica)   │
              └───────────────────────┘
```

## File Organization Principles

1. **Feature-based**: Group by feature/module
2. **Colocation**: Keep related files together
3. **Separation of Concerns**: UI, Logic, Data separate
4. **Reusability**: Shared components in `/components/ui`
5. **Type Safety**: Types in `/types`
6. **Utilities**: Helper functions in `/lib`

## Technology Decisions

### Why Next.js?
- Full-stack framework (Frontend + Backend)
- Server-side rendering for SEO
- API routes for backend
- File-based routing
- Great developer experience

### Why Prisma?
- Type-safe database client
- Great migrations system
- Excellent TypeScript support
- Auto-generated types
- Database agnostic

### Why shadcn/ui?
- Customizable components
- Not a dependency (copy-paste)
- Built on Radix UI (accessible)
- Beautiful default styling
- Easy to modify

### Why NextAuth?
- Industry standard for Next.js
- Multiple providers support
- JWT or database sessions
- Great documentation
- Active community

---

This architecture is designed to be:
- **Scalable**: Can handle growing data and users
- **Maintainable**: Clear structure and separation
- **Secure**: Multiple layers of protection
- **Performant**: Optimized at every level
- **Developer-friendly**: Clear patterns and conventions


