import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Apple, Beef, Droplet, Flame, Minus, Plus, Search, Trash2, Wheat, Loader2 } from "lucide-react";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import {
  getLog, getRecentLogs, todayKey, upsertLog, type DailyLog,
} from "@/lib/firestore-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/nutrition")({
  ssr: false,
  head: () => ({ meta: [{ title: "Nutrition - PulsefitX" }] }),
  component: NutritionPage,
});

/* -------- tiny built-in food database (per 100 g unless noted) -------- */
type Food = { name: string; unit: string; cal: number; p: number; c: number; f: number };
const FOODS: Food[] = [
  { name: "Chicken breast", unit: "100 g", cal: 165, p: 31, c: 0, f: 3.6 },
  { name: "Egg (whole)", unit: "1 large", cal: 72, p: 6.3, c: 0.4, f: 5 },
  { name: "Greek yogurt", unit: "100 g", cal: 59, p: 10, c: 3.6, f: 0.4 },
  { name: "Paneer", unit: "100 g", cal: 265, p: 18, c: 1.2, f: 21 },
  { name: "Tofu", unit: "100 g", cal: 76, p: 8, c: 1.9, f: 4.8 },
  { name: "Lentils (cooked)", unit: "100 g", cal: 116, p: 9, c: 20, f: 0.4 },
  { name: "Chickpeas (cooked)", unit: "100 g", cal: 164, p: 8.9, c: 27, f: 2.6 },
  { name: "Rice (cooked)", unit: "100 g", cal: 130, p: 2.7, c: 28, f: 0.3 },
  { name: "Roti (wheat)", unit: "1 medium", cal: 104, p: 3.1, c: 18, f: 2.5 },
  { name: "Oats (dry)", unit: "40 g", cal: 152, p: 5.4, c: 27, f: 2.6 },
  { name: "Banana", unit: "1 medium", cal: 105, p: 1.3, c: 27, f: 0.3 },
  { name: "Apple", unit: "1 medium", cal: 95, p: 0.5, c: 25, f: 0.3 },
  { name: "Peanut butter", unit: "1 tbsp", cal: 94, p: 4, c: 3, f: 8 },
  { name: "Almonds", unit: "30 g", cal: 174, p: 6.4, c: 6, f: 15 },
  { name: "Whey protein", unit: "1 scoop", cal: 120, p: 24, c: 3, f: 1.5 },
  { name: "Milk (toned)", unit: "200 ml", cal: 116, p: 6.4, c: 9.6, f: 5.8 },
  { name: "Salmon", unit: "100 g", cal: 208, p: 20, c: 0, f: 13 },
  { name: "Broccoli", unit: "100 g", cal: 35, p: 2.4, c: 7, f: 0.4 },
  { name: "Sweet potato", unit: "100 g", cal: 86, p: 1.6, c: 20, f: 0.1 },
  { name: "Olive oil", unit: "1 tbsp", cal: 119, p: 0, c: 0, f: 13.5 },
];

type MealKey = "breakfast" | "lunch" | "snack" | "dinner";
const MEAL_LABEL: Record<MealKey, string> = {
  breakfast: "Breakfast", lunch: "Lunch", snack: "Snack", dinner: "Dinner",
};

type MealEntry = {
  id: string; meal: MealKey; name: string; servings: number;
  cal: number; p: number; c: number; f: number;
};

function NutritionPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const date = todayKey();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [week, setWeek] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [l, w] = await Promise.all([
        getLog(user.uid, date),
        getRecentLogs(user.uid, 7),
      ]);
      setLog(l);
      setWeek(w);
      setLoading(false);
    })();
  }, [user, date]);

  const entries: MealEntry[] = ((log?.meals as MealEntry[] | undefined) ?? []).filter(
    (m): m is MealEntry => !!m && typeof m === "object" && "meal" in m,
  );

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, m) => ({
        cal: acc.cal + m.cal, p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f,
      }),
      { cal: 0, p: 0, c: 0, f: 0 },
    );
  }, [entries]);

  const t = profile.targets;
  const water = log?.water ?? 0;

  const persist = async (next: Partial<DailyLog>) => {
    if (!user) return;
    setSaving(true);
    try {
      const base: DailyLog = log ?? {
        date, calories: 0, protein: 0, carbs: 0, fats: 0,
        water: 0, steps: 0, sleepHours: 0, meals: [],
      };
      const merged: DailyLog = { ...base, ...next };
      await upsertLog(user.uid, date, merged);
      setLog(merged);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setSaving(false); }
  };

  const addEntry = async (meal: MealKey, food: Food, servings: number) => {
    const e: MealEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      meal, name: food.name, servings,
      cal: Math.round(food.cal * servings),
      p: Math.round(food.p * servings * 10) / 10,
      c: Math.round(food.c * servings * 10) / 10,
      f: Math.round(food.f * servings * 10) / 10,
    };
    const next = [...entries, e];
    const tot = next.reduce((a, m) => ({
      cal: a.cal + m.cal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f,
    }), { cal: 0, p: 0, c: 0, f: 0 });
    await persist({
      meals: next as unknown as DailyLog["meals"],
      calories: tot.cal, protein: tot.p, carbs: tot.c, fats: tot.f,
    });
    toast.success(`Added ${food.name}`);
  };

  const removeEntry = async (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    const tot = next.reduce((a, m) => ({
      cal: a.cal + m.cal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f,
    }), { cal: 0, p: 0, c: 0, f: 0 });
    await persist({
      meals: next as unknown as DailyLog["meals"],
      calories: tot.cal, protein: tot.p, carbs: tot.c, fats: tot.f,
    });
  };

  const setWater = async (next: number) => {
    const v = Math.max(0, Math.round(next * 4) / 4);
    await persist({ water: v });
  };

  const weekly = week.map((d) => ({
    day: d.date.slice(5),
    calories: d.calories,
    protein: d.protein,
  }));

  const macros = [
    { name: "Carbs", value: totals.c * 4, color: "oklch(0.7 0.18 290)" },
    { name: "Protein", value: totals.p * 4, color: "oklch(0.83 0.22 145)" },
    { name: "Fats", value: totals.f * 9, color: "oklch(0.82 0.17 80)" },
  ];
  const totalMacroCal = macros.reduce((a, m) => a + m.value, 0);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black tracking-tight sm:text-3xl">Nutrition</h1>
          <p className="text-sm text-muted-foreground">Log your meals and track macros for today.</p>
        </div>
        {saving && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving
          </span>
        )}
      </header>

      {/* Macro summary */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MacroCard icon={Flame} color="amber" label="Calories" value={totals.cal} goal={t.calories} unit="kcal" />
        <MacroCard icon={Beef} color="primary" label="Protein" value={Math.round(totals.p)} goal={t.proteinG} unit="g" />
        <MacroCard icon={Wheat} color="violet" label="Carbs" value={Math.round(totals.c)} goal={t.carbsG} unit="g" />
        <MacroCard icon={Apple} color="sky" label="Fats" value={Math.round(totals.f)} goal={t.fatsG} unit="g" />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Meals */}
        <section className="rounded-2xl border border-border/60 bg-card/70 p-4 sm:p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Today's Meals</h2>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {entries.length} item{entries.length !== 1 ? "s" : ""}
            </span>
          </div>

          <Tabs defaultValue="breakfast" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              {(Object.keys(MEAL_LABEL) as MealKey[]).map((k) => (
                <TabsTrigger key={k} value={k} className="text-xs sm:text-sm">{MEAL_LABEL[k]}</TabsTrigger>
              ))}
            </TabsList>
            {(Object.keys(MEAL_LABEL) as MealKey[]).map((k) => (
              <TabsContent key={k} value={k} className="mt-4 space-y-4">
                <MealList entries={entries.filter((e) => e.meal === k)} onRemove={removeEntry} />
                <FoodPicker onAdd={(f, s) => addEntry(k, f, s)} />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Right column */}
        <aside className="space-y-4">
          {/* Water */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Water</h3>
              <span className="text-xs text-muted-foreground">{water} / {t.waterL} L</span>
            </div>
            <div className="mt-3 grid grid-cols-8 gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => {
                const filled = water >= (i + 1) * (t.waterL / 8);
                return (
                  <button
                    key={i}
                    onClick={() => setWater((i + 1) * (t.waterL / 8))}
                    className={cn(
                      "h-8 rounded-md border transition-colors",
                      filled ? "border-sky-400/60 bg-sky-400/30" : "border-border bg-secondary/30 hover:bg-secondary/60",
                    )}
                    aria-label={`Set ${i + 1} of 8 glasses`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setWater(water - 0.25)} aria-label="Subtract 250 ml">
                <Minus className="h-4 w-4" />
              </Button>
              <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Droplet className="h-4 w-4 text-sky-400" /> 250 ml
              </div>
              <Button variant="hero" size="icon" onClick={() => setWater(water + 0.25)} aria-label="Add 250 ml">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Macro split */}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
            <h3 className="font-bold">Macro Split</h3>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-28 w-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={macros.filter((m) => m.value > 0)} dataKey="value" innerRadius={36} outerRadius={54} stroke="none">
                      {macros.map((m) => <Cell key={m.name} fill={m.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-1 text-sm">
                {macros.map((m) => (
                  <li key={m.name} className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                      {m.name}
                    </span>
                    <span className="font-semibold">
                      {totalMacroCal ? Math.round((m.value / totalMacroCal) * 100) : 0}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Weekly */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Last 7 Days</h3>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Calories vs Protein</span>
        </div>
        <div className="mt-3 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly}>
              <CartesianGrid stroke="oklch(0.3 0.02 250 / 0.3)" vertical={false} />
              <XAxis dataKey="day" stroke="oklch(0.66 0.02 250)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.66 0.02 250)" fontSize={10} tickLine={false} axisLine={false} width={32} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.025 250)", border: "1px solid oklch(0.3 0.02 250)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="calories" fill="oklch(0.83 0.22 145)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="protein" fill="oklch(0.7 0.18 290)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function MacroCard({
  icon: Icon, color, label, value, goal, unit,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: "amber" | "primary" | "violet" | "sky";
  label: string; value: number; goal: number; unit: string;
}) {
  const pct = Math.min(100, goal > 0 ? Math.round((value / goal) * 100) : 0);
  const dotMap = {
    amber: "from-amber-400/30 to-amber-500/10 text-amber-300",
    primary: "from-primary/30 to-primary/5 text-primary",
    violet: "from-violet-500/30 to-violet-500/5 text-violet-300",
    sky: "from-sky-400/30 to-sky-500/5 text-sky-300",
  } as const;
  const bar = {
    amber: "bg-amber-400", primary: "bg-primary",
    violet: "bg-violet-400", sky: "bg-sky-400",
  } as const;
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <div className="flex items-center gap-3">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br", dotMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="text-lg font-bold">
            {value}<span className="ml-1 text-xs text-muted-foreground">/ {goal} {unit}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary/60">
        <div className={cn("h-full rounded-full transition-all", bar[color])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MealList({ entries, onRemove }: { entries: MealEntry[]; onRemove: (id: string) => void }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
        No items yet — pick from below.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {entries.map((e) => (
        <li key={e.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 p-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{e.name}</div>
            <div className="text-[11px] text-muted-foreground">
              {e.servings}× &middot; {e.cal} kcal &middot; P {e.p}g &middot; C {e.c}g &middot; F {e.f}g
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onRemove(e.id)} aria-label="Remove">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

function FoodPicker({ onAdd }: { onAdd: (food: Food, servings: number) => void }) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Food | null>(null);
  const [servings, setServings] = useState("1");
  const [custom, setCustom] = useState({ name: "", cal: "", p: "", c: "", f: "" });

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return FOODS.slice(0, 8);
    return FOODS.filter((f) => f.name.toLowerCase().includes(s)).slice(0, 8);
  }, [q]);

  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3">
      <Tabs defaultValue="search">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-3 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); setPicked(null); }}
              placeholder="Search foods..." className="pl-9" />
          </div>
          {!picked ? (
            <ul className="max-h-56 space-y-1 overflow-y-auto">
              {matches.length === 0 && (
                <li className="rounded-md px-3 py-2 text-sm text-muted-foreground">No matches</li>
              )}
              {matches.map((f) => (
                <li key={f.name}>
                  <button
                    type="button"
                    onClick={() => setPicked(f)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-secondary/60"
                  >
                    <span className="truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{f.cal} kcal &middot; {f.unit}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3 rounded-lg bg-secondary/40 p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{picked.name}</div>
                  <div className="text-[11px] text-muted-foreground">{picked.unit} &middot; {picked.cal} kcal</div>
                </div>
                <button type="button" onClick={() => setPicked(null)} className="text-xs text-muted-foreground underline">
                  Change
                </button>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_auto_auto]">
                <div>
                  <Label className="text-xs">Servings</Label>
                  <Input type="number" inputMode="decimal" step="0.25" min="0.25"
                    value={servings} onChange={(e) => setServings(e.target.value)} />
                </div>
                <div className="hidden self-end text-xs text-muted-foreground sm:block">
                  = {Math.round(picked.cal * Number(servings || 0))} kcal
                </div>
                <Button
                  variant="hero" className="self-end"
                  onClick={() => {
                    const s = Number(servings);
                    if (!s || s <= 0) return toast.error("Servings must be > 0");
                    onAdd(picked, s);
                    setPicked(null); setServings("1"); setQ("");
                  }}
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="mt-3 space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs">Name</Label>
              <Input value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} placeholder="Homemade dal" />
            </div>
            <div><Label className="text-xs">Calories</Label>
              <Input type="number" value={custom.cal} onChange={(e) => setCustom({ ...custom, cal: e.target.value })} /></div>
            <div><Label className="text-xs">Protein (g)</Label>
              <Input type="number" value={custom.p} onChange={(e) => setCustom({ ...custom, p: e.target.value })} /></div>
            <div><Label className="text-xs">Carbs (g)</Label>
              <Input type="number" value={custom.c} onChange={(e) => setCustom({ ...custom, c: e.target.value })} /></div>
            <div><Label className="text-xs">Fats (g)</Label>
              <Input type="number" value={custom.f} onChange={(e) => setCustom({ ...custom, f: e.target.value })} /></div>
          </div>
          <Button
            variant="hero" className="w-full"
            onClick={() => {
              if (!custom.name.trim()) return toast.error("Add a name");
              const cal = Number(custom.cal); if (!cal) return toast.error("Calories required");
              onAdd({
                name: custom.name.trim(), unit: "1 serving",
                cal, p: Number(custom.p) || 0, c: Number(custom.c) || 0, f: Number(custom.f) || 0,
              }, 1);
              setCustom({ name: "", cal: "", p: "", c: "", f: "" });
            }}
          >
            <Plus className="h-4 w-4" /> Add custom food
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
