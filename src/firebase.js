// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

let firebaseApp = null;
let auth = null;

export async function initFirebase() {
  if (firebaseApp) return { firebaseApp, auth }; // Already initialized

  const res = await fetch("https://petite-planner-backend.onrender.com/api/firebase-config");
  const config = await res.json();

  firebaseApp = initializeApp(config);
  auth = getAuth(firebaseApp);

  return { firebaseApp, auth };
}
