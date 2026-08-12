import {
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, depositsCol, depositDoc } from "../firebase/firestore";
import { DepositRecord, DepositStatus } from "@/types/deposit";

export const DepositService = {
  /**
   * Get deposits for a specific month
   */
  async getDepositsForMonth(hostelId: string, monthId: string): Promise<DepositRecord[]> {
    const q = query(depositsCol(hostelId), where("monthId", "==", monthId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DepositRecord);
  },

  /**
   * Add a deposit record
   */
  async addDeposit(
    hostelId: string,
    params: Omit<DepositRecord, "id" | "hostelId" | "createdAt" | "updatedAt">
  ): Promise<DepositRecord> {
    const depRef = doc(collection(db, "hostels", hostelId, "deposits"));
    const newDep: DepositRecord = {
      id: depRef.id,
      hostelId,
      ...params,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(depRef, newDep);
    return newDep;
  },

  /**
   * Update deposit status (approved/rejected)
   */
  async updateStatus(
    hostelId: string,
    depositId: string,
    status: DepositStatus,
    reviewerUid: string
  ): Promise<void> {
    await updateDoc(depositDoc(hostelId, depositId), {
      status,
      receivedBy: reviewerUid,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },
};
