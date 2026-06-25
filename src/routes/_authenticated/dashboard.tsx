import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Flame, Footprints, Droplet, Beef, Bot, Sparkles, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatRing } from "@/components/app/stat-ring";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { getLog, getRecentLogs, todayKey, upsertLog, type DailyLog } from "@/lib/firestore-data";
import { generateCoachInsight } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - PulsefitX" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const date = todayKey();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [week, setWeek] = useState<DailyLog[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLog(await getLog(user.uid, date));
      setWeek(await getRecentLogs(user.uid, 7));
    })();
  }, [user, date]);

  const t = profile.targets;
  const c = log?.calories ?? 0;
  const p = log?.protein ?? 0;
  const s = log?.steps ?? 0;
  const w = log?.water ?? 0;

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const requestInsight = async () => {
    setInsightLoading(true);
    try {
      const r = await generateCoachInsight({ data: {
        calorieGoal: t.calories, proteinGoal: t.proteinG, stepGoal: t.stepGoal, waterGoal: t.waterL,
        todayCalories: c, todayProtein: p, todaySteps: s, todayWater: w, goal: profile.goal,
      }});
      setInsight(r.insight);
    } catch (e) { toast.error((e as Error).message); }
    finally { setInsightLoading(false); }
  };

  const macros = useMemo(() => {
    const carbs = log?.carbs ?? 0; const fats = log?.fats ?? 0;
    const totalCal = carbs * 4 + p * 4 + fats * 9;
    return [
      { name: "Carbs", value: carbs * 4, color: "oklch(0.7 0.18 290)" },
      { name: "Protein", value: p * 4, color: "oklch(0.83 0.22 145)" },
      { name: "Fats", value: fats * 9, color: "oklch(0.82 0.17 80)" },
    ].map(m => ({ ...m, pct: totalCal > 0 ? Math.round((m.value / totalCal) * 100) : 0 }));
  }, [log, p]);

  const weeklyData = week.map((d) => ({
    day: d.date.slice(5),
    calories: d.calories,
    steps: d.steps,
  }));

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-black tracking-tight sm:text-3xl">
            {greet}, {profile.name.split(" ")[0] || "there"}!
          </h1>
          <p className="text-xs text-muted-foreground sm:text-sm">Let's make today healthier than yesterday.</p>
        </div>
        <Button variant="hero" size="sm" onClick={() => navigate({ to: "/coach" })} className="shrink-0">
          <Bot className="h-4 w-4" /> AI Coach
        </Button>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatRing label="Calories" value={c} goal={t.calories} unit="kcal" icon={Flame} color="amber" />
        <StatRing label="Steps" value={s} goal={t.stepGoal} unit="steps" icon={Footprints} color="primary" />
        <StatRing label="Water" value={w} goal={t.waterL} unit="L" icon={Droplet} color="sky" />
        <StatRing label="Protein" value={p} goal={t.proteinG} unit="g" icon={Beef} color="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Today's plan */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/60 bg-card/70 p-5 backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Today's Plan</h3>
            <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">AI Generated</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Based on your goal: <span className="text-primary font-semibold">{labelGoal(profile.goal)}</span></p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PlanItem label="Calories Goal" value={`${t.calories}`} unit="kcal" />
            <PlanItem label="Protein Goal" value={`${t.proteinG}`} unit="g" />
            <PlanItem label="Step Goal" value={`${t.stepGoal.toLocaleString()}`} unit="steps" />
            <PlanItem label="Water Goal" value={`${t.waterL}`} unit="L" />
          </div>
        </motion.section>

        {/* Coach suggestion */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-violet-500/10 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <Sparkles className="h-4 w-4" /> AI Coach Suggestion
          </div>
          <p className="mt-3 min-h-[60px] text-sm leading-relaxed">
            {insight || "Tap the button for a personalized recommendation based on your day so far."}
          </p>
          <Button onClick={requestInsight} variant="hero" size="sm" className="mt-3" disabled={insightLoading}>
            {insightLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {insight ? "Get another tip" : "Get recommendation"}
          </Button>
        </motion.section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick log */}
        <QuickLog
          onLog={async (patch) => {
            if (!user) return;
            const merged = { ...(log ?? { date, calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, steps: 0, sleepHours: 0, meals: [] }), ...patch };
            await upsertLog(user.uid, date, merged);
            setLog(merged);
            toast.success("Logged!");
          }}
        />

        {/* Calories breakdown */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h3 className="font-bold">Calories Breakdown</h3>
          <div className="mt-3 flex items-center gap-4">
            <div className="h-32 w-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={macros.filter(m => m.value > 0)} dataKey="value" innerRadius={40} outerRadius={60} stroke="none">
                    {macros.map((m) => <Cell key={m.name} fill={m.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5 text-sm">
              {macros.map((m) => (
                <div key={m.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: m.color }} />{m.name}</div>
                  <span className="font-semibold">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="rounded-2xl border border-border/60 bg-card/70 p-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Weekly Progress</h3>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">7 days</span>
          </div>
          <div className="mt-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <XAxis dataKey="day" stroke="oklch(0.66 0.02 250)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.66 0.02 250)" fontSize={10} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 250)", border: "1px solid oklch(0.3 0.02 250)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="calories" stroke="oklch(0.83 0.22 145)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="steps" stroke="oklch(0.7 0.18 290)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanItem({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}<span className="ml-1 text-[10px] font-medium text-muted-foreground">{unit}</span></div>
    </div>
  );
}

function labelGoal(g: string) {
  return ({ lose: "Weight Loss", maintain: "Maintenance", gain: "Weight Gain", muscle: "Muscle Gain" } as Record<string, string>)[g] ?? g;
}

function QuickLog({ onLog }: { onLog: (p: Partial<DailyLog>) => Promise<void> }) {
  const [cal, setCal] = useState(""); const [prot, setProt] = useState("");
  const [steps, setSteps] = useState(""); const [water, setWater] = useState("");
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
      <h3 className="font-bold">Quick Log</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">Add to today's totals</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <LogField label="Calories" value={cal} onChange={setCal} unit="kcal" />
        <LogField label="Protein" value={prot} onChange={setProt} unit="g" />
        <LogField label="Steps" value={steps} onChange={setSteps} unit="steps" />
        <LogField label="Water" value={water} onChange={setWater} unit="L" step="0.25" />
      </div>
      <Button
        variant="hero" size="sm" className="mt-4 w-full"
        onClick={async () => {
          const patch: Partial<DailyLog> = {};
          if (cal) patch.calories = Number(cal);
          if (prot) patch.protein = Number(prot);
          if (steps) patch.steps = Number(steps);
          if (water) patch.water = Number(water);
          if (Object.keys(patch).length === 0) return toast.error("Enter at least one value");
          await onLog(patch);
          setCal(""); setProt(""); setSteps(""); setWater("");
        }}>
        <Plus className="h-4 w-4" /> Log
      </Button>
    </div>
  );
}

function LogField({ label, value, onChange, unit, step }: { label: string; value: string; onChange: (v: string) => void; unit: string; step?: string }) {
  return (
    <label className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="relative">
        <Input type="number" inputMode="decimal" step={step ?? "1"} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder="0" className="pr-10" />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </label>
  );
}