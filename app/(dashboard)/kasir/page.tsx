"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Trash2, ShoppingCart, Search, Receipt, ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "sonner"
import { CartItem } from "@/types"

interface Barang {
  id: string
  nama: string
  kategori: string
  stok: number
  hargaJual: number
  satuan: string
}

export default function KasirPage() {
  const [barang, setBarang] = useState<Barang[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [metodePembayaran, setMetodePembayaran] = useState("tunai")
  const [jumlahBayar, setJumlahBayar] = useState(0)
  const [receiptDialog, setReceiptDialog] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ barangId: string; nama: string } | null>(null)
  const [deleteAllDialog, setDeleteAllDialog] = useState(false)
  const [jumlahBayarDisplay, setJumlahBayarDisplay] = useState("")
  const [confirmPaymentDialog, setConfirmPaymentDialog] = useState(false)
  const [cartMinimized, setCartMinimized] = useState(false)

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const pajak = 0 // 10% tax
  const diskon = 0
  const total = subtotal + pajak - diskon
  const kembalian = jumlahBayar - total

  // Format number to Rupiah (with thousand separators)
  function formatRupiah(value: number): string {
    if (value === 0) return ""
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  // Parse Rupiah format to number
  function parseRupiah(value: string): number {
    const cleanValue = value.replace(/\./g, "")
    return parseInt(cleanValue) || 0
  }

  // Handle payment input change
  function handleJumlahBayarChange(value: string) {
    // Remove all non-digit characters except dots
    const cleanValue = value.replace(/[^\d]/g, "")
    
    if (cleanValue === "") {
      setJumlahBayar(0)
      setJumlahBayarDisplay("")
      return
    }

    const numericValue = parseInt(cleanValue)
    setJumlahBayar(numericValue)
    setJumlahBayarDisplay(formatRupiah(numericValue))
  }

  useEffect(() => {
    fetchBarang()
  }, [])

  async function fetchBarang() {
    try {
      const response = await fetch("/api/barang")
      const data = await response.json()
      setBarang(data)
    } catch (error) {
      toast.error("Gagal memuat data barang")
    }
  }

  function addToCart(item: Barang) {
    const existing = cart.find((c) => c.barangId === item.id)

    if (existing) {
      if (existing.qty >= item.stok) {
        toast.error(`Stok ${item.nama} tidak cukup`)
        return
      }
      updateQuantity(item.id, existing.qty + 1)
    } else {
      if (item.stok < 1) {
        toast.error(`Stok ${item.nama} habis`)
        return
      }
      setCart([
        ...cart,
        {
          id: Math.random().toString(),
          barangId: item.id,
          nama: item.nama,
          hargaJual: item.hargaJual,
          qty: 1,
          stok: item.stok,
          subtotal: item.hargaJual,
        },
      ])
      toast.success(`${item.nama} ditambahkan ke keranjang`)
    }
  }

  function updateQuantity(barangId: string, newQty: number) {
    const item = cart.find((c) => c.barangId === barangId)
    if (!item) return

    if (newQty <= 0) {
      // Open confirmation dialog instead of directly removing
      openDeleteDialog(barangId, item.nama)
      return
    }

    if (newQty > item.stok) {
      toast.error("Jumlah melebihi stok tersedia")
      return
    }

    setCart(
      cart.map((c) =>
        c.barangId === barangId
          ? { ...c, qty: newQty, subtotal: c.hargaJual * newQty }
          : c
      )
    )
  }

  function openDeleteDialog(barangId: string, nama: string) {
    setItemToDelete({ barangId, nama })
    setDeleteDialog(true)
  }

  function removeFromCart(barangId: string) {
    setCart(cart.filter((c) => c.barangId !== barangId))
    setDeleteDialog(false)
    setItemToDelete(null)
    toast.success("Item berhasil dihapus dari keranjang")
  }

  function openDeleteAllDialog() {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong")
      return
    }
    setDeleteAllDialog(true)
  }

  function clearAllCart() {
    setCart([])
    setDeleteAllDialog(false)
    setJumlahBayar(0)
    setJumlahBayarDisplay("")
    toast.success("Semua item berhasil dihapus dari keranjang")
  }

  function openConfirmPayment() {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong")
      return
    }

    if (jumlahBayar < total) {
      toast.error("Jumlah bayar kurang dari total")
      return
    }

    setConfirmPaymentDialog(true)
  }

  async function handleCheckout() {
    setConfirmPaymentDialog(false)
    setLoading(true)
    try {
      const response = await fetch("/api/transaksi-kasir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            barangId: item.barangId,
            namaBarang: item.nama,
            hargaSatuan: item.hargaJual,
            qty: item.qty,
            subtotal: item.subtotal,
          })),
          subtotal,
          pajak,
          diskon,
          total,
          metodePembayaran,
          jumlahBayar,
          kembalian,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Gagal memproses transaksi")
      }

      const transaction = await response.json()
      setLastTransaction(transaction)
      setReceiptDialog(true)

      // Reset
      setCart([])
      setJumlahBayar(0)
      setJumlahBayarDisplay("")
      fetchBarang() // Refresh stock
      toast.success("Transaksi berhasil!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredBarang = barang.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination calculations
  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBarang = filteredBarang.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  return (
    <div className="flex flex-col h-full">
      <Header title="Kasir" description="Point of Sale (POS)" />

      <div className="flex-1 p-6 bg-blue-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Product List */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Pilih Barang</CardTitle>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari barang..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="relative">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="elektronik">Elektronik</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="makanan">Makanan</SelectItem>
                        <SelectItem value="minuman">Minuman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    {/* sorting barang */}
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sortir berdasarkan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nama">Nama</SelectItem>
                        <SelectItem value="harga">Harga</SelectItem>
                        <SelectItem value="stok">Stok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
              {paginatedBarang.length === 0 && (
                    <div className="text-center text-muted-foreground py-8 flex items-center justify-center gap-2">
                      <span>Tidak ada barang "{search}" yang ditemukan</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSearch("")}
                        className="mt-2 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {paginatedBarang.map((item) => {
                    const cartItem = cart.find((c) => c.barangId === item.id)
                    const isInCart = !!cartItem
                    
                    return (
                      <Card
                        key={item.id}
                        className={`cursor-pointer transition-colors relative ${
                          isInCart 
                            ? "border-2 border-blue-400 bg-green-50/50 hover:bg-green-100/50" 
                            : "hover:bg-accent"
                        }`}
                        onClick={() => addToCart(item)}
                      >
                        {isInCart && (
                          <div className="absolute top-2 right-2 bg-blue-400 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                            {cartItem.qty}
                          </div>
                        )}
                        <CardContent className="p-3">
                          <div className="font-medium text-xl mb-1">{item.nama}</div>
                          <div className="text-2xl font-bold text-primary mb-1">
                            Rp {item.hargaJual.toLocaleString("id-ID")}
                          </div>
                          <div className="flex flex-col">
                            <Badge variant="outline" className="text-xs">
                              {item.kategori}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Stok: {item.stok}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
              
              {/* Pagination - Fixed at Bottom */}
              {totalPages > 1 && (
                <div className="border-t p-4 bg-background">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        
                        // Show ellipsis
                        const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
                        const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2

                        if (showEllipsisBefore || showEllipsisAfter) {
                          return (
                            <span key={`ellipsis-${page}`} className="px-2 text-muted-foreground">
                              ...
                            </span>
                          )
                        }

                        if (!showPage) return null

                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="h-8 w-8 p-0"
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Cart & Checkout */}
          <div className="lg:col-span-1">
            <Card className="flex flex-col sticky top-5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Keranjang ({cart.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {cart.length > 0 && !cartMinimized && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={openDeleteAllDialog}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus Semua
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCartMinimized(!cartMinimized)}
                      className="hover:bg-accent"
                    >
                      {cartMinimized ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {!cartMinimized && (
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Keranjang kosong
                    </p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 border rounded-lg bg-white"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.nama}</div>
                          <div className="text-xs text-muted-foreground">
                            Rp {item.hargaJual.toLocaleString("id-ID")} / {item.qty}x
                          </div>
                          <div className="text-sm font-bold">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateQuantity(item.barangId, parseInt(e.target.value))}
                            className="w-16 text-center text-sm font-medium"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => openDeleteDialog(item.barangId, item.nama)}
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-xl font-bold">Total:</span>
                      <span className="text-xl font-bold">Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                    <Separator />
                  </div>

                  {cart.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="bayar">Jumlah Bayar</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                        Rp
                      </span>
                      <Input
                        id="bayar"
                        type="text"
                        inputMode="numeric"
                        value={jumlahBayarDisplay}
                        onChange={(e) => handleJumlahBayarChange(e.target.value)}
                        placeholder="0"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  )}

                  {jumlahBayar > 0 && (
                    <div className="flex flex-col justify-between text-sm">
                      <span>Kembalian:</span>
                      <span className={kembalian < 0 ? "text-red-600 text-xl" : "text-green-600 text-xl"}>
                        Rp {kembalian.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={openConfirmPayment}
                    disabled={loading || cart.length === 0 || kembalian < 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Bayar
                  </Button>
                </div>
              </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Dialog */}
      <Dialog open={confirmPaymentDialog} onOpenChange={setConfirmPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription>
              Pastikan semua detail pembayaran sudah benar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {cart.length} item dalam keranjang
                  </div>
                  <div className="text-xs text-blue-600">
                    Pastikan jumlah dan pembayaran sudah benar
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Items Summary */}
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50">
              <div className="text-xs font-medium text-gray-700 mb-2">Rincian Belanja:</div>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b last:border-0">
                  <div className="flex-1">
                    <span className="font-medium">{item.nama}</span>
                    <span className="text-gray-500 text-xs ml-2">x{item.qty}</span>
                  </div>
                  <span className="font-medium">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>

            {/* Payment Details */}
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Belanja:</span>
                <span className="font-bold text-lg">Rp {total.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Jumlah Bayar:</span>
                <span className="font-bold text-lg text-blue-600">Rp {jumlahBayar.toLocaleString("id-ID")}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-600">Kembalian:</span>
                <span className="font-bold text-xl text-green-600">Rp {kembalian.toLocaleString("id-ID")}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmPaymentDialog(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                className="flex-1"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Memproses...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Konfirmasi Bayar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus item ini dari keranjang?
            </DialogDescription>
          </DialogHeader>
          {itemToDelete && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="font-medium text-sm text-gray-900">
                      {itemToDelete.nama}
                    </div>
                    <div className="text-xs text-red-600">
                      Item akan dihapus dari keranjang
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setDeleteDialog(false)
                    setItemToDelete(null)
                  }}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => removeFromCart(itemToDelete.barangId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog open={deleteAllDialog} onOpenChange={setDeleteAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Semua</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus semua item dari keranjang?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-3">
                <Trash2 className="h-8 w-8 text-red-600" />
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {cart.length} item akan dihapus
                  </div>
                  <div className="text-xs text-red-600">
                    Tindakan ini tidak dapat dibatalkan
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
              <div className="text-xs font-medium text-gray-700 mb-2">Item yang akan dihapus:</div>
              <ul className="space-y-1">
                {cart.map((item) => (
                  <li key={item.id} className="text-xs text-gray-600 flex items-center gap-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    {item.nama} ({item.qty}x)
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteAllDialog(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={clearAllCart}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Semua
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialog} onOpenChange={setReceiptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaksi Berhasil!</DialogTitle>
            <DialogDescription>
              Transaksi telah berhasil diproses
            </DialogDescription>
          </DialogHeader>
          {lastTransaction && (
            <div className="space-y-4">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Receipt className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground mb-1">
                  No. Transaksi
                </div>
                <div className="text-lg font-bold">
                  {lastTransaction.nomorTransaksi}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-2xl">Total:</span>
                  <span className="font-bold text-2xl">
                    Rp {lastTransaction.total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-2xl">Bayar:</span>
                  <span className="font-bold text-2xl">Rp {lastTransaction.jumlahBayar.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="text-2xl">Kembalian:</span>
                  <span className="font-bold text-2xl">
                    Rp {lastTransaction.kembalian.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}





