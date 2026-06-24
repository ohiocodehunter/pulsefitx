import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth-context";
import { getProfile } from "@/lib/firestore-data";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in - PulsefitX" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      const profile = await getProfile(user.uid);
      navigate({ to: profile?.onboardingComplete ? "/dashboard" : "/onboarding" });
    })();
  }, [user, loading, navigate]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div>
          <h2 className="text-4xl font-black tracking-tight">Train Smart. <span className="text-gradient-primary">Live Better.</span></h2>
          <p className="mt-4 max-w-md text-muted-foreground">Join 10,000+ people transforming their lives with personalized AI coaching.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Logo /> <span>(c) {new Date().getFullYear()} PulsefitX</span>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-3 lg:hidden"><Logo /></div>
          <h1 className="text-2xl font-bold">Welcome to PulsefitX</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in or create your free account to start.</p>
          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-5">
              <AuthForm mode="login" busy={busy}
                onSubmit={async ({ email, password }) => {
                  setBusy(true);
                  try { await signIn(email, password); }
                  catch (e) { toast.error((e as Error).message || "Sign in failed"); }
                  finally { setBusy(false); }
                }}
                onForgot={async (email) => {
                  if (!email) return toast.error("Enter your email first");
                  try { await resetPassword(email); toast.success("Password reset email sent"); }
                  catch (e) { toast.error((e as Error).message); }
                }}
              />
            </TabsContent>
            <TabsContent value="signup" className="mt-5">
              <AuthForm mode="signup" busy={busy}
                onSubmit={async ({ email, password, name }) => {
                  setBusy(true);
                  try { await signUp(email, password, name ?? ""); }
                  catch (e) { toast.error((e as Error).message || "Sign up failed"); }
                  finally { setBusy(false); }
                }}
              />
            </TabsContent>
          </Tabs>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" className="w-full" disabled={busy}
            onClick={async () => {
              setBusy(true);
              try { await signInWithGoogle(); }
              catch (e) { toast.error((e as Error).message || "Google sign in failed"); }
              finally { setBusy(false); }
            }}
          >
            <GoogleIcon /> Continue with Google
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function AuthForm({ mode, busy, onSubmit, onForgot }: {
  mode: "login" | "signup"; busy: boolean;
  onSubmit: (v: { email: string; password: string; name?: string }) => void;
  onForgot?: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  return (
    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSubmit({ email, password, name }); }}>
      {mode === "signup" && (
        <Field icon={<User className="h-4 w-4" />} label="Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required minLength={2} maxLength={60} />
        </Field>
      )}
      <Field icon={<Mail className="h-4 w-4" />} label="Email">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
      </Field>
      <Field icon={<Lock className="h-4 w-4" />} label="Password">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required minLength={6} />
      </Field>
      {mode === "login" && onForgot && (
        <button type="button" onClick={() => onForgot(email)} className="text-xs text-primary hover:underline">Forgot password?</button>
      )}
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} {mode === "login" ? "Log in" : "Create account"}
      </Button>
    </form>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon} {label}</Label>
      {children}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#FFC107" d="M21.8 10.04H12v3.93h5.6c-.25 1.6-1.84 4.7-5.6 4.7-3.37 0-6.12-2.79-6.12-6.23S8.63 6.21 12 6.21c1.92 0 3.2.82 3.94 1.52L18.9 5C17 3.25 14.7 2.2 12 2.2 6.45 2.2 2 6.65 2 12.2s4.45 10 10 10c5.77 0 9.59-4.05 9.59-9.76 0-.66-.07-1.16-.16-1.4z" />
    </svg>
  );
}