import { Timestamp, FieldValue } from "firebase/firestore";
import { UserRole } from "./user";

export type MemberRole = UserRole;
export type MemberStatus = "active" | "pending" | "suspended";

export interface HostelMember {
  uid: string;
  role: MemberRole;
  status: MemberStatus;
  roomNumber?: string;
  studentId?: string;
  university?: string;
  department?: string;
  phone?: string;
  joinedAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface MemberWithProfile extends HostelMember {
  name: string;
  email: string;
  photoURL?: string;
}
