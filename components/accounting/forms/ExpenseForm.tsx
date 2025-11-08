"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pengeluaran, PengeluaranFormData, ExpenseCategory, PaymentMethod } from "@/types/accounting"

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "GAJI", label: "Gaji" },
  { value: "UTILITAS", label: "Utilitas" },
  { value: "SEWA", label: "Sewa" },
  { value: "PERLENGKAPAN", label: "Perlengkapan" },
  { value: "LAINNYA", label: "Lainnya" }
]

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "tunai", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "cek", label: "Cek" },
  { value: "kartu_kredit", label: "Kartu Kredit" }
]

interface ExpenseFormProps {
  expense?: Pengeluaran | null
  onSubmit: (data: PengeluaranFormData) => Promise<void>
  loading?: boolean
}

export function ExpenseForm({ expense, onSubmit, loading = false }: ExpenseFormProps) {
  const [formData, setFormData] = useState<PengeluaranFormData>({
    tanggal: new Date().toISOString().split('T')[0],
    kategori: "LAINNYA",
    deskripsi: "",
    jumlah: 0,
    penerima: "",
    metodePembayaran: "tunai",
    catatan: ""
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        tanggal: expense.tanggal.split('T')[0],
        kategori: expense.kategori as ExpenseCategory,
        deskripsi: expense.deskripsi,
        jumlah: expense.jumlah,
        penerima: expense.penerima,
        metodePembayaran: expense.metodePembayaran as PaymentMethod,
        catatan: expense.catatan || ""
      })
    } else {
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        kategori: "LAINNYA",
        deskripsi: "",
        jumlah: 0,
        penerima: "",
        metodePembayaran: "tunai",
        catatan: ""
      })
    }
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleInputChange = (field: keyof PengeluaranFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tanggal">Tanggal *</Label>
          <Input
            id="tanggal"
            type="date"
            value={formData.tanggal}
            onChange={(e) => handleInputChange("tanggal", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kategori">Kategori *</Label>
          <Select
            value={formData.kategori}
            onValueChange={(value) => handleInputChange("kategori", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi *</Label>
        <Textarea
          id="deskripsi"
          value={formData.deskripsi}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("deskripsi", e.target.value)}
          placeholder="Deskripsi pengeluaran"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="penerima">Penerima *</Label>
          <Input
            id="penerima"
            value={formData.penerima}
            onChange={(e) => handleInputChange("penerima", e.target.value)}
            placeholder="Nama penerima"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="jumlah">Jumlah (Rp) *</Label>
          <Input
            id="jumlah"
            type="number"
            min="0"
            step="0.01"
            value={formData.jumlah || ""}
            onChange={(e) => handleInputChange("jumlah", parseFloat(e.target.value) || 0)}
            placeholder="0"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metodePembayaran">Metode Pembayaran *</Label>
        <Select
          value={formData.metodePembayaran}
          onValueChange={(value) => handleInputChange("metodePembayaran", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih metode pembayaran" />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method.value} value={method.value}>
                {method.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="catatan">Catatan</Label>
        <Textarea
          id="catatan"
          value={formData.catatan}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("catatan", e.target.value)}
          placeholder="Catatan tambahan (opsional)"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Menyimpan..." : (expense ? "Perbarui Pengeluaran" : "Buat Pengeluaran")}
      </Button>
    </form>
  )
}