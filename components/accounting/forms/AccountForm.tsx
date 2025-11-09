"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Akun, AkunFormData, AccountType } from "@/types/accounting";
import { useAccounts } from "@/hooks/accounting";
import {
  getDisplayCategories,
  mapEnumToDisplayCategory,
} from "@/lib/accounting-mappings";

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: "ASSET", label: "Aset" },
  { value: "LIABILITY", label: "Liabilitas" },
  { value: "EQUITY", label: "Ekuitas" },
  { value: "REVENUE", label: "Pendapatan" },
  { value: "EXPENSE", label: "Beban" },
];

interface AccountFormProps {
  account?: Akun | null;
  onSubmit: (data: AkunFormData) => Promise<void>;
  loading?: boolean;
}

export function AccountForm({
  account,
  onSubmit,
  loading = false,
}: AccountFormProps) {
  const [formData, setFormData] = useState<AkunFormData>({
    kode: "",
    nama: "",
    tipe: "ASSET",
    kategori: "",
    deskripsi: "",
  });

  // Fetch all accounts for parent selection
  const { accounts: allAccounts } = useAccounts({ autoLoad: true });

  // Filter potential parent accounts (exclude current account and its children)
  const availableParents =
    allAccounts?.filter(
      (acc) =>
        acc.id !== account?.id &&
        !account?.children?.some((child) => child.id === acc.id),
    ) || [];

  const ACCOUNT_CATEGORIES = getDisplayCategories();

  useEffect(() => {
    if (account) {
      setFormData({
        kode: account.kode,
        nama: account.nama,
        tipe: account.tipe,
        kategori:
          mapEnumToDisplayCategory(account.kategori) || account.kategori,
        parentId: account.parentId || undefined,
        deskripsi: account.deskripsi || "",
      });
    } else {
      setFormData({
        kode: "",
        nama: "",
        tipe: "ASSET",
        kategori: "",
        deskripsi: "",
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (
    field: keyof AkunFormData,
    value: string | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kode">Kode Akun *</Label>
          <Input
            id="kode"
            value={formData.kode}
            onChange={(e) => handleInputChange("kode", e.target.value)}
            placeholder="Contoh: 1001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nama">Nama Akun *</Label>
          <Input
            id="nama"
            value={formData.nama}
            onChange={(e) => handleInputChange("nama", e.target.value)}
            placeholder="Contoh: Kas Kecil"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipe">Tipe Akun *</Label>
          <Select
            value={formData.tipe}
            onValueChange={(value) => handleInputChange("tipe", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tipe akun" />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {ACCOUNT_CATEGORIES.filter(
                (category) => category && category.trim() !== "",
              ).map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentId">Akun Induk (Opsional)</Label>
        <Select
          value={formData.parentId || "none"}
          onValueChange={(value) =>
            handleInputChange("parentId", value === "none" ? undefined : value)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih akun induk (kosongkan jika akun utama)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Tidak ada akun induk</SelectItem>
            {availableParents.map((parentAccount) => (
              <SelectItem key={parentAccount.id} value={parentAccount.id}>
                {parentAccount.kode} - {parentAccount.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <Textarea
          id="deskripsi"
          value={formData.deskripsi}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleInputChange("deskripsi", e.target.value)
          }
          placeholder="Deskripsi akun (opsional)"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Menyimpan..." : account ? "Perbarui Akun" : "Buat Akun"}
      </Button>
    </form>
  );
}
