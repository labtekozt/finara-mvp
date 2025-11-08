import { prisma } from "./prisma"
import { generateTransactionNumber } from "./transaction-number"

// Account codes (these should match your chart of accounts)
export const ACCOUNT_CODES = {
  // Assets
  CASH: "1001",
  ACCOUNTS_RECEIVABLE: "1002",
  INVENTORY: "1003",

  // Liabilities
  ACCOUNTS_PAYABLE: "2001",

  // Equity
  OWNER_EQUITY: "3001",
  RETAINED_EARNINGS: "3002",

  // Revenue
  SALES_REVENUE: "4001",

  // Expenses
  COST_OF_GOODS_SOLD: "5001",
  SALARY_EXPENSE: "5002",
  UTILITY_EXPENSE: "5003",
  OTHER_EXPENSE: "5004"
}

// Get active accounting period
export async function getActiveAccountingPeriod() {
  return await prisma.periodeAkuntansi.findFirst({
    where: { isActive: true }
  })
}

// Get account by code
export async function getAccountByCode(code: string) {
  return await prisma.akun.findFirst({
    where: {
      kode: code,
      isActive: true
    }
  })
}

// Create journal entry for POS transaction
export async function createJournalEntryForSale(
  transaksiKasirId: string,
  totalAmount: number,
  userId: string
) {
  const periode = await getActiveAccountingPeriod()
  if (!periode) {
    throw new Error("Tidak ada periode akuntansi aktif")
  }

  const cashAccount = await getAccountByCode(ACCOUNT_CODES.CASH)
  const salesRevenueAccount = await getAccountByCode(ACCOUNT_CODES.SALES_REVENUE)

  if (!cashAccount || !salesRevenueAccount) {
    throw new Error("Akun kas atau pendapatan penjualan tidak ditemukan")
  }

  const nomorJurnal = generateTransactionNumber("JR")

  const jurnalEntry = await prisma.jurnalEntry.create({
    data: {
      nomorJurnal,
      tanggal: new Date(),
      deskripsi: `Penjualan POS - ${transaksiKasirId}`,
      referensi: transaksiKasirId,
      tipeReferensi: "SALE",
      periodeId: periode.id,
      userId,
      isPosted: true,
      details: {
        create: [
          // Debit Cash (Asset increases)
          {
            akunId: cashAccount.id,
            debit: totalAmount,
            kredit: 0,
            deskripsi: "Penerimaan kas dari penjualan"
          },
          // Credit Sales Revenue (Revenue increases)
          {
            akunId: salesRevenueAccount.id,
            debit: 0,
            kredit: totalAmount,
            deskripsi: "Pendapatan dari penjualan"
          }
        ]
      }
    },
    include: {
      details: {
        include: {
          akun: true
        }
      }
    }
  })

  return jurnalEntry
}

// Create journal entry for inventory purchase
export async function createJournalEntryForPurchase(
  transaksiMasukId: string,
  totalAmount: number,
  userId: string
) {
  const periode = await getActiveAccountingPeriod()
  if (!periode) {
    throw new Error("Tidak ada periode akuntansi aktif")
  }

  const inventoryAccount = await getAccountByCode(ACCOUNT_CODES.INVENTORY)
  const accountsPayableAccount = await getAccountByCode(ACCOUNT_CODES.ACCOUNTS_PAYABLE)

  if (!inventoryAccount || !accountsPayableAccount) {
    throw new Error("Akun persediaan atau hutang tidak ditemukan")
  }

  const nomorJurnal = generateTransactionNumber("JR")

  const jurnalEntry = await prisma.jurnalEntry.create({
    data: {
      nomorJurnal,
      tanggal: new Date(),
      deskripsi: `Pembelian Barang - ${transaksiMasukId}`,
      referensi: transaksiMasukId,
      tipeReferensi: "PURCHASE",
      periodeId: periode.id,
      userId,
      isPosted: true,
      details: {
        create: [
          // Debit Inventory (Asset increases)
          {
            akunId: inventoryAccount.id,
            debit: totalAmount,
            kredit: 0,
            deskripsi: "Pembelian persediaan"
          },
          // Credit Accounts Payable (Liability increases)
          {
            akunId: accountsPayableAccount.id,
            debit: 0,
            kredit: totalAmount,
            deskripsi: "Hutang pembelian"
          }
        ]
      }
    },
    include: {
      details: {
        include: {
          akun: true
        }
      }
    }
  })

  return jurnalEntry
}

