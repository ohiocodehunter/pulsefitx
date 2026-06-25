import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Utensils, Sparkles, X, Loader2, Lightbulb, Trash2, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/lib/profile-context";
import { generateMealPlan } from "@/lib/ai.functions";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import {
  saveMealPlan, listMealPlans, deleteMealPlan, type SavedMealPlan,
} from "@/lib/firestore-data";

export const Route = createFileRoute("/_authenticated/meals")({
  head: () => ({ meta: [{ title: "Meal Planner - PulsefitX" }] }),
  component: Meals,
});

type Plan = Awaited<ReturnType<typeof generateMealPlan>>;

const COMMON = ["Rice", "Eggs", "Milk", "Bread", "Dal", "Chicken", "Paneer", "Oats", "Banana", "Roti", "Curd", "Peanut Butter"];

function Meals() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t: tr, lang } = useT();
  const [foods, setFoods] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [saved, setSaved] = useState<SavedMealPlan[]>([]);

  useEffect(() => {
    if (!user) return;
    listMealPlans(user.uid).then(setSaved).catch(() => {});
  }, [user]);

  const addFood = (f: string) => {
    const v = f.trim();
    if (!v || foods.includes(v)) return;
    if (foods.length >= 30) return toast.error(tr("meals.max30"));
    setFoods((s) => [...s, v]); setInput("");
  };

  const generate = async () => {
    if (foods.length === 0) return toast.error(tr("meals.addOne"));
    setBusy(true);
    try {
      const r = await generateMealPlan({ data: {
        foods, calories: profile.targets.calories, proteinG: profile.targets.proteinG,
        diet: profile.diet, lifestyle: profile.lifestyle, budget: profile.budget,
        lang,
      }});
      setPlan(r);
      // Auto-save so the plan survives page reloads / closing the tab.
      if (user) {
        const entry: SavedMealPlan = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: Date.now(),
          foods: [...foods],
          plan: r,
        };
        try {
          await saveMealPlan(user.uid, entry);
          setSaved((s) => [entry, ...s]);
        } catch {
          /* ignore — plan still visible in memory */
        }
      }
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const removeSaved = async (id: string) => {
    if (!user) return;
    await deleteMealPlan(user.uid, id);
    setSaved((s) => s.filter((p) => p.id !== id));
    toast.success(tr("meals.deleted") || "Deleted");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-black sm:text-3xl">{tr("meals.title")}</h1>
        <p className="text-sm text-muted-foreground">{tr("meals.subtitle")}</p>
      </header>

      <section className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <h3 className="font-bold">{tr("meals.available")}</h3>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addFood(input); }}>
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={tr("meals.addFood")} maxLength={40} />
          <Button type="submit" variant="outline">{tr("meals.add")}</Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {foods.map((f) => (
            <span key={f} className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
              {f} <button onClick={() => setFoods((s) => s.filter((x) => x !== f))}><X className="h-3 w-3" /></button>
            </span>
          ))}
        </div>
        <div className="mt-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{tr("meals.quickAdd")}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {COMMON.filter((c) => !foods.includes(c)).map((c) => (
              <button key={c} onClick={() => addFood(c)} className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground">
                + {c}
              </button>
            ))}
          </div>
        </div>
        <Button variant="hero" size="lg" className="mt-5 w-full sm:w-auto" disabled={busy} onClick={generate}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {tr("meals.generate")} ({profile.targets.calories} kcal / {profile.targets.proteinG}g {tr("nutrition.protein")})
        </Button>
      </section>

      <AnimatePresence>
        {plan && (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-center gap-2 text-sm font-bold text-primary"><Sparkles className="h-4 w-4" /> {tr("meals.yourPlan")}</div>
              <p className="mt-2 text-sm">{plan.summary}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {plan.meals.map((m) => (
                <div key={m.name} className="rounded-2xl border border-border/60 bg-card/70 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary"><Utensils className="h-4 w-4" /></div>
                      <div>
                        <div className="font-bold">{m.name}</div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.time}</div>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-bold">{m.totalCalories} <span className="text-[10px] text-muted-foreground">kcal</span></div>
                      <div className="text-muted-foreground">{m.totalProteinG}g protein</div>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {m.items.map((it, i) => (
                      <li key={i} className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2 text-sm">
                        <div><div className="font-medium">{it.food}</div><div className="text-[10px] text-muted-foreground">{it.portion}</div></div>
                        <div className="text-right text-[11px]">
                          <div>{it.calories} kcal</div>
                          <div className="text-muted-foreground">{it.proteinG}g P</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {plan.tips?.length > 0 && (
              <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
                <div className="flex items-center gap-2 font-bold"><Lightbulb className="h-4 w-4 text-amber-400" /> {tr("meals.coachTips")}</div>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {plan.tips.map((t, i) => <li key={i} className="flex gap-2 text-muted-foreground"><span className="text-primary">•</span>{t}</li>)}
                </ul>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {saved.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <History className="h-4 w-4 text-primary" /> {tr("meals.saved") || "Saved plans"}
            <span className="text-[10px] font-normal text-muted-foreground">({saved.length})</span>
          </div>
          <ul className="space-y-2">
            {saved.map((s) => {
              const p = s.plan as Plan;
              const date = new Date(s.createdAt);
              const isOpen = plan === p;
              return (
                <li key={s.id} className="rounded-2xl border border-border/60 bg-card/70 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <button onClick={() => setPlan(p)} className="min-w-0 flex-1 text-left">
                      <div className="truncate text-sm font-semibold">{p?.summary?.slice(0, 80) || "Meal plan"}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {date.toLocaleString()} · {s.foods.slice(0, 4).join(", ")}{s.foods.length > 4 ? "…" : ""}
                      </div>
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => setPlan(p)} disabled={isOpen}>
                      {tr("meals.view") || "View"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeSaved(s.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}