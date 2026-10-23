// Firebase web config is publishable by design — security is enforced via
// Firestore rules + Auth domain allowlist in the Firebase console.
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
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
    // Persist auth across tab closes / browser restarts.
    setPersistence(_auth, browserLocalPersistence).catch(() => {
      /* non-fatal; falls back to in-memory */
    });
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

// Lazy-initialised so firebase/auth's GoogleAuthProvider (which touches
// browser globals) is never instantiated during SSR.
let _googleProvider: GoogleAuthProvider | null = null;

export function getGoogleProvider(): GoogleAuthProvider {
  if (!_googleProvider) {
    _googleProvider = new GoogleAuthProvider();
    // Always show the Google account chooser so users with multiple Google
    // accounts can pick which one to sign in with (instead of silently
    // re-using the previously selected account).
    _googleProvider.setCustomParameters({ prompt: "select_account" });
  }
  return _googleProvider;
}

// Keep the named export for backwards-compat — but it's now a getter.
// Existing call-sites that import `googleProvider` still work because
// they only reference it at runtime (inside event handlers), never at
// module-evaluation time on the server.
export const googleProvider: GoogleAuthProvider = new Proxy(
  {} as GoogleAuthProvider,
  {
    get(_target, prop, receiver) {
      return Reflect.get(getGoogleProvider(), prop, receiver);
    },
  },
);