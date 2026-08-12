import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { app, isFirebaseConfigured } from "./config";
import { Auth } from "firebase/auth";

export const auth = isFirebaseConfigured ? getAuth(app!) : ({} as Auth);
export const googleProvider = isFirebaseConfigured ? new GoogleAuthProvider() : null;

// Custom parameters for Google OAuth
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
}

export const signInWithEmail = async (email: string, password: string) => {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
) => {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
};

export const signInWithGooglePopup = async () => {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  if (!googleProvider) throw new Error("Google Auth Provider is not configured.");
  return await signInWithPopup(auth, googleProvider);
};

export const sendPasswordReset = async (email: string) => {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  return await sendPasswordResetEmail(auth, email);
};

export const signOutUser = async () => {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured.");
  return await signOut(auth);
};

export { onAuthStateChanged };
export type { FirebaseUser };
