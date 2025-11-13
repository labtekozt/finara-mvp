import {
  Dialog,
  DialogContent,
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

interface TambahEditBarangDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: Barang | null;
  tambahMode: "new" | "existing";
  formData: {
    nama: string;
    sku: string;
    kategori: string;
    stok: number;
    stokMinimum: number;
    hargaBeli: number;
    hargaJual: number;
    satuan: string;
    deskripsi: string;
    lokasiId: string;
  };
  setFormData: (data: any) => void;
  formTambahStok: {
    barangId: string;
    qty: number;
    hargaBeli: number;
    sumber: string;
    lokasiId: string;
    keterangan: string;
  };
  setFormTambahStok: (data: any) => void;
  barang: Barang[];
  lokasi: Lokasi[];
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  handleSelectForTambah: (value: string) => void;
  resetForm: () => void;
}

export function TambahEditBarangDialog({
  open,
  onOpenChange,
  editingItem,
  tambahMode,
  formData,
  setFormData,
  formTambahStok,
  setFormTambahStok,
  barang,
  lokasi,
  loading,
  handleSubmit,
  handleSelectForTambah,
  resetForm,
}: TambahEditBarangDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Edit Barang" : "Tambah Barang"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Pilih barang atau tambah baru (gabungan) - tampil jika bukan edit */}
            {!editingItem && (
              <div className="space-y-2">
                <Label>Pilih Barang atau Tambah Baru</Label>
                <Select
                  value={
                    tambahMode === "new" ? "NEW" : formTambahStok.barangId || ""
                  }
                  onValueChange={(value: string) =>
                    handleSelectForTambah(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih barang atau tambah baru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">➕ Tambah Barang Baru</SelectItem>
                    {barang.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.nama} - Stok: {b.stok} {b.satuan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Form untuk TAMBAH STOK (existing) */}
            {!editingItem && tambahMode === "existing" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qty-tambah">Jumlah Tambah Stok *</Label>
                    <Input
                      id="qty-tambah"
                      type="number"
                      value={formTambahStok.qty || ""}
                      onChange={(e) =>
                        setFormTambahStok({
                          ...formTambahStok,
                          qty: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="harga-beli-tambah">Harga Beli *</Label>
                    <Input
                      id="harga-beli-tambah"
                      type="number"
                      value={formTambahStok.hargaBeli || ""}
                      onChange={(e) =>
                        setFormTambahStok({
                          ...formTambahStok,
                          hargaBeli: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sumber-tambah">Sumber Barang *</Label>
                  <Input
                    id="sumber-tambah"
                    value={formTambahStok.sumber}
                    onChange={(e) =>
                      setFormTambahStok({
                        ...formTambahStok,
                        sumber: e.target.value,
                      })
                    }
                    placeholder="Contoh: Supplier A, Pembelian Lokal, Transfer Cabang"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lokasi-tambah">Lokasi Gudang *</Label>
                  <Select
                    value={formTambahStok.lokasiId}
                    onValueChange={(value: string) =>
                      setFormTambahStok({
                        ...formTambahStok,
                        lokasiId: value,
                      })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {lokasi.map((lok) => (
                        <SelectItem key={lok.id} value={lok.id}>
                          {lok.namaLokasi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keterangan-tambah">Keterangan</Label>
                  <Input
                    id="keterangan-tambah"
                    value={formTambahStok.keterangan}
                    onChange={(e) =>
                      setFormTambahStok({
                        ...formTambahStok,
                        keterangan: e.target.value,
                      })
                    }
                    placeholder="Catatan tambahan (opsional)"
                  />
                </div>

                {formTambahStok.qty > 0 && formTambahStok.hargaBeli > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      Total Nilai Tambah Stok
                    </div>
                    <div className="text-2xl font-bold">
                      Rp{" "}
                      {(
                        formTambahStok.qty * formTambahStok.hargaBeli
                      ).toLocaleString("id-ID")}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Form untuk BARANG BARU (custom) atau EDIT */}
            {(editingItem || tambahMode === "new") && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Barang *</Label>
                    <Input
                      id="nama"
                      value={formData.nama}
                      onChange={(e) =>
                        setFormData({ ...formData, nama: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      placeholder="Kode unik (opsional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kategori">Kategori *</Label>
                    <Input
                      id="kategori"
                      value={formData.kategori}
                      onChange={(e) =>
                        setFormData({ ...formData, kategori: e.target.value })
                      }
                      placeholder="Contoh: Elektronik, Makanan"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="satuan">Satuan *</Label>
                    <Input
                      id="satuan"
                      value={formData.satuan}
                      onChange={(e) =>
                        setFormData({ ...formData, satuan: e.target.value })
                      }
                      placeholder="Contoh: pcs, kg, box"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stok">Stok Awal *</Label>
                    <Input
                      id="stok"
                      type="number"
                      value={formData.stok}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stok: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stokMinimum">Stok Minimum *</Label>
                    <Input
                      id="stokMinimum"
                      type="number"
                      value={formData.stokMinimum}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stokMinimum: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hargaBeli">Harga Beli *</Label>
                    <Input
                      id="hargaBeli"
                      type="number"
                      value={formData.hargaBeli}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hargaBeli: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hargaJual">Harga Jual *</Label>
                    <Input
                      id="hargaJual"
                      type="number"
                      value={formData.hargaJual}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hargaJual: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lokasiId">Lokasi *</Label>
                  <Select
                    value={formData.lokasiId}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, lokasiId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih lokasi" />
                    </SelectTrigger>
                    <SelectContent>
                      {lokasi.map((lok) => (
                        <SelectItem key={lok.id} value={lok.id}>
                          {lok.namaLokasi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Input
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData({ ...formData, deskripsi: e.target.value })
                    }
                    placeholder="Informasi tambahan (opsional)"
                  />
                </div>
              </>
            )}
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
              {loading ? "Menyimpan..." : editingItem ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
