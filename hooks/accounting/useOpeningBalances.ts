import { useState, useEffect, useCallback } from "react";
import { AccountingService } from "@/services/accounting";
import { SaldoAwal } from "@/types/accounting";

export function useOpeningBalances(periodeId: string | null) {
  const [openingBalances, setOpeningBalances] = useState<SaldoAwal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpeningBalances = useCallback(async () => {
    if (!periodeId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await AccountingService.getOpeningBalances(periodeId);
      setOpeningBalances(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch opening balances",
      );
    } finally {
      setLoading(false);
    }
  }, [periodeId]);

  const createOpeningBalance = async (data: {
    periodeId: string;
    akunId: string;
    saldo: number;
  }) => {
    try {
      const newBalance = await AccountingService.createOpeningBalance(data);
      setOpeningBalances((prev) => {
        const existing = prev.find((b) => b.akunId === data.akunId);
        if (existing) {
          return prev.map((b) => (b.akunId === data.akunId ? newBalance : b));
        }
        return [...prev, newBalance];
      });
      return newBalance;
    } catch (err) {
      throw err;
    }
  };

  const updateOpeningBalance = async (
    akunId: string,
    periodeId: string,
    saldo: number,
  ) => {
    try {
      const updatedBalance = await AccountingService.updateOpeningBalance(
        akunId,
        periodeId,
        saldo,
      );
      setOpeningBalances((prev) =>
        prev.map((b) => (b.akunId === akunId ? updatedBalance : b)),
      );
      return updatedBalance;
    } catch (err) {
      throw err;
    }
  };

  const deleteOpeningBalance = async (akunId: string, periodeId: string) => {
    try {
      await AccountingService.deleteOpeningBalance(akunId, periodeId);
      setOpeningBalances((prev) => prev.filter((b) => b.akunId !== akunId));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchOpeningBalances();
  }, [fetchOpeningBalances]);

  return {
    openingBalances,
    loading,
    error,
    refetch: fetchOpeningBalances,
    createOpeningBalance,
    updateOpeningBalance,
    deleteOpeningBalance,
  };
}
