import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if valid Firebase configuration is present
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your-api-key-here" &&
  !firebaseConfig.apiKey.startsWith("AIzaSyFakeKey") &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "your-project-id" &&
  firebaseConfig.projectId !== "hostel-management-dev"
);

// Initialize Firebase as a singleton instance
export const app: FirebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

export default app;
