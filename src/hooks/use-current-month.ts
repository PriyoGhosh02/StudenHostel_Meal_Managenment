import { useHostel } from "@/context/hostel-context";

export function useCurrentMonth() {
  const { currentMonth, currentHostel } = useHostel();

  return {
    month: currentMonth,
    monthId: currentMonth?.id || "",
    monthName: currentMonth?.name || "",
    year: currentMonth?.year || new Date().getFullYear(),
    monthNumber: currentMonth?.month || new Date().getMonth() + 1,
    isActive: currentMonth?.status === "active",
    currency: currentHostel?.currency || "BDT",
  };
}
