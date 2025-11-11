"use client";

import { AccountsManagement } from "@/components/accounting/AccountsManagement";

export default function DaftarAkunPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Daftar Akun</h2>
          <p className="text-muted-foreground mt-1">
            Kelola chart of accounts untuk sistem akuntansi
          </p>
        </div>
      </div>

      <AccountsManagement />
    </div>
  );
}
