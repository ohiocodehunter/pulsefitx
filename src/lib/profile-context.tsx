import { createContext, useContext, type ReactNode, type Dispatch, type SetStateAction } from "react";
import type { UserProfile } from "./firestore-data";

interface ProfileCtx {
  profile: UserProfile;
  setProfile: Dispatch<SetStateAction<UserProfile | null>>;
}

const Ctx = createContext<ProfileCtx | null>(null);

export function ProfileProvider({
  profile, setProfile, children,
}: ProfileCtx & { children: ReactNode }) {
  return <Ctx.Provider value={{ profile, setProfile }}>{children}</Ctx.Provider>;
}

export function useProfile(): ProfileCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useProfile must be used inside ProfileProvider");
  return v;
}