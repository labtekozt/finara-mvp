import { useState, useEffect } from "react";
import { AccountingService } from "@/services/accounting";
import { GeneralLedgerData } from "@/types/accounting";

interface UseGeneralLedgerOptions {
  akunId?: string;
  periodeId?: string;
  startDate?: string;
  endDate?: string;
  autoLoad?: boolean;
}

export function useGeneralLedger(options: UseGeneralLedgerOptions = {}) {
  const [data, setData] = useState<GeneralLedgerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!options.akunId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await AccountingService.getGeneralLedger(
        options.akunId,
        options.periodeId,
        options.startDate,
        options.endDate,
      );
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch general ledger",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoLoad !== false && options.akunId) {
      fetchData();
    }
  }, [
    options.akunId,
    options.periodeId,
    options.startDate,
    options.endDate,
    options.autoLoad,
  ]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
