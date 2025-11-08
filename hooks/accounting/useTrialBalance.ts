import { useState, useEffect } from "react";
import { AccountingService } from "@/services/accounting";
import { TrialBalanceData } from "@/types/accounting";

interface UseTrialBalanceOptions {
  periodeId?: string;
  autoLoad?: boolean;
}

export function useTrialBalance(options: UseTrialBalanceOptions = {}) {
  const [data, setData] = useState<TrialBalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AccountingService.getTrialBalance(options.periodeId);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch trial balance",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.autoLoad !== false) {
      fetchData();
    }
  }, [options.periodeId, options.autoLoad]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
