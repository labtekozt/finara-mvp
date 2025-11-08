import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const barangSchema = z.object({
  nama: z.string().min(1, "Nama barang harus diisi"),
  sku: z.string().optional(),
  kategori: z.string().min(1, "Kategori harus diisi"),
  stok: z.number().int().min(0, "Stok tidak boleh negatif"),
  stokMinimum: z.number().int().min(0, "Stok minimum tidak boleh negatif"),
  hargaBeli: z.number().min(0, "Harga beli tidak boleh negatif"),
  hargaJual: z.number().min(0, "Harga jual tidak boleh negatif"),
  satuan: z.string().min(1, "Satuan harus diisi"),
  deskripsi: z.string().optional(),
  lokasiId: z.string().min(1, "Lokasi harus dipilih"),
})

// GET - Get single item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const barang = await prisma.barang.findUnique({
      where: { id },
      include: {
        lokasi: true,
      },
    })

    if (!barang) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(barang)
  } catch (error) {
    console.error("Error fetching barang:", error)
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    )
  }
}

// PUT - Update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = barangSchema.parse(body)

    const barang = await prisma.barang.update({
      where: { id },
      data: validatedData,
      include: {
        lokasi: true,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "",
        action: "UPDATE",
        entity: "Barang",
        entityId: barang.id,
        description: `Mengupdate barang: ${barang.nama}`,
      },
    })

    return NextResponse.json(barang)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error updating barang:", error)
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    )
  }
}

// DELETE - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const barang = await prisma.barang.findUnique({
      where: { id },
    })

    if (!barang) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // Cek apakah barang sudah digunakan dalam transaksi
    const [itemTransaksiCount, transaksiMasukCount, transaksiKeluarCount] = await Promise.all([
      prisma.itemTransaksi.count({ where: { barangId: id } }),
      prisma.transaksiMasuk.count({ where: { barangId: id } }),
      prisma.transaksiKeluar.count({ where: { barangId: id } }),
    ])

    const totalTransaksi = itemTransaksiCount + transaksiMasukCount + transaksiKeluarCount

    if (totalTransaksi > 0) {
      const messages = []
      if (itemTransaksiCount > 0) messages.push(`${itemTransaksiCount} transaksi penjualan`)
      if (transaksiMasukCount > 0) messages.push(`${transaksiMasukCount} transaksi masuk`)
      if (transaksiKeluarCount > 0) messages.push(`${transaksiKeluarCount} transaksi keluar`)

      return NextResponse.json(
        {
          error: "Barang tidak dapat dihapus",
          message: `Barang "${barang.nama}" sudah digunakan dalam ${messages.join(", ")}. Hapus transaksi terkait terlebih dahulu atau nonaktifkan barang ini.`,
          transactionCount: totalTransaksi,
        },
        { status: 400 }
      )
    }

    await prisma.barang.delete({
      where: { id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "",
        action: "DELETE",
        entity: "Barang",
        entityId: id,
        description: `Menghapus barang: ${barang.nama}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting barang:", error)
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    )
  }
}


