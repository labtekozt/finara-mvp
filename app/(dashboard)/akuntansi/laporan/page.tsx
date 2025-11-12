"use client";

import { FinancialStatements } from "@/components/accounting/FinancialStatements";

export default function LaporanPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Keuangan</h2>
          <p className="text-muted-foreground mt-1">
            Lihat laporan keuangan perusahaan
          </p>
        </div>
      </div>

      <FinancialStatements />
    </div>
  );
}
