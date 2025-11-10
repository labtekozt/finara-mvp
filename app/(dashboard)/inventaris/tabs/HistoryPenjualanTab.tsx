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
import { Search, Package, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { StatsGrid } from "../components/StatsGrid";
import { TransaksiKasir } from "../types";
import { ReactNode } from "react";

interface HistoryPenjualanTabProps {
  // Data
  originalTransaksiKasir: TransaksiKasir[];
  paginatedTransaksiKasir: Array<{ tr: TransaksiKasir; item: any }>;
  kategoriList: string[];

  // Search & Filter state
  searchKasir: string;
  setSearchKasir: (value: string) => void;
  kategoriFilterKasir: string;
  setKategoriFilterKasir: (value: string) => void;
  startDateKasir: string;
  endDateKasir: string;

  // Sort handlers
  handleSortKasir: (column: string) => void;
  getSortIconKasir: (column: string) => ReactNode;

  // Pagination
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  PaginationComponent: React.ComponentType<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }>;
}

export function HistoryPenjualanTab({
  originalTransaksiKasir,
  paginatedTransaksiKasir,
  kategoriList,
  searchKasir,
  setSearchKasir,
  kategoriFilterKasir,
  setKategoriFilterKasir,
  startDateKasir,
  endDateKasir,
  handleSortKasir,
  getSortIconKasir,
  currentPage,
  totalPages,
  setCurrentPage,
  PaginationComponent,
}: HistoryPenjualanTabProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-linear-to-b from-blue-50 to-white">
        <CardHeader>
          <CardTitle>History Penjualan Barang</CardTitle>
          <CardDescription>
            Riwayat barang keluar dari transaksi kasir (per item)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistics Cards */}
          <StatsGrid
            stats={[
              {
                title: "Total Jenis Barang",
                value: (() => {
                  const uniqueBarangIds = new Set<string>();
                  originalTransaksiKasir.forEach((tr) => {
                    tr.itemTransaksi.forEach((item) => {
                      uniqueBarangIds.add(item.barang.id);
                    });
                  });
                  return uniqueBarangIds.size;
                })(),
                description: "Total keseluruhan",
                icon: Package,
              },
              {
                title: "Total Qty Keluar",
                value: originalTransaksiKasir.reduce(
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
                value: `Rp ${originalTransaksiKasir.reduce((sum, tr) => sum + tr.total, 0).toLocaleString("id-ID")}`,
                description: "Omset penjualan",
                icon: TrendingDown,
              },
              {
                title: "Rata-rata",
                value: `Rp ${originalTransaksiKasir.length > 0 ? (originalTransaksiKasir.reduce((sum, tr) => sum + tr.total, 0) / originalTransaksiKasir.length).toLocaleString("id-ID") : "0"}`,
                description: "Per transaksi",
                icon: TrendingDown,
              },
            ]}
          />

          {/* Filters */}
          <div className="flex flex-wrap gap-4 my-5">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari no. transaksi, barang, kasir, atau metode bayar"
                  value={searchKasir}
                  onChange={(e) => setSearchKasir(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>
            </div>
            <Select
              value={kategoriFilterKasir}
              onValueChange={setKategoriFilterKasir}
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
          </div>

          {/* Table */}
          <div className="rounded-md border mt-5">
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
                        {format(new Date(tr.tanggal), "dd/MM/yyyy HH:mm")}
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
                        <Badge variant="outline">{tr.metodePembayaran}</Badge>
                      </TableCell>
                      <TableCell>{tr.kasir.nama}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <PaginationComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

