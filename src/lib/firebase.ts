// Firebase web config is publishable by design — security is enforced via
// Firestore rules + Auth domain allowlist in the Firebase console.
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChDQMaIWzRK-zGeGPDFAZCzb2dMewn-Kc",
  authDomain: "pulsefitx.firebaseapp.com",
  projectId: "pulsefitx",
  storageBucket: "pulsefitx.firebasestorage.app",
  messagingSenderId: "956252638942",
  appId: "1:956252638942:web:b8d551ad32bfd8c1897c4f",
  measurementId: "G-J61PKFZZC1",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function ensure() {
  if (typeof window === "undefined") return null;
  if (!_app) {
    _app = getApps()[0] ?? initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
  }
  return _app;
}

export function getFirebaseAuth(): Auth {
  ensure();
  if (!_auth) throw new Error("Firebase auth only available on the client");
  return _auth;
}

export function getDb(): Firestore {
  ensure();
  if (!_db) throw new Error("Firestore only available on the client");
  return _db;
}

export const googleProvider = new GoogleAuthProvider();