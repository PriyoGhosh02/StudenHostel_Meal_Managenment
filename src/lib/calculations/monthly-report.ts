import { calculateMealRate, calculateMemberMealCost } from "./meal-rate";
import { calculateMemberBalance } from "./member-balance";
import { summarizeMonthlyExpenses } from "./monthly-expense";
import { MealRecord } from "@/types/meal";
import { ExpenseItem } from "@/types/expense";
import { DepositRecord } from "@/types/deposit";
import { MemberWithProfile } from "@/types/member";
import { MonthlyReportSummary, MemberMonthlyReport } from "@/types/report";
import { Timestamp } from "firebase/firestore";

/**
 * Generate a complete monthly report from raw records
 */
export function generateMonthlyReport(params: {
  hostelId: string;
  monthId: string;
  monthName: string;
  members: MemberWithProfile[];
  meals: MealRecord[];
  expenses: ExpenseItem[];
  deposits: DepositRecord[];
}): MonthlyReportSummary {
  const { hostelId, monthId, monthName, members, meals, expenses, deposits } = params;

  // 1. Calculate total meals across all members
  let totalMeals = 0;
  const memberMealMap = new Map<string, number>();

  for (const m of meals) {
    const mealSum = (m.totalMeals || 0) + (m.guestBreakfast || 0) + (m.guestLunch || 0) + (m.guestDinner || 0);
    totalMeals += mealSum;
    memberMealMap.set(m.userId, (memberMealMap.get(m.userId) || 0) + mealSum);
  }

  // 2. Calculate expenses
  const expenseSummary = summarizeMonthlyExpenses(expenses);
  const mealRate = calculateMealRate(expenseSummary.totalBazaar, totalMeals);

  // 3. Shared other expenses (divided equally among active members)
  const nonBazaarShared = expenseSummary.sharedTotal - expenseSummary.totalBazaar;
  const activeMembersCount = Math.max(members.filter((m) => m.status === "active").length, 1);
  const sharedExpensePerMember = Number((nonBazaarShared / activeMembersCount).toFixed(2));

  // 4. Calculate deposits per member
  const memberDepositMap = new Map<string, number>();
  let totalDeposits = 0;

  for (const dep of deposits) {
    if (dep.status === "approved") {
      const amt = dep.amount || 0;
      totalDeposits += amt;
      memberDepositMap.set(dep.userId, (memberDepositMap.get(dep.userId) || 0) + amt);
    }
  }

  // 5. Individual member reports
  const memberReports: MemberMonthlyReport[] = members.map((member) => {
    const memMeals = memberMealMap.get(member.uid) || 0;
    const mealCost = calculateMemberMealCost(memMeals, mealRate);
    const individualExpenses = 0; // individual expense items if assigned
    const totalDeposited = memberDepositMap.get(member.uid) || 0;

    const balance = calculateMemberBalance({
      totalDeposited,
      mealCost,
      individualExpenses,
      sharedExpenses: sharedExpensePerMember,
    });

    return {
      userId: member.uid,
      userName: member.name || "Member",
      roomNumber: member.roomNumber,
      totalMeals: memMeals,
      mealCost,
      individualExpenses,
      sharedExpenses: sharedExpensePerMember,
      totalDebit: balance.totalDebit,
      totalDeposited,
      netBalance: balance.netBalance,
    };
  });

  const hostelBalance = Number((totalDeposits - expenseSummary.grandTotal).toFixed(2));

  return {
    id: monthId,
    hostelId,
    monthId,
    monthName,
    totalMeals,
    totalBazaarExpense: expenseSummary.totalBazaar,
    totalOtherExpense: expenseSummary.grandTotal - expenseSummary.totalBazaar,
    totalSharedExpense: expenseSummary.sharedTotal,
    mealRate,
    totalDeposits,
    hostelBalance,
    activeMembersCount,
    memberReports,
    generatedAt: Timestamp.now(),
  };
}
