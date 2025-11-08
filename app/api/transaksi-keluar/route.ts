import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { generateKeluarNumber } from "@/lib/transaction-number";
import { createJournalEntryForInventoryAdjustment } from "@/lib/accounting-utils";
import { z } from "zod";

const transaksiKeluarSchema = z.object({
  barangId: z.string().min(1, "Barang harus dipilih"),
  qty: z.number().int().positive("Jumlah harus lebih dari 0"),
  tujuan: z.string().min(1, "Tujuan barang harus diisi"),
  lokasiId: z.string().min(1, "Lokasi harus dipilih"),
  keterangan: z.string().optional(),
});

// GET - List outgoing transactions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const lokasiId = searchParams.get("lokasiId");

    const where: any = {};
    if (startDate || endDate) {
      where.tanggal = {};
      if (startDate) where.tanggal.gte = new Date(startDate);
      if (endDate) where.tanggal.lte = new Date(endDate);
    }
    if (lokasiId) where.lokasiId = lokasiId;

    const transaksi = await prisma.transaksiKeluar.findMany({
      where,
      include: {
        barang: true,
        lokasi: true,
      },
      orderBy: {
        tanggal: "desc",
      },
      take: 100,
    });

    return NextResponse.json(transaksi);
  } catch (error) {
    console.error("Error fetching transaksi keluar:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

// POST - Create outgoing transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = transaksiKeluarSchema.parse(body);

    // Check stock
    const barang = await prisma.barang.findUnique({
      where: { id: validatedData.barangId },
    });

    if (!barang) {
      return NextResponse.json(
        { error: "Barang tidak ditemukan" },
        { status: 404 },
      );
    }

    if (barang.stok < validatedData.qty) {
      return NextResponse.json(
        {
          error: `Stok ${barang.nama} tidak cukup. Tersedia: ${barang.stok} ${barang.satuan}`,
        },
        { status: 400 },
      );
    }

    const totalNilai = validatedData.qty * barang.hargaBeli;

    // Create transaction and update stock
    const transaksi = await prisma.$transaction(async (tx: any) => {
      const newTransaksi = await tx.transaksiKeluar.create({
        data: {
          nomorTransaksi: generateKeluarNumber(),
          barangId: validatedData.barangId,
          qty: validatedData.qty,
          hargaBarang: barang.hargaBeli,
          totalNilai,
          tujuan: validatedData.tujuan,
          lokasiId: validatedData.lokasiId,
          keterangan: validatedData.keterangan,
        },
        include: {
          barang: true,
          lokasi: true,
        },
      });

      // Update stock
      await tx.barang.update({
        where: { id: validatedData.barangId },
        data: {
          stok: {
            decrement: validatedData.qty,
          },
        },
      });

      // Create journal entry for inventory adjustment
      try {
        await createJournalEntryForInventoryAdjustment(
          newTransaksi.id,
          totalNilai,
          session.user.id,
        );
      } catch (journalError) {
        console.error(
          "Failed to create journal entry for outgoing transaction:",
          journalError,
        );
        // Don't fail the transaction if journal creation fails
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || "",
          action: "CREATE",
          entity: "TransaksiKeluar",
          entityId: newTransaksi.id,
          description: `Barang keluar ${newTransaksi.nomorTransaksi} - ${newTransaksi.barang.nama} (${validatedData.qty} ${newTransaksi.barang.satuan})`,
        },
      });

      return newTransaksi;
    });

    return NextResponse.json(transaksi, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Error creating transaksi keluar:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
