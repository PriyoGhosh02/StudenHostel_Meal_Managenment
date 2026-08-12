import {
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { reportDoc, reportsCol } from "../firebase/firestore";
import { MonthlyReportSummary } from "@/types/report";

export const ReportService = {
  /**
   * Get report for a specific month
   */
  async getReport(hostelId: string, monthId: string): Promise<MonthlyReportSummary | null> {
    const snap = await getDoc(reportDoc(hostelId, monthId));
    if (!snap.exists()) return null;
    return snap.data() as MonthlyReportSummary;
  },

  /**
   * Save generated monthly report
   */
  async saveReport(
    hostelId: string,
    monthId: string,
    report: Omit<MonthlyReportSummary, "id" | "hostelId" | "generatedAt">
  ): Promise<MonthlyReportSummary> {
    const docRef = reportDoc(hostelId, monthId);
    const newReport: MonthlyReportSummary = {
      id: monthId,
      hostelId,
      ...report,
      generatedAt: serverTimestamp(),
    };
    await setDoc(docRef, newReport);
    return newReport;
  },

  /**
   * List all historical reports
   */
  async listAllReports(hostelId: string): Promise<MonthlyReportSummary[]> {
    const snap = await getDocs(reportsCol(hostelId));
    return snap.docs.map((d) => d.data() as MonthlyReportSummary);
  },
};
