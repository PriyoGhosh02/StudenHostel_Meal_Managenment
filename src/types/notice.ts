import { Timestamp, FieldValue } from "firebase/firestore";

export type NoticePriority = "low" | "medium" | "high" | "urgent";
export type NoticeExpression = "yes" | "no" | "like" | "dislike";

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
  votes?: Record<string, { name: string, expression: NoticeExpression }>;
}
