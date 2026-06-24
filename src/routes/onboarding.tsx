import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { useAuth } from "@/lib/auth-context";
import { calcTargets, type ActivityLevel, type Gender, type Goal } from "@/lib/calculations";
import { saveProfile, getProfile } from "@/lib/firestore-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({ meta: [{ title: "Set up your plan - PulsefitX" }] }),
  component: Onboarding,
});

type Lifestyle = "hostel" | "home" | "office" | "solo";
type Diet = "vegetarian" | "non_vegetarian" | "vegan";
type Budget = "low" | "medium" | "high";

interface State {
  name: string; age: number; gender: Gender;
  heightCm: number; weightKg: number;
  goal: Goal; activity: ActivityLevel;
  lifestyle: Lifestyle; diet: Diet; budget: Budget;
  healthConditions: string[];
}

const goals: { v: Goal; t: string; sub: string }[] = [
  { v: "lose", t: "Weight Loss", sub: "Burn fat, lean down" },
  { v: "maintain", t: "Maintenance", sub: "Stay where you are" },
  { v: "gain", t: "Weight Gain", sub: "Healthy bulk" },
  { v: "muscle", t: "Muscle Gain", sub: "Build strength" },
];
const activities: { v: ActivityLevel; t: string; sub: string }[] = [
  { v: "sedentary", t: "Sedentary", sub: "Little or no exercise" },
  { v: "light", t: "Lightly Active", sub: "1-3 days / week" },
  { v: "moderate", t: "Moderately Active", sub: "3-5 days / week" },
  { v: "active", t: "Very Active", sub: "6-7 days / week" },
  { v: "very_active", t: "Athlete", sub: "Twice a day or physical job" },
];
const lifestyles: { v: Lifestyle; t: string }[] = [
  { v: "hostel", t: "Hostel" }, { v: "home", t: "Home" },
  { v: "office", t: "Office" }, { v: "solo", t: "Solo Living" },
];
const diets: { v: Diet; t: string }[] = [
  { v: "vegetarian", t: "Vegetarian" }, { v: "non_vegetarian", t: "Non-Vegetarian" }, { v: "vegan", t: "Vegan" },
];
const budgets: { v: Budget; t: string }[] = [
  { v: "low", t: "Low" }, { v: "medium", t: "Medium" }, { v: "high", t: "High" },
];
const conditions = ["Diabetes", "Hypertension", "Thyroid", "Allergies"];

