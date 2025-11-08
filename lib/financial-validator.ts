import { TrialBalanceEntry, BalanceSheetData } from "@/types/accounting";

export interface ValidationResult {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  variance: number;
  message?: string;
}

export class FinancialValidator {
  /**
   * Validates trial balance entries for balance
   * Based on FinOps Framework best practices for financial validation
   */
  static validateTrialBalance(entries: TrialBalanceEntry[]): ValidationResult {
    const totalDebit = entries
      .filter((entry) => entry.saldoAkhir > 0)
      .reduce((sum, entry) => sum + entry.saldoAkhir, 0);

    const totalCredit = entries
      .filter((entry) => entry.saldoAkhir < 0)
      .reduce((sum, entry) => sum + Math.abs(entry.saldoAkhir), 0);

    const variance = Math.abs(totalDebit - totalCredit);
    const isBalanced = variance < 0.01; // Allow for small floating point differences

    return {
      isBalanced,
      totalDebit,
      totalCredit,
      variance,
      message: isBalanced
        ? "Trial balance is balanced"
        : `Trial balance imbalance: Debit ${totalDebit.toLocaleString("id-ID")} vs Credit ${totalCredit.toLocaleString("id-ID")} (variance: ${variance.toFixed(2)})`,
    };
  }

  /**
   * Validates balance sheet for accounting equation compliance
   * Assets = Liabilities + Equity (based on XBRL standards)
   */
  static validateBalanceSheet(
    assets: number,
    liabilitiesEquity: number,
  ): ValidationResult {
    const variance = Math.abs(assets - liabilitiesEquity);
    const isBalanced = variance < 0.01;

    return {
      isBalanced,
      totalDebit: assets,
      totalCredit: liabilitiesEquity,
      variance,
      message: isBalanced
        ? "Balance sheet is balanced (Assets = Liabilities + Equity)"
        : `Balance sheet imbalance: Assets ${assets.toLocaleString("id-ID")} vs Liabilities+Equity ${liabilitiesEquity.toLocaleString("id-ID")} (variance: ${variance.toFixed(2)})`,
    };
  }

  /**
   * Validates income statement for proper net income calculation
   */
  static validateIncomeStatement(
    revenue: number,
    expenses: number,
    netIncome: number,
  ): ValidationResult {
    const calculatedNetIncome = revenue - expenses;
    const variance = Math.abs(calculatedNetIncome - netIncome);
    const isBalanced = variance < 0.01;

    return {
      isBalanced,
      totalDebit: revenue,
      totalCredit: expenses,
      variance,
      message: isBalanced
        ? "Income statement calculation is correct"
        : `Income statement error: Revenue ${revenue.toLocaleString("id-ID")} - Expenses ${expenses.toLocaleString("id-ID")} should equal Net Income ${calculatedNetIncome.toLocaleString("id-ID")}, but got ${netIncome.toLocaleString("id-ID")} (variance: ${variance.toFixed(2)})`,
    };
  }

  /**
   * Validates XBRL compliance for financial reports
   * Based on XBRL 2.1 specification requirements
   */
  static validateXBRLCompliance(report: any): ValidationResult {
    const requiredElements = ["context", "unit", "schemaRef"];

    const missingElements = requiredElements.filter(
      (element) => !report.xbrl?.[element],
    );

    const isBalanced = missingElements.length === 0;

    return {
      isBalanced,
      totalDebit: 0,
      totalCredit: 0,
      variance: missingElements.length,
      message: isBalanced
        ? "XBRL structure is compliant"
        : `XBRL compliance issues: Missing elements: ${missingElements.join(", ")}`,
    };
  }

  /**
   * Comprehensive financial health check
   * Combines multiple validation types for overall financial integrity
   */
  static performFinancialHealthCheck(data: {
    trialBalance?: TrialBalanceEntry[];
    balanceSheet?: BalanceSheetData;
    incomeStatement?: { revenue: number; expenses: number; netIncome: number };
  }): {
    overallHealth: boolean;
    validations: Record<string, ValidationResult>;
    recommendations: string[];
  } {
    const validations: Record<string, ValidationResult> = {};
    const recommendations: string[] = [];

    // Trial Balance Validation
    if (data.trialBalance) {
      validations.trialBalance = this.validateTrialBalance(data.trialBalance);
      if (!validations.trialBalance.isBalanced) {
        recommendations.push(
          "Review journal entries for trial balance imbalance",
        );
        recommendations.push(
          "Check account type classifications (debit/credit normal)",
        );
      }
    }

    // Balance Sheet Validation
    if (data.balanceSheet) {
      validations.balanceSheet = this.validateBalanceSheet(
        data.balanceSheet.totalAssets,
        data.balanceSheet.totalLiabilitiesEquity,
      );
      if (!validations.balanceSheet.isBalanced) {
        recommendations.push(
          "Verify asset and liability/equity account balances",
        );
        recommendations.push(
          "Check for missing or incorrect account classifications",
        );
      }
    }

    // Income Statement Validation
    if (data.incomeStatement) {
      validations.incomeStatement = this.validateIncomeStatement(
        data.incomeStatement.revenue,
        data.incomeStatement.expenses,
        data.incomeStatement.netIncome,
      );
      if (!validations.incomeStatement.isBalanced) {
        recommendations.push("Recalculate net income: Revenue - Expenses");
        recommendations.push("Review revenue and expense account balances");
      }
    }

    const overallHealth = Object.values(validations).every((v) => v.isBalanced);

    return {
      overallHealth,
      validations,
      recommendations,
    };
  }
}
