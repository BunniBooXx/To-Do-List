// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

let firebaseApp = null;
let auth = null;

// Get backend URL from env OR default to localhost during local dev
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:10000";

export async function initFirebase() {
  if (firebaseApp) {
    return { firebaseApp, auth }; // Already initialized
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/firebase-config`);
    if (!res.ok) {
      throw new Error(`Failed to fetch config: ${res.status} ${res.statusText}`);
    }

    const config = await res.json();

    firebaseApp = initializeApp(config);
    auth = getAuth(firebaseApp);

    console.log("✅ Firebase initialized!");
    return { firebaseApp, auth };
  } catch (error) {
    console.error("❌ Error initializing Firebase:", error);
    throw error; // Rethrow so calling code can handle it
  }
}
