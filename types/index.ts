import { UserRole } from "@prisma/client";

export type { UserRole };

export interface DashboardStats {
  totalPenjualanHariIni: number;
  totalTransaksiHariIni: number;
  barangStokRendah: number;
  totalBarangMasuk: number;
  totalBarangKeluar: number;
}

export interface CartItem {
  id: string;
  barangId: string;
  nama: string;
  hargaJual: number;
  qty: number;
  stok: number;
  subtotal: number;
}

export interface TransaksiKasirForm {
  items: CartItem[];
  subtotal: number;
  pajak: number;
  diskon: number;
  total: number;
  metodePembayaran: string;
  jumlahBayar: number;
  kembalian: number;
  catatan?: string;
}

export interface BarangForm {
  nama: string;
  sku?: string;
  kategori: string;
  stok: number;
  stokMinimum: number;
  hargaBeli: number;
  hargaJual: number;
  satuan: string;
  deskripsi?: string;
  lokasiId: string;
}

export interface TransaksiMasukForm {
  barangId: string;
  qty: number;
  hargaBeli: number;
  sumber: string;
  lokasiId: string;
  keterangan?: string;
}

export interface TransaksiKeluarForm {
  barangId: string;
  qty: number;
  tujuan: string;
  lokasiId: string;
  keterangan?: string;
}

// Re-export accounting types
export * from "./accounting";
