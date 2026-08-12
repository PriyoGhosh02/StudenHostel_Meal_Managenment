import { Timestamp, FieldValue } from "firebase/firestore";

export type PreferredLanguage = "en" | "bn" | "hi";

export type UserRole = "owner" | "admin" | "manager" | "member";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  preferredLanguage: PreferredLanguage;
  activeHostelId?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export type Permission =
  | "viewDashboard"
  | "manageMembers"
  | "approveJoinRequests"
  | "manageMeals"
  | "manageDeposits"
  | "manageExpenses"
  | "manageBazaar"
  | "manageMonths"
  | "manageReports"
  | "manageSettings"
  | "changeManager";
