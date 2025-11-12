"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Minus,
  Search,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { StatsGrid, StatItem, TambahEditBarangDialog, BarangKeluarDialog } from "@/components/inventory";
import { Button as StatsButton } from "@/components/ui/button";

interface Barang {
  id: string;
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
  lokasi: {
    id: string;
    namaLokasi: string;
  };
}

interface Lokasi {
  id: string;
  namaLokasi: string;
  alamat?: string;
}

interface TransaksiKeluar {
  id: string;
  nomorTransaksi: string;
  tanggal: string;
  qty: number;
  hargaBarang: number;
  totalNilai: number;
  tujuan: string;
  keterangan?: string;
  barang: Barang;
  lokasi: Lokasi;
}

interface ItemTransaksiKasir {
  id: string;
  namaBarang: string;
  qty: number;
  hargaSatuan: number;
  subtotal: number;
  barang: Barang;
}

interface TransaksiKasir {
  id: string;
  nomorTransaksi: string;
  tanggal: string;
  total: number;
  metodePembayaran: string;
  kasir: {
    id: string;
    nama: string;
    username: string;
  };
  itemTransaksi: ItemTransaksiKasir[];
}

export default function InventarisPage() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [lokasi, setLokasi] = useState<Lokasi[]>([]);
  const [transaksiKeluar, setTransaksiKeluar] = useState<TransaksiKeluar[]>([]);
  const [transaksiKasir, setTransaksiKasir] = useState<TransaksiKasir[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("ALL");
  const [lokasiFilter, setLokasiFilter] = useState("ALL");
  const [stokRendahFilter, setStokRendahFilter] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKeluarOpen, setDialogKeluarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Barang | null>(null);
  const [sortColumn, setSortColumn] = useState<string>("nama");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [startDateKeluar, setStartDateKeluar] = useState("");
  const [endDateKeluar, setEndDateKeluar] = useState("");
  const [startDateKasir, setStartDateKasir] = useState("");
  const [endDateKasir, setEndDateKasir] = useState("");
  const [sortColumnKeluar, setSortColumnKeluar] = useState<string>("tanggal");
  const [sortDirectionKeluar, setSortDirectionKeluar] = useState<
    "asc" | "desc"
  >("desc");
  const [sortColumnKasir, setSortColumnKasir] = useState<string>("tanggal");
  const [sortDirectionKasir, setSortDirectionKasir] = useState<"asc" | "desc">(
    "desc",
  );

  // Pagination states
  const [currentPageBarang, setCurrentPageBarang] = useState(1);
  const [currentPageKeluar, setCurrentPageKeluar] = useState(1);
  const [currentPageKasir, setCurrentPageKasir] = useState(1);
  const itemsPerPage = 10;

  // Mode: "new" untuk barang baru custom, "existing" untuk update stok barang existing
  const [tambahMode, setTambahMode] = useState<"new" | "existing">("existing");

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
  });

  // Form untuk tambah stok barang existing
  const [formTambahStok, setFormTambahStok] = useState({
    barangId: "",
    qty: 0,
    hargaBeli: 0,
    sumber: "",
    lokasiId: "",
    keterangan: "",
    reason: "PURCHASE" as
      | "PURCHASE"
      | "STOCK_OPNAME_SURPLUS"
      | "INTERNAL_ADJUSTMENT",
    paymentMethod: "CREDIT" as "CASH" | "CREDIT" | undefined,
  });

  // Form untuk barang keluar
  const [formKeluar, setFormKeluar] = useState({
    barangId: "",
    qty: 0,
    tujuan: "",
    lokasiId: "",
    keterangan: "",
  });

  useEffect(() => {
    fetchData();
  }, [search, kategoriFilter, lokasiFilter]);

  // Reset pagination saat filter/sort berubah
  useEffect(() => {
    setCurrentPageBarang(1);
  }, [
    search,
    kategoriFilter,
    lokasiFilter,
    stokRendahFilter,
    sortColumn,
    sortDirection,
  ]);

  useEffect(() => {
    setCurrentPageKeluar(1);
  }, [startDateKeluar, endDateKeluar, sortColumnKeluar, sortDirectionKeluar]);

  useEffect(() => {
    setCurrentPageKasir(1);
  }, [startDateKasir, endDateKasir, sortColumnKasir, sortDirectionKasir]);

  const sortedBarang = useMemo(() => {
    let filtered = [...barang];

    // Filter stok rendah jika diaktifkan
    if (stokRendahFilter) {
      filtered = filtered.filter((item) => item.stok <= item.stokMinimum);
    }

    return filtered.sort((a, b) => {
      let aValue: any = a[sortColumn as keyof Barang];
      let bValue: any = b[sortColumn as keyof Barang];

      if (sortColumn === "lokasi") {
        aValue = a.lokasi.namaLokasi;
        bValue = b.lokasi.namaLokasi;
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [barang, sortColumn, sortDirection, stokRendahFilter]);

  const sortedTransaksiKeluar = useMemo(() => {
    let filtered = [...transaksiKeluar];

    // Filter berdasarkan range tanggal
    if (startDateKeluar || endDateKeluar) {
      filtered = filtered.filter((tr) => {
        const transaksiDate = new Date(tr.tanggal);
        const start = startDateKeluar ? new Date(startDateKeluar) : null;
        const end = endDateKeluar ? new Date(endDateKeluar) : null;

        // Set time untuk perbandingan yang akurat
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        transaksiDate.setHours(0, 0, 0, 0);

        if (start && end) {
          return transaksiDate >= start && transaksiDate <= end;
        } else if (start) {
          return transaksiDate >= start;
        } else if (end) {
          return transaksiDate <= end;
        }
        return true;
      });
    }

    return filtered.sort((a, b) => {
      let aValue: any = a[sortColumnKeluar as keyof TransaksiKeluar];
      let bValue: any = b[sortColumnKeluar as keyof TransaksiKeluar];

      if (sortColumnKeluar === "tanggal") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortColumnKeluar === "barang") {
        aValue = a.barang.nama.toLowerCase();
        bValue = b.barang.nama.toLowerCase();
      } else if (sortColumnKeluar === "lokasi") {
        aValue = a.lokasi.namaLokasi.toLowerCase();
        bValue = b.lokasi.namaLokasi.toLowerCase();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirectionKeluar === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirectionKeluar === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    transaksiKeluar,
    sortColumnKeluar,
    sortDirectionKeluar,
    startDateKeluar,
    endDateKeluar,
  ]);

  const sortedTransaksiKasir = useMemo(() => {
    let filtered = [...transaksiKasir];

    // Filter berdasarkan range tanggal
    if (startDateKasir || endDateKasir) {
      filtered = filtered.filter((tr) => {
        const transaksiDate = new Date(tr.tanggal);
        const start = startDateKasir ? new Date(startDateKasir) : null;
        const end = endDateKasir ? new Date(endDateKasir) : null;

        // Set time untuk perbandingan yang akurat
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        transaksiDate.setHours(0, 0, 0, 0);

        if (start && end) {
          return transaksiDate >= start && transaksiDate <= end;
        } else if (start) {
          return transaksiDate >= start;
        } else if (end) {
          return transaksiDate <= end;
        }
        return true;
      });
    }

    return filtered.sort((a, b) => {
      let aValue: any = a[sortColumnKasir as keyof TransaksiKasir];
      let bValue: any = b[sortColumnKasir as keyof TransaksiKasir];

      if (sortColumnKasir === "tanggal") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortColumnKasir === "kasir") {
        aValue = a.kasir.nama.toLowerCase();
        bValue = b.kasir.nama.toLowerCase();
      } else if (sortColumnKasir === "metodePembayaran") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirectionKasir === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirectionKasir === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    transaksiKasir,
    sortColumnKasir,
    sortDirectionKasir,
    startDateKasir,
    endDateKasir,
  ]);

  // Pagination untuk Barang
  const paginatedBarang = useMemo(() => {
    const startIndex = (currentPageBarang - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedBarang.slice(startIndex, endIndex);
  }, [sortedBarang, currentPageBarang, itemsPerPage]);

  const totalPagesBarang = Math.ceil(sortedBarang.length / itemsPerPage);

  // Pagination untuk Transaksi Keluar
  const paginatedTransaksiKeluar = useMemo(() => {
    const startIndex = (currentPageKeluar - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedTransaksiKeluar.slice(startIndex, endIndex);
  }, [sortedTransaksiKeluar, currentPageKeluar, itemsPerPage]);

  const totalPagesKeluar = Math.ceil(
    sortedTransaksiKeluar.length / itemsPerPage,
  );

  // Pagination untuk Transaksi Kasir (per item)
  const paginatedTransaksiKasir = useMemo(() => {
    // Flatten dulu untuk menghitung total items
    const allItems = sortedTransaksiKasir.flatMap((tr) =>
      tr.itemTransaksi.map((item) => ({ tr, item })),
    );

    const startIndex = (currentPageKasir - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allItems.slice(startIndex, endIndex);
  }, [sortedTransaksiKasir, currentPageKasir, itemsPerPage]);

  const totalPagesKasir = Math.ceil(
    sortedTransaksiKasir.reduce((sum, tr) => sum + tr.itemTransaksi.length, 0) /
      itemsPerPage,
  );

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  function handleSortKeluar(column: string) {
    if (sortColumnKeluar === column) {
      setSortDirectionKeluar(sortDirectionKeluar === "asc" ? "desc" : "asc");
    } else {
      setSortColumnKeluar(column);
      setSortDirectionKeluar("desc");
    }
  }

  function getSortIcon(column: string) {
    if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  }

  function getSortIconKeluar(column: string) {
    if (sortColumnKeluar !== column)
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirectionKeluar === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  }

  function handleSortKasir(column: string) {
    if (sortColumnKasir === column) {
      setSortDirectionKasir(sortDirectionKasir === "asc" ? "desc" : "asc");
    } else {
      setSortColumnKasir(column);
      setSortDirectionKasir("desc");
    }
  }

  function getSortIconKasir(column: string) {
    if (sortColumnKasir !== column)
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirectionKasir === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  }

  async function fetchData() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (kategoriFilter && kategoriFilter !== "ALL")
        params.append("kategori", kategoriFilter);
      if (lokasiFilter && lokasiFilter !== "ALL")
        params.append("lokasiId", lokasiFilter);

      const [barangRes, lokasiRes, keluarRes, kasirRes] = await Promise.all([
        fetch(`/api/barang?${params}`),
        fetch("/api/lokasi"),
        fetch("/api/transaksi-keluar"),
        fetch("/api/transaksi-kasir"),
      ]);

      const barangData = await barangRes.json();
      const lokasiData = await lokasiRes.json();
      const keluarData = await keluarRes.json();
      const kasirData = await kasirRes.json();

      setBarang(barangData);
      setLokasi(lokasiData);
      setTransaksiKeluar(keluarData);
      setTransaksiKasir(kasirData);
    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingItem) {
        // Mode edit barang existing
        const response = await fetch(`/api/barang/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Gagal mengupdate data");
        }

        toast.success("Barang berhasil diupdate");
      } else if (tambahMode === "new") {
        // Mode tambah barang baru custom
        const response = await fetch("/api/barang", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Gagal menambahkan barang baru");
        }

        toast.success("Barang baru berhasil ditambahkan");
      } else {
        // Mode tambah stok barang existing
        const payload = {
          ...formTambahStok,
          reason: formTambahStok.reason,
          paymentMethod:
            formTambahStok.reason === "PURCHASE"
              ? formTambahStok.paymentMethod
              : undefined,
        };

        const response = await fetch("/api/transaksi-masuk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Gagal menambah stok barang");
        }

        toast.success("Stok barang berhasil ditambahkan");
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitKeluar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/transaksi-keluar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formKeluar),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal menyimpan transaksi");
      }

      toast.success("Barang keluar berhasil dicatat");
      setDialogKeluarOpen(false);
      resetFormKeluar();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus barang ini?")) return;

    try {
      const response = await fetch(`/api/barang/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika barang sudah digunakan dalam transaksi
        if (response.status === 400 && data.message) {
          toast.error(data.message, {
            duration: 5000, // Tampil lebih lama karena pesan panjang
          });
        } else {
          toast.error(data.error || "Gagal menghapus barang");
        }
        return;
      }

      toast.success("Barang berhasil dihapus");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    }
  }

  function openEditDialog(item: Barang) {
    setEditingItem(item);
    setTambahMode("new"); // Tidak digunakan saat edit
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
    });
    setDialogOpen(true);
  }

  function openTambahDialog() {
    setEditingItem(null);
    setTambahMode("existing"); // Default: tambah stok
    resetForm();
    setDialogOpen(true);
  }

  function resetForm() {
    setEditingItem(null);
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
    });
    setFormTambahStok({
      barangId: "",
      qty: 0,
      hargaBeli: 0,
      sumber: "",
      lokasiId: "",
      keterangan: "",
      reason: "PURCHASE",
      paymentMethod: "CASH",
    });
  }

  function resetFormKeluar() {
    setFormKeluar({
      barangId: "",
      qty: 0,
      tujuan: "",
      lokasiId: "",
      keterangan: "",
    });
  }

  function handleBarangChangeTambahStok(barangId: string) {
    const selectedBarang = barang.find((b) => b.id === barangId);
    if (!selectedBarang) return;

    setFormTambahStok({
      ...formTambahStok,
      barangId,
      hargaBeli: selectedBarang.hargaBeli,
      lokasiId: selectedBarang.lokasiId,
      // Reset reason and payment method when changing item
      reason: "PURCHASE",
      paymentMethod: "CASH",
    });
  }

  // Handler untuk Select gabungan di modal tambah: jika value === "NEW" => mode new
  function handleSelectForTambah(value: string) {
    if (value === "NEW") {
      // pilih untuk membuat barang baru
      setTambahMode("new");
      // kosongkan pilihan tambah stok
      setFormTambahStok({
        barangId: "",
        qty: 0,
        hargaBeli: 0,
        sumber: "",
        lokasiId: "",
        keterangan: "",
        reason: "PURCHASE",
        paymentMethod: "CASH",
      });
      // reset formData untuk input barang baru
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
      });
    } else {
      // pilih barang existing
      setTambahMode("existing");
      handleBarangChangeTambahStok(value);
    }
  }

  function handleBarangChangeKeluar(barangId: string) {
    const selectedBarang = barang.find((b) => b.id === barangId);
    if (!selectedBarang) return;

    setFormKeluar({
      ...formKeluar,
      barangId,
      lokasiId: selectedBarang.lokasiId,
    });
  }

  const kategoriList = Array.from(new Set(barang.map((item) => item.kategori)));

  // Komponen Pagination
  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Halaman {currentPage} dari {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Sebelumnya
          </Button>
          {startPage > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
              >
                1
              </Button>
              {startPage > 2 && <span className="px-2">...</span>}
            </>
          )}
          {pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Selanjutnya
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Inventaris" description="Kelola data barang dan stok" />

      <div className="flex-1 p-3 space-y-6">
        {/* Tabs: Daftar Barang & History Keluar */}
        <h1 className="text-lg font-bold">Pilih Menu</h1>
        <Tabs defaultValue="barang" className="space-y-4">
            <TabsList className="bg-amber-400">
              <TabsTrigger value="barang">
                <Package className="mr-2 h-4 w-4" />
                Daftar Barang
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="mr-2 h-4 w-4" />
                History Barang Keluar
              </TabsTrigger>
              <TabsTrigger value="kasir">
                <TrendingDown className="mr-2 h-4 w-4" />
                History Penjualan Barang
              </TabsTrigger>
            </TabsList>
          {/* Tab Daftar Barang */}
          <TabsContent value="barang">
            <Card className="bg-linear-to-b from-blue-50 to-white">
              <CardHeader>
                <CardTitle>Daftar Barang</CardTitle>
                <CardDescription>
                  <div className="flex justify-between items-center">
                    <Button onClick={openTambahDialog} className="my-3">
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Barang
                    </Button>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Statistics */}
                <StatsGrid
                  stats={[
                    {
                      title: "Total Barang",
                      value: barang.length,
                      description: "Item dalam inventaris",
                      icon: Package,
                    },
                    {
                      title: "Total Nilai",
                      value: `Rp ${barang.reduce((sum, item) => sum + item.stok * item.hargaBeli, 0).toLocaleString("id-ID")}`,
                      description: "Berdasarkan harga beli",
                      icon: Package,
                    },
                    {
                      title: "Stok Rendah",
                      value: barang.filter(
                        (item) => item.stok <= item.stokMinimum,
                      ).length,
                      description: "Perlu restock",
                      icon: AlertTriangle,
                      action: (
                        <Button
                          variant={stokRendahFilter ? "default" : "outline"}
                          onClick={() => setStokRendahFilter(!stokRendahFilter)}
                          className="w-full"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          {stokRendahFilter
                            ? "Stok Rendah Aktif"
                            : "Tampilkan Stok Rendah"}
                        </Button>
                      ),
                    },
                  ]}
                />

                {/* Filters */}
                <div className="flex flex-wrap gap-4 my-5">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari nama atau SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white"
                      />
                    </div>
                  </div>
                  <Select
                    value={kategoriFilter}
                    onValueChange={setKategoriFilter}
                  >
                    <SelectTrigger className="w-[200px] bg-white">
                      <SelectValue placeholder="Semua Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Kategori</SelectItem>
                      {kategoriList.map((kat) => (
                        <SelectItem key={kat} value={kat}>
                          {kat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={lokasiFilter} onValueChange={setLokasiFilter}>
                    <SelectTrigger className="w-[200px] bg-white">
                      <SelectValue placeholder="Semua Lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Lokasi</SelectItem>
                      {lokasi.map((lok) => (
                        <SelectItem key={lok.id} value={lok.id}>
                          {lok.namaLokasi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Table */}
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer select-none"
                          onClick={() => handleSort("nama")}
                        >
                          <div className="flex items-center">
                            Nama
                            {getSortIcon("nama")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none"
                          onClick={() => handleSort("sku")}
                        >
                          <div className="flex items-center">
                            SKU
                            {getSortIcon("sku")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none"
                          onClick={() => handleSort("kategori")}
                        >
                          <div className="flex items-center">
                            Kategori
                            {getSortIcon("kategori")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none"
                          onClick={() => handleSort("stok")}
                        >
                          <div className="flex items-center">
                            Stok
                            {getSortIcon("stok")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none"
                          onClick={() => handleSort("hargaBeli")}
                        >
                          <div className="flex items-center">
                            Harga Beli
                            {getSortIcon("hargaBeli")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none"
                          onClick={() => handleSort("hargaJual")}
                        >
                          <div className="flex items-center">
                            Harga Jual
                            {getSortIcon("hargaJual")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer select-none"
                          onClick={() => handleSort("lokasi")}
                        >
                          <div className="flex items-center">
                            Lokasi
                            {getSortIcon("lokasi")}
                          </div>
                        </TableHead>
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
                      ) : paginatedBarang.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            Tidak ada data
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedBarang.map((item) => (
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
                {totalPagesBarang > 1 && (
                  <Pagination
                    currentPage={currentPageBarang}
                    totalPages={totalPagesBarang}
                    onPageChange={setCurrentPageBarang}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab History Barang Keluar */}
          <TabsContent value="history">
            <div className="space-y-4">
              {/* Filter Tanggal Range */}
              <Card className="bg-linear-to-b from-blue-50 to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>History Barang Keluar</CardTitle>
                  <CardDescription>
                    <Button
                      onClick={() => setDialogKeluarOpen(true)}
                      variant="default"
                    >
                      <Minus className="mr-2 h-4 w-4" />
                      Catat Barang Keluar
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Statistics Cards */}
                  <StatsGrid
                    stats={[
                      {
                        title: "Total Jenis Barang Keluar",
                        value: new Set(
                          sortedTransaksiKeluar.map((tr) => tr.barang.id),
                        ).size,
                        description:
                          startDateKeluar || endDateKeluar
                            ? `${startDateKeluar ? format(new Date(startDateKeluar), "dd/MM/yyyy") : "..."} - ${endDateKeluar ? format(new Date(endDateKeluar), "dd/MM/yyyy") : "..."}`
                            : "Total keseluruhan",
                        icon: TrendingDown,
                      },
                      {
                        title: "Total Jumlah Barang",
                        value: sortedTransaksiKeluar.reduce(
                          (sum, tr) => sum + tr.qty,
                          0,
                        ),
                        description: "Unit keluar",
                        icon: TrendingDown,
                      },
                      {
                        title: "Total Nilai",
                        value: `Rp ${sortedTransaksiKeluar.reduce((sum, tr) => sum + tr.totalNilai, 0).toLocaleString("id-ID")}`,
                        description: "Nilai barang keluar",
                        icon: TrendingDown,
                      },
                      {
                        title: "Rata-rata",
                        value: `Rp ${sortedTransaksiKeluar.length > 0 ? (sortedTransaksiKeluar.reduce((sum, tr) => sum + tr.totalNilai, 0) / sortedTransaksiKeluar.length).toLocaleString("id-ID") : "0"}`,
                        description: "Per transaksi",
                        icon: TrendingDown,
                      },
                    ]}
                  />
                  {/* History Barang Keluar */}
                  {/* Filters */}
                  <div className="flex flex-wrap gap-4 my-5">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Cari nama atau SKU..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="pl-9 bg-white"
                        />
                      </div>
                    </div>
                    <Select
                      value={kategoriFilter}
                      onValueChange={setKategoriFilter}
                    >
                      <SelectTrigger className="w-[200px] bg-white">
                        <SelectValue placeholder="Semua Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Semua Kategori</SelectItem>
                        {kategoriList.map((kat) => (
                          <SelectItem key={kat} value={kat}>
                            {kat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={lokasiFilter}
                      onValueChange={setLokasiFilter}
                    >
                      <SelectTrigger className="w-[200px] bg-white">
                        <SelectValue placeholder="Semua Lokasi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Semua Lokasi</SelectItem>
                        {lokasi.map((lok) => (
                          <SelectItem key={lok.id} value={lok.id}>
                            {lok.namaLokasi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKeluar("nomorTransaksi")}
                          >
                            <div className="flex items-center">
                              No. Transaksi
                              {getSortIconKeluar("nomorTransaksi")}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKeluar("tanggal")}
                          >
                            <div className="flex items-center">
                              Tanggal
                              {getSortIconKeluar("tanggal")}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKeluar("barang")}
                          >
                            <div className="flex items-center">
                              Barang
                              {getSortIconKeluar("barang")}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKeluar("qty")}
                          >
                            <div className="flex items-center">
                              Qty
                              {getSortIconKeluar("qty")}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKeluar("hargaBarang")}
                          >
                            <div className="flex items-center">
                              Harga
                              {getSortIconKeluar("hargaBarang")}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKeluar("totalNilai")}
                          >
                            <div className="flex items-center">
                              Total Nilai
                              {getSortIconKeluar("totalNilai")}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKeluar("tujuan")}
                          >
                            <div className="flex items-center">
                              Tujuan
                              {getSortIconKeluar("tujuan")}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKeluar("lokasi")}
                          >
                            <div className="flex items-center">
                              Lokasi
                              {getSortIconKeluar("lokasi")}
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTransaksiKeluar.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center">
                              {startDateKeluar || endDateKeluar
                                ? "Tidak ada transaksi pada rentang tanggal tersebut"
                                : "Belum ada transaksi"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedTransaksiKeluar.map((tr) => (
                            <TableRow key={tr.id}>
                              <TableCell className="font-medium">
                                {tr.nomorTransaksi}
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(tr.tanggal),
                                  "dd/MM/yyyy HH:mm",
                                )}
                              </TableCell>
                              <TableCell>{tr.barang.nama}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {tr.qty} {tr.barang.satuan}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                Rp {tr.hargaBarang.toLocaleString("id-ID")}
                              </TableCell>
                              <TableCell className="font-semibold">
                                Rp {tr.totalNilai.toLocaleString("id-ID")}
                              </TableCell>
                              <TableCell>{tr.tujuan}</TableCell>
                              <TableCell>{tr.lokasi.namaLokasi}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPagesKeluar > 1 && (
                    <Pagination
                      currentPage={currentPageKeluar}
                      totalPages={totalPagesKeluar}
                      onPageChange={setCurrentPageKeluar}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Barang Keluar dari Kasir */}
          <TabsContent value="kasir">
            <div className="space-y-4">
              {/* Filter Tanggal Range
              <Card>
                <CardHeader>
                  <CardTitle>Filter Transaksi</CardTitle>
                  <CardDescription>
                    Filter transaksi berdasarkan rentang tanggal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Dari Tanggal</Label>
                      <Input
                        type="date"
                        className="mt-2"
                        value={startDateKasir}
                        onChange={(e) => setStartDateKasir(e.target.value)}
                        max={endDateKasir || format(new Date(), "yyyy-MM-dd")}
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Sampai Tanggal</Label>
                      <Input
                        type="date"
                        className="mt-2"
                        value={endDateKasir}
                        onChange={(e) => setEndDateKasir(e.target.value)}
                        min={startDateKasir}
                        max={format(new Date(), "yyyy-MM-dd")}
                      />
                    </div>
                    {(startDateKasir || endDateKasir) && (
                      <div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setStartDateKasir("");
                            setEndDateKasir("");
                          }}
                        >
                          Reset Filter
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card> */}

              {/* Statistics Cards */}
              <Card className="bg-linear-to-b from-blue-50 to-white">
              <StatsGrid
                stats={[
                  {
                    title: "Total Jenis Barang",
                    value: (() => {
                      const uniqueBarangIds = new Set<string>();
                      sortedTransaksiKasir.forEach((tr) => {
                        tr.itemTransaksi.forEach((item) => {
                          uniqueBarangIds.add(item.barang.id);
                        });
                      });
                      return uniqueBarangIds.size;
                    })(),
                    description:
                      startDateKasir || endDateKasir
                        ? `${startDateKasir ? format(new Date(startDateKasir), "dd/MM/yyyy") : "..."} - ${endDateKasir ? format(new Date(endDateKasir), "dd/MM/yyyy") : "..."}`
                        : "Total keseluruhan",
                    icon: Package,
                  },
                  {
                    title: "Total Qty Keluar",
                    value: sortedTransaksiKasir.reduce(
                      (sum, tr) =>
                        sum +
                        tr.itemTransaksi.reduce((s, item) => s + item.qty, 0),
                      0,
                    ),
                    description: "Unit terjual",
                    icon: TrendingDown,
                  },
                  {
                    title: "Total Nilai Penjualan",
                    value: `Rp ${sortedTransaksiKasir.reduce((sum, tr) => sum + tr.total, 0).toLocaleString("id-ID")}`,
                    description: "Omset penjualan",
                    icon: TrendingDown,
                  },
                  {
                    title: "Rata-rata",
                    value: `Rp ${sortedTransaksiKasir.length > 0 ? (sortedTransaksiKasir.reduce((sum, tr) => sum + tr.total, 0) / sortedTransaksiKasir.length).toLocaleString("id-ID") : "0"}`,
                    description: "Per transaksi",
                    icon: TrendingDown,
                  },
                ]}
              />

              {/* Table History Kasir - Per Item */}
              <Card>
                <CardHeader>
                  <CardTitle>History Barang Keluar (Kasir)</CardTitle>
                  <CardDescription>
                    Riwayat barang keluar dari transaksi kasir (per item)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKasir("nomorTransaksi")}
                          >
                            <div className="flex items-center">
                              No. Transaksi
                              {getSortIconKasir("nomorTransaksi")}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKasir("tanggal")}
                          >
                            <div className="flex items-center">
                              Tanggal
                              {getSortIconKasir("tanggal")}
                            </div>
                          </TableHead>
                          <TableHead>Nama Barang</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Harga Satuan</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKasir("metodePembayaran")}
                          >
                            <div className="flex items-center">
                              Metode Bayar
                              {getSortIconKasir("metodePembayaran")}
                            </div>
                          </TableHead>
                          <TableHead
                            className="cursor-pointer select-none"
                            onClick={() => handleSortKasir("kasir")}
                          >
                            <div className="flex items-center">
                              Kasir
                              {getSortIconKasir("kasir")}
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedTransaksiKasir.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center">
                              {startDateKasir || endDateKasir
                                ? "Tidak ada transaksi pada rentang tanggal tersebut"
                                : "Belum ada transaksi"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedTransaksiKasir.map(({ tr, item }) => (
                            <TableRow key={`${tr.id}-${item.id}`}>
                              <TableCell className="font-medium">
                                {tr.nomorTransaksi}
                              </TableCell>
                              <TableCell>
                                {format(
                                  new Date(tr.tanggal),
                                  "dd/MM/yyyy HH:mm",
                                )}
                              </TableCell>
                              <TableCell>{item.namaBarang}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {item.qty} {item.barang.satuan}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                Rp {item.hargaSatuan.toLocaleString("id-ID")}
                              </TableCell>
                              <TableCell className="font-semibold">
                                Rp {item.subtotal.toLocaleString("id-ID")}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {tr.metodePembayaran}
                                </Badge>
                              </TableCell>
                              <TableCell>{tr.kasir.nama}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {totalPagesKasir > 1 && (
                    <Pagination
                      currentPage={currentPageKasir}
                      totalPages={totalPagesKasir}
                      onPageChange={setCurrentPageKasir}
                    />
                  )}
                </CardContent>
              </Card>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Tambah/Edit Barang */}
      <TambahEditBarangDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editingItem}
        tambahMode={tambahMode}
        formData={formData}
        setFormData={setFormData}
        formTambahStok={formTambahStok}
        setFormTambahStok={setFormTambahStok}
        barang={barang}
        lokasi={lokasi}
        loading={loading}
        handleSubmit={handleSubmit}
        handleSelectForTambah={handleSelectForTambah}
        resetForm={resetForm}
      />

      {/* Dialog Barang Keluar */}
      <BarangKeluarDialog
        open={dialogKeluarOpen}
        onOpenChange={setDialogKeluarOpen}
        formKeluar={formKeluar}
        setFormKeluar={setFormKeluar}
        barang={barang}
        lokasi={lokasi}
        loading={loading}
        handleSubmitKeluar={handleSubmitKeluar}
        handleBarangChangeKeluar={handleBarangChangeKeluar}
        resetFormKeluar={resetFormKeluar}
      />
    </div>
  );
}
