"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface Barang {
  id: string
  nama: string
  sku?: string
  kategori: string
  stok: number
  stokMinimum: number
  hargaBeli: number
  hargaJual: number
  satuan: string
  deskripsi?: string
  lokasiId: string
  lokasi: {
    id: string
    namaLokasi: string
  }
}

interface Lokasi {
  id: string
  namaLokasi: string
  alamat?: string
}

export default function InventarisPage() {
  const [barang, setBarang] = useState<Barang[]>([])
  const [lokasi, setLokasi] = useState<Lokasi[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [kategoriFilter, setKategoriFilter] = useState("")
  const [lokasiFilter, setLokasiFilter] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Barang | null>(null)
  const [formData, setFormData] = useState({
    nama: "",
    sku: "",
    kategori: "",
    stok: 0,
    stokMinimum: 10,
    hargaBeli: 0,
    hargaJual: 0,
    satuan: "pcs",
    deskripsi: "",
    lokasiId: "",
  })

  useEffect(() => {
    fetchData()
  }, [search, kategoriFilter, lokasiFilter])

  async function fetchData() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (kategoriFilter) params.append("kategori", kategoriFilter)
      if (lokasiFilter) params.append("lokasiId", lokasiFilter)

      const [barangRes, lokasiRes] = await Promise.all([
        fetch(`/api/barang?${params}`),
        fetch("/api/lokasi"),
      ])

      const barangData = await barangRes.json()
      const lokasiData = await lokasiRes.json()

      setBarang(barangData)
      setLokasi(lokasiData)
    } catch (error) {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      const url = editingItem ? `/api/barang/${editingItem.id}` : "/api/barang"
      const method = editingItem ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Gagal menyimpan data")
      }

      toast.success(editingItem ? "Barang berhasil diupdate" : "Barang berhasil ditambahkan")
      setDialogOpen(false)
      resetForm()
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus barang ini?")) return

    try {
      const response = await fetch(`/api/barang/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Gagal menghapus barang")

      toast.success("Barang berhasil dihapus")
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  function openEditDialog(item: Barang) {
    setEditingItem(item)
    setFormData({
      nama: item.nama,
      sku: item.sku || "",
      kategori: item.kategori,
      stok: item.stok,
      stokMinimum: item.stokMinimum,
      hargaBeli: item.hargaBeli,
      hargaJual: item.hargaJual,
      satuan: item.satuan,
      deskripsi: item.deskripsi || "",
      lokasiId: item.lokasiId,
    })
    setDialogOpen(true)
  }

  function resetForm() {
    setEditingItem(null)
    setFormData({
      nama: "",
      sku: "",
      kategori: "",
      stok: 0,
      stokMinimum: 10,
      hargaBeli: 0,
      hargaJual: 0,
      satuan: "pcs",
      deskripsi: "",
      lokasiId: "",
    })
  }

  const kategoriList = Array.from(new Set(barang.map(item => item.kategori)))

  return (
    <div className="flex flex-col h-full">
      <Header title="Inventaris" description="Kelola data barang dan stok" />

      <div className="flex-1 p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Pencarian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau SKU..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Kategori</SelectItem>
                  {kategoriList.map((kat) => (
                    <SelectItem key={kat} value={kat}>
                      {kat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={lokasiFilter} onValueChange={setLokasiFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Semua Lokasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Lokasi</SelectItem>
                  {lokasi.map((lok) => (
                    <SelectItem key={lok.id} value={lok.id}>
                      {lok.namaLokasi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Barang
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Barang</CardTitle>
            <CardDescription>
              Total: {barang.length} barang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Harga Beli</TableHead>
                    <TableHead>Harga Jual</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : barang.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Tidak ada data
                      </TableCell>
                    </TableRow>
                  ) : (
                    barang.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.stok <= item.stokMinimum && (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            )}
                            {item.nama}
                          </div>
                        </TableCell>
                        <TableCell>{item.sku || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.kategori}</Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              item.stok <= item.stokMinimum
                                ? "text-red-600 font-semibold"
                                : ""
                            }
                          >
                            {item.stok} {item.satuan}
                          </span>
                        </TableCell>
                        <TableCell>
                          Rp {item.hargaBeli.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          Rp {item.hargaJual.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>{item.lokasi.namaLokasi}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open: boolean) => {
        setDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Barang" : "Tambah Barang Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk {editingItem ? "mengupdate" : "menambahkan"} barang
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Barang *</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kategori">Kategori *</Label>
                  <Input
                    id="kategori"
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="satuan">Satuan *</Label>
                  <Input
                    id="satuan"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stok">Stok Awal *</Label>
                  <Input
                    id="stok"
                    type="number"
                    value={formData.stok}
                    onChange={(e) => setFormData({ ...formData, stok: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stokMinimum">Stok Minimum *</Label>
                  <Input
                    id="stokMinimum"
                    type="number"
                    value={formData.stokMinimum}
                    onChange={(e) => setFormData({ ...formData, stokMinimum: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hargaBeli">Harga Beli *</Label>
                  <Input
                    id="hargaBeli"
                    type="number"
                    value={formData.hargaBeli}
                    onChange={(e) => setFormData({ ...formData, hargaBeli: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hargaJual">Harga Jual *</Label>
                  <Input
                    id="hargaJual"
                    type="number"
                    value={formData.hargaJual}
                    onChange={(e) => setFormData({ ...formData, hargaJual: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lokasiId">Lokasi *</Label>
                <Select
                  value={formData.lokasiId}
                  onValueChange={(value: string) => setFormData({ ...formData, lokasiId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih lokasi" />
                  </SelectTrigger>
                  <SelectContent>
                    {lokasi.map((lok) => (
                      <SelectItem key={lok.id} value={lok.id}>
                        {lok.namaLokasi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <Input
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {editingItem ? "Update" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

