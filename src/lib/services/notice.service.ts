import {
  getDocs,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, noticesCol } from "../firebase/firestore";
import { Notice, NoticeExpression } from "@/types/notice";

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
      votes: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(notRef, newNotice);
    return newNotice;
  },

  /**
   * Delete a notice
   */
  async deleteNotice(hostelId: string, noticeId: string): Promise<void> {
    const notRef = doc(db, "hostels", hostelId, "notices", noticeId);
    await deleteDoc(notRef);
  },

  /**
   * Submit reaction/vote on a notice
   */
  async castVote(
    hostelId: string,
    noticeId: string,
    userId: string,
    name: string,
    expression: NoticeExpression
  ): Promise<void> {
    const notRef = doc(db, "hostels", hostelId, "notices", noticeId);
    await updateDoc(notRef, {
      [`votes.${userId}`]: { name, expression },
      updatedAt: serverTimestamp(),
    });
  },
};
