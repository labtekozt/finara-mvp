import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "today";
    const customStartDate = searchParams.get("startDate");
    const customEndDate = searchParams.get("endDate");

    let startDate: Date;
    let endDate: Date;

    if (customStartDate && customEndDate) {
      startDate = startOfDay(new Date(customStartDate));
      endDate = endOfDay(new Date(customEndDate));
    } else {
      const today = new Date();

      switch (period) {
        case "today":
          startDate = startOfDay(today);
          endDate = endOfDay(today);
          break;
        case "yesterday":
          const yesterday = subDays(today, 1);
          startDate = startOfDay(yesterday);
          endDate = endOfDay(yesterday);
          break;
        case "week":
          startDate = startOfWeek(today, { weekStartsOn: 1 });
          endDate = endOfWeek(today, { weekStartsOn: 1 });
          break;
        case "month":
          startDate = startOfMonth(today);
          endDate = endOfMonth(today);
          break;
        case "year":
          startDate = startOfYear(today);
          endDate = endOfYear(today);
          break;
        default:
          startDate = startOfDay(today);
          endDate = endOfDay(today);
      }
    }

    // Total penjualan
    const penjualan = await prisma.transaksiKasir.aggregate({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    // Barang dengan stok rendah (tidak terpengaruh filter tanggal)
    const barangStokRendah = await prisma.barang.count({
      where: {
        stok: {
          lte: prisma.barang.fields.stokMinimum,
        },
      },
    });

    // Transaksi barang masuk
    const barangMasuk = await prisma.transaksiMasuk.count({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Transaksi barang keluar
    const barangKeluar = await prisma.transaksiKeluar.count({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Transaksi terakhir
    const recentTransactions = await prisma.transaksiKasir.findMany({
      take: 5,
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        tanggal: "desc",
      },
      include: {
        kasir: true,
        itemTransaksi: {
          include: {
            barang: true,
          },
        },
      },
    });

    // Barang stok rendah
    const lowStockItems = await prisma.barang.findMany({
      where: {
        stok: {
          lte: prisma.barang.fields.stokMinimum,
        },
      },
      take: 5,
      include: {
        lokasi: true,
      },
      orderBy: {
        stok: "asc",
      },
    });

    // Barang terlaris
    const items = await prisma.itemTransaksi.groupBy({
      by: ["barangId"],
      where: {
        transaksiKasir: {
          tanggal: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      _sum: {
        qty: true,
      },
      orderBy: {
        _sum: {
          qty: "desc",
        },
      },
      take: 5,
    });

    const barangIds = items.map((item: any) => item.barangId);
    const barangDetails = await prisma.barang.findMany({
      where: {
        id: {
          in: barangIds,
        },
      },
    });

    const topSellingItems = items.map((item: any) => {
      const barang = barangDetails.find((b: any) => b.id === item.barangId);
      return {
        nama: barang?.nama || "Unknown",
        jumlah: item._sum.qty || 0,
      };
    });

    return NextResponse.json({
      stats: {
        totalPenjualan: penjualan._sum.total || 0,
        totalTransaksi: penjualan._count,
        barangStokRendah,
        totalBarangMasuk: barangMasuk,
        totalBarangKeluar: barangKeluar,
      },
      recentTransactions,
      lowStockItems,
      topSellingItems,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