// Create journal entry for salary expense
export async function createJournalEntryForSalary(
  employeeName: string,
  amount: number,
  userId: string
) {
  const periode = await getActiveAccountingPeriod()
  if (!periode) {
    throw new Error("Tidak ada periode akuntansi aktif")
  }

  const salaryExpenseAccount = await getAccountByCode(ACCOUNT_CODES.SALARY_EXPENSE)
  const cashAccount = await getAccountByCode(ACCOUNT_CODES.CASH)

  if (!salaryExpenseAccount || !cashAccount) {
    throw new Error("Akun gaji atau kas tidak ditemukan")
  }

  const nomorJurnal = generateTransactionNumber("JR")

  const jurnalEntry = await prisma.jurnalEntry.create({
    data: {
      nomorJurnal,
      tanggal: new Date(),
      deskripsi: `Pembayaran Gaji - ${employeeName}`,
      referensi: `SALARY-${employeeName}`,
      tipeReferensi: "EXPENSE",
      periodeId: periode.id,
      userId,
      isPosted: true,
      details: {
        create: [
          // Debit Salary Expense (Expense increases)
          {
            akunId: salaryExpenseAccount.id,
            debit: amount,
            kredit: 0,
            deskripsi: `Gaji ${employeeName}`
          },
          // Credit Cash (Asset decreases)
          {
            akunId: cashAccount.id,
            debit: 0,
            kredit: amount,
            deskripsi: "Pembayaran gaji"
          }
        ]
      }
    },
    include: {
      details: {
        include: {
          akun: true
        }
      }
    }
  })

  return jurnalEntry
}

// Create journal entry for inventory adjustment (cost of goods sold)
export async function createJournalEntryForCOGS(
  barangId: string,
  quantity: number,
  costPerUnit: number,
  userId: string
) {
  const periode = await getActiveAccountingPeriod()
  if (!periode) {
    throw new Error("Tidak ada periode akuntansi aktif")
  }

  const cogsAccount = await getAccountByCode(ACCOUNT_CODES.COST_OF_GOODS_SOLD)
  const inventoryAccount = await getAccountByCode(ACCOUNT_CODES.INVENTORY)

  if (!cogsAccount || !inventoryAccount) {
    throw new Error("Akun COGS atau persediaan tidak ditemukan")
  }

  const totalAmount = quantity * costPerUnit
  const nomorJurnal = generateTransactionNumber("JR")

  const jurnalEntry = await prisma.jurnalEntry.create({
    data: {
      nomorJurnal,
      tanggal: new Date(),
      deskripsi: `Harga Pokok Penjualan - ${barangId}`,
      referensi: `COGS-${barangId}`,
      tipeReferensi: "COGS",
      periodeId: periode.id,
      userId,
      isPosted: true,
      details: {
        create: [
          // Debit COGS (Expense increases)
          {
            akunId: cogsAccount.id,
            debit: totalAmount,
            kredit: 0,
            deskripsi: "Harga pokok penjualan"
          },
          // Credit Inventory (Asset decreases)
          {
            akunId: inventoryAccount.id,
            debit: 0,
            kredit: totalAmount,
            deskripsi: "Pengurangan persediaan"
          }
        ]
      }
    },
    include: {
      details: {
        include: {
          akun: true
        }
      }
    }
  })

  return jurnalEntry
}

