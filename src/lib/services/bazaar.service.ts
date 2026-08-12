import {
  getDocs,
  query,
  where,
  setDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, bazaarCol } from "../firebase/firestore";
import { BazaarSchedule } from "@/types/bazaar";

export const BazaarService = {
  /**
   * Get bazaar schedule for a month
   */
  async getBazaarForMonth(hostelId: string, monthId: string): Promise<BazaarSchedule[]> {
    const q = query(bazaarCol(hostelId), where("monthId", "==", monthId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as BazaarSchedule);
  },

  /**
   * Schedule a bazaar duty
   */
  async scheduleBazaar(
    hostelId: string,
    params: Omit<BazaarSchedule, "id" | "hostelId" | "createdAt" | "updatedAt">
  ): Promise<BazaarSchedule> {
    const bazRef = doc(collection(db, "hostels", hostelId, "bazaar"));
    const newBaz: BazaarSchedule = {
      id: bazRef.id,
      hostelId,
      ...params,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(bazRef, newBaz);
    return newBaz;
  },
};
