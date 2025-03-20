// ✅ Import Firebase modules
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"; // ✅ Ensure backend URL

let firebaseConfig = null;

// ✅ Function to fetch Firebase config securely from backend
const fetchFirebaseConfig = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/firebase-config`);
    if (!response.ok) throw new Error("Failed to fetch Firebase config.");
    
    firebaseConfig = await response.json();
    console.log("✅ Fetched Firebase Config:", firebaseConfig);
    
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
  } catch (error) {
    console.error("❌ Firebase Config Fetch Error:", error);
  }
};

// ✅ Initialize Firebase once config is fetched
await fetchFirebaseConfig(); // ⏳ Load before exporting services

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ Export Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;



