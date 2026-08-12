import { Timestamp, FieldValue } from "firebase/firestore";

export interface MemberMonthlyReport {
  userId: string;
  userName: string;
  roomNumber?: string;
  totalMeals: number;
  mealCost: number;
  individualExpenses: number;
  sharedExpenses: number;
  totalDebit: number;
  totalDeposited: number;
  netBalance: number;
}

export interface MonthlyReportSummary {
  id: string;
  hostelId: string;
  monthId: string;
  monthName: string;
  totalMeals: number;
  totalBazaarExpense: number;
  totalOtherExpense: number;
  totalSharedExpense: number;
  mealRate: number;
  totalDeposits: number;
  hostelBalance: number;
  activeMembersCount: number;
  memberReports: MemberMonthlyReport[];
  generatedAt: Timestamp | FieldValue;
}