// Create journal entry for inventory adjustment (outgoing goods)
export async function createJournalEntryForInventoryAdjustment(
  transaksiKeluarId: string,
  totalAmount: number,
  userId: string
) {
  const periode = await getActiveAccountingPeriod()
  if (!periode) {
    throw new Error("Tidak ada periode akuntansi aktif")
  }

  const inventoryAccount = await getAccountByCode(ACCOUNT_CODES.INVENTORY)
  const otherExpenseAccount = await getAccountByCode(ACCOUNT_CODES.OTHER_EXPENSE)

  if (!inventoryAccount || !otherExpenseAccount) {
    throw new Error("Akun persediaan atau beban lain tidak ditemukan")
  }

  const nomorJurnal = generateTransactionNumber("JR")

  const jurnalEntry = await prisma.jurnalEntry.create({
    data: {
      nomorJurnal,
      tanggal: new Date(),
      deskripsi: `Penyesuaian Persediaan - ${transaksiKeluarId}`,
      referensi: transaksiKeluarId,
      tipeReferensi: "ADJUSTMENT",
      periodeId: periode.id,
      userId,
      isPosted: true,
      details: {
        create: [
          // Debit Other Expense (Expense increases)
          {
            akunId: otherExpenseAccount.id,
            debit: totalAmount,
            kredit: 0,
            deskripsi: "Penyesuaian persediaan keluar"
          },
          // Credit Inventory (Asset decreases)
          {
            akunId: inventoryAccount.id,
            debit: 0,
            kredit: totalAmount,
            deskripsi: "Pengurangan persediaan"
          }
        ]
      }
    },
    include: {
      details: {
        include: {
          akun: true
        }
      }
    }
  })

  return jurnalEntry
}

// Create journal entry for expense
export async function createJournalEntryForExpense(
  tx: any,
  pengeluaran: any,
  userId: string
) {
  const periode = await tx.periodeAkuntansi.findFirst({
    where: { isActive: true }
  })

  if (!periode) {
    throw new Error("Tidak ada periode akuntansi aktif")
  }

  // Map expense categories to account codes
  const expenseAccountMap: { [key: string]: string } = {
    GAJI_KARYAWAN: ACCOUNT_CODES.SALARY_EXPENSE,
    UTILITAS: ACCOUNT_CODES.UTILITY_EXPENSE,
    SEWA: "5004", // Other expense
    PERLENGKAPAN_KANTOR: "5005", // ATK
    TRANSPORTASI: "5006", // Transport
    PERBAIKAN: "5007", // Repairs
    IKLAN_PROMOSI: "5008", // Advertising
    PAJAK: "5009", // Taxes
    ASURANSI: "5010", // Insurance
    LAINNYA: ACCOUNT_CODES.OTHER_EXPENSE
  }

  const expenseAccountCode = expenseAccountMap[pengeluaran.kategori] || ACCOUNT_CODES.OTHER_EXPENSE

  const expenseAccount = await tx.akun.findFirst({
    where: {
      kode: expenseAccountCode,
      isActive: true
    }
  })

  const cashAccount = await tx.akun.findFirst({
    where: {
      kode: ACCOUNT_CODES.CASH,
      isActive: true
    }
  })

  if (!expenseAccount || !cashAccount) {
    throw new Error("Akun pengeluaran atau kas tidak ditemukan")
  }

  const nomorJurnal = generateTransactionNumber("JR")

  const jurnalEntry = await tx.jurnalEntry.create({
    data: {
      nomorJurnal,
      tanggal: pengeluaran.tanggal,
      deskripsi: `Pengeluaran: ${pengeluaran.deskripsi}`,
      referensi: `EXP-${pengeluaran.id}`,
      tipeReferensi: "EXPENSE",
      periodeId: periode.id,
      userId,
      isPosted: true,
      details: {
        create: [
          // Debit Expense (Expense increases)
          {
            akunId: expenseAccount.id,
            debit: pengeluaran.jumlah,
            kredit: 0,
            deskripsi: pengeluaran.deskripsi
          },
          // Credit Cash (Asset decreases)
          {
            akunId: cashAccount.id,
            debit: 0,
            kredit: pengeluaran.jumlah,
            deskripsi: `Pembayaran ke ${pengeluaran.penerima}`
          }
        ]
      }
    },
    include: {
      details: {
        include: {
          akun: true
        }
      }
    }
  })

  return jurnalEntry
}