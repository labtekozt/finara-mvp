"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Package,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface ReturPenjualan {
  id: string;
  nomorTransaksi: string;
  tanggal: string;
  barang: {
    id: string;
    nama: string;
    sku?: string;
    satuan: string;
  };
  lokasi: {
    id: string;
    namaLokasi: string;
  };
  qty: number;
  hargaJual: number;
  totalNilai: number;
  pelanggan: string;
  keterangan: string;
}

interface TransaksiKasir {
  id: string;
  nomorTransaksi: string;
  tanggal: string;
  itemTransaksi: Array<{
    id: string;
    barang: {
      id: string;
      nama: string;
      sku?: string;
      satuan: string;
    };
    qty: number;
    hargaSatuan: number;
    total: number;
  }>;
  total: number;
  pelanggan?: string;
}

interface Lokasi {
  id: string;
  namaLokasi: string;
}

export default function ReturPenjualanPage() {
  const [returPenjualan, setReturPenjualan] = useState<ReturPenjualan[]>([]);
  const [transaksiKasir, setTransaksiKasir] = useState<TransaksiKasir[]>([]);
  const [lokasi, setLokasi] = useState<Lokasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lokasiFilter, setLokasiFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("tanggal");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [formData, setFormData] = useState({
    transaksiKasirId: "",
    itemTransaksiId: "",
    qty: 0,
    alasan: "",
    catatan: "",
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (lokasiFilter && lokasiFilter !== "ALL")
        params.append("lokasiId", lokasiFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const [returRes, transaksiRes, lokasiRes] = await Promise.all([
        fetch(`/api/retur-penjualan?${params}`),
        fetch("/api/transaksi-kasir"),
        fetch("/api/lokasi"),
      ]);

      if (!returRes.ok) {
        throw new Error(`Failed to fetch retur data: ${returRes.status}`);
      }
      if (!transaksiRes.ok) {
        throw new Error(
          `Failed to fetch transaksi data: ${transaksiRes.status}`,
        );
      }
      if (!lokasiRes.ok) {
        throw new Error(`Failed to fetch lokasi data: ${lokasiRes.status}`);
      }

      const returData = await returRes.json();
      const transaksiData = await transaksiRes.json();
      const lokasiData = await lokasiRes.json();

      // Ensure data is in expected format
      setReturPenjualan(Array.isArray(returData) ? returData : []);
      setTransaksiKasir(Array.isArray(transaksiData) ? transaksiData : []);
      setLokasi(Array.isArray(lokasiData) ? lokasiData : []);
    } catch (error) {
      toast.error("Gagal memuat data retur penjualan");
    } finally {
      setLoading(false);
    }
  }, [search, lokasiFilter, startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedReturPenjualan = useMemo(() => {
    if (!returPenjualan || !Array.isArray(returPenjualan)) {
      return [];
    }
    return [...returPenjualan].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof ReturPenjualan];
      let bValue: any = b[sortColumn as keyof ReturPenjualan];

      if (sortColumn === "barang") {
        aValue = a.barang?.nama || "";
        bValue = b.barang?.nama || "";
      } else if (sortColumn === "lokasi") {
        aValue = a.lokasi?.namaLokasi || "";
        bValue = b.lokasi?.namaLokasi || "";
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [returPenjualan, sortColumn, sortDirection]);

  function handleSort(column: string) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedItem) {
      toast.error("Pilih item yang akan diretur");
      return;
    }

    try {
      const payload = {
        transaksiKasirId: formData.transaksiKasirId,
        items: [
          {
            barangId: selectedItem.barang?.id || "",
            qty: formData.qty,
          },
        ],
        alasan: formData.alasan,
        catatan: formData.catatan,
      };

      const response = await fetch("/api/retur-penjualan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal membuat retur penjualan");
      }

      toast.success("Retur penjualan berhasil dicatat");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  function resetForm() {
    setFormData({
      transaksiKasirId: "",
      itemTransaksiId: "",
      qty: 0,
      alasan: "",
      catatan: "",
    });
  }

  function handleTransaksiChange(transaksiId: string) {
    setFormData({
      ...formData,
      transaksiKasirId: transaksiId,
      itemTransaksiId: "", // Reset item selection
      qty: 0,
    });
  }

  function handleItemChange(itemId: string) {
    const selectedTransaksi = transaksiKasir.find(
      (t) => t.id === formData.transaksiKasirId,
    );
    const selectedItem = selectedTransaksi?.itemTransaksi.find(
      (item) => item.id === itemId,
    );

    if (selectedItem) {
      setFormData({
        ...formData,
        itemTransaksiId: itemId,
        qty: selectedItem.qty, // Default to full quantity
      });
    }
  }

  const selectedTransaksi = transaksiKasir.find(
    (t) => t.id === formData.transaksiKasirId,
  );
  const selectedItem = selectedTransaksi?.itemTransaksi.find(
    (item) => item.id === formData.itemTransaksiId,
  );

  const totalRetur = returPenjualan.length;
  const totalValue = returPenjualan.reduce(
    (sum, item) => sum + Math.abs(item.totalNilai),
    0,
  );

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Retur Penjualan"
        description="Pengembalian barang dari pelanggan"
      />

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
                    placeholder="Cari nama barang..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={lokasiFilter} onValueChange={setLokasiFilter}>
                <SelectTrigger className="w-[200px]">
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
              <div className="flex gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Dari Tanggal</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[140px]"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sampai Tanggal</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[140px]"
                  />
                </div>
              </div>
              <Button onClick={() => setDialogOpen(true)} className="self-end">
                <Plus className="mr-2 h-4 w-4" />
                Retur Penjualan Baru
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Retur</CardTitle>
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRetur}</div>
              <p className="text-xs text-muted-foreground">Kali pengembalian</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp {totalValue.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-muted-foreground">
                Nilai pengembalian
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rp{" "}
                {totalRetur > 0
                  ? (totalValue / totalRetur).toLocaleString("id-ID")
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Per transaksi retur
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lokasi</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  new Set(
                    returPenjualan
                      .filter((item) => item.lokasi)
                      .map((item) => item.lokasi.id),
                  ).size
                }
              </div>
              <p className="text-xs text-muted-foreground">Lokasi berbeda</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Retur Penjualan</CardTitle>
            <CardDescription>
              Total: {returPenjualan.length} retur penjualan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("tanggal")}
                    >
                      <div className="flex items-center">
                        Tanggal
                        {getSortIcon("tanggal")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("nomorTransaksi")}
                    >
                      <div className="flex items-center">
                        No. Transaksi
                        {getSortIcon("nomorTransaksi")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => handleSort("barang")}
                    >
                      <div className="flex items-center">
                        Barang
                        {getSortIcon("barang")}
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
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                    <TableHead>Pelanggan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Memuat data...
                      </TableCell>
                    </TableRow>
                  ) : sortedReturPenjualan.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Tidak ada data retur penjualan
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedReturPenjualan.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {new Date(item.tanggal).toLocaleDateString("id-ID")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.nomorTransaksi}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.barang?.nama || "N/A"}
                            </div>
                            {item.barang?.sku && (
                              <div className="text-sm text-muted-foreground">
                                SKU: {item.barang.sku}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.lokasi?.namaLokasi || "N/A"}
                        </TableCell>
                        <TableCell className="text-center">
                          {Math.abs(item.qty)} {item.barang?.satuan || ""}
                        </TableCell>
                        <TableCell className="text-right">
                          Rp {Math.abs(item.totalNilai).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {item.pelanggan || "Umum"}
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

      {/* Add Retur Penjualan Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open: boolean) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Retur Penjualan Baru</DialogTitle>
            <DialogDescription>
              Catat pengembalian barang dari pelanggan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="transaksiKasirId">Transaksi Penjualan *</Label>
                <Select
                  value={formData.transaksiKasirId}
                  onValueChange={handleTransaksiChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih transaksi penjualan" />
                  </SelectTrigger>
                  <SelectContent>
                    {transaksiKasir.map((transaksi) => (
                      <SelectItem key={transaksi.id} value={transaksi.id}>
                        {transaksi.nomorTransaksi} -{" "}
                        {transaksi.pelanggan || "Umum"} (Rp{" "}
                        {transaksi.total.toLocaleString("id-ID")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTransaksi && (
                <div className="space-y-2">
                  <Label htmlFor="itemTransaksiId">Barang yang Diretur *</Label>
                  <Select
                    value={formData.itemTransaksiId}
                    onValueChange={handleItemChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih barang yang diretur" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTransaksi.itemTransaksi.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.barang?.nama || "N/A"} - {item.qty}{" "}
                          {item.barang?.satuan || ""} @ Rp{" "}
                          {(item.hargaSatuan ?? 0).toLocaleString("id-ID")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedItem && selectedItem.total !== undefined && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Detail Item Asli</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Barang:</span>{" "}
                        {selectedItem.barang?.nama || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Qty Asli:</span>{" "}
                        {selectedItem.qty} {selectedItem.barang?.satuan || ""}
                      </div>
                      <div>
                        <span className="font-medium">Harga Jual:</span> Rp{" "}
                        {(selectedItem.hargaSatuan ?? 0).toLocaleString(
                          "id-ID",
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Total:</span> Rp{" "}
                        {(selectedItem.total ?? 0).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="qty">Jumlah Retur *</Label>
                <Input
                  id="qty"
                  type="number"
                  value={formData.qty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qty: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  max={selectedItem?.qty || 0}
                />
                <p className="text-xs text-muted-foreground">
                  Maksimal: {selectedItem?.qty || 0}{" "}
                  {selectedItem?.barang?.satuan || ""}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alasan">Alasan Retur *</Label>
                <Select
                  value={formData.alasan}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, alasan: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih alasan retur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Barang Rusak">Barang Rusak</SelectItem>
                    <SelectItem value="Tidak Sesuai Pesanan">
                      Tidak Sesuai Pesanan
                    </SelectItem>
                    <SelectItem value="Kesalahan Pengiriman">
                      Kesalahan Pengiriman
                    </SelectItem>
                    <SelectItem value="Ubah Pikiran">Ubah Pikiran</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="catatan">Catatan Tambahan</Label>
                <Textarea
                  id="catatan"
                  value={formData.catatan}
                  onChange={(e) =>
                    setFormData({ ...formData, catatan: e.target.value })
                  }
                  placeholder="Tambahkan catatan jika diperlukan"
                />
              </div>

              {/* Preview */}
              {selectedItem && formData.qty > 0 && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Pratinjau Retur</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Nilai Retur:</span>
                        <span className="font-medium">
                          Rp{" "}
                          {(
                            formData.qty * (selectedItem?.hargaSatuan ?? 0)
                          ).toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jurnal:</span>
                        <span className="font-medium">
                          Penjualan Cr, Persediaan Dr
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">Catat Retur Penjualan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
