import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { DollarSign, ShoppingCart, Package, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react"
import { startOfDay, endOfDay } from "date-fns"

async function getDashboardStats() {
  const today = new Date()
  const startOfToday = startOfDay(today)
  const endOfToday = endOfDay(today)

  // Total penjualan hari ini
  const penjualanHariIni = await prisma.transaksiKasir.aggregate({
    where: {
      tanggal: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    _sum: {
      total: true,
    },
    _count: true,
  })

  // Barang dengan stok rendah
  const barangStokRendah = await prisma.barang.count({
    where: {
      stok: {
        lte: prisma.barang.fields.stokMinimum,
      },
    },
  })

  // Transaksi barang masuk hari ini
  const barangMasukHariIni = await prisma.transaksiMasuk.count({
    where: {
      tanggal: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  })

  // Transaksi barang keluar hari ini
  const barangKeluarHariIni = await prisma.transaksiKeluar.count({
    where: {
      tanggal: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
  })

  return {
    totalPenjualanHariIni: penjualanHariIni._sum.total || 0,
    totalTransaksiHariIni: penjualanHariIni._count,
    barangStokRendah,
    totalBarangMasuk: barangMasukHariIni,
    totalBarangKeluar: barangKeluarHariIni,
  }
}

async function getRecentTransactions() {
  return await prisma.transaksiKasir.findMany({
    take: 5,
    orderBy: {
      tanggal: "desc",
    },
    include: {
      kasir: true,
    },
  })
}

async function getLowStockItems() {
  return await prisma.barang.findMany({
    where: {
      stok: {
        lte: prisma.barang.fields.stokMinimum,
      },
    },
    take: 5,
    include: {
      lokasi: true,
    },
    orderBy: {
      stok: "asc",
    },
  })
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const stats = await getDashboardStats()
  const recentTransactions = await getRecentTransactions()
  const lowStockItems = await getLowStockItems()

  return (
    <div className="flex flex-col h-full">
      <Header
        title={`Selamat Datang, ${session?.user?.name}`}
        description="Dashboard - Ringkasan Sistem"
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Penjualan Hari Ini
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {stats.totalPenjualanHariIni.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalTransaksiHariIni} transaksi
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
              <div className="text-2xl font-bold">{stats.barangStokRendah}</div>
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
              <div className="text-2xl font-bold">{stats.totalBarangMasuk}</div>
              <p className="text-xs text-muted-foreground">
                Hari ini
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
              <div className="text-2xl font-bold">{stats.totalBarangKeluar}</div>
              <p className="text-xs text-muted-foreground">
                Hari ini
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
                {recentTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
                ) : (
                  recentTransactions.map((transaction: any) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{transaction.nomorTransaksi}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.kasir.nama}
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
                {lowStockItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Semua stok aman</p>
                ) : (
                  lowStockItems.map((item: any) => (
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
      </div>
    </div>
  )
}

