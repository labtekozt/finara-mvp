import { useState, useEffect, useCallback } from 'react'
import { Pengeluaran, PengeluaranFormData } from '@/types/accounting'
import { AccountingService } from '@/services/accounting'
import { toast } from 'sonner'

interface UseExpensesOptions {
  startDate?: string
  endDate?: string
  kategori?: string
  search?: string
  autoLoad?: boolean
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const [expenses, setExpenses] = useState<Pengeluaran[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await AccountingService.getExpenses({
        startDate: options.startDate,
        endDate: options.endDate,
        kategori: options.kategori,
        search: options.search
      })
      setExpenses(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load expenses'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [options.startDate, options.endDate, options.kategori, options.search])

  const createExpense = useCallback(async (data: PengeluaranFormData): Promise<Pengeluaran | null> => {
    try {
      setLoading(true)
      const newExpense = await AccountingService.createExpense(data)
      setExpenses(prev => [newExpense, ...prev])
      toast.success('Pengeluaran berhasil dibuat')
      return newExpense
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create expense'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateExpense = useCallback(async (id: string, data: Partial<PengeluaranFormData>): Promise<Pengeluaran | null> => {
    try {
      setLoading(true)
      const updatedExpense = await AccountingService.updateExpense(id, data)
      setExpenses(prev => prev.map(expense =>
        expense.id === id ? updatedExpense : expense
      ))
      toast.success('Pengeluaran berhasil diperbarui')
      return updatedExpense
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update expense'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await AccountingService.deleteExpense(id)
      setExpenses(prev => prev.filter(expense => expense.id !== id))
      toast.success('Pengeluaran berhasil dihapus')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete expense'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (options.autoLoad !== false) {
      loadExpenses()
    }
  }, [loadExpenses, options.autoLoad])

  return {
    expenses,
    loading,
    error,
    loadExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    refetch: loadExpenses
  }
}