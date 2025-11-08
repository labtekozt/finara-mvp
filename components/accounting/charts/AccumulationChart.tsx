"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AccumulationData, AccumulationPeriod } from "@/types/accounting";

interface AccumulationChartProps {
  data: AccumulationData[];
  period: AccumulationPeriod;
  loading?: boolean;
}

export function AccumulationChart({
  data,
  period,
  loading,
}: AccumulationChartProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-muted-foreground">
          Memuat data akumulasi...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          Tidak ada data untuk ditampilkan
        </p>
      </div>
    );
  }

  const formatPeriodLabel = (
    periodStr: string,
    periodType: AccumulationPeriod,
  ) => {
    switch (periodType) {
      case "daily":
        return new Date(periodStr).toLocaleDateString("id-ID");
      case "monthly":
        const [year, month] = periodStr.split("-");
        return `${month}/${year}`;
      case "yearly":
        return periodStr;
      default:
        return periodStr;
    }
  };

  const totalDebit = data.reduce((sum, item) => sum + item.totalDebit, 0);
  const totalKredit = data.reduce((sum, item) => sum + item.totalKredit, 0);
  const totalTransactions = data.reduce(
    (sum, item) => sum + item.transactionCount,
    0,
  );
  const balancedCount = data.filter((item) => item.isBalanced).length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">{totalTransactions}</div>
          <div className="text-xs text-muted-foreground">Total Transaksi</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">
            Rp {totalDebit.toLocaleString("id-ID")}
          </div>
          <div className="text-xs text-muted-foreground">Total Debit</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">
            Rp {totalKredit.toLocaleString("id-ID")}
          </div>
          <div className="text-xs text-muted-foreground">Total Kredit</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-semibold">
            {balancedCount}/{data.length}
          </div>
          <div className="text-xs text-muted-foreground">Seimbang</div>
        </div>
      </div>

      {/* Accumulation Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Periode</TableHead>
              <TableHead className="text-right">Jumlah Transaksi</TableHead>
              <TableHead className="text-right">Total Debit</TableHead>
              <TableHead className="text-right">Total Kredit</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {formatPeriodLabel(item.period, period)}
                </TableCell>
                <TableCell className="text-right">
                  {item.transactionCount}
                </TableCell>
                <TableCell className="text-right">
                  Rp {item.totalDebit.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  Rp {item.totalKredit.toLocaleString("id-ID")}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={item.isBalanced ? "default" : "destructive"}>
                    {item.isBalanced ? "✓" : "✗"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}

            {/* Totals Row */}
            <TableRow className="bg-muted/50 font-medium">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{totalTransactions}</TableCell>
              <TableCell className="text-right">
                Rp {totalDebit.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-right">
                Rp {totalKredit.toLocaleString("id-ID")}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={
                    totalDebit === totalKredit ? "default" : "destructive"
                  }
                >
                  {totalDebit === totalKredit ? "✓" : "✗"}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
