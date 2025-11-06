"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle, Calendar } from "lucide-react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

interface DashboardData {
  stats: {
    totalPenjualan: number
    totalTransaksi: number
    barangStokRendah: number
    totalBarangMasuk: number
    totalBarangKeluar: number
  }
  recentTransactions: any[]
  lowStockItems: any[]
  topSellingItems: any[]
}

export function DashboardClient() {
  const [period, setPeriod] = useState("today")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  async function fetchData() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (period === "custom" && startDate && endDate) {
        params.append("startDate", startDate)
        params.append("endDate", endDate)
      } else if (period !== "custom") {
        params.append("period", period)
      }

      const response = await fetch(`/api/dashboard?${params}`)
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyCustomDate = () => {
    if (startDate && endDate) {
      fetchData()
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }

  const getPeriodLabel = () => {
    if (period === "custom" && startDate && endDate) {
      return `${format(new Date(startDate), "d MMM yyyy", { locale: idLocale })} - ${format(new Date(endDate), "d MMM yyyy", { locale: idLocale })}`
    }
    switch (period) {
      case "today": return "Hari Ini"
      case "yesterday": return "Kemarin"
      case "week": return "Minggu Ini"
      case "month": return "Bulan Ini"
      case "year": return "Tahun Ini"
      default: return "Hari Ini"
    }
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filter Periode
          </CardTitle>
          <CardDescription>Pilih periode waktu atau range tanggal untuk melihat statistik</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Quick Period Selection */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Periode Cepat</label>
              <Select value={period} onValueChange={(value) => { setPeriod(value); setStartDate(""); setEndDate("") }}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="yesterday">Kemarin</SelectItem>
                  <SelectItem value="week">Minggu Ini</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                  <SelectItem value="year">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Custom Date Range */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-3 block">Atau Pilih Range Tanggal Custom</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Dari Tanggal</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setPeriod("custom")
                    }}
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">Sampai Tanggal</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setPeriod("custom")
                    }}
                    min={startDate}
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleApplyCustomDate}
                    disabled={!startDate || !endDate}
                    className="w-full sm:w-auto"
                  >
                    Terapkan
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Current Period Label */}
            <div className="flex items-center justify-center px-4 py-3 bg-primary/10 rounded-md border-2 border-primary/20">
              <span className="text-sm font-semibold text-primary">{getPeriodLabel()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Penjualan
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {data.stats.totalPenjualan.toLocaleString("id-ID")}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.stats.totalTransaksi} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Barang Stok Rendah
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.barangStokRendah}</div>
            <p className="text-xs text-muted-foreground">
              Perlu restock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Barang Masuk
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalBarangMasuk}</div>
            <p className="text-xs text-muted-foreground">
              Periode ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Barang Keluar
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalBarangKeluar}</div>
            <p className="text-xs text-muted-foreground">
              Periode ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Low Stock */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terakhir</CardTitle>
            <CardDescription>5 transaksi kasir terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada transaksi pada periode ini</p>
              ) : (
                data.recentTransactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="border-b pb-3 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium">{transaction.nomorTransaksi}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.kasir.nama}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {transaction.metodePembayaran === "tunai" ? "💵 Tunai" : "💳 Kartu"}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          Rp {transaction.total.toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.tanggal).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    {transaction.itemTransaksi && transaction.itemTransaksi.length > 0 && (
                      <div className="text-xs text-muted-foreground pl-2 border-l-2 border-gray-200">
                        {transaction.itemTransaksi.map((item: any) => (
                          <div key={item.id} className="flex justify-between py-0.5">
                            <span>{item.barang.nama}</span>
                            <span>{item.qty}x @ Rp {item.hargaSatuan.toLocaleString("id-ID")}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stok Rendah</CardTitle>
            <CardDescription>Barang yang perlu direstock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Semua stok aman</p>
              ) : (
                data.lowStockItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.lokasi.namaLokasi}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">
                        {item.stok} {item.satuan}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {item.stokMinimum}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Barang Terlaris</CardTitle>
          <CardDescription>Top 5 barang dengan penjualan tertinggi pada periode ini</CardDescription>
        </CardHeader>
        <CardContent>
          {data.topSellingItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data penjualan pada periode ini</p>
          ) : (
            <div className="space-y-4">
              {data.topSellingItems.map((item: any, index: number) => {
                const maxJumlah = data.topSellingItems[0]?.jumlah || 1
                const percentage = (item.jumlah / maxJumlah) * 100
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium">{item.nama}</span>
                      </div>
                      <span className="font-bold">{item.jumlah} terjual</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
