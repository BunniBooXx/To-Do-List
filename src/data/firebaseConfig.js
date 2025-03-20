// ✅ Import Firebase modules
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

// ✅ Ensure backend URL is correctly set
if (!backendUrl) {
  console.error("❌ Missing REACT_APP_BACKEND_URL! Check your Netlify environment variables.");
}

// ✅ Fetch Firebase config from the backend before initializing Firebase
const fetchFirebaseConfig = async () => {
  try {
    console.log("🔍 Fetching Firebase Config from:", `${backendUrl}/api/firebase-config`);
    const response = await fetch(`${backendUrl}/api/firebase-config`);
    if (!response.ok) throw new Error("Failed to fetch Firebase config.");
    const firebaseConfig = await response.json();
    console.log("✅ Fetched Firebase Config:", firebaseConfig);
    return firebaseConfig;
  } catch (error) {
    console.error("❌ Firebase Config Fetch Error:", error);
    throw error;
  }
};

// ✅ Ensure Firebase initializes only once
const initializeFirebase = async () => {
  if (!getApps().length) {
    const config = await fetchFirebaseConfig(); // Wait for config
    return initializeApp(config);
  }
  return getApp();
};

// ✅ Lazy load Firebase instance
const appPromise = initializeFirebase();

// ✅ Function to access Firebase services after initialization
export const getFirebaseServices = async () => {
  const app = await appPromise;
  return {
    auth: getAuth(app),
    database: getDatabase(app),
  };
};

// ❌ Do NOT export `auth` and `database` directly
export default appPromise;
