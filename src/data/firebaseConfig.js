// ✅ Import Firebase modules
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

let firebaseConfig = null;

// ✅ Function to Fetch Firebase Config
const fetchFirebaseConfig = async () => {
  try {
    console.log("🔍 Fetching Firebase Config from:", `${backendUrl}/api/firebase-config`);
    const response = await fetch(`${backendUrl}/api/firebase-config`);
    if (!response.ok) throw new Error("Failed to fetch Firebase config.");

    firebaseConfig = await response.json();
    console.log("✅ Firebase Config Fetched:", firebaseConfig);

    // ✅ Initialize Firebase if not already initialized
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
  } catch (error) {
    console.error("❌ Firebase Config Fetch Error:", error);
  }
};

// ✅ Ensure Firebase is initialized before exporting services
fetchFirebaseConfig().then(() => {
  console.log("✅ Firebase Initialized");
}).catch(err => console.error("❌ Firebase Initialization Failed:", err));

const app = getApps().length ? getApp() : null;

// ✅ Export Firebase Services
export const auth = app ? getAuth(app) : null;
export const database = app ? getDatabase(app) : null;
export default app;



