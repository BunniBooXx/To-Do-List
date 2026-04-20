import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

// ✅ Ensure backend URL is correctly set
if (!backendUrl) {
  console.error("❌ Missing REACT_APP_BACKEND_URL! Check your Netlify environment variables.");
}

// ✅ Store Firebase Config in Cache
let firebaseConfigCache = null;

// ✅ Fetch Firebase Config (Only Once)
const fetchFirebaseConfig = async () => {
  if (firebaseConfigCache) return firebaseConfigCache;
  try {
    if (!backendUrl) {
      throw new Error("Missing REACT_APP_BACKEND_URL (cannot fetch Firebase config).");
    }
    console.log("🔍 Fetching Firebase Config from:", `${backendUrl}/api/firebase-config`);
    const response = await fetch(`${backendUrl}/api/firebase-config`);
    if (!response.ok) throw new Error("Failed to fetch Firebase config.");
    const firebaseConfig = await response.json();
    console.log("✅ Fetched Firebase Config");
    firebaseConfigCache = firebaseConfig;
    return firebaseConfig;
  } catch (error) {
    console.error("❌ Firebase Config Fetch Error:", error);
    throw error;
  }
};

// ✅ Ensure Firebase initializes immediately when the app starts
const firebaseAppPromise = (async () => {
  try {
    if (!getApps().length) {
      const config = await fetchFirebaseConfig();
      return initializeApp(config);
    }
    return getApp();
  } catch (error) {
    console.error("❌ Firebase Initialization Failed:", error);
    return null;
  }
})();

// ✅ Function to get Firebase Services
export const getFirebaseServices = async () => {
  const app = await firebaseAppPromise;
  if (!app) throw new Error("❌ Firebase failed to initialize.");

  const auth = getAuth(app);
  const database = getDatabase(app);

  // Guard against a "resolved but unusable" state (prevents UIs from getting stuck on "Initializing…")
  if (!auth || typeof auth !== "object") {
    throw new Error("❌ Firebase Auth instance is unavailable.");
  }

  // ✅ Automatically Refresh ID Token — fully commented out for safety
  onIdTokenChanged(auth, async (user) => {
    if (user) {
      try {
        // const idToken = await user.getIdToken(true); // 🔄 Refresh token
        // localStorage.setItem("idToken", idToken); // 💾 Do NOT store token
        // console.log("🔄 ID Token Refreshed:", idToken); // ❌ Do NOT log token
      } catch (error) {
        console.error("❌ Error refreshing token:", error);
      }
    }
  });

  return { auth, database };
};

// ❌ Do NOT export `auth` and `database` directly
export default firebaseAppPromise;
