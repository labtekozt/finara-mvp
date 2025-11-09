# Inventaris Components

This directory contains reusable components for the Inventaris page.

## Components

### StatCard

A reusable card component for displaying a single statistic.

**Props:**

- `title`: string - The title of the stat
- `value`: string | number - The main value to display
- `description`: string - Helper text below the value
- `icon`: LucideIcon - Icon component from lucide-react
- `action`: ReactNode (optional) - Optional action button or element

**Example:**

```tsx
<StatCard
  title="Total Barang"
  value={100}
  description="Item dalam inventaris"
  icon={Package}
/>
```

### StatsGrid

A grid layout component that displays multiple StatCard components.

**Props:**

- `stats`: StatItem[] - Array of stat objects

**StatItem interface:**

```typescript
interface StatItem {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
}
```

**Example:**

```tsx
<StatsGrid
  stats={[
    {
      title: "Total Barang",
      value: 100,
      description: "Item dalam inventaris",
      icon: Package,
    },
    {
      title: "Total Nilai",
      value: "Rp 10.000.000",
      description: "Berdasarkan harga beli",
      icon: Package,
    },
  ]}
/>
```

## Usage in page.tsx

The StatCard and StatsGrid components are now used in three places:

1. **Barang Tab** - Statistics for inventory items
2. **History Keluar Tab** - Statistics for outgoing transactions
3. **History Kasir Tab** - Statistics for POS transactions

## Benefits of Refactoring

✅ **DRY Principle** - Eliminated duplicate code (3 identical stat card patterns)
✅ **Maintainability** - Easy to update styling/behavior in one place
✅ **Reusability** - Can be used in other pages/features
✅ **Type Safety** - Proper TypeScript interfaces
✅ **Consistency** - Ensures all stat cards look and behave the same
✅ **Reduced File Size** - Reduced main page by ~120 lines

## File Structure

```
app/(dashboard)/inventaris/
├── page.tsx (reduced from 1819 to ~1760 lines)
└── components/
    ├── StatCard.tsx
    ├── StatsGrid.tsx
    └── README.md
```
