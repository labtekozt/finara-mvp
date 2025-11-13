"use client";

import { useState, useMemo } from "react";
import { useOpeningBalances, useAccounts } from "@/hooks/accounting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { SaldoAwal, PeriodeAkuntansi } from "@/types/accounting";

interface OpeningBalanceManagementProps {
  periods: PeriodeAkuntansi[];
}

export function OpeningBalanceManagement({
  periods,
}: OpeningBalanceManagementProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [editingBalance, setEditingBalance] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [newBalance, setNewBalance] = useState({
    akunId: "",
    saldo: 0,
  });

  const { accounts, loading: accountsLoading } = useAccounts();
  const {
    openingBalances,
    loading: balancesLoading,
    error,
    createOpeningBalance,
    updateOpeningBalance,
    deleteOpeningBalance,
  } = useOpeningBalances(selectedPeriod);

  const activePeriods = useMemo(
    () => periods.filter((p) => !p.isClosed),
    [periods],
  );

  const availableAccounts = useMemo(
    () =>
      accounts.filter(
        (account) =>
          !openingBalances.some((balance) => balance.akunId === account.id),
      ),
    [accounts, openingBalances],
  );

  const handleCreateBalance = async () => {
    if (!selectedPeriod || !newBalance.akunId || newBalance.saldo === 0) {
      toast.error("Harap lengkapi semua field");
      return;
    }

    try {
      await createOpeningBalance({
        periodeId: selectedPeriod,
        akunId: newBalance.akunId,
        saldo: newBalance.saldo,
      });
      setNewBalance({ akunId: "", saldo: 0 });
      toast.success("Saldo awal berhasil ditambahkan");
    } catch (error) {
      toast.error("Gagal menambahkan saldo awal");
    }
  };

  const handleUpdateBalance = async (akunId: string) => {
    if (!selectedPeriod) return;

    const saldo = parseFloat(editValue);
    if (isNaN(saldo)) {
      toast.error("Saldo harus berupa angka");
      return;
    }

    try {
      await updateOpeningBalance(akunId, selectedPeriod, saldo);
      setEditingBalance(null);
      setEditValue("");
      toast.success("Saldo awal berhasil diperbarui");
    } catch (error) {
      toast.error("Gagal memperbarui saldo awal");
    }
  };

  const handleDeleteBalance = async (akunId: string) => {
    if (!selectedPeriod) return;

    try {
      await deleteOpeningBalance(akunId, selectedPeriod);
      toast.success("Saldo awal berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus saldo awal");
    }
  };

  const startEditing = (balance: SaldoAwal) => {
    setEditingBalance(balance.akunId);
    setEditValue(balance.saldo.toString());
  };

  const cancelEditing = () => {
    setEditingBalance(null);
    setEditValue("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  if (accountsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Saldo Awal</CardTitle>
          <CardDescription>
            Kelola saldo awal untuk periode akuntansi yang dipilih
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Period Selection */}
          <div className="flex items-center space-x-4">
            <Label htmlFor="period-select">Periode Akuntansi:</Label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                {activePeriods.map((period) => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPeriod && (
            <>
              {/* Add New Balance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Tambah Saldo Awal Baru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="account-select">Akun</Label>
                      <Select
                        value={newBalance.akunId}
                        onValueChange={(value) =>
                          setNewBalance((prev) => ({ ...prev, akunId: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih akun" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.kode} - {account.nama}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="balance-input">Saldo Awal</Label>
                      <Input
                        id="balance-input"
                        type="number"
                        step="0.01"
                        value={newBalance.saldo}
                        onChange={(e) =>
                          setNewBalance((prev) => ({
                            ...prev,
                            saldo: parseFloat(e.target.value) || 0,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleCreateBalance} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Balances Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Saldo Awal Periode</CardTitle>
                  <CardDescription>
                    Daftar saldo awal untuk periode yang dipilih
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {balancesLoading ? (
                    <div>Loading...</div>
                  ) : error ? (
                    <div className="text-red-500">{error}</div>
                  ) : openingBalances.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada saldo awal untuk periode ini
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kode Akun</TableHead>
                          <TableHead>Nama Akun</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Saldo Awal</TableHead>
                          <TableHead className="w-32">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {openingBalances.map((balance) => (
                          <TableRow key={balance.akunId}>
                            <TableCell className="font-mono">
                              {balance.akun.kode}
                            </TableCell>
                            <TableCell>{balance.akun.nama}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {balance.akun.tipe}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {editingBalance === balance.akunId ? (
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-32"
                                />
                              ) : (
                                <span className="font-mono">
                                  {formatCurrency(balance.saldo)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {editingBalance === balance.akunId ? (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleUpdateBalance(balance.akunId)
                                      }
                                    >
                                      <Save className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={cancelEditing}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => startEditing(balance)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            `Apakah Anda yakin ingin menghapus saldo awal untuk akun ${balance.akun.nama}?`,
                                          )
                                        ) {
                                          handleDeleteBalance(balance.akunId);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
