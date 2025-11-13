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
  Scale,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useTrialBalance } from "@/hooks/accounting";
import { useAccountingDashboard } from "@/hooks/accounting";
import { TrialBalanceEntry, PeriodeAkuntansi } from "@/types/accounting";
import { AccountingService } from "@/services/accounting";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface TrialBalanceProps {
  className?: string;
}

export function TrialBalance({ className }: TrialBalanceProps) {
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>("ALL");

  const {
    data: trialBalanceData,
    loading,
    error,
    refetch,
  } = useTrialBalance({
    periodeId: selectedPeriodeId === "ALL" ? undefined : selectedPeriodeId,
    autoLoad: true,
  });

  const { periods } = useAccountingDashboard();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportToPDF = () => {
    if (!trialBalanceData) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;

    // Header
    pdf.setFontSize(16);
    pdf.text("NERACA SALDO (TRIAL BALANCE)", pageWidth / 2, 20, {
      align: "center",
    });

    pdf.setFontSize(12);
    if (trialBalanceData.periode) {
      pdf.text(`Periode: ${trialBalanceData.periode.nama}`, 20, 35);
      pdf.text(
        `Tanggal: ${new Date(trialBalanceData.periode.tanggalMulai).toISOString().split("T")[0]} - ${new Date(trialBalanceData.periode.tanggalAkhir).toISOString().split("T")[0]}`,
        20,
        45,
      );
    } else {
      pdf.text("Periode: Semua Periode", 20, 35);
    }

    // Balance status
    const statusY = trialBalanceData.periode ? 55 : 45;
    pdf.text(
      `Status: ${trialBalanceData.isBalanced ? "Seimbang" : "Tidak Seimbang"}`,
      20,
      statusY,
    );

    // Table data
    const tableData = trialBalanceData.entries.map((entry) => [
      entry.akun.kode,
      entry.akun.nama,
      formatCurrency(entry.saldoAwal),
      formatCurrency(entry.mutasiDebit),
      formatCurrency(entry.mutasiKredit),
      formatCurrency(entry.saldoAkhir),
    ]);

    autoTable(pdf, {
      head: [
        [
          "Kode",
          "Nama Akun",
          "Saldo Awal",
          "Mutasi Debit",
          "Mutasi Kredit",
          "Saldo Akhir",
        ],
      ],
      body: tableData,
      startY: statusY + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Footer with totals
    const finalY = (pdf as any).lastAutoTable.finalY + 10;
    pdf.text(
      `Total Saldo Awal: ${formatCurrency(trialBalanceData.totalSaldoAwal)}`,
      20,
      finalY,
    );
    pdf.text(
      `Total Mutasi Debit: ${formatCurrency(trialBalanceData.totalMutasiDebit)}`,
      20,
      finalY + 10,
    );
    pdf.text(
      `Total Mutasi Kredit: ${formatCurrency(trialBalanceData.totalMutasiKredit)}`,
      20,
      finalY + 20,
    );
    pdf.text(
      `Total Saldo Akhir: ${formatCurrency(trialBalanceData.totalSaldoAkhir)}`,
      20,
      finalY + 30,
    );

    pdf.save(
      `neraca-saldo-${selectedPeriodeId === "ALL" ? "all" : selectedPeriodeId}.pdf`,
    );
    toast.success("PDF berhasil diekspor");
  };

  const exportToCSV = () => {
    if (!trialBalanceData) return;

    const headers = [
      "Kode Akun",
      "Nama Akun",
      "Saldo Awal",
      "Mutasi Debit",
      "Mutasi Kredit",
      "Saldo Akhir",
    ];
    const csvData = trialBalanceData.entries.map((entry) => [
      entry.akun.kode,
      entry.akun.nama,
      entry.saldoAwal,
      entry.mutasiDebit,
      entry.mutasiKredit,
      entry.saldoAkhir,
    ]);

    // Add totals row
    csvData.push([
      "TOTAL",
      "",
      trialBalanceData.totalSaldoAwal,
      trialBalanceData.totalMutasiDebit,
      trialBalanceData.totalMutasiKredit,
      trialBalanceData.totalSaldoAkhir,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `neraca-saldo-${selectedPeriodeId === "ALL" ? "all" : selectedPeriodeId}.csv`;
    link.click();

    toast.success("CSV berhasil diekspor");
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Neraca Saldo (Trial Balance)
          </CardTitle>
          <CardDescription>
            Ringkasan saldo semua akun untuk memverifikasi keseimbangan buku
            besar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Period Selector */}
          <div className="mb-6">
            <Label htmlFor="periode" className="mb-2">Pilih Periode</Label>
            <Select
              value={selectedPeriodeId}
              onValueChange={setSelectedPeriodeId}
            >
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Pilih periode..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Periode</SelectItem>
                {periods.map((periode: PeriodeAkuntansi) => (
                  <SelectItem key={periode.id} value={periode.id}>
                    {periode.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Buttons */}
          {trialBalanceData && (
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

          {/* Balance Status */}
          {trialBalanceData && (
            <div className="mb-6">
              <Card
                className={
                  trialBalanceData.isBalanced
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    {trialBalanceData.isBalanced ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {trialBalanceData.isBalanced
                          ? "Neraca Saldo Seimbang"
                          : "Neraca Saldo Tidak Seimbang"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trialBalanceData.isBalanced
                          ? "Total debit sama dengan total kredit"
                          : "Ada ketidakseimbangan dalam pencatatan transaksi"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Summary Cards */}
          {trialBalanceData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Saldo Awal
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(trialBalanceData.totalSaldoAwal)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Mutasi Debit
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(trialBalanceData.totalMutasiDebit)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Mutasi Kredit
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(trialBalanceData.totalMutasiKredit)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Saldo Akhir
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(trialBalanceData.totalSaldoAkhir)}
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
                Memuat neraca saldo...
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
          {trialBalanceData && !loading && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Akun</TableHead>
                    <TableHead className="text-right">Saldo Awal</TableHead>
                    <TableHead className="text-right">Mutasi Debit</TableHead>
                    <TableHead className="text-right">Mutasi Kredit</TableHead>
                    <TableHead className="text-right">Saldo Akhir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalanceData.entries.map((entry) => (
                    <TableRow key={entry.akun.id}>
                      <TableCell className="font-mono">
                        {entry.akun.kode}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.akun.nama}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(entry.saldoAwal)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {entry.mutasiDebit > 0
                          ? formatCurrency(entry.mutasiDebit)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {entry.mutasiKredit > 0
                          ? formatCurrency(entry.mutasiKredit)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(entry.saldoAkhir)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Totals Row */}
                  <TableRow className="border-t-2 font-semibold bg-muted/50">
                    <TableCell colSpan={2} className="text-right">
                      TOTAL
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(trialBalanceData.totalSaldoAwal)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {formatCurrency(trialBalanceData.totalMutasiDebit)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(trialBalanceData.totalMutasiKredit)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(trialBalanceData.totalSaldoAkhir)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}

          {!trialBalanceData && !loading && !error && (
            <div className="text-center py-8 text-muted-foreground">
              Pilih periode untuk melihat neraca saldo
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
