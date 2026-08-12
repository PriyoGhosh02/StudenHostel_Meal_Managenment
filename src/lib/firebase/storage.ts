import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { app } from "./config";

export const storage = getStorage(app);

export interface UploadOptions {
  contentType?: string;
  customMetadata?: Record<string, string>;
}

/**
 * Upload a user profile avatar
 */
export const uploadUserAvatar = async (
  userId: string,
  file: Blob | Uint8Array | ArrayBuffer,
  fileName: string
): Promise<string> => {
  const fileExt = fileName.split(".").pop() || "jpg";
  const storageRef = ref(storage, `users/${userId}/avatar_${Date.now()}.${fileExt}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

/**
 * Upload a hostel logo/banner
 */
export const uploadHostelMedia = async (
  hostelId: string,
  folder: "logo" | "notices" | "receipts",
  file: Blob | Uint8Array | ArrayBuffer,
  fileName: string
): Promise<string> => {
  const storageRef = ref(
    storage,
    `hostels/${hostelId}/${folder}/${Date.now()}_${fileName.replace(/\s+/g, "_")}`
  );
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

/**
 * Delete a file by URL or path
 */
export const deleteStorageFile = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Failed to delete storage file:", error);
  }
};
