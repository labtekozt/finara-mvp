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
import { Barang, Lokasi } from "../types";

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
}: BarangKeluarDialogProps) {
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
    </Dialog>
  );
}
