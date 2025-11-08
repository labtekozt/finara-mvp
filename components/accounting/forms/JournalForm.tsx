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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2 } from "lucide-react"
import { JurnalEntry, JurnalFormData, JurnalDetailForm, Akun } from "@/types/accounting"
import { useAccounts } from "@/hooks/accounting"

interface JournalFormProps {
  entry?: JurnalEntry | null
  onSubmit: (data: JurnalFormData) => Promise<void>
  loading?: boolean
}

const REFERENCE_TYPES = [
  { value: "SALE", label: "Penjualan" },
  { value: "PURCHASE", label: "Pembelian" },
  { value: "PAYMENT", label: "Pembayaran" },
  { value: "RECEIPT", label: "Penerimaan" },
  { value: "ADJUSTMENT", label: "Penyesuaian" },
  { value: "OTHER", label: "Lainnya" }
]

export function JournalForm({ entry, onSubmit, loading = false }: JournalFormProps) {
  const { accounts } = useAccounts({ autoLoad: true })

  const [formData, setFormData] = useState<JurnalFormData>({
    nomorJurnal: "",
    tanggal: new Date().toISOString().split('T')[0],
    deskripsi: "",
    referensi: "",
    tipeReferensi: "OTHER",
    periodeId: "",
    details: [
      { akunId: undefined, debit: 0, kredit: 0, deskripsi: "" },
      { akunId: undefined, debit: 0, kredit: 0, deskripsi: "" }
    ]
  })

  useEffect(() => {
    if (entry) {
      setFormData({
        nomorJurnal: entry.nomorJurnal,
        tanggal: entry.tanggal.split('T')[0],
        deskripsi: entry.deskripsi,
        referensi: entry.referensi || "",
        tipeReferensi: entry.tipeReferensi || "OTHER",
        periodeId: entry.periodeId,
        details: entry.details.map(detail => ({
          akunId: detail.akunId,
          debit: detail.debit,
          kredit: detail.kredit,
          deskripsi: detail.deskripsi
        }))
      })
    } else {
      // Reset form for new entry
      setFormData({
        nomorJurnal: "",
        tanggal: new Date().toISOString().split('T')[0],
        deskripsi: "",
        referensi: "",
        tipeReferensi: "OTHER",
        periodeId: "",
        details: [
          { akunId: undefined, debit: 0, kredit: 0, deskripsi: "" },
          { akunId: undefined, debit: 0, kredit: 0, deskripsi: "" }
        ]
      })
    }
  }, [entry])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that debit equals credit
    const totalDebit = formData.details.reduce((sum, detail) => sum + detail.debit, 0)
    const totalKredit = formData.details.reduce((sum, detail) => sum + detail.kredit, 0)

    if (totalDebit !== totalKredit) {
      alert("Total debit harus sama dengan total kredit")
      return
    }

    // Filter out empty details
    const validDetails = formData.details.filter(
      detail => detail.akunId && (detail.debit > 0 || detail.kredit > 0)
    )

    if (validDetails.length < 2) {
      alert("Minimal 2 detail jurnal diperlukan")
      return
    }

    await onSubmit({
      ...formData,
      details: validDetails
    })
  }

  const handleInputChange = (field: keyof JurnalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDetailChange = (index: number, field: keyof JurnalDetailForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      )
    }))
  }

  const addDetail = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { akunId: undefined, debit: 0, kredit: 0, deskripsi: "" }]
    }))
  }

  const removeDetail = (index: number) => {
    if (formData.details.length > 2) {
      setFormData(prev => ({
        ...prev,
        details: prev.details.filter((_, i) => i !== index)
      }))
    }
  }

  const totalDebit = formData.details.reduce((sum, detail) => sum + detail.debit, 0)
  const totalKredit = formData.details.reduce((sum, detail) => sum + detail.kredit, 0)
  const isBalanced = totalDebit === totalKredit

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Journal Header */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nomorJurnal">Nomor Jurnal</Label>
          <Input
            id="nomorJurnal"
            value={formData.nomorJurnal}
            onChange={(e) => handleInputChange("nomorJurnal", e.target.value)}
            placeholder="Auto-generated if empty"
          />
        </div>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi *</Label>
        <Textarea
          id="deskripsi"
          value={formData.deskripsi}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("deskripsi", e.target.value)}
          placeholder="Deskripsi transaksi jurnal"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="referensi">Referensi</Label>
          <Input
            id="referensi"
            value={formData.referensi}
            onChange={(e) => handleInputChange("referensi", e.target.value)}
            placeholder="Nomor referensi (opsional)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipeReferensi">Tipe Referensi</Label>
          <Select
            value={formData.tipeReferensi}
            onValueChange={(value) => handleInputChange("tipeReferensi", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REFERENCE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Journal Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Detail Jurnal</Label>
          <Button type="button" variant="outline" size="sm" onClick={addDetail}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Baris
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Akun</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Kredit</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.details.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={detail.akunId || ""}
                      onValueChange={(value) => handleDetailChange(index, "akunId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih akun" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.kode} - {account.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={detail.deskripsi}
                      onChange={(e) => handleDetailChange(index, "deskripsi", e.target.value)}
                      placeholder="Deskripsi detail"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={detail.debit || ""}
                      onChange={(e) => handleDetailChange(index, "debit", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={detail.kredit || ""}
                      onChange={(e) => handleDetailChange(index, "kredit", parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell>
                    {formData.details.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDetail(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* Totals Row */}
              <TableRow className="bg-muted/50 font-medium">
                <TableCell colSpan={2} className="text-right">
                  Total
                </TableCell>
                <TableCell className="text-right">
                  Rp {totalDebit.toLocaleString('id-ID')}
                </TableCell>
                <TableCell className="text-right">
                  Rp {totalKredit.toLocaleString('id-ID')}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Balance Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label className="text-sm font-medium">Status Keseimbangan</Label>
            <p className="text-sm text-muted-foreground">
              Debit harus sama dengan Kredit
            </p>
          </div>
          <Badge variant={isBalanced ? "default" : "destructive"}>
            {isBalanced ? "Seimbang" : "Tidak Seimbang"}
          </Badge>
        </div>
      </div>

      <Button type="submit" disabled={loading || !isBalanced} className="w-full">
        {loading ? "Menyimpan..." : (entry ? "Perbarui Jurnal" : "Buat Jurnal")}
      </Button>
    </form>
  )
}