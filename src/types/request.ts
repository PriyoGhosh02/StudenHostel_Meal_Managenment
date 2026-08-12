import { Timestamp, FieldValue } from "firebase/firestore";

export type RequestType = "meal" | "deposit" | "expense" | "bazaar_schedule";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface ApprovalRequest {
  id: string;
  hostelId: string;
  monthId: string;
  type: RequestType;
  userId: string;       // requester uid
  userName: string;     // requester display name
  status: RequestStatus;
  details: {
    // Shared parameters across different requests
    date?: string;
    amount?: number;

    // for meal request:
    targetUserId?: string;
    breakfast?: number;
    lunch?: number;
    dinner?: number;
    totalMeals?: number;

    // for deposit request:
    paymentMethod?: string;
    transactionId?: string;

    // for expense request:
    title?: string;
    category?: string;

    // for bazaar schedule request:
    assignedMemberNames?: string[];
    allocatedBudget?: number;
  };
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}
