import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { TrialBalanceData } from "@/types/accounting";

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

    // Get all active accounts
    const accounts = await prisma.akun.findMany({
      where: { isActive: true },
      orderBy: [{ tipe: "asc" }, { kode: "asc" }],
    });

    // Get period info if specified
    let periode = null;
    if (periodeId) {
      periode = await prisma.periodeAkuntansi.findUnique({
        where: { id: periodeId },
      });
    }

    // Calculate trial balance for each account
    const entries = await Promise.all(
      accounts.map(async (akun) => {
        // Calculate opening balance (saldo awal) - all transactions before period start
        let saldoAwal = 0;
        const openingWhere: any = {
          akunId: akun.id,
        };

        if (periode) {
          openingWhere.jurnal = {
            tanggal: {
              lt: periode.tanggalMulai,
            },
          };
        }

        const openingDetails = await prisma.jurnalDetail.findMany({
          where: openingWhere,
          select: {
            debit: true,
            kredit: true,
          },
        });

        // Calculate opening balance based on account type
        for (const detail of openingDetails) {
          if (akun.tipe === "ASSET" || akun.tipe === "EXPENSE") {
            saldoAwal += detail.debit - detail.kredit;
          } else {
            saldoAwal += detail.kredit - detail.debit;
          }
        }

        // Calculate mutations within the period
        let mutasiDebit = 0;
        let mutasiKredit = 0;

        const mutationWhere: any = {
          akunId: akun.id,
        };

        if (periode) {
          mutationWhere.jurnal = {
            periodeId: periode.id,
          };
        }

        const mutationDetails = await prisma.jurnalDetail.findMany({
          where: mutationWhere,
          select: {
            debit: true,
            kredit: true,
          },
        });

        for (const detail of mutationDetails) {
          mutasiDebit += detail.debit;
          mutasiKredit += detail.kredit;
        }

        // Calculate ending balance
        let saldoAkhir = saldoAwal;
        if (akun.tipe === "ASSET" || akun.tipe === "EXPENSE") {
          saldoAkhir += mutasiDebit - mutasiKredit;
        } else {
          saldoAkhir += mutasiKredit - mutasiDebit;
        }

        return {
          akun,
          saldoAwal,
          mutasiDebit,
          mutasiKredit,
          saldoAkhir,
        };
      }),
    );

    // Calculate totals
    const totalSaldoAwal = entries.reduce(
      (sum, entry) => sum + entry.saldoAwal,
      0,
    );
    const totalMutasiDebit = entries.reduce(
      (sum, entry) => sum + entry.mutasiDebit,
      0,
    );
    const totalMutasiKredit = entries.reduce(
      (sum, entry) => sum + entry.mutasiKredit,
      0,
    );
    const totalSaldoAkhir = entries.reduce(
      (sum, entry) => sum + entry.saldoAkhir,
      0,
    );

    // Check if balanced (total debits should equal total credits)
    const isBalanced =
      Math.abs(
        totalSaldoAwal + totalMutasiDebit - totalMutasiKredit - totalSaldoAkhir,
      ) < 0.01;

    const result: TrialBalanceData = {
      periodeId: periodeId || undefined,
      periode: periode || undefined,
      entries,
      totalSaldoAwal,
      totalMutasiDebit,
      totalMutasiKredit,
      totalSaldoAkhir,
      isBalanced,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching trial balance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
