import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { BalanceSheetData } from "@/types/accounting";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.role, "canAccessTransaksi")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const periodeId = searchParams.get("periodeId");

    // Get period info if specified
    let periode = null;
    if (periodeId) {
      periode = await prisma.periodeAkuntansi.findUnique({
        where: { id: periodeId },
      });
    }

    // Get all active accounts with their balances
    const accounts = await prisma.akun.findMany({
      where: { isActive: true },
      orderBy: [{ tipe: "asc" }, { kode: "asc" }],
    });

    // Calculate balances for each account
    const accountBalances = await Promise.all(
      accounts.map(async (akun) => {
        // Calculate balance up to period end (or current date if no period)
        const balanceWhere: any = {
          akunId: akun.id,
        };

        if (periode) {
          balanceWhere.jurnal = {
            tanggal: {
              lte: periode.tanggalAkhir,
            },
            periodeId: periode.id,
          };
        }

        const details = await prisma.jurnalDetail.findMany({
          where: balanceWhere,
          select: {
            debit: true,
            kredit: true,
          },
        });

        // Calculate balance based on account type
        let balance = 0;
        for (const detail of details) {
          if (akun.tipe === "ASSET" || akun.tipe === "EXPENSE") {
            balance += detail.debit - detail.kredit;
          } else {
            balance += detail.kredit - detail.debit;
          }
        }

        return {
          akun,
          saldo: balance,
        };
      }),
    );

    // Group accounts by type for balance sheet
    const assets = accountBalances.filter(
      (item) => item.akun.tipe === "ASSET" && item.saldo !== 0,
    );
    const liabilities = accountBalances.filter(
      (item) => item.akun.tipe === "LIABILITY" && item.saldo !== 0,
    );
    const equity = accountBalances.filter(
      (item) => item.akun.tipe === "EQUITY" && item.saldo !== 0,
    );

    // Calculate totals
    const totalAssets = assets.reduce((sum, item) => sum + item.saldo, 0);
    const totalLiabilities = liabilities.reduce(
      (sum, item) => sum + item.saldo,
      0,
    );
    const totalEquity = equity.reduce((sum, item) => sum + item.saldo, 0);
    const totalLiabilitiesEquity = totalLiabilities + totalEquity;

    // Check if balanced
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesEquity) < 0.01;

    const result: BalanceSheetData = {
      periodeId: periodeId || undefined,
      periode: periode || undefined,
      assets: {
        title: "ASET",
        entries: assets,
        total: totalAssets,
      },
      liabilities: {
        title: "KEWAJIBAN",
        entries: liabilities,
        total: totalLiabilities,
      },
      equity: {
        title: "EKUITAS",
        entries: equity,
        total: totalEquity,
      },
      totalAssets,
      totalLiabilitiesEquity,
      isBalanced,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching balance sheet:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
