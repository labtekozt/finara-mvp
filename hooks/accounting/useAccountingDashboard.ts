import { useState, useEffect, useCallback } from 'react'
import { PeriodeAkuntansi, DashboardStats } from '@/types/accounting'
import { AccountingService } from '@/services/accounting'
import { toast } from 'sonner'

export function useAccountingDashboard() {
  const [periods, setPeriods] = useState<PeriodeAkuntansi[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load periods and stats in parallel
      const [periodsData, statsData] = await Promise.all([
        AccountingService.getPeriods(),
        AccountingService.getDashboardStats()
      ])

      setPeriods(periodsData)
      setStats(statsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createPeriod = useCallback(async (data: Omit<PeriodeAkuntansi, 'id'>): Promise<PeriodeAkuntansi | null> => {
    try {
      const newPeriod = await AccountingService.createPeriod(data)
      setPeriods(prev => [...prev, newPeriod])
      toast.success('Periode akuntansi berhasil dibuat')
      return newPeriod
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create period'
      toast.error(errorMessage)
      return null
    }
  }, [])

  const updatePeriod = useCallback(async (id: string, data: Partial<PeriodeAkuntansi>): Promise<PeriodeAkuntansi | null> => {
    try {
      const updatedPeriod = await AccountingService.updatePeriod(id, data)
      setPeriods(prev => prev.map(period =>
        period.id === id ? updatedPeriod : period
      ))
      toast.success('Periode akuntansi berhasil diperbarui')
      return updatedPeriod
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update period'
      toast.error(errorMessage)
      return null
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  return {
    periods,
    stats,
    loading,
    error,
    loadDashboard,
    createPeriod,
    updatePeriod,
    refetch: loadDashboard
  }
}