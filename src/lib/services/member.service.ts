import {
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { memberDoc, membersCol, userDoc } from "../firebase/firestore";
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
        name: uData?.name || "Unknown Member",
        email: uData?.email || "",
        photoURL: uData?.photoURL || "",
      });
    }

    return fullMembers;
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
};
