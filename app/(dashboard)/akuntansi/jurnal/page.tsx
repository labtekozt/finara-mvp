"use client";

import React, { useState } from "react";
import { JournalsManagement } from "@/components/accounting/JournalsManagement";

export default function JurnalPage() {
  const [selectedPeriode, setSelectedPeriode] = useState<string>("");

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Jurnal</h2>
          <p className="text-muted-foreground mt-1">
            Kelola jurnal transaksi akuntansi
          </p>
        </div>
      </div>

      <JournalsManagement selectedPeriode={selectedPeriode} />
    </div>
  );
}