function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<State>({
    name: "", age: 25, gender: "male",
    heightCm: 170, weightKg: 70,
    goal: "muscle", activity: "moderate",
    lifestyle: "home", diet: "vegetarian", budget: "medium",
    healthConditions: [],
  });

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth", replace: true }); return; }
    (async () => {
      const p = await getProfile(user.uid);
      if (p?.onboardingComplete) { navigate({ to: "/dashboard", replace: true }); return; }
      if (p) setState((s) => ({ ...s, ...p }));
      if (!state.name && user.displayName) setState((s) => ({ ...s, name: user.displayName ?? "" }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const steps = [
    {
      title: "Tell us about you",
      body: (
        <div className="space-y-4">
          <Field label="Your name">
            <Input value={state.name} onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))} placeholder="Karan" maxLength={60} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age">
              <Input type="number" min={13} max={100} value={state.age}
                onChange={(e) => setState((s) => ({ ...s, age: Number(e.target.value) }))} />
            </Field>
            <Field label="Gender">
              <Choice options={[{ v: "male", t: "Male" }, { v: "female", t: "Female" }]}
                value={state.gender} onChange={(v) => setState((s) => ({ ...s, gender: v as Gender }))} />
            </Field>
          </div>
        </div>
      ),
    },
    {
      title: "Body metrics",
      body: (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (cm)">
            <Input type="number" min={120} max={230} value={state.heightCm}
              onChange={(e) => setState((s) => ({ ...s, heightCm: Number(e.target.value) }))} />
          </Field>
          <Field label="Weight (kg)">
            <Input type="number" min={30} max={250} value={state.weightKg}
              onChange={(e) => setState((s) => ({ ...s, weightKg: Number(e.target.value) }))} />
          </Field>
        </div>
      ),
    },
    {
      title: "What's your goal?",
      body: (
        <div className="grid grid-cols-2 gap-3">
          {goals.map((g) => (
            <BigPick key={g.v} active={state.goal === g.v} onClick={() => setState((s) => ({ ...s, goal: g.v }))}
              title={g.t} sub={g.sub} />
          ))}
        </div>
      ),
    },
    {
      title: "How active are you?",
      body: (
        <div className="space-y-2">
          {activities.map((a) => (
            <BigPick key={a.v} active={state.activity === a.v} onClick={() => setState((s) => ({ ...s, activity: a.v }))}
              title={a.t} sub={a.sub} compact />
          ))}
        </div>
      ),
    },
    {
      title: "Where do you live?",
      body: (
        <div className="grid grid-cols-2 gap-3">
          {lifestyles.map((l) => (
            <BigPick key={l.v} active={state.lifestyle === l.v} onClick={() => setState((s) => ({ ...s, lifestyle: l.v }))} title={l.t} />
          ))}
        </div>
      ),
    },
    {
      title: "Diet & budget",
      body: (
        <div className="space-y-4">
          <Field label="Diet">
            <div className="grid grid-cols-3 gap-2">
              {diets.map((d) => (
                <BigPick key={d.v} active={state.diet === d.v} onClick={() => setState((s) => ({ ...s, diet: d.v }))} title={d.t} />
              ))}
            </div>
          </Field>
          <Field label="Budget">
            <div className="grid grid-cols-3 gap-2">
              {budgets.map((b) => (
                <BigPick key={b.v} active={state.budget === b.v} onClick={() => setState((s) => ({ ...s, budget: b.v }))} title={b.t} />
              ))}
            </div>
          </Field>
        </div>
      ),
    },
    {
      title: "Health conditions (optional)",
      body: (
        <div className="grid grid-cols-2 gap-3">
          {conditions.map((c) => {
            const on = state.healthConditions.includes(c);
            return (
              <button key={c} type="button"
                onClick={() => setState((s) => ({
                  ...s, healthConditions: on ? s.healthConditions.filter((x) => x !== c) : [...s.healthConditions, c],
                }))}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-3 text-left text-sm transition-all",
                  on ? "border-primary bg-primary/10 text-primary" : "border-border bg-card/60 hover:border-primary/40",
                )}
              >
                {c} {on && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      ),
    },
  ];

  const next = async () => {
    if (step < steps.length - 1) { setStep(step + 1); return; }
    if (!user) return;
    setBusy(true);
    try {
      const targets = calcTargets({
        age: state.age, gender: state.gender,
        heightCm: state.heightCm, weightKg: state.weightKg,
        activity: state.activity, goal: state.goal,
      });
      await saveProfile(user.uid, {
        ...state, email: user.email ?? "",
        targets, onboardingComplete: true,
      });
      toast.success("Your plan is ready!");
      navigate({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message || "Failed to save profile");
    } finally { setBusy(false); }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <div className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</div>
        </div>
        <div className="h-1 w-full bg-border/50">
          <motion.div className="h-full bg-primary" animate={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
      </header>
      <main className="container mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-10">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex-1"
          >
            <h2 className="text-3xl font-black tracking-tight">{steps[step].title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Personalize your AI coaching experience.</p>
            <div className="mt-8">{steps[step].body}</div>
          </motion.div>
        </AnimatePresence>
        <div className="mt-10 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || busy}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="hero" size="lg" onClick={next} disabled={busy}>
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {step === steps.length - 1 ? "Finish & Generate Plan" : "Continue"}
            {!busy && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{children}</div>;
}

function Choice<T extends string>({ options, value, onChange }: {
  options: { v: T; t: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((o) => (
        <button key={o.v} type="button" onClick={() => onChange(o.v)}
          className={cn(
            "rounded-xl border p-2 text-sm transition-all",
            value === o.v ? "border-primary bg-primary/10 text-primary" : "border-border bg-card/60 hover:border-primary/40",
          )}>
          {o.t}
        </button>
      ))}
    </div>
  );
}

function BigPick({ active, onClick, title, sub, compact = false }: {
  active: boolean; onClick: () => void; title: string; sub?: string; compact?: boolean;
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "rounded-2xl border text-left transition-all",
        compact ? "p-3" : "p-4",
        active ? "border-primary bg-primary/10 shadow-[0_0_30px_-12px_oklch(0.83_0.22_145/0.6)]" : "border-border bg-card/60 hover:border-primary/40",
      )}>
      <div className={cn("font-semibold", active ? "text-primary" : "text-foreground")}>{title}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </button>
  );
}