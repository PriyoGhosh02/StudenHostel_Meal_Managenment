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
import { app } from "./config";

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Custom parameters for Google OAuth
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const signInWithEmail = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
};

export const signInWithGooglePopup = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const sendPasswordReset = async (email: string) => {
  return await sendPasswordResetEmail(auth, email);
};

export const signOutUser = async () => {
  return await signOut(auth);
};

export { onAuthStateChanged };
export type { FirebaseUser };
