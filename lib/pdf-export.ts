import { AccumulationData, AccumulationPeriod, JurnalEntry } from "@/types";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

export class JournalPDFExporter {
  static async exportRecapitulationReport(
    accumulationData: AccumulationData[],
    period: AccumulationPeriod,
    startDate?: string,
    endDate?: string,
    selectedPeriode?: string,
  ) {
    const pdf = new jsPDF();

    // Title
    pdf.setFontSize(20);
    pdf.text("Rekapitulasi Jurnal Umum", 105, 20, { align: "center" });

    // Period info
    pdf.setFontSize(12);
    pdf.text(`Periode: ${this.formatPeriodType(period)}`, 20, 35);

    if (startDate && endDate) {
      pdf.text(
        `Tanggal: ${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(endDate).toLocaleDateString("id-ID")}`,
        20,
        45,
      );
    }

    if (selectedPeriode) {
      pdf.text(`Periode Akuntansi: ${selectedPeriode}`, 20, 55);
    }

    // Summary
    const totalDebit = accumulationData.reduce(
      (sum, item) => sum + item.totalDebit,
      0,
    );
    const totalKredit = accumulationData.reduce(
      (sum, item) => sum + item.totalKredit,
      0,
    );
    const totalTransactions = accumulationData.reduce(
      (sum, item) => sum + item.transactionCount,
      0,
    );

    pdf.text(`Total Debit: Rp ${totalDebit.toLocaleString("id-ID")}`, 20, 70);
    pdf.text(`Total Kredit: Rp ${totalKredit.toLocaleString("id-ID")}`, 20, 80);
    pdf.text(`Total Transaksi: ${totalTransactions}`, 20, 90);

    // Table data
    const tableData = accumulationData.map((item) => [
      this.formatPeriodLabel(item.period, period),
      `Rp ${item.totalDebit.toLocaleString("id-ID")}`,
      `Rp ${item.totalKredit.toLocaleString("id-ID")}`,
      item.transactionCount.toString(),
      item.isBalanced ? "Seimbang" : "Tidak Seimbang",
    ]);

    // Add table
    autoTable(pdf, {
      head: [
        [
          "Periode",
          "Total Debit",
          "Total Kredit",
          "Jumlah Transaksi",
          "Status",
        ],
      ],
      body: tableData,
      startY: 100,
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: "center" });
      pdf.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 20, 285);
    }

    // Save the PDF
    pdf.save(
      `rekapitulasi-jurnal-${period}-${new Date().toISOString().split("T")[0]}.pdf`,
    );
  }

  static async exportDetailedPeriodReport(
    periodData: AccumulationData,
    detailedEntries: JurnalEntry[],
    period: AccumulationPeriod,
  ) {
    const pdf = new jsPDF();

    // Title
    pdf.setFontSize(20);
    pdf.text("Detail Jurnal Periode", 105, 20, { align: "center" });

    // Period info
    pdf.setFontSize(12);
    pdf.text(
      `Periode: ${this.formatPeriodLabel(periodData.period, period)}`,
      20,
      35,
    );
    pdf.text(
      `Total Debit: Rp ${periodData.totalDebit.toLocaleString("id-ID")}`,
      20,
      45,
    );
    pdf.text(
      `Total Kredit: Rp ${periodData.totalKredit.toLocaleString("id-ID")}`,
      20,
      55,
    );
    pdf.text(`Jumlah Transaksi: ${periodData.transactionCount}`, 20, 65);

    // Table data
    const tableData: any[] = [];

    detailedEntries.forEach((entry) => {
      // Add entry header
      tableData.push([
        new Date(entry.tanggal).toLocaleDateString("id-ID"),
        entry.nomorJurnal,
        entry.deskripsi,
        "",
        "",
        "",
      ]);

      // Add entry details
      entry.details.forEach((detail) => {
        tableData.push([
          "",
          "",
          "",
          `${detail.akun.kode} - ${detail.akun.nama}`,
          detail.debit > 0 ? `Rp ${detail.debit.toLocaleString("id-ID")}` : "-",
          detail.kredit > 0
            ? `Rp ${detail.kredit.toLocaleString("id-ID")}`
            : "-",
        ]);
      });

      // Add empty row for separation
      tableData.push(["", "", "", "", "", ""]);
    });

    // Add table
    autoTable(pdf, {
      head: [
        ["Tanggal", "Nomor Jurnal", "Deskripsi", "Akun", "Debit", "Kredit"],
      ],
      body: tableData,
      startY: 75,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 30 },
        2: { cellWidth: 50 },
        3: { cellWidth: 45 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
    });

    // Footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: "center" });
      pdf.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 20, 285);
    }

    // Save the PDF
    pdf.save(
      `detail-jurnal-${periodData.period}-${new Date().toISOString().split("T")[0]}.pdf`,
    );
  }

  private static formatPeriodType(period: AccumulationPeriod): string {
    switch (period) {
      case "daily":
        return "Harian";
      case "monthly":
        return "Bulanan";
      case "yearly":
        return "Tahunan";
      default:
        return period;
    }
  }

  private static formatPeriodLabel(
    periodStr: string,
    periodType: AccumulationPeriod,
  ): string {
    switch (periodType) {
      case "daily":
        return new Date(periodStr).toLocaleDateString("id-ID");
      case "monthly":
        const [year, month] = periodStr.split("-");
        const monthNames = [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      case "yearly":
        return `Tahun ${periodStr}`;
      default:
        return periodStr;
    }
  }
}

