"use client";

import { TrialBalance } from "@/components/accounting/TrialBalance";

export default function NeracaSaldoPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Neraca Saldo</h2>
          <p className="text-muted-foreground mt-1">
            Lihat neraca saldo periode akuntansi
          </p>
        </div>
      </div>

      <TrialBalance />
    </div>
  );
}
