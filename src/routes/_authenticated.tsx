import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, AlertCircle, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getProfile, type UserProfile } from "@/lib/firestore-data";
import { AppShell } from "@/components/app/app-shell";
import { ProfileProvider } from "@/lib/profile-context";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }

    let active = true;
    setChecking(true);
    setError(null);

    (async () => {
      try {
        const p = await getProfile(user.uid);
        if (!active) return;
        if (!p?.onboardingComplete) {
          navigate({ to: "/onboarding", replace: true });
          return;
        }
        setProfile(p);
      } catch (err: unknown) {
        console.error("Failed to load user profile:", err);
        if (!active) return;
        const msg = (err as Error)?.message || "Failed to load profile";
        setError(msg);
      } finally {
        if (active) setChecking(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, loading, navigate, retryCount]);

  if (loading || checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-lg">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <h2 className="text-lg font-bold">Failed to load profile</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <div className="mt-3 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <strong>Tip:</strong> If this mentions <code>Missing or insufficient permissions</code>, ensure Cloud Firestore is enabled in your Firebase Console and security rules allow read/write for <code>/users/{`{userId}`}</code>.
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setRetryCount((c) => c + 1)}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/onboarding" })}
            >
              Go to Onboarding
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !user) {
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