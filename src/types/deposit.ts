import { Timestamp, FieldValue } from "firebase/firestore";

export type PaymentMethod = "cash" | "bkash" | "nagad" | "rocket" | "bank" | "upi" | "other";
export type DepositStatus = "pending" | "approved" | "rejected";

export interface DepositRecord {
  id: string;
  hostelId: string;
  monthId: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status: DepositStatus;
  notes?: string;
  receiptURL?: string;
  receivedBy?: string;
  approvedAt?: Timestamp | FieldValue;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}
