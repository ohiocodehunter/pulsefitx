import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Utensils, Sparkles, X, Loader2, Lightbulb, Trash2, History, Pencil, Clock } from "lucide-react";
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listMealPlans(user.uid)
      .then((list) => {
        setSaved(list);
        // Auto-restore the most recent plan so it survives page refresh.
        if (list.length > 0 && !plan) {
          setPlan(list[0].plan as Plan);
          setActiveId(list[0].id);
          setFoods(list[0].foods);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          setActiveId(entry.id);
          toast.success(tr("meals.savedToast") || "Plan saved to history");
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
    if (activeId === id) { setPlan(null); setActiveId(null); }
    setConfirmDelete(null);
    toast.success(tr("meals.deleted") || "Plan deleted");
  };

  const modifySaved = (s: SavedMealPlan) => {
    setFoods(s.foods);
    setPlan(s.plan as Plan);
    setActiveId(s.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success(tr("meals.modifyHint") || "Edit foods and regenerate to update");
  };

  const openSaved = (s: SavedMealPlan) => {
    setPlan(s.plan as Plan);
    setActiveId(s.id);
    setFoods(s.foods);
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
              const isOpen = activeId === s.id;
              return (
                <li key={s.id} className={`rounded-2xl border bg-card/70 p-4 ${isOpen ? "border-primary/50" : "border-border/60"}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button onClick={() => openSaved(s)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold">{p?.summary?.slice(0, 80) || "Meal plan"}</div>
                        {isOpen && <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase text-primary">Active</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{date.toLocaleString(lang === "ja" ? "ja-JP" : undefined)}</span>
                        <span className="truncate">{s.foods.slice(0, 5).join(", ")}{s.foods.length > 5 ? "…" : ""}</span>
                      </div>
                    </button>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openSaved(s)} disabled={isOpen}>
                        {tr("meals.view") || "View"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => modifySaved(s)} title={tr("meals.modify") || "Modify"}>
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{tr("meals.modify") || "Modify"}</span>
                      </Button>
                      {confirmDelete === s.id ? (
                        <>
                          <Button variant="destructive" size="sm" onClick={() => removeSaved(s.id)}>
                            {tr("common.confirm") || "Confirm"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                            {tr("common.cancel") || "Cancel"}
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(s.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
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