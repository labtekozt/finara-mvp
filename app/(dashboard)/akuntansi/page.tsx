"use client";

import { useAccountingDashboard } from "@/hooks/accounting";
import { AccountingDashboard } from "@/components/accounting/AccountingDashboard";

export default function AccountingPage() {
  const { stats, loading } = useAccountingDashboard();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Dashboard Akuntansi
          </h2>
          <p className="text-muted-foreground mt-1">
            Ringkasan pembukuan dan laporan keuangan
          </p>
        </div>
      </div>

      <AccountingDashboard stats={stats} loading={loading} />
    </div>
  );
}
