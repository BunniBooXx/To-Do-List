// ✅ Import Firebase modules
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://petite-planner-backend.onrender.com";

let firebaseConfig = null;

// ✅ Function to Fetch Firebase Config
const fetchFirebaseConfig = async () => {
  try {
    const apiUrl = `${backendUrl}/api/firebase-config`.replace(/([^:]\/)\/+/g, "$1"); // ✅ Fix double slash issue
    console.log("🔍 Fetching Firebase Config from:", apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Failed to fetch Firebase config.");

    firebaseConfig = await response.json();
    console.log("✅ Firebase Config Fetched:", firebaseConfig);

    // ✅ Ensure Firebase is initialized after fetching config
    if (!getApps().length) {
      initializeApp(firebaseConfig);
      console.log("🔥 Firebase App Initialized");
    }
  } catch (error) {
    console.error("❌ Firebase Config Fetch Error:", error);
  }
};

// ✅ Ensure Firebase is initialized before exporting services
const initFirebase = async () => {
  await fetchFirebaseConfig();
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
};

// ✅ Initialize Firebase properly before use
const appPromise = initFirebase();

// ✅ Export Firebase Services Safely
export const auth = appPromise.then(app => getAuth(app)).catch(() => null);
export const database = appPromise.then(app => getDatabase(app)).catch(() => null);
export default appPromise;

