import {
  getDocs,
  query,
  where,
  setDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, mealsCol } from "../firebase/firestore";
import { MealRecord } from "@/types/meal";

export const MealService = {
  /**
   * Get meals for a specific month
   */
  async getMealsForMonth(hostelId: string, monthId: string): Promise<MealRecord[]> {
    const q = query(mealsCol(hostelId), where("monthId", "==", monthId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as MealRecord);
  },

  /**
   * Record or update a meal entry
   */
  async recordMeal(
    hostelId: string,
    params: Omit<MealRecord, "id" | "hostelId" | "createdAt" | "updatedAt">
  ): Promise<MealRecord> {
    const mealRef = doc(collection(db, "hostels", hostelId, "meals"));
    const newMeal: MealRecord = {
      id: mealRef.id,
      hostelId,
      ...params,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(mealRef, newMeal);
    return newMeal;
  },
};
