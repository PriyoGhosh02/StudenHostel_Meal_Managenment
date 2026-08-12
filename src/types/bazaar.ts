import { Timestamp, FieldValue } from "firebase/firestore";

export type BazaarStatus = "scheduled" | "completed" | "cancelled";

export interface BazaarItem {
  name: string;
  quantity?: string;
  estimatedCost?: number;
  actualCost?: number;
}

export interface BazaarSchedule {
  id: string;
  hostelId: string;
  monthId: string;
  date: string; // "YYYY-MM-DD"
  assignedMemberIds: string[];
  assignedMemberNames?: string[];
  items: BazaarItem[];
  allocatedBudget: number;
  totalSpent?: number;
  status: BazaarStatus;
  notes?: string;
  receiptURL?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}
