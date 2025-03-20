// ✅ Import Firebase modules
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const backendUrl = process.env.REACT_APP_BACKEND_URL;
let firebaseConfig = null;

// ✅ Fetch Firebase config (Blocking)
const fetchFirebaseConfigSync = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/firebase-config`);
    if (!response.ok) throw new Error("Failed to fetch Firebase config.");
    firebaseConfig = await response.json();
    console.log("✅ Fetched Firebase Config:", firebaseConfig);
  } catch (error) {
    console.error("❌ Firebase Config Fetch Error:", error);
    throw error;
  }
};

// ✅ Ensure Firebase initializes only once
(async () => {
  await fetchFirebaseConfigSync();
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }
})();

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Export Firebase services normally
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
