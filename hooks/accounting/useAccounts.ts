import { useState, useEffect, useCallback } from "react";
import { Akun, AkunFormData } from "@/types/accounting";
import { AccountingService } from "@/services/accounting";
import { toast } from "sonner";

interface UseAccountsOptions {
  tipe?: string;
  kategori?: string;
  search?: string;
  autoLoad?: boolean;
}

export function useAccounts(options: UseAccountsOptions = {}) {
  const [accounts, setAccounts] = useState<Akun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AccountingService.getAccounts({
        tipe: options.tipe,
        kategori: options.kategori,
        search: options.search,
      });
      setAccounts(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load accounts";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [options.tipe, options.kategori, options.search]);

  const createAccount = useCallback(
    async (data: AkunFormData): Promise<Akun | null> => {
      try {
        setLoading(true);
        const newAccount = await AccountingService.createAccount(data);
        setAccounts((prev) => [...prev, newAccount]);
        toast.success("Akun berhasil dibuat");
        return newAccount;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create account";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateAccount = useCallback(
    async (id: string, data: Partial<AkunFormData>): Promise<Akun | null> => {
      try {
        setLoading(true);
        const updatedAccount = await AccountingService.updateAccount(id, data);
        setAccounts((prev) =>
          prev.map((account) => (account.id === id ? updatedAccount : account)),
        );
        toast.success("Akun berhasil diperbarui");
        return updatedAccount;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update account";
        setError(errorMessage);
        toast.error(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await AccountingService.deleteAccount(id);
      setAccounts((prev) => prev.filter((account) => account.id !== id));
      toast.success("Akun berhasil dihapus");
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete account";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (options.autoLoad !== false) {
      loadAccounts();
    }
  }, [loadAccounts, options.autoLoad]);

  return {
    accounts,
    loading,
    error,
    loadAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    refetch: loadAccounts,
  };
}
