import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getProfile, type UserProfile } from "@/lib/firestore-data";
import { AppShell } from "@/components/app/app-shell";
import { ProfileProvider } from "@/lib/profile-context";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    (async () => {
      const p = await getProfile(user.uid);
      if (!p?.onboardingComplete) {
        navigate({ to: "/onboarding", replace: true });
        return;
      }
      setProfile(p);
      setChecking(false);
    })();
  }, [user, loading, navigate]);

  if (loading || checking || !profile || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ProfileProvider profile={profile} setProfile={setProfile}>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProfileProvider>
  );
}