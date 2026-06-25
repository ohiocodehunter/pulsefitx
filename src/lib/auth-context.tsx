import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "./firebase";

// Detect Android/iOS WebViews where Firebase's signInWithRedirect breaks because
// sessionStorage is partitioned across the firebaseapp.com auth handler origin.
export function isInAppWebView(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  // Android WebView: "; wv)" marker. iOS in-app: no "Safari/" token on WebKit.
  const androidWv = /\bwv\b/.test(ua) || /Version\/[\d.]+ Chrome\/[\d.]+ Mobile/.test(ua) && /; wv\)/.test(ua);
  const iosWv = /(iPhone|iPod|iPad)/.test(ua) && !/Safari/.test(ua);
  // Common in-app browsers
  const named = /(FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|GSA\/)/i.test(ua);
  return androidWv || iosWv || named;
}

// True when the host Android app has injected a JS bridge for native Google Sign-In.
export function hasNativeGoogleBridge(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { AndroidBridge?: { googleSignIn?: () => void } };
  return typeof w.AndroidBridge?.googleSignIn === "function";
}

export interface AuthValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    // Expose a global handler that the Android host calls after native Google
    // Sign-In: webView.evaluateJavascript("window.handleGoogleIdToken('<id>')", null)
    const w = window as unknown as {
      handleGoogleIdToken?: (idToken: string) => Promise<void>;
    };
    w.handleGoogleIdToken = async (idToken: string) => {
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(getFirebaseAuth(), credential);
    };
    return () => {
      unsub();
      try {
        delete (window as unknown as Record<string, unknown>).handleGoogleIdToken;
      } catch {
        /* ignore */
      }
    };
  }, []);

  const value: AuthValue = {
    user,
    loading,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    },
    signUp: async (email, password, name) => {
      const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
    },
    signInWithGoogle: async () => {
      // Prefer the native Android Google Sign-In bridge when the host app exposes it.
      if (hasNativeGoogleBridge()) {
        const w = window as unknown as { AndroidBridge: { googleSignIn: () => void } };
        w.AndroidBridge.googleSignIn();
        return;
      }
      if (isInAppWebView()) {
        throw new Error(
          "Google sign-in isn't supported inside this in-app browser. Please use Email & Password here, or open this site in Chrome/Safari to continue with Google.",
        );
      }
      try {
        await signInWithPopup(getFirebaseAuth(), googleProvider);
      } catch (e) {
        const code = (e as { code?: string }).code;
        // Don't fall back to signInWithRedirect — it fails inside WebViews with
        // "missing initial state" due to partitioned sessionStorage on the
        // firebaseapp.com auth handler origin. Surface a clear message instead.
        if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
          return; // user dismissed; no-op
        }
        if (
          code === "auth/popup-blocked" ||
          code === "auth/operation-not-supported-in-this-environment"
        ) {
          throw new Error(
            "Your browser blocked the Google sign-in popup. Please allow popups for this site, or use Email & Password.",
          );
        }
        throw e;
      }
    },
    resetPassword: async (email) => {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
    },
    signOut: async () => {
      await fbSignOut(getFirebaseAuth());
    },
    deleteAccount: async (password?: string) => {
      const auth = getFirebaseAuth();
      const u = auth.currentUser;
      if (!u) throw new Error("Not signed in");
      try {
        await deleteUser(u);
      } catch (e) {
        const code = (e as { code?: string }).code;
        if (code !== "auth/requires-recent-login") throw e;
        const isGoogle = u.providerData.some((p) => p.providerId === "google.com");
        if (isGoogle) {
          await reauthenticateWithPopup(u, googleProvider);
        } else {
          if (!password) throw new Error("Please enter your password to confirm");
          if (!u.email) throw new Error("No email on account");
          const cred = EmailAuthProvider.credential(u.email, password);
          await reauthenticateWithCredential(u, cred);
        }
        await deleteUser(u);
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}