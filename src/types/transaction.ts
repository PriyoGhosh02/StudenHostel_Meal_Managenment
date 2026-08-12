import { Timestamp, FieldValue } from "firebase/firestore";

export type TransactionType = "deposit" | "expense" | "refund" | "adjustment";

export interface LedgerTransaction {
  id: string;
  hostelId: string;
  monthId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId?: string;
  userId?: string;
  performedBy: string;
  balanceAfter: number;
  createdAt: Timestamp | FieldValue;
}
