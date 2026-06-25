import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  signInWithPopup,
  signInWithRedirect,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "./firebase";

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
    return () => unsub();
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
      try {
        await signInWithPopup(getFirebaseAuth(), googleProvider);
      } catch (e) {
        const code = (e as { code?: string }).code;
        // Popup blocked / closed by user / browser policy — fall back to redirect.
        if (
          code === "auth/popup-blocked" ||
          code === "auth/popup-closed-by-user" ||
          code === "auth/cancelled-popup-request" ||
          code === "auth/operation-not-supported-in-this-environment"
        ) {
          await signInWithRedirect(getFirebaseAuth(), googleProvider);
          return;
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