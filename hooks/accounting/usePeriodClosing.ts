import { useState, useEffect } from "react";
import { PeriodClosingData, PeriodeAkuntansi } from "@/types/accounting";

interface PreCloseValidation {
  isValid: boolean;
  issues: string[];
  summary: {
    totalJournals: number;
    unpostedJournals: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    retainedEarningsAccount?: {
      id: string;
      nama: string;
      kode: string;
    };
  };
}

export function usePeriodClosing(periodeId: string) {
  const [closingData, setClosingData] = useState<PeriodClosingData | null>(
    null,
  );
  const [preCloseValidation, setPreCloseValidation] =
    useState<PreCloseValidation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreCloseValidation = async () => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/akuntansi/periode/${periodeId}/pre-close`,
      );

      if (response.ok) {
        const data = await response.json();
        setPreCloseValidation(data);
      } else {
        throw new Error("Failed to load pre-close validation");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error loading pre-close validation:", err);
    } finally {
      setIsValidating(false);
    }
  };

  const loadClosingStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/akuntansi/periode/${periodeId}/closing-status`,
      );

      if (response.ok) {
        const data = await response.json();
        setClosingData(data);
      } else if (response.status === 404) {
        setClosingData(null);
      } else {
        throw new Error("Failed to load closing status");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error loading period closing status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const closePeriod = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/akuntansi/periode/${periodeId}/close`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to close period");
      }

      // Reload closing status after successful close
      await loadClosingStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error closing period:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (periodeId) {
      loadClosingStatus();
      loadPreCloseValidation();
    }
  }, [periodeId]);

  return {
    closingData,
    preCloseValidation,
    isLoading,
    isValidating,
    error,
    loadClosingStatus,
    loadPreCloseValidation,
    closePeriod,
  };
}
