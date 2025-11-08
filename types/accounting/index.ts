export interface PeriodeAkuntansi {
  id: string
  nama: string
  tanggalMulai: string
  tanggalAkhir: string
  isActive: boolean
  isClosed: boolean
}

export interface DashboardStats {
  totalAkun: number
  totalJurnal: number
  periodeAktif: string
  isBalanced: boolean
}

export interface Akun {
  id: string
  kode: string
  nama: string
  tipe: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
  kategori: string
  parentId?: string
  level: number
  isActive: boolean
  deskripsi?: string
  parent?: Akun
  children?: Akun[]
  _count?: {
    jurnalEntries: number
  }
}

export interface AkunFormData {
  kode: string
  nama: string
  tipe: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
  kategori: string
  parentId?: string
  deskripsi?: string
}

export interface JurnalEntry {
  id: string
  nomorJurnal: string
  tanggal: string
  deskripsi: string
  referensi?: string
  tipeReferensi?: string
  periodeId: string
  userId: string
  isPosted: boolean
  periode: PeriodeAkuntansi
  user: {
    id: string
    name: string
  }
  details: JurnalDetail[]
}

export interface JurnalDetail {
  id: string
  akunId: string
  debit: number
  kredit: number
  deskripsi: string
  akun: Akun
}

export interface JurnalFormData {
  nomorJurnal: string
  tanggal: string
  deskripsi: string
  referensi: string
  tipeReferensi: string
  periodeId: string
  details: JurnalDetailForm[]
}

export interface JurnalDetailForm {
  akunId?: string
  debit: number
  kredit: number
  deskripsi: string
}

export interface Pengeluaran {
  id: string
  tanggal: string
  kategori: string
  deskripsi: string
  jumlah: number
  penerima: string
  metodePembayaran: string
  catatan?: string
  userId: string
  user: {
    id: string
    name: string
  }
}

export interface PengeluaranFormData {
  tanggal: string
  kategori: string
  deskripsi: string
  jumlah: number
  penerima: string
  metodePembayaran: string
  catatan: string
}

export interface AccumulationData {
  period: string
  totalDebit: number
  totalKredit: number
  transactionCount: number
  isBalanced: boolean
}

export type AccumulationPeriod = "daily" | "monthly" | "yearly"
export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
export type ExpenseCategory = "GAJI" | "UTILITAS" | "SEWA" | "PERLENGKAPAN" | "LAINNYA"
export type PaymentMethod = "tunai" | "transfer" | "cek" | "kartu_kredit"