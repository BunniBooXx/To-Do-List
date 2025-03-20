// ✅ Import Firebase modules
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

// ✅ Ensure backend URL is correctly set
if (!backendUrl) {
  console.error("❌ Missing REACT_APP_BACKEND_URL! Check your Netlify environment variables.");
}

// ✅ Fetch Firebase config ONCE and store it
let firebaseConfigCache = null;

const fetchFirebaseConfig = async () => {
  if (firebaseConfigCache) return firebaseConfigCache; // Return cached config if available
  try {
    console.log("🔍 Fetching Firebase Config from:", `${backendUrl}/api/firebase-config`);
    const response = await fetch(`${backendUrl}/api/firebase-config`);
    if (!response.ok) throw new Error("Failed to fetch Firebase config.");
    const firebaseConfig = await response.json();
    console.log("✅ Fetched Firebase Config:", firebaseConfig);
    firebaseConfigCache = firebaseConfig; // Store config in cache
    return firebaseConfig;
  } catch (error) {
    console.error("❌ Firebase Config Fetch Error:", error);
    throw error;
  }
};

// ✅ Ensure Firebase initializes only once
const initializeFirebase = async () => {
  try {
    const config = await fetchFirebaseConfig(); // Wait for config
    if (!getApps().length) {
      return initializeApp(config);
    }
    return getApp();
  } catch (error) {
    console.error("❌ Firebase Initialization Failed:", error);
    return null; // Prevents crashing
  }
};

// ✅ Lazy load Firebase instance
const firebaseAppPromise = initializeFirebase();

// ✅ Function to access Firebase services after initialization
export const getFirebaseServices = async () => {
  const app = await firebaseAppPromise;
  if (!app) {
    throw new Error("❌ Firebase failed to initialize.");
  }
  return {
    auth: getAuth(app),
    database: getDatabase(app),
  };
};

// ❌ Do NOT export `auth` and `database` directly because Firebase may not be ready
export default firebaseAppPromise;
