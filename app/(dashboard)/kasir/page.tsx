"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Search,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { CartItem } from "@/types";

interface Barang {
  id: string;
  nama: string;
  kategori: string;
  stok: number;
  hargaJual: number;
  satuan: string;
}

export default function KasirPage() {
  const [barang, setBarang] = useState<Barang[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [metodePembayaran, setMetodePembayaran] = useState("tunai");
  const [jumlahBayar, setJumlahBayar] = useState(0);
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const pajak = subtotal * 0.1; // 10% tax
  const diskon = 0;
  const total = subtotal + pajak - diskon;
  const kembalian = jumlahBayar - total;

  useEffect(() => {
    fetchBarang();
  }, []);

  async function fetchBarang() {
    try {
      const response = await fetch("/api/barang");
      const data = await response.json();
      setBarang(data);
    } catch (error) {
      toast.error("Gagal memuat data barang");
    }
  }

  function addToCart(item: Barang) {
    const existing = cart.find((c) => c.barangId === item.id);

    if (existing) {
      if (existing.qty >= item.stok) {
        toast.error(`Stok ${item.nama} tidak cukup`);
        return;
      }
      updateQuantity(item.id, existing.qty + 1);
    } else {
      if (item.stok < 1) {
        toast.error(`Stok ${item.nama} habis`);
        return;
      }
      setCart([
        ...cart,
        {
          id: Math.random().toString(),
          barangId: item.id,
          nama: item.nama,
          hargaJual: item.hargaJual,
          qty: 1,
          stok: item.stok,
          subtotal: item.hargaJual,
        },
      ]);
      toast.success(`${item.nama} ditambahkan ke keranjang`);
    }
  }

  function updateQuantity(barangId: string, newQty: number) {
    const item = cart.find((c) => c.barangId === barangId);
    if (!item) return;

    if (newQty <= 0) {
      removeFromCart(barangId);
      return;
    }

    if (newQty > item.stok) {
      toast.error("Jumlah melebihi stok tersedia");
      return;
    }

    setCart(
      cart.map((c) =>
        c.barangId === barangId
          ? { ...c, qty: newQty, subtotal: c.hargaJual * newQty }
          : c,
      ),
    );
  }

  function removeFromCart(barangId: string) {
    setCart(cart.filter((c) => c.barangId !== barangId));
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      toast.error("Keranjang masih kosong");
      return;
    }

    if (jumlahBayar < total) {
      toast.error("Jumlah bayar kurang dari total");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/transaksi-kasir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            barangId: item.barangId,
            namaBarang: item.nama,
            hargaSatuan: item.hargaJual,
            qty: item.qty,
            subtotal: item.subtotal,
          })),
          subtotal,
          pajak,
          diskon,
          total,
          metodePembayaran,
          jumlahBayar,
          kembalian,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal memproses transaksi");
      }

      const transaction = await response.json();
      setLastTransaction(transaction);
      setReceiptDialog(true);

      // Reset
      setCart([]);
      setJumlahBayar(0);
      fetchBarang(); // Refresh stock
      toast.success("Transaksi berhasil!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function printReceipt() {
    if (!lastTransaction) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk - ${lastTransaction.nomorTransaksi}</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            width: 300px;
            margin: 20px auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .info {
            margin-bottom: 10px;
            font-size: 12px;
          }
          .items {
            margin: 20px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
          }
          .separator {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          .total {
            font-weight: bold;
            font-size: 14px;
          }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FINARA</h1>
          <p>Sistem Ritel & Gudang</p>
        </div>
        <div class="separator"></div>
        <div class="info">
          <div>No: ${lastTransaction.nomorTransaksi}</div>
          <div>Tanggal: ${new Date(lastTransaction.tanggal).toLocaleString("id-ID")}</div>
          <div>Kasir: ${lastTransaction.kasir.nama}</div>
        </div>
        <div class="separator"></div>
        <div class="items">
          ${lastTransaction.itemTransaksi
            .map(
              (item: any) => `
            <div class="item">
              <span>${item.namaBarang} (${item.qty}x)</span>
              <span>Rp ${item.subtotal.toLocaleString("id-ID")}</span>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="separator"></div>
        <div class="item">
          <span>Subtotal:</span>
          <span>Rp ${lastTransaction.subtotal.toLocaleString("id-ID")}</span>
        </div>
        <div class="item">
          <span>Pajak (10%):</span>
          <span>Rp ${lastTransaction.pajak.toLocaleString("id-ID")}</span>
        </div>
        <div class="item">
          <span>Diskon:</span>
          <span>Rp ${lastTransaction.diskon.toLocaleString("id-ID")}</span>
        </div>
        <div class="separator"></div>
        <div class="item total">
          <span>TOTAL:</span>
          <span>Rp ${lastTransaction.total.toLocaleString("id-ID")}</span>
        </div>
        <div class="item">
          <span>Bayar:</span>
          <span>Rp ${lastTransaction.jumlahBayar.toLocaleString("id-ID")}</span>
        </div>
        <div class="item">
          <span>Kembalian:</span>
          <span>Rp ${lastTransaction.kembalian.toLocaleString("id-ID")}</span>
        </div>
        <div class="separator"></div>
        <div class="info" style="text-align: center; margin-top: 20px;">
          <p>Terima Kasih!</p>
        </div>
        <script>
          window.onload = () => {
            window.print();
            window.close();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  }

  const filteredBarang = barang.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      <Header title="Kasir" description="Point of Sale (POS)" />

      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Product List */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Pilih Barang</CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari barang..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredBarang.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => addToCart(item)}
                    >
                      <CardContent className="p-4">
                        <div className="font-medium text-sm mb-1">
                          {item.nama}
                        </div>
                        <div className="text-lg font-bold text-primary mb-1">
                          Rp {item.hargaJual.toLocaleString("id-ID")}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {item.kategori}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Stok: {item.stok}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart & Checkout */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Keranjang ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Keranjang kosong
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.nama}</div>
                          <div className="text-xs text-muted-foreground">
                            Rp {item.hargaJual.toLocaleString("id-ID")} /{" "}
                            {item.qty}x
                          </div>
                          <div className="text-sm font-bold">
                            Rp {item.subtotal.toLocaleString("id-ID")}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.barangId, item.qty - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.qty}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.barangId, item.qty + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => removeFromCart(item.barangId)}
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pajak (10%):</span>
                      <span>Rp {pajak.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diskon:</span>
                      <span>Rp {diskon.toLocaleString("id-ID")}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>TOTAL:</span>
                      <span>Rp {total.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metode">Metode Pembayaran</Label>
                    <Select
                      value={metodePembayaran}
                      onValueChange={setMetodePembayaran}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tunai">Tunai</SelectItem>
                        <SelectItem value="kartu">
                          Kartu Debit/Kredit
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bayar">Jumlah Bayar</Label>
                    <Input
                      id="bayar"
                      type="number"
                      value={jumlahBayar || ""}
                      onChange={(e) =>
                        setJumlahBayar(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>

                  {jumlahBayar > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Kembalian:</span>
                      <span
                        className={
                          kembalian < 0 ? "text-red-600" : "text-green-600"
                        }
                      >
                        Rp {kembalian.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleCheckout}
                    disabled={loading || cart.length === 0 || kembalian < 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {loading ? "Memproses..." : "Bayar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialog} onOpenChange={setReceiptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaksi Berhasil!</DialogTitle>
            <DialogDescription>
              Transaksi telah berhasil diproses
            </DialogDescription>
          </DialogHeader>
          {lastTransaction && (
            <div className="space-y-4">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Receipt className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <div className="text-sm text-muted-foreground mb-1">
                  No. Transaksi
                </div>
                <div className="text-lg font-bold">
                  {lastTransaction.nomorTransaksi}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">
                    Rp {lastTransaction.total.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bayar:</span>
                  <span>
                    Rp {lastTransaction.jumlahBayar.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Kembalian:</span>
                  <span className="font-bold">
                    Rp {lastTransaction.kembalian.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <Button className="w-full" onClick={printReceipt}>
                <Receipt className="mr-2 h-4 w-4" />
                Cetak Struk
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
