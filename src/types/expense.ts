import { Timestamp, FieldValue } from "firebase/firestore";

export type ExpenseCategory =
  | "bazaar"
  | "utility"
  | "cook_salary"
  | "maintenance"
  | "paper_dish"
  | "gas"
  | "internet"
  | "other";

export interface ExpenseItem {
  id: string;
  hostelId: string;
  monthId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // "YYYY-MM-DD"
  description?: string;
  receiptURL?: string;
  isIndividual?: boolean;
  assignedMemberIds?: string[];
  createdBy: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}
