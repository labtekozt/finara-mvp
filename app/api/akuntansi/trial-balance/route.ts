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
        // Get opening balance from SaldoAwal table for the period
        let saldoAwal = 0;
        if (periode) {
          const openingBalance = await prisma.saldoAwal.findUnique({
            where: {
              akunId_periodeId: {
                akunId: akun.id,
                periodeId: periode.id,
              },
            },
          });
          saldoAwal = openingBalance?.saldo || 0;
        } else {
          // For all periods, opening balance is 0 (or we could calculate from all historical transactions)
          saldoAwal = 0;
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

        // Calculate ending balance based on account type and normal balance
        let saldoAkhir = saldoAwal;

        // For balance sheet accounts (Asset, Liability, Equity):
        // Normal balance is carried forward, then mutations are added/subtracted
        // For income statement accounts (Revenue, Expense):
        // They start at 0 each period, mutations create the balance
        if (akun.tipe === "ASSET") {
          // Assets: Debit normal, increase with debit, decrease with credit
          saldoAkhir = saldoAkhir + mutasiDebit - mutasiKredit;
        } else if (akun.tipe === "LIABILITY" || akun.tipe === "EQUITY") {
          // Liabilities & Equity: Credit normal, increase with credit, decrease with debit
          saldoAkhir = saldoAkhir + mutasiKredit - mutasiDebit;
        } else if (akun.tipe === "REVENUE") {
          // Revenue: Credit normal, increases with credit, decreases with debit
          // Revenue accounts typically start at 0 each period
          saldoAkhir = mutasiKredit - mutasiDebit;
        } else if (akun.tipe === "EXPENSE") {
          // Expense: Debit normal, increases with debit, decreases with credit
          // Expense accounts typically start at 0 each period
          saldoAkhir = mutasiDebit - mutasiKredit;
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
