// ✅ Import Firebase modules
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// ✅ Firebase Configuration (DO NOT EXPOSE SECRETS IN FRONTEND)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// ✅ Ensure Firebase initializes only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Export Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;



