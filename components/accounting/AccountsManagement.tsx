"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import { useAccounts } from "@/hooks/accounting"
import { Akun, AkunFormData, AccountType } from "@/types/accounting"
import { AccountForm } from "./forms/AccountForm"

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "ASSET", label: "Aset" },
  { value: "LIABILITY", label: "Liabilitas" },
  { value: "EQUITY", label: "Ekuitas" },
  { value: "REVENUE", label: "Pendapatan" },
  { value: "EXPENSE", label: "Beban" }
]

const ACCOUNT_CATEGORIES = [
  "Kas & Bank",
  "Piutang",
  "Persediaan",
  "Aktiva Tetap",
  "Utang",
  "Ekuitas",
  "Pendapatan",
  "Beban Operasional",
  "Beban Lainnya"
]

interface AccountsManagementProps {
  className?: string
}

export function AccountsManagement({ className }: AccountsManagementProps) {
  const [filterTipe, setFilterTipe] = useState<string>("ALL")
  const [filterKategori, setFilterKategori] = useState<string>("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Akun | null>(null)

  const {
    accounts,
    loading,
    createAccount,
    updateAccount,
    deleteAccount
  } = useAccounts({
    tipe: filterTipe === "ALL" ? undefined : filterTipe,
    kategori: filterKategori === "ALL" ? undefined : filterKategori,
    search: searchTerm || undefined
  })

  const handleCreateAccount = async (data: AkunFormData) => {
    const result = await createAccount(data)
    if (result) {
      setIsDialogOpen(false)
    }
  }

  const handleUpdateAccount = async (data: AkunFormData) => {
    if (editingAccount) {
      const result = await updateAccount(editingAccount.id, data)
      if (result) {
        setIsDialogOpen(false)
        setEditingAccount(null)
      }
    }
  }

  const handleDeleteAccount = async (account: Akun) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun "${account.nama}"?`)) {
      await deleteAccount(account.id)
    }
  }

  const openEditDialog = (account: Akun) => {
    setEditingAccount(account)
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingAccount(null)
    setIsDialogOpen(true)
  }

  const getAccountTypeLabel = (tipe: AccountType) => {
    return ACCOUNT_TYPES.find(t => t.value === tipe)?.label || tipe
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Daftar Akun</h3>
          <p className="text-sm text-muted-foreground">
            Kelola chart of accounts untuk sistem akuntansi
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Akun
        </Button>
      </div>

      {/* Filters */}
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Cari Akun</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan kode atau nama..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full sm:w-40">
              <Label htmlFor="tipe">Tipe Akun</Label>
              <Select value={filterTipe} onValueChange={setFilterTipe}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Tipe</SelectItem>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Label htmlFor="kategori">Kategori</Label>
              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kategori</SelectItem>
                  {ACCOUNT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card className="mt-4">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Memuat akun...</div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Belum ada akun</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tambahkan akun pertama untuk memulai
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Akun Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Akun</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.kode}</TableCell>
                    <TableCell>{account.nama}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getAccountTypeLabel(account.tipe)}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.kategori}</TableCell>
                    <TableCell>
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? "Aktif" : "Tidak Aktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccount(account)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Account Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? 'Perbarui informasi akun yang dipilih'
                : 'Buat akun baru untuk chart of accounts'
              }
            </DialogDescription>
          </DialogHeader>

          <AccountForm
            account={editingAccount}
            onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
            loading={loading}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}