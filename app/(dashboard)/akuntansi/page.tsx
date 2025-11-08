"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calculator,
  FileText,
  BookOpen,
  TrendingUp,
  Settings,
  Scale,
  Lock,
} from "lucide-react";
import { useAccountingDashboard } from "@/hooks/accounting";
import { AccountingDashboard } from "@/components/accounting/AccountingDashboard";
import { AccountsManagement } from "@/components/accounting/AccountsManagement";
import { JournalsManagement } from "@/components/accounting/JournalsManagement";
import { ExpensesManagement } from "@/components/accounting/ExpensesManagement";
import { GeneralLedger } from "@/components/accounting/GeneralLedger";
import { TrialBalance } from "@/components/accounting/TrialBalance";
import { FinancialStatements } from "@/components/accounting/FinancialStatements";
import { PeriodClosing } from "@/components/accounting/PeriodClosing";

export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPeriode, setSelectedPeriode] = useState<string>("");

  const { periods, stats, loading } = useAccountingDashboard();

  // Set default active period
  React.useEffect(() => {
    if (periods.length > 0 && !selectedPeriode) {
      const activePeriod = periods.find((p) => p.isActive);
      if (activePeriod) {
        setSelectedPeriode(activePeriod.id);
      }
    }
  }, [periods, selectedPeriode]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Akuntansi</h2>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="dashboard">
            <TrendingUp className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="akun">
            <Calculator className="mr-2 h-4 w-4" />
            Daftar Akun
          </TabsTrigger>
          <TabsTrigger value="buku-besar">
            <BookOpen className="mr-2 h-4 w-4" />
            Buku Besar
          </TabsTrigger>
          <TabsTrigger value="trial-balance">
            <Scale className="mr-2 h-4 w-4" />
            Neraca Saldo
          </TabsTrigger>
          <TabsTrigger value="laporan-keuangan">
            <FileText className="mr-2 h-4 w-4" />
            Laporan Keuangan
          </TabsTrigger>
          <TabsTrigger value="penutupan-periode">
            <Lock className="mr-2 h-4 w-4" />
            Penutupan Periode
          </TabsTrigger>
          <TabsTrigger value="jurnal">
            <BookOpen className="mr-2 h-4 w-4" />
            Jurnal
          </TabsTrigger>
          <TabsTrigger value="pengeluaran">
            <FileText className="mr-2 h-4 w-4" />
            Pengeluaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <AccountingDashboard stats={stats} loading={loading} />
        </TabsContent>

        <TabsContent value="akun" className="space-y-4">
          <AccountsManagement />
        </TabsContent>

        <TabsContent value="buku-besar" className="space-y-4">
          <GeneralLedger />
        </TabsContent>

        <TabsContent value="trial-balance" className="space-y-4">
          <TrialBalance />
        </TabsContent>

        <TabsContent value="laporan-keuangan" className="space-y-4">
          <FinancialStatements />
        </TabsContent>

        <TabsContent value="penutupan-periode" className="space-y-4">
          <PeriodClosing
            periode={periods.find((p) => p.id === selectedPeriode)!}
          />
        </TabsContent>

        <TabsContent value="jurnal" className="space-y-4">
          <JournalsManagement selectedPeriode={selectedPeriode} />
        </TabsContent>

        <TabsContent value="pengeluaran" className="space-y-4">
          <ExpensesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
