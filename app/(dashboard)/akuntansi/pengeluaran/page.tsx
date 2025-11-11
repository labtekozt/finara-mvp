"use client";

import { ExpensesManagement } from "@/components/accounting/ExpensesManagement";

export default function PengeluaranPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pengeluaran</h2>
          <p className="text-muted-foreground mt-1">
            Kelola pengeluaran operasional
          </p>
        </div>
      </div>

      <ExpensesManagement />
    </div>
  );
}
