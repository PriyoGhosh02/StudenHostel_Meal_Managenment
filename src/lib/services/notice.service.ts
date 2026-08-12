import {
  getDocs,
  query,
  setDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, noticesCol } from "../firebase/firestore";
import { Notice } from "@/types/notice";

export const NoticeService = {
  /**
   * Get all active notices
   */
  async getNotices(hostelId: string): Promise<Notice[]> {
    const q = query(noticesCol(hostelId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Notice);
  },

  /**
   * Create a new notice
   */
  async createNotice(
    hostelId: string,
    params: Omit<Notice, "id" | "hostelId" | "createdAt" | "updatedAt">
  ): Promise<Notice> {
    const notRef = doc(collection(db, "hostels", hostelId, "notices"));
    const newNotice: Notice = {
      id: notRef.id,
      hostelId,
      ...params,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(notRef, newNotice);
    return newNotice;
  },
};
