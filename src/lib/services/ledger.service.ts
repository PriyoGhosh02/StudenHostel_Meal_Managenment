import {
  getDocs,
  query,
  where,
  setDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, transactionsCol } from "../firebase/firestore";
import { LedgerTransaction } from "@/types/transaction";

export const LedgerService = {
  /**
   * Get transactions for a month
   */
  async getTransactionsForMonth(hostelId: string, monthId: string): Promise<LedgerTransaction[]> {
    const q = query(transactionsCol(hostelId), where("monthId", "==", monthId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as LedgerTransaction);
  },

  /**
   * Record a transaction
   */
  async recordTransaction(
    hostelId: string,
    params: Omit<LedgerTransaction, "id" | "hostelId" | "createdAt">
  ): Promise<LedgerTransaction> {
    const txRef = doc(collection(db, "hostels", hostelId, "transactions"));
    const newTx: LedgerTransaction = {
      id: txRef.id,
      hostelId,
      ...params,
      createdAt: serverTimestamp(),
    };
    await setDoc(txRef, newTx);
    return newTx;
  },
};
