import { ExpenseItem } from "@/types/expense";

export interface MonthlyExpenseBreakdown {
  totalBazaar: number;
  totalUtility: number;
  totalCookSalary: number;
  totalMaintenance: number;
  totalOther: number;
  grandTotal: number;
  sharedTotal: number;
}

/**
 * Summarize and categorize monthly expenses
 */
export function summarizeMonthlyExpenses(expenses: ExpenseItem[]): MonthlyExpenseBreakdown {
  let totalBazaar = 0;
  let totalUtility = 0;
  let totalCookSalary = 0;
  let totalMaintenance = 0;
  let totalOther = 0;
  let sharedTotal = 0;

  for (const exp of expenses) {
    const amount = exp.amount || 0;
    if (exp.category === "bazaar") {
      totalBazaar += amount;
    } else if (exp.category === "utility" || exp.category === "gas" || exp.category === "internet") {
      totalUtility += amount;
    } else if (exp.category === "cook_salary") {
      totalCookSalary += amount;
    } else if (exp.category === "maintenance") {
      totalMaintenance += amount;
    } else {
      totalOther += amount;
    }

    if (!exp.isIndividual) {
      sharedTotal += amount;
    }
  }

  const grandTotal = totalBazaar + totalUtility + totalCookSalary + totalMaintenance + totalOther;

  return {
    totalBazaar: Number(totalBazaar.toFixed(2)),
    totalUtility: Number(totalUtility.toFixed(2)),
    totalCookSalary: Number(totalCookSalary.toFixed(2)),
    totalMaintenance: Number(totalMaintenance.toFixed(2)),
    totalOther: Number(totalOther.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
    sharedTotal: Number(sharedTotal.toFixed(2)),
  };
}
