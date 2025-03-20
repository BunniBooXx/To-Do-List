// ✅ Import Firebase modules
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const backendUrl = process.env.REACT_APP_BACKEND_URL; // ✅ Ensure backend URL

// ✅ Function to fetch Firebase config securely from backend
const fetchFirebaseConfig = async () => {
  try {
    const response = await fetch(`${backendUrl}/api/firebase-config`);
    if (!response.ok) throw new Error("Failed to fetch Firebase config.");
    
    const firebaseConfig = await response.json();
    console.log("✅ Fetched Firebase Config:", firebaseConfig);

    if (!getApps().length) {
      return initializeApp(firebaseConfig);
    }
    return getApp();
  } catch (error) {
    console.error("❌ Firebase Config Fetch Error:", error);
    throw error;
  }
};

// ✅ Initialize Firebase once config is fetched
const appPromise = fetchFirebaseConfig();

// ✅ Export Firebase services (used in async components)
export const getFirebaseServices = async () => {
  const app = await appPromise;
  return {
    auth: getAuth(app),
    database: getDatabase(app),
  };
};

export default appPromise;

