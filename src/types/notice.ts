import { Timestamp, FieldValue } from "firebase/firestore";

export type NoticePriority = "low" | "medium" | "high" | "urgent";

export interface Notice {
  id: string;
  hostelId: string;
  title: string;
  content: string;
  priority: NoticePriority;
  authorId: string;
  authorName: string;
  pinned: boolean;
  expiresAt?: Timestamp | FieldValue;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}
