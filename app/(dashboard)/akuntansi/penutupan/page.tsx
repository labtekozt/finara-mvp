"use client";

import React, { useState } from "react";
import { PeriodClosing } from "@/components/accounting/PeriodClosing";
import { useAccountingDashboard } from "@/hooks/accounting";

export default function PenutupanPage() {
  const { periods } = useAccountingDashboard();
  const [selectedPeriode, setSelectedPeriode] = useState<string>("");

  // Set default active period
  React.useEffect(() => {
    if (periods.length > 0 && !selectedPeriode) {
      const activePeriod = periods.find((p) => p.isActive);
      if (activePeriod) {
        setSelectedPeriode(activePeriod.id);
      }
    }
  }, [periods, selectedPeriode]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Penutupan Periode
          </h2>
          <p className="text-muted-foreground mt-1">Tutup periode akuntansi</p>
        </div>
      </div>

      <PeriodClosing periode={periods.find((p) => p.id === selectedPeriode)!} />
    </div>
  );
}
