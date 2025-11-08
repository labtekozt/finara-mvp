import { useState, useEffect } from "react";
import { AccountingService } from "@/services/accounting";
import { IncomeStatementData } from "@/types/accounting";

interface UseIncomeStatementOptions {
  periodeId?: string;
  autoLoad?: boolean;
}

export function useIncomeStatement(options: UseIncomeStatementOptions = {}) {
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await AccountingService.getIncomeStatement(
        options.periodeId,
      );
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch income statement",
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
