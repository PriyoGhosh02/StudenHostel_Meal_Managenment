"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./auth-context";
import { HostelService, getCurrentMonthInfo } from "@/lib/services/hostel.service";
import { MemberService } from "@/lib/services/member.service";
import { getDoc, Timestamp } from "firebase/firestore";
import { monthDoc } from "@/lib/firebase/firestore";
import { Hostel, HostelMonth } from "@/types/hostel";
import { HostelMember } from "@/types/member";
import { UserRole, Permission } from "@/types/user";
import { UserService } from "@/lib/services/user.service";
import { hasPermission, isManagerialRole, isAdminRole } from "@/lib/permissions";

export interface HostelContextType {
  currentHostel: Hostel | null;
  currentMonth: HostelMonth | null;
  currentMember: HostelMember | null;
  role: UserRole | null;
  loading: boolean;
  can: (permission: Permission) => boolean;
  isManager: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  refreshHostel: () => Promise<void>;
  switchHostel: (hostelId: string) => Promise<void>;
}

const HostelContext = createContext<HostelContextType | undefined>(undefined);

export function HostelProvider({ children }: { children: React.ReactNode }) {
  const { user, profile, isFirebaseConfigured } = useAuth();

  const [currentHostel, setCurrentHostel] = useState<Hostel | null>(() => {
    if (!isFirebaseConfigured) {
      const { monthId } = getCurrentMonthInfo();
      return {
        id: "demo-hostel-1",
        name: "Emerald Green Student Residence",
        address: "Road 12, Block D, Bashundhara R/A",
        city: "Dhaka",
        ownerId: "demo-user-123",
        code: "HST-DEMO1",
        currency: "BDT",
        currentMonthId: monthId,
        status: "active",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
    }
    return null;
  });

  const [currentMember, setCurrentMember] = useState<HostelMember | null>(() => {
    if (!isFirebaseConfigured) {
      return {
        uid: "demo-user-123",
        role: "manager",
        status: "active",
        roomNumber: "302",
        studentId: "2024-CSE-091",
        university: "North South University",
        department: "CSE",
        phone: "+8801712345678",
        joinedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
    }
    return null;
  });

  const [currentMonth, setCurrentMonth] = useState<HostelMonth | null>(() => {
    if (!isFirebaseConfigured) {
      const { year, month, monthId, monthName } = getCurrentMonthInfo();
      return {
        id: monthId,
        name: monthName,
        year,
        month,
        status: "active",
        startedAt: Timestamp.now(),
      };
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  const loadHostelData = useCallback(async (hostelId: string, uid: string) => {
    try {
      setLoading(true);
      const hostel = await HostelService.getHostelById(hostelId);
      if (!hostel) {
        setCurrentHostel(null);
        setCurrentMember(null);
        setCurrentMonth(null);
        return;
      }
      setCurrentHostel(hostel);

      // Load membership
      const member = await MemberService.getMember(hostelId, uid);
      setCurrentMember(member);

      if (!member) {
        // If member is null, it means they are no longer in this hostel (e.g. rejected or removed).
        // Clear active hostel ID.
        try {
          await UserService.setActiveHostel(uid, "");
        } catch (err) {
          console.warn("Failed to clear active hostel ID:", err);
        }
        setCurrentHostel(null);
        setCurrentMonth(null);
        return;
      }

      // Load active month ONLY if status is active
      if (member.status === "active" && hostel.currentMonthId) {
        const mSnap = await getDoc(monthDoc(hostelId, hostel.currentMonthId));
        if (mSnap.exists()) {
          setCurrentMonth(mSnap.data() as HostelMonth);
        }
      } else {
        setCurrentMonth(null);
      }
    } catch (error) {
      console.error("Error loading hostel data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    if (user && profile?.activeHostelId) {
      loadHostelData(profile.activeHostelId, user.uid);
    }
  }, [user, profile?.activeHostelId, isFirebaseConfigured, loadHostelData]);

  const refreshHostel = async () => {
    if (currentHostel && user) {
      await loadHostelData(currentHostel.id, user.uid);
    }
  };

  const switchHostel = async (hostelId: string) => {
    if (user) {
      await loadHostelData(hostelId, user.uid);
    }
  };

  const role = currentMember?.role || null;
  const can = (permission: Permission) => hasPermission(role, permission);
  const isManager = (role as string) === "manager" || (role as string) === "owner" || (role as string) === "admin";
  const isAdmin = (role as string) === "manager" || (role as string) === "owner" || (role as string) === "admin";
  const isOwner = (role as string) === "manager" || (role as string) === "owner" || (role as string) === "admin";

  return (
    <HostelContext.Provider
      value={{
        currentHostel,
        currentMonth,
        currentMember,
        role,
        loading,
        can,
        isManager,
        isAdmin,
        isOwner,
        refreshHostel,
        switchHostel,
      }}
    >
      {children}
    </HostelContext.Provider>
  );
}

export function useHostel() {
  const context = useContext(HostelContext);
  if (!context) {
    throw new Error("useHostel must be used within a HostelProvider");
  }
  return context;
}
