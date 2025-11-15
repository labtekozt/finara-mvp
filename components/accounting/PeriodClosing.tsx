"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Lock,
  Unlock,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PeriodClosingData, PeriodeAkuntansi } from "@/types/accounting";
import { exportPeriodClosingToPDF } from "@/lib/pdf-export";

interface PreCloseValidation {
  isValid: boolean;
  issues: string[];
  summary: {
    totalJournals: number;
    unpostedJournals: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    retainedEarningsAccount?: {
      id: string;
      nama: string;
      kode: string;
    };
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

interface PeriodClosingProps {
  periode: PeriodeAkuntansi;
}

export function PeriodClosing({ periode }: PeriodClosingProps) {
  const [closingData, setClosingData] = useState<PeriodClosingData | null>(
    null,
  );
  const [preCloseValidation, setPreCloseValidation] =
    useState<PreCloseValidation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    loadClosingStatus();
    loadPreCloseValidation();
  }, [periode.id]);

  const loadClosingStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/akuntansi/periode/${periode.id}/closing-status`,
      );
      if (response.ok) {
        const data = await response.json();
        setClosingData(data);
      } else if (response.status === 404) {
        setClosingData(null);
      } else {
        throw new Error("Failed to load closing status");
      }
    } catch (error) {
      console.error("Error loading closing status:", error);
      toast.error("Gagal memuat status penutupan periode");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreCloseValidation = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(
        `/api/akuntansi/periode/${periode.id}/pre-close`,
      );
      if (response.ok) {
        const data = await response.json();
        setPreCloseValidation(data);
      } else {
        throw new Error("Failed to load pre-close validation");
      }
    } catch (error) {
      console.error("Error loading pre-close validation:", error);
      toast.error("Gagal memuat validasi pra-penutupan");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClosePeriod = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menutup periode ini? Tindakan ini tidak dapat dibatalkan.",
      )
    ) {
      return;
    }

    setIsClosing(true);
    try {
      const response = await fetch(
        `/api/akuntansi/periode/${periode.id}/close`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        toast.success("Periode berhasil ditutup");
        await loadClosingStatus();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Gagal menutup periode");
      }
    } catch (error) {
      console.error("Error closing period:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal menutup periode",
      );
    } finally {
      setIsClosing(false);
    }
  };

  const handleExportPDF = () => {
    if (!closingData) return;

    try {
      exportPeriodClosingToPDF(closingData);
      toast.success("Laporan penutupan periode berhasil diekspor");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Gagal mengekspor laporan");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat status penutupan...</span>
        </CardContent>
      </Card>
    );
  }

  if (!closingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Penutupan Periode
          </CardTitle>
          <CardDescription>
            Periode {periode.nama} belum ditutup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800">
                Penutupan periode akan membuat jurnal penutupan untuk akun
                pendapatan dan beban, serta membuat saldo awal untuk periode
                berikutnya.
              </p>
            </CardContent>
          </Card>

          {/* Pre-close Validation */}
          {isValidating ? (
            <Card>
              <CardContent className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Memvalidasi periode...</span>
              </CardContent>
            </Card>
          ) : (
            preCloseValidation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {preCloseValidation.isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    Validasi Pra-Penutupan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {preCloseValidation.summary.totalJournals}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Jurnal
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {preCloseValidation.summary.unpostedJournals}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Belum Diposting
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(
                          preCloseValidation.summary.totalRevenue,
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Pendapatan
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-red-600">
                        {formatCurrency(
                          preCloseValidation.summary.totalExpenses,
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Beban
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Laba Bersih Periode
                      </div>
                      <div
                        className={`text-xl font-bold ${
                          preCloseValidation.summary.netIncome >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(preCloseValidation.summary.netIncome)}
                      </div>
                    </div>
                    {preCloseValidation.summary.retainedEarningsAccount && (
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Akun Laba Ditahan
                        </div>
                        <div className="font-medium">
                          {
                            preCloseValidation.summary.retainedEarningsAccount
                              .kode
                          }{" "}
                          -{" "}
                          {
                            preCloseValidation.summary.retainedEarningsAccount
                              .nama
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Issues */}
                  {preCloseValidation.issues.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">
                          Masalah yang harus diperbaiki:
                        </span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                        {preCloseValidation.issues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          )}

          <div className="mt-4">
            <Button
              onClick={handleClosePeriod}
              disabled={isClosing || !preCloseValidation?.isValid}
              className="w-full"
            >
              {isClosing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menutup Periode...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Tutup Periode
                </>
              )}
            </Button>
            {!preCloseValidation?.isValid && (
              <p className="text-sm text-red-600 mt-2 text-center">
                Perbaiki masalah validasi sebelum menutup periode
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5" />
            Periode Ditutup
          </CardTitle>
          <CardDescription>
            Periode {periode.nama} telah ditutup pada{" "}
            {new Date(closingData.closedAt!).toLocaleDateString("id-ID")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(closingData.netIncome)}
              </div>
              <div className="text-sm text-muted-foreground">Laba Bersih</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {closingData.closingEntries.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Jurnal Penutupan
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {closingData.openingBalances.length}
              </div>
              <div className="text-sm text-muted-foreground">Saldo Awal</div>
            </div>
          </div>

          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Ekspor Laporan PDF
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jurnal Penutupan</CardTitle>
          <CardDescription>
            Jurnal yang dibuat saat penutupan periode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Akun</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Kredit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closingData.closingEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell colSpan={5} className="font-medium bg-muted/50">
                    {new Date(entry.tanggal).toLocaleDateString("id-ID")} -{" "}
                    {entry.deskripsi}
                  </TableCell>
                </TableRow>
              ))}
              {closingData.closingEntries.flatMap((entry) =>
                entry.details.map((detail, index) => (
                  <TableRow key={`${entry.id}-${index}`}>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>{detail.akun.nama}</TableCell>
                    <TableCell className="text-right">
                      {detail.debit > 0 ? formatCurrency(detail.debit) : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      {detail.kredit > 0 ? formatCurrency(detail.kredit) : ""}
                    </TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saldo Awal Periode Berikutnya</CardTitle>
          <CardDescription>
            Saldo awal yang dibuat untuk periode berikutnya
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Akun</TableHead>
                <TableHead className="text-right">Saldo Awal</TableHead>
                <TableHead>Tipe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {closingData.openingBalances.map((balance) => (
                <TableRow key={balance.id}>
                  <TableCell>{balance.akun.nama}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(balance.saldo)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={balance.saldo >= 0 ? "default" : "secondary"}
                    >
                      {balance.saldo >= 0 ? "Debit" : "Kredit"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
