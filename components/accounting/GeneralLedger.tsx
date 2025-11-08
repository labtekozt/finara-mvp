"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Download,
  Calendar,
  Eye,
  FileText,
  Printer,
} from "lucide-react";
import { useGeneralLedger } from "@/hooks/accounting";
import { useAccounts } from "@/hooks/accounting";
import { useAccountingDashboard } from "@/hooks/accounting";
import { GeneralLedgerEntry, Akun } from "@/types/accounting";
import { AccountingService } from "@/services/accounting";
import { toast } from "sonner";
import { JournalPDFExporter } from "@/lib/pdf-export";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

interface GeneralLedgerProps {
  className?: string;
}

export function GeneralLedger({ className }: GeneralLedgerProps) {
  const [selectedAkunId, setSelectedAkunId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<GeneralLedgerEntry | null>(
    null,
  );
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const {
    data: ledgerData,
    loading,
    error,
    refetch,
  } = useGeneralLedger({
    akunId: selectedAkunId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    autoLoad: !!selectedAkunId,
  });

  const { accounts } = useAccounts({ autoLoad: true });
  const {
    periods,
    stats,
    loading: dashboardLoading,
  } = useAccountingDashboard();

  const handleAkunChange = (akunId: string) => {
    setSelectedAkunId(akunId);
  };

  const handleViewDetails = (entry: GeneralLedgerEntry) => {
    setSelectedEntry(entry);
    setIsDetailDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportToPDF = () => {
    if (!ledgerData) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;

    // Header
    pdf.setFontSize(16);
    pdf.text("BUKU BESAR", pageWidth / 2, 20, { align: "center" });

    pdf.setFontSize(12);
    pdf.text(`Akun: ${ledgerData.akun.nama} (${ledgerData.akun.kode})`, 20, 35);
    pdf.text(
      `Periode: ${startDate || "Awal"} - ${endDate || "Sekarang"}`,
      20,
      45,
    );

    // Saldo Awal
    pdf.text(`Saldo Awal: ${formatCurrency(ledgerData.saldoAwal)}`, 20, 55);

    // Table data
    const tableData = ledgerData.entries.map((entry) => [
      entry.tanggal,
      entry.nomorJurnal,
      entry.deskripsi,
      entry.referensi || "",
      formatCurrency(entry.debit),
      formatCurrency(entry.kredit),
      formatCurrency(entry.saldo),
    ]);

    autoTable(pdf, {
      head: [
        [
          "Tanggal",
          "No. Jurnal",
          "Deskripsi",
          "Referensi",
          "Debit",
          "Kredit",
          "Saldo",
        ],
      ],
      body: tableData,
      startY: 65,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Footer with totals
    const finalY = (pdf as any).lastAutoTable.finalY + 10;
    pdf.text(
      `Total Debit: ${formatCurrency(ledgerData.totalDebit)}`,
      20,
      finalY,
    );
    pdf.text(
      `Total Kredit: ${formatCurrency(ledgerData.totalKredit)}`,
      20,
      finalY + 10,
    );
    pdf.text(
      `Saldo Akhir: ${formatCurrency(ledgerData.saldoAkhir)}`,
      20,
      finalY + 20,
    );

    pdf.save(`buku-besar-${ledgerData.akun.kode}.pdf`);
    toast.success("PDF berhasil diekspor");
  };

  const exportToCSV = () => {
    if (!ledgerData) return;

    const headers = [
      "Tanggal",
      "No. Jurnal",
      "Deskripsi",
      "Referensi",
      "Debit",
      "Kredit",
      "Saldo",
    ];
    const csvData = ledgerData.entries.map((entry) => [
      entry.tanggal,
      entry.nomorJurnal,
      entry.deskripsi,
      entry.referensi || "",
      entry.debit,
      entry.kredit,
      entry.saldo,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `buku-besar-${ledgerData.akun.kode}.csv`;
    link.click();

    toast.success("CSV berhasil diekspor");
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Buku Besar (General Ledger)
          </CardTitle>
          <CardDescription>
            Lihat semua transaksi per akun dengan saldo berjalan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="akun">Pilih Akun</Label>
              <Select value={selectedAkunId} onValueChange={handleAkunChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun..." />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.map((akun: Akun) => (
                    <SelectItem key={akun.id} value={akun.id}>
                      {akun.kode} - {akun.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Export Buttons */}
          {ledgerData && (
            <div className="flex gap-2 mb-4">
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          )}

          {/* Summary Cards */}
          {ledgerData && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Saldo Awal
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(ledgerData.saldoAwal)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Debit
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(ledgerData.totalDebit)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Kredit
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(ledgerData.totalKredit)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Saldo Akhir
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(ledgerData.saldoAkhir)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading/Error States */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Memuat data buku besar...
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={refetch} className="mt-2">
                Coba Lagi
              </Button>
            </div>
          )}

          {/* Table */}
          {ledgerData && !loading && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>No. Jurnal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Kredit</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerData.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.tanggal}</TableCell>
                      <TableCell className="font-mono">
                        {entry.nomorJurnal}
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={entry.deskripsi}
                      >
                        {entry.deskripsi}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {entry.debit > 0 ? formatCurrency(entry.debit) : "-"}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {entry.kredit > 0 ? formatCurrency(entry.kredit) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(entry.saldo)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(entry)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!ledgerData && !loading && !error && (
            <div className="text-center py-8 text-muted-foreground">
              Pilih akun untuk melihat buku besar
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>
              Informasi lengkap tentang transaksi jurnal
            </DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tanggal</Label>
                  <p className="font-medium">{selectedEntry.tanggal}</p>
                </div>
                <div>
                  <Label>No. Jurnal</Label>
                  <p className="font-medium font-mono">
                    {selectedEntry.nomorJurnal}
                  </p>
                </div>
              </div>

              <div>
                <Label>Deskripsi</Label>
                <p className="font-medium">{selectedEntry.deskripsi}</p>
              </div>

              {selectedEntry.referensi && (
                <div>
                  <Label>Referensi</Label>
                  <p className="font-medium">{selectedEntry.referensi}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Debit</Label>
                  <p className="font-medium text-red-600">
                    {selectedEntry.debit > 0
                      ? formatCurrency(selectedEntry.debit)
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label>Kredit</Label>
                  <p className="font-medium text-green-600">
                    {selectedEntry.kredit > 0
                      ? formatCurrency(selectedEntry.kredit)
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label>Saldo</Label>
                  <p className="font-medium">
                    {formatCurrency(selectedEntry.saldo)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
