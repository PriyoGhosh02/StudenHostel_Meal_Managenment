import {
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { userDoc } from "../firebase/firestore";
import { UserProfile, PreferredLanguage } from "@/types/user";

export const UserService = {
  /**
   * Create or update a user profile upon registration / login
   */
  async createOrUpdateUser(
    uid: string,
    data: {
      name: string;
      email: string;
      photoURL?: string;
      phone?: string;
      preferredLanguage?: PreferredLanguage;
    }
  ): Promise<UserProfile> {
    const docRef = userDoc(uid);
    const existingSnap = await getDoc(docRef);

    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
      const updatedData: Partial<UserProfile> = {
        name: data.name || existingData.name,
        email: data.email || existingData.email,
        updatedAt: serverTimestamp(),
      };

      if (data.photoURL) updatedData.photoURL = data.photoURL;
      if (data.phone) updatedData.phone = data.phone;
      if (data.preferredLanguage) updatedData.preferredLanguage = data.preferredLanguage;

      await updateDoc(docRef, updatedData);
      return { ...existingData, ...updatedData } as UserProfile;
    }

    const newUser: UserProfile = {
      uid,
      name: data.name,
      email: data.email,
      photoURL: data.photoURL || "",
      phone: data.phone || "",
      preferredLanguage: data.preferredLanguage || "en",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, newUser);
    return newUser;
  },

  /**
   * Get user profile by UID
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = userDoc(uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  },

  /**
   * Update preferred language
   */
  async updateLanguage(uid: string, language: PreferredLanguage): Promise<void> {
    const docRef = userDoc(uid);
    await updateDoc(docRef, {
      preferredLanguage: language,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Update active hostel for quick navigation
   */
  async setActiveHostel(uid: string, hostelId: string): Promise<void> {
    const docRef = userDoc(uid);
    await updateDoc(docRef, {
      activeHostelId: hostelId,
      updatedAt: serverTimestamp(),
    });
  },
};
