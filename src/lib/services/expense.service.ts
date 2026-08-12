import {
  getDocs,
  query,
  where,
  setDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, expensesCol } from "../firebase/firestore";
import { ExpenseItem } from "@/types/expense";

export const ExpenseService = {
  /**
   * Get all expenses for a given month
   */
  async getExpensesForMonth(hostelId: string, monthId: string): Promise<ExpenseItem[]> {
    const q = query(expensesCol(hostelId), where("monthId", "==", monthId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ExpenseItem);
  },

  /**
   * Add a new expense
   */
  async addExpense(
    hostelId: string,
    params: Omit<ExpenseItem, "id" | "hostelId" | "createdAt" | "updatedAt">
  ): Promise<ExpenseItem> {
    const expenseRef = doc(collection(db, "hostels", hostelId, "expenses"));
    const newExpense: ExpenseItem = {
      id: expenseRef.id,
      hostelId,
      ...params,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(expenseRef, newExpense);
    return newExpense;
  },
};
