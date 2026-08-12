import {
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { memberDoc, membersCol, userDoc, hostelDoc } from "../firebase/firestore";
import { HostelMember, MemberRole, MemberStatus, MemberWithProfile } from "@/types/member";
import { UserProfile } from "@/types/user";

export const MemberService = {
  /**
   * Get member profile with user details
   */
  async getMember(hostelId: string, uid: string): Promise<HostelMember | null> {
    const snap = await getDoc(memberDoc(hostelId, uid));
    if (!snap.exists()) return null;
    return snap.data() as HostelMember;
  },

  /**
   * List all members of a hostel with populated user info
   */
  async listMembersWithProfiles(hostelId: string): Promise<MemberWithProfile[]> {
    const membersSnap = await getDocs(membersCol(hostelId));
    const members = membersSnap.docs.map((d) => d.data() as HostelMember);

    const fullMembers: MemberWithProfile[] = [];
    for (const m of members) {
      const uSnap = await getDoc(userDoc(m.uid));
      const uData = uSnap.exists() ? (uSnap.data() as UserProfile) : null;
      fullMembers.push({
        ...m,
        memberCode: m.memberCode || m.studentId || `MEM-${m.uid.slice(0, 6).toUpperCase()}`,
        name: uData?.name || "Unknown Member",
        email: uData?.email || "",
        photoURL: uData?.photoURL || "",
      });
    }

    return fullMembers;
  },

  /**
   * Add a new member to a hostel with a unique member code
   */
  async addMemberWithCode(
    hostelId: string,
    params: {
      name: string;
      email?: string;
      phone?: string;
      roomNumber?: string;
      memberCode: string;
      role?: MemberRole;
    }
  ): Promise<HostelMember> {
    const newUid = `user_${Date.now()}`;
    const cleanCode = params.memberCode.trim().toUpperCase();

    // Create user profile
    await setDoc(userDoc(newUid), {
      uid: newUid,
      name: params.name,
      email: params.email || `${cleanCode.toLowerCase()}@hostel.local`,
      phone: params.phone || "",
      activeHostelId: hostelId,
      preferredLanguage: "en",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Create hostel member document
    const newMember: HostelMember = {
      uid: newUid,
      memberCode: cleanCode,
      role: params.role || "member",
      status: "active",
      roomNumber: params.roomNumber || "",
      studentId: cleanCode,
      phone: params.phone || "",
      joinedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(memberDoc(hostelId, newUid), newMember);
    return newMember;
  },

  /**
   * Update member role
   */
  async updateRole(hostelId: string, uid: string, role: MemberRole): Promise<void> {
    await updateDoc(memberDoc(hostelId, uid), {
      role,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Update member status (e.g. suspend / activate)
   */
  async updateStatus(hostelId: string, uid: string, status: MemberStatus): Promise<void> {
    await updateDoc(memberDoc(hostelId, uid), {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Remove member from hostel
   */
  async removeMember(hostelId: string, uid: string): Promise<void> {
    await deleteDoc(memberDoc(hostelId, uid));
  },

  /**
   * Transfer manager power: promotes target user to manager and demotes current manager to member
   */
  async transferManagerPower(hostelId: string, currentManagerId: string, targetMemberId: string): Promise<void> {
    await updateDoc(memberDoc(hostelId, targetMemberId), {
      role: "manager",
      updatedAt: serverTimestamp(),
    });
    await updateDoc(memberDoc(hostelId, currentManagerId), {
      role: "member",
      updatedAt: serverTimestamp(),
    });
    await updateDoc(hostelDoc(hostelId), {
      ownerId: targetMemberId,
      updatedAt: serverTimestamp(),
    });
  },
};
