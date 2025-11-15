import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Barang, Lokasi } from "@/app/(dashboard)/inventaris/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface BarangKeluarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formKeluar: {
    barangId: string;
    qty: number;
    tujuan: string;
    lokasiId: string;
    keterangan: string;
  };
  setFormKeluar: (data: any) => void;
  barang: Barang[];
  lokasi: Lokasi[];
  loading: boolean;
  handleSubmitKeluar: (e: React.FormEvent) => void;
  handleBarangChangeKeluar: (value: string) => void;
  resetFormKeluar: () => void;
  onLokasiAdded?: () => void;
}

export function BarangKeluarDialog({
  open,
  onOpenChange,
  formKeluar,
  setFormKeluar,
  barang,
  lokasi,
  loading,
  handleSubmitKeluar,
  handleBarangChangeKeluar,
  resetFormKeluar,
  onLokasiAdded,
}: BarangKeluarDialogProps) {
  const [lokasiDialogOpen, setLokasiDialogOpen] = useState(false);
  const [lokasiFormData, setLokasiFormData] = useState({
    namaLokasi: "",
    alamat: "",
  });
  const [lokasiLoading, setLokasiLoading] = useState(false);

  const handleCreateLokasi = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lokasiFormData.namaLokasi.trim()) {
      toast.error("Nama lokasi harus diisi");
      return;
    }

    try {
      setLokasiLoading(true);
      const response = await fetch("/api/lokasi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namaLokasi: lokasiFormData.namaLokasi.trim(),
          alamat: lokasiFormData.alamat.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menambah lokasi");
      }

      toast.success("Lokasi berhasil ditambahkan");
      setLokasiDialogOpen(false);
      setLokasiFormData({ namaLokasi: "", alamat: "" });

      // Refresh lokasi list
      if (onLokasiAdded) {
        onLokasiAdded();
      }

      // Auto-select the newly created location
      setFormKeluar({ ...formKeluar, lokasiId: data.id });
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan");
    } finally {
      setLokasiLoading(false);
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetFormKeluar();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaksi Barang Keluar</DialogTitle>
          <DialogDescription>Catat barang keluar dari gudang</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmitKeluar}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="barang-keluar">Barang *</Label>
              <Select
                value={formKeluar.barangId}
                onValueChange={handleBarangChangeKeluar}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih barang" />
                </SelectTrigger>
                <SelectContent>
                  {barang.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.nama} - Stok: {b.stok} {b.satuan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty-keluar">Jumlah *</Label>
              <Input
                id="qty-keluar"
                type="number"
                value={formKeluar.qty || ""}
                onChange={(e) =>
                  setFormKeluar({
                    ...formKeluar,
                    qty: parseInt(e.target.value) || 0,
                  })
                }
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tujuan">Tujuan *</Label>
              <Input
                id="tujuan"
                value={formKeluar.tujuan}
                onChange={(e) =>
                  setFormKeluar({ ...formKeluar, tujuan: e.target.value })
                }
                placeholder="Contoh: Toko Cabang A, Retur Supplier, Rusak"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lokasi-keluar">Lokasi Gudang *</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={formKeluar.lokasiId}
                    onValueChange={(value) =>
                      setFormKeluar({ ...formKeluar, lokasiId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {lokasi.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.namaLokasi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setLokasiDialogOpen(true)}
                  title="Tambah Lokasi Baru"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan-keluar">Keterangan</Label>
              <Input
                id="keterangan-keluar"
                value={formKeluar.keterangan}
                onChange={(e) =>
                  setFormKeluar({ ...formKeluar, keterangan: e.target.value })
                }
                placeholder="Catatan tambahan (opsional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Dialog Tambah Lokasi */}
      <Dialog open={lokasiDialogOpen} onOpenChange={setLokasiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Lokasi Baru</DialogTitle>
            <DialogDescription>
              Tambahkan lokasi gudang baru ke sistem
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLokasi}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="namaLokasi">Nama Lokasi *</Label>
                <Input
                  id="namaLokasi"
                  value={lokasiFormData.namaLokasi}
                  onChange={(e) =>
                    setLokasiFormData({
                      ...lokasiFormData,
                      namaLokasi: e.target.value,
                    })
                  }
                  placeholder="Contoh: Gudang Utama, Cabang A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  value={lokasiFormData.alamat}
                  onChange={(e) =>
                    setLokasiFormData({
                      ...lokasiFormData,
                      alamat: e.target.value,
                    })
                  }
                  placeholder="Alamat lokasi (opsional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLokasiDialogOpen(false);
                  setLokasiFormData({ namaLokasi: "", alamat: "" });
                }}
                disabled={lokasiLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={lokasiLoading}>
                {lokasiLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
