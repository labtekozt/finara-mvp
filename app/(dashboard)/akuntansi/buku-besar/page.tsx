"use client";

import { GeneralLedger } from "@/components/accounting/GeneralLedger";

export default function BukuBesarPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Buku Besar</h2>
          <p className="text-muted-foreground mt-1">
            Lihat buku besar akun
          </p>
        </div>
      </div>

      <GeneralLedger />
    </div>
  );
}
