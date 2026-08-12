import {
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  doc,
  collection,
} from "firebase/firestore";
import {
  db,
  hostelDoc,
  hostelsCol,
  memberDoc,
  monthDoc,
  joinRequestDoc,
  joinRequestsCol,
  monthsCol,
} from "../firebase/firestore";
import { UserService } from "./user.service";
import { Hostel, JoinRequest, HostelMonth, HostelCurrency } from "@/types/hostel";
import { HostelMember } from "@/types/member";

/**
 * Generate human-readable random hostel code e.g. "HST-X7K92"
 */
export const generateHostelCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars like O, 0, I, 1
  let code = "HST-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Format current month ID e.g. "2026-08" and Name "August 2026"
 */
export const getCurrentMonthInfo = (date = new Date()) => {
  const year = date.getFullYear();
  const monthNumber = date.getMonth() + 1;
  const monthId = `${year}-${String(monthNumber).padStart(2, "0")}`;
  const monthName = date.toLocaleString("en-US", { month: "long", year: "numeric" });
  return { year, month: monthNumber, monthId, monthName };
};

export const HostelService = {
  /**
   * Create a new hostel, register owner, and initialize the first active month
   */
  async createHostel(params: {
    name: string;
    ownerId: string;
    address?: string;
    city?: string;
    currency?: HostelCurrency;
    ownerDetails?: {
      phone?: string;
      roomNumber?: string;
      studentId?: string;
      university?: string;
      department?: string;
    };
  }): Promise<{ hostel: Hostel; month: HostelMonth }> {
    const hostelRef = doc(collection(db, "hostels"));
    const hostelId = hostelRef.id;
    const hostelCode = generateHostelCode();
    const currency = params.currency || "BDT";
    const { year, month: monthNum, monthId, monthName } = getCurrentMonthInfo();

    // 1. Create first month
    const firstMonth: HostelMonth = {
      id: monthId,
      name: monthName,
      year,
      month: monthNum,
      status: "active",
      startedAt: serverTimestamp(),
    };
    await setDoc(monthDoc(hostelId, monthId), firstMonth);

    // 2. Create hostel document
    const newHostel: Hostel = {
      id: hostelId,
      name: params.name,
      address: params.address || "",
      city: params.city || "",
      ownerId: params.ownerId,
      code: hostelCode,
      currency,
      currentMonthId: monthId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: "active",
    };
    await setDoc(hostelDoc(hostelId), newHostel);

    // 3. Create owner membership record
    const ownerMember: HostelMember = {
      uid: params.ownerId,
      role: "manager",
      status: "active",
      phone: params.ownerDetails?.phone || "",
      roomNumber: params.ownerDetails?.roomNumber || "",
      studentId: params.ownerDetails?.studentId || "",
      university: params.ownerDetails?.university || "",
      department: params.ownerDetails?.department || "",
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(memberDoc(hostelId, params.ownerId), ownerMember);

    // 4. Update user's active hostel
    await UserService.setActiveHostel(params.ownerId, hostelId);

    return { hostel: newHostel, month: firstMonth };
  },

  /**
   * Find a hostel by code (for joining)
   */
  async findHostelByCode(code: string): Promise<Hostel | null> {
    const cleanCode = code.trim().toUpperCase();
    const q = query(hostelsCol(), where("code", "==", cleanCode), where("status", "==", "active"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Hostel;
  },

  /**
   * Get hostel by ID
   */
  async getHostelById(hostelId: string): Promise<Hostel | null> {
    const snap = await getDoc(hostelDoc(hostelId));
    if (!snap.exists()) return null;
    return snap.data() as Hostel;
  },

  /**
   * Submit a join request to a hostel
   */
  async submitJoinRequest(params: {
    hostelId: string;
    userId: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    hostelName?: string;
    hostelCode?: string;
  }): Promise<JoinRequest> {
    const reqRef = doc(collection(db, "hostels", params.hostelId, "joinRequests"));
    const joinReq: JoinRequest = {
      id: reqRef.id,
      userId: params.userId,
      userName: params.userName || "",
      userEmail: params.userEmail || "",
      userPhone: params.userPhone || "",
      hostelId: params.hostelId,
      hostelName: params.hostelName || "",
      hostelCode: params.hostelCode || "",
      status: "pending",
      createdAt: serverTimestamp(),
    };
    await setDoc(joinRequestDoc(params.hostelId, reqRef.id), joinReq);
    return joinReq;
  },

  /**
   * Approve or reject a join request
   */
  async reviewJoinRequest(
    hostelId: string,
    requestId: string,
    action: "approved" | "rejected",
    reviewerUid: string,
    memberDetails?: {
      roomNumber?: string;
      studentId?: string;
      phone?: string;
    }
  ): Promise<void> {
    const reqRef = joinRequestDoc(hostelId, requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) throw new Error("Join request not found");

    const reqData = reqSnap.data();

    // Update request status
    await updateDoc(reqRef, {
      status: action,
      reviewedAt: serverTimestamp(),
      reviewedBy: reviewerUid,
    });

    // If approved, create active member record
    if (action === "approved") {
      const memberRecord: HostelMember = {
        uid: reqData.userId,
        role: "member",
        status: "active",
        phone: memberDetails?.phone || reqData.userPhone || "",
        roomNumber: memberDetails?.roomNumber || "",
        studentId: memberDetails?.studentId || "",
        joinedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(memberDoc(hostelId, reqData.userId), memberRecord);
      await UserService.setActiveHostel(reqData.userId, hostelId);
    }
  },

  /**
   * Get all pending join requests for a hostel
   */
  async getPendingJoinRequests(hostelId: string): Promise<JoinRequest[]> {
    const q = query(joinRequestsCol(hostelId), where("status", "==", "pending"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as JoinRequest);
  },

  /**
   * Get all months for a hostel
   */
  async getMonths(hostelId: string): Promise<HostelMonth[]> {
    const snap = await getDocs(monthsCol(hostelId));
    return snap.docs.map((d) => d.data() as HostelMonth);
  },
};
