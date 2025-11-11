"use client";

import { OpeningBalanceManagement } from "@/components/accounting/OpeningBalanceManagement";
import { useAccountingDashboard } from "@/hooks/accounting";

export default function SaldoAwalPage() {
  const { periods } = useAccountingDashboard();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Saldo Awal</h2>
          <p className="text-muted-foreground mt-1">
            Kelola saldo awal untuk periode akuntansi
          </p>
        </div>
      </div>

      <OpeningBalanceManagement periods={periods} />
    </div>
  );
}
