import { Timestamp, FieldValue } from "firebase/firestore";

export interface MealCount {
  breakfast: number;
  lunch: number;
  dinner: number;
  guestCount?: number;
}

export interface MealRecord {
  id: string;
  hostelId: string;
  monthId: string;
  userId: string;
  date: string; // "YYYY-MM-DD"
  breakfast: number;
  lunch: number;
  dinner: number;
  guestBreakfast?: number;
  guestLunch?: number;
  guestDinner?: number;
  totalMeals: number;
  recordedBy: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface DailyMealSummary {
  date: string;
  totalBreakfast: number;
  totalLunch: number;
  totalDinner: number;
  totalDailyMeals: number;
  memberCount: number;
}
