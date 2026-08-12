import {
  getFirestore,
  collection,
  doc,
  collectionGroup,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { app, isFirebaseConfigured } from "./config";
import { Firestore } from "firebase/firestore";
import { UserProfile } from "@/types/user";
import { Hostel, JoinRequest, HostelMonth } from "@/types/hostel";
import { HostelMember } from "@/types/member";
import { MealRecord } from "@/types/meal";
import { ExpenseItem } from "@/types/expense";
import { DepositRecord } from "@/types/deposit";
import { BazaarSchedule } from "@/types/bazaar";
import { Notice } from "@/types/notice";
import { LedgerTransaction } from "@/types/transaction";
import { MonthlyReportSummary } from "@/types/report";

export const db = isFirebaseConfigured ? getFirestore(app!) : ({} as Firestore);

// Generic Converter
export const genericConverter = <T extends DocumentData>(): FirestoreDataConverter<T> => ({
  toFirestore(data: T): DocumentData {
    return { ...data };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
    } as unknown as T;
  },
});

// Collection Reference Factories (Multi-Tenant)
export const usersCol = () => collection(db, "users").withConverter(genericConverter<UserProfile>());
export const userDoc = (uid: string) => doc(db, "users", uid).withConverter(genericConverter<UserProfile>());

export const hostelsCol = () => collection(db, "hostels").withConverter(genericConverter<Hostel>());
export const hostelDoc = (hostelId: string) => doc(db, "hostels", hostelId).withConverter(genericConverter<Hostel>());

export const membersCol = (hostelId: string) =>
  collection(db, "hostels", hostelId, "members").withConverter(genericConverter<HostelMember>());
export const memberDoc = (hostelId: string, uid: string) =>
  doc(db, "hostels", hostelId, "members", uid).withConverter(genericConverter<HostelMember>());

export const joinRequestsCol = (hostelId: string) =>
  collection(db, "hostels", hostelId, "joinRequests").withConverter(genericConverter<JoinRequest>());
export const joinRequestDoc = (hostelId: string, requestId: string) =>
  doc(db, "hostels", hostelId, "joinRequests", requestId).withConverter(genericConverter<JoinRequest>());

export const monthsCol = (hostelId: string) =>
  collection(db, "hostels", hostelId, "months").withConverter(genericConverter<HostelMonth>());
export const monthDoc = (hostelId: string, monthId: string) =>
  doc(db, "hostels", hostelId, "months", monthId).withConverter(genericConverter<HostelMonth>());

export const noticesCol = (hostelId: string) =>
  collection(db, "hostels", hostelId, "notices").withConverter(genericConverter<Notice>());
export const noticeDoc = (hostelId: string, noticeId: string) =>
  doc(db, "hostels", hostelId, "notices", noticeId).withConverter(genericConverter<Notice>());

export const mealsCol = (hostelId: string) =>
  collection(db, "hostels", hostelId, "meals").withConverter(genericConverter<MealRecord>());
export const mealDoc = (hostelId: string, mealId: string) =>
  doc(db, "hostels", hostelId, "meals", mealId).withConverter(genericConverter<MealRecord>());

export const expensesCol = (hostelId: string) =>
  collection(db, "hostels", hostelId, "expenses").withConverter(genericConverter<ExpenseItem>());
export const expenseDoc = (hostelId: string, expenseId: string) =>
  doc(db, "hostels", hostelId, "expenses", expenseId).withConverter(genericConverter<ExpenseItem>());

export const depositsCol = (hostelId: string) =>
  collection(db, "hostels", hostelId, "deposits").withConverter(genericConverter<DepositRecord>());
export const depositDoc = (hostelId: string, depositId: string) =>
  doc(db, "hostels", hostelId, "deposits", depositId).withConverter(genericConverter<DepositRecord>());

export const bazaarCol = (hostelId: string) =>
  collection(db, "hostels", hostelId, "bazaar").withConverter(genericConverter<BazaarSchedule>());
export const bazaarDoc = (hostelId: string, bazaarId: string) =>
  doc(db, "hostels", hostelId, "bazaar", bazaarId).withConverter(genericConverter<BazaarSchedule>());

export const transactionsCol = (hostelId: string) =>
  collection(db, "hostels", hostelId, "transactions").withConverter(genericConverter<LedgerTransaction>());
export const transactionDoc = (hostelId: string, txId: string) =>
  doc(db, "hostels", hostelId, "transactions", txId).withConverter(genericConverter<LedgerTransaction>());

export const reportsCol = (hostelId: string) =>
  collection(db, "hostels", hostelId, "reports").withConverter(genericConverter<MonthlyReportSummary>());
export const reportDoc = (hostelId: string, reportId: string) =>
  doc(db, "hostels", hostelId, "reports", reportId).withConverter(genericConverter<MonthlyReportSummary>());

export { collectionGroup, serverTimestamp, Timestamp };
