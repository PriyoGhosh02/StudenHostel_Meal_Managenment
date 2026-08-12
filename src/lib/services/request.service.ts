import {
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import { ApprovalRequest, RequestStatus } from "@/types/request";
import { MealService } from "./meal.service";
import { DepositService } from "./deposit.service";
import { ExpenseService } from "./expense.service";
import { BazaarService } from "./bazaar.service";

export const RequestService = {
  /**
   * Submit a request for manager approval
   */
  async submitRequest(
    hostelId: string,
    params: Omit<ApprovalRequest, "id" | "hostelId" | "status" | "createdAt" | "updatedAt">
  ): Promise<ApprovalRequest> {
    const reqRef = doc(collection(db, "hostels", hostelId, "approvalRequests"));
    const newReq: ApprovalRequest = {
      id: reqRef.id,
      hostelId,
      status: "pending",
      ...params,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(reqRef, newReq);
    return newReq;
  },

  /**
   * List all pending or all requests for a hostel
   */
  async listRequests(hostelId: string, status?: RequestStatus): Promise<ApprovalRequest[]> {
    const requestsCol = collection(db, "hostels", hostelId, "approvalRequests");
    const q = status 
      ? query(requestsCol, where("status", "==", status))
      : query(requestsCol);
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ApprovalRequest);
  },

  /**
   * Listen to pending approval requests count in real-time
   */
  subscribePendingRequestsCount(hostelId: string, callback: (count: number) => void) {
    const requestsCol = collection(db, "hostels", hostelId, "approvalRequests");
    const q = query(requestsCol, where("status", "==", "pending"));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.length);
    });
  },

  /**
   * Approve a request and apply changes automatically to the database
   */
  async approveRequest(hostelId: string, requestId: string, managerUserId: string): Promise<void> {
    const reqRef = doc(db, "hostels", hostelId, "approvalRequests", requestId);
    const reqSnap = await getDoc(reqRef);
    if (!reqSnap.exists()) throw new Error("Request not found");

    const reqData = reqSnap.data() as ApprovalRequest;
    if (reqData.status !== "pending") throw new Error("Request is already processed");

    const details = reqData.details;

    // Apply the operation to the database based on request type
    if (reqData.type === "meal") {
      await MealService.recordMeal(hostelId, {
        monthId: reqData.monthId,
        userId: details.targetUserId || reqData.userId,
        date: details.date || new Date().toISOString().split("T")[0],
        breakfast: details.breakfast || 0,
        lunch: details.lunch || 0,
        dinner: details.dinner || 0,
        totalMeals: details.totalMeals || 0,
        recordedBy: managerUserId,
      });
    } else if (reqData.type === "deposit") {
      await DepositService.addDeposit(hostelId, {
        monthId: reqData.monthId,
        userId: reqData.userId,
        amount: details.amount || 0,
        paymentMethod: (details.paymentMethod as any) || "cash",
        transactionId: details.transactionId || "-",
        status: "approved",
      });
    } else if (reqData.type === "expense") {
      await ExpenseService.addExpense(hostelId, {
        monthId: reqData.monthId,
        title: details.title || "Expense",
        amount: details.amount || 0,
        category: (details.category as any) || "other",
        date: details.date || new Date().toISOString().split("T")[0],
        createdBy: reqData.userId,
      });
    } else if (reqData.type === "bazaar_schedule") {
      await BazaarService.scheduleBazaar(hostelId, {
        monthId: reqData.monthId,
        date: details.date || new Date().toISOString().split("T")[0],
        allocatedBudget: details.allocatedBudget || 0,
        assignedMemberNames: details.assignedMemberNames || [reqData.userName],
        assignedMemberIds: [reqData.userId],
        items: [],
        status: "scheduled",
      });
    }

    // Mark the request as approved
    await updateDoc(reqRef, {
      status: "approved",
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Reject a request
   */
  async rejectRequest(hostelId: string, requestId: string): Promise<void> {
    const reqRef = doc(db, "hostels", hostelId, "approvalRequests", requestId);
    await updateDoc(reqRef, {
      status: "rejected",
      updatedAt: serverTimestamp(),
    });
  },
};
