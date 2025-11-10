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
import { Minus, Search, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { StatsGrid } from "../components/StatsGrid";
import { TransaksiKeluar, Lokasi } from "../types";
import { ReactNode } from "react";

interface HistoryBarangKeluarTabProps {
  // Data
  originalTransaksiKeluar: TransaksiKeluar[];
  paginatedTransaksiKeluar: TransaksiKeluar[];
  lokasi: Lokasi[];
  kategoriList: string[];

  // Search & Filter state
  searchKeluar: string;
  setSearchKeluar: (value: string) => void;
  kategoriFilterKeluar: string;
  setKategoriFilterKeluar: (value: string) => void;
  lokasiFilterKeluar: string;
  setLokasiFilterKeluar: (value: string) => void;
  startDateKeluar: string;
  endDateKeluar: string;

  // Sort handlers
  handleSortKeluar: (column: string) => void;
  getSortIconKeluar: (column: string) => ReactNode;

  // Actions
  setDialogKeluarOpen: (value: boolean) => void;

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

export function HistoryBarangKeluarTab({
  originalTransaksiKeluar,
  paginatedTransaksiKeluar,
  lokasi,
  kategoriList,
  searchKeluar,
  setSearchKeluar,
  kategoriFilterKeluar,
  setKategoriFilterKeluar,
  lokasiFilterKeluar,
  setLokasiFilterKeluar,
  startDateKeluar,
  endDateKeluar,
  handleSortKeluar,
  getSortIconKeluar,
  setDialogKeluarOpen,
  currentPage,
  totalPages,
  setCurrentPage,
  PaginationComponent,
}: HistoryBarangKeluarTabProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-linear-to-b from-blue-50 to-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>History Barang Keluar</CardTitle>
          <CardDescription>
            <Button onClick={() => setDialogKeluarOpen(true)} variant="default">
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
                  originalTransaksiKeluar.map((tr) => tr.barang.id),
                ).size,
                description: "Total keseluruhan",
                icon: TrendingDown,
              },
              {
                title: "Total Jumlah Barang",
                value: originalTransaksiKeluar.reduce(
                  (sum, tr) => sum + tr.qty,
                  0,
                ),
                description: "Unit keluar",
                icon: TrendingDown,
              },
              {
                title: "Total Nilai",
                value: `Rp ${originalTransaksiKeluar.reduce((sum, tr) => sum + tr.totalNilai, 0).toLocaleString("id-ID")}`,
                description: "Nilai barang keluar",
                icon: TrendingDown,
              },
              {
                title: "Rata-rata",
                value: `Rp ${originalTransaksiKeluar.length > 0 ? (originalTransaksiKeluar.reduce((sum, tr) => sum + tr.totalNilai, 0) / originalTransaksiKeluar.length).toLocaleString("id-ID") : "0"}`,
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
                  placeholder="Cari no. transaksi, barang, tujuan, atau lokasi"
                  value={searchKeluar}
                  onChange={(e) => setSearchKeluar(e.target.value)}
                  className="pl-9 bg-white"
                />
              </div>
            </div>
            <Select
              value={kategoriFilterKeluar}
              onValueChange={setKategoriFilterKeluar}
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
              value={lokasiFilterKeluar}
              onValueChange={setLokasiFilterKeluar}
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

          {/* Table */}
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
                        {format(new Date(tr.tanggal), "dd/MM/yyyy HH:mm")}
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

