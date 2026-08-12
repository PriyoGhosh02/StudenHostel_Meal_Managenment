import { Timestamp, FieldValue } from "firebase/firestore";

export type HostelCurrency = "BDT" | "INR" | "USD";

export type HostelStatus = "active" | "archived";

export interface Hostel {
  id: string;
  name: string;
  address?: string;
  city?: string;
  ownerId: string;
  code: string;
  currency: HostelCurrency;
  currentMonthId?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  status: HostelStatus;
}

export type JoinRequestStatus = "pending" | "approved" | "rejected";

export interface JoinRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  hostelId: string;
  hostelName?: string;
  hostelCode?: string;
  status: JoinRequestStatus;
  createdAt: Timestamp | FieldValue;
  reviewedAt?: Timestamp | FieldValue;
  reviewedBy?: string;
}

export type MonthStatus = "active" | "closed";

export interface HostelMonth {
  id: string; // e.g. "2026-08"
  name: string; // e.g. "August 2026"
  year: number;
  month: number;
  status: MonthStatus;
  startedAt: Timestamp | FieldValue;
  closedAt?: Timestamp | FieldValue;
}