export function exportPeriodClosingToPDF(closingData: any) {
  const pdf = new jsPDF();

  // Title
  pdf.setFontSize(20);
  pdf.text("Laporan Penutupan Periode", 105, 20, { align: "center" });

  // Period info
  pdf.setFontSize(12);
  pdf.text(`Periode: ${closingData.periode.namaPeriode}`, 20, 35);
  pdf.text(
    `Tanggal Penutupan: ${new Date(closingData.closedAt).toLocaleDateString("id-ID")}`,
    20,
    45,
  );
  pdf.text(
    `Laba Bersih: Rp ${closingData.netIncome.toLocaleString("id-ID")}`,
    20,
    55,
  );

  let yPosition = 70;

  // Closing Entries Section
  pdf.setFontSize(14);
  pdf.text("Jurnal Penutupan", 20, yPosition);
  yPosition += 10;

  const closingTableData: any[] = [];
  closingData.closingEntries.forEach((entry: any) => {
    closingTableData.push([
      new Date(entry.tanggal).toLocaleDateString("id-ID"),
      entry.nomorJurnal,
      entry.deskripsi,
      "",
      "",
      "",
    ]);

    entry.details.forEach((detail: any) => {
      closingTableData.push([
        "",
        "",
        "",
        `${detail.akun.kode} - ${detail.akun.namaAkun}`,
        detail.debit > 0 ? `Rp ${detail.debit.toLocaleString("id-ID")}` : "-",
        detail.kredit > 0 ? `Rp ${detail.kredit.toLocaleString("id-ID")}` : "-",
      ]);
    });

    closingTableData.push(["", "", "", "", "", ""]);
  });

  autoTable(pdf, {
    head: [["Tanggal", "Nomor Jurnal", "Deskripsi", "Akun", "Debit", "Kredit"]],
    body: closingTableData,
    startY: yPosition,
    styles: {
      fontSize: 7,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 30 },
      2: { cellWidth: 50 },
      3: { cellWidth: 45 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25 },
    },
  });

  // Check if we need a new page
  const tableHeight = (pdf as any).lastAutoTable?.finalY || 200;
  if (tableHeight > 250) {
    pdf.addPage();
    yPosition = 20;
  } else {
    yPosition = tableHeight + 20;
  }

  // Opening Balances Section
  pdf.setFontSize(14);
  pdf.text("Saldo Awal Periode Berikutnya", 20, yPosition);
  yPosition += 10;

  const openingTableData = closingData.openingBalances.map((balance: any) => [
    balance.akun.kode,
    balance.akun.namaAkun,
    `Rp ${balance.saldo.toLocaleString("id-ID")}`,
    balance.saldo >= 0 ? "Debit" : "Kredit",
  ]);

  autoTable(pdf, {
    head: [["Kode Akun", "Nama Akun", "Saldo Awal", "Tipe"]],
    body: openingTableData,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: "center" });
    pdf.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 20, 285);
  }

  // Save the PDF
  pdf.save(
    `penutupan-periode-${closingData.periode.namaPeriode.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`,
  );
}
