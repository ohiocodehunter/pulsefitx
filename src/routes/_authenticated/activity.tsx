import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity as ActivityIcon, Footprints, Flame, Timer, MapPin, Heart, Moon, Zap, Plus, Trash2, Dumbbell, Bike, PersonStanding, Waves,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatRing } from "@/components/app/stat-ring";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import {
  getLog, getRecentLogs, todayKey, upsertLog, recoveryScore,
  type DailyLog, type Workout,
} from "@/lib/firestore-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/activity")({
  ssr: false,
  head: () => ({ meta: [{ title: "Activity - PulsefitX" }] }),
  component: ActivityPage,
});

const WORKOUT_TYPES = [
  { v: "Running", icon: Footprints, mets: 9.8 },
  { v: "Walking", icon: PersonStanding, mets: 3.5 },
  { v: "Cycling", icon: Bike, mets: 7.5 },
  { v: "Strength", icon: Dumbbell, mets: 6 },
  { v: "HIIT", icon: Zap, mets: 10 },
  { v: "Yoga", icon: PersonStanding, mets: 3 },
  { v: "Swimming", icon: Waves, mets: 8 },
];

function estimateCalories(type: string, durationMin: number, weightKg: number) {
  const def = WORKOUT_TYPES.find((w) => w.v === type)?.mets ?? 5;
  return Math.round((def * 3.5 * weightKg / 200) * durationMin);
}

function ActivityPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { t: tr } = useT();
  const date = todayKey();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [week, setWeek] = useState<DailyLog[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLog(await getLog(user.uid, date));
      setWeek(await getRecentLogs(user.uid, 7));
    })();
  }, [user, date]);

  const stepGoal = profile.targets.stepGoal;
  const steps = log?.steps ?? 0;
  const distance = log?.distanceKm ?? Number(((steps * 0.000762)).toFixed(2));
  const activeMin = log?.activeMinutes ?? (log?.workouts?.reduce((s, w) => s + w.durationMin, 0) ?? 0);
  const burned = (log?.workouts?.reduce((s, w) => s + w.calories, 0) ?? 0)
    + Math.round(steps * 0.04);
  const recovery = recoveryScore(log);

  const persist = async (patch: Partial<DailyLog>) => {
    if (!user) return;
    const base: DailyLog = log ?? { date, calories: 0, protein: 0, carbs: 0, fats: 0, water: 0, steps: 0, sleepHours: 0, meals: [] };
    const merged = { ...base, ...patch };
    await upsertLog(user.uid, date, merged);
    setLog(merged);
  };

  const addWorkout = async (w: Workout) => {
    const next = [...(log?.workouts ?? []), w];
    await persist({ workouts: next, activeMinutes: next.reduce((s, x) => s + x.durationMin, 0) });
    toast.success(`${tr("workout." + w.type)} ${tr("activity.added")}`);
  };

  const removeWorkout = async (id: string) => {
    const next = (log?.workouts ?? []).filter((w) => w.id !== id);
    await persist({ workouts: next, activeMinutes: next.reduce((s, x) => s + x.durationMin, 0) });
  };

  const weeklyData = useMemo(() => week.map((d) => ({
    day: d.date.slice(5),
    steps: d.steps ?? 0,
    active: d.activeMinutes ?? (d.workouts?.reduce((s, w) => s + w.durationMin, 0) ?? 0),
    sleep: d.sleepHours ?? 0,
  })), [week]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">{tr("activity.title")}</h1>
          <p className="text-sm text-muted-foreground">{tr("activity.subtitle")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="h-4 w-4" /> {tr("activity.logWorkout")}</Button>
          </DialogTrigger>
          <WorkoutDialog
            weightKg={profile.weightKg}
            onClose={() => setOpen(false)}
            onAdd={async (w) => { await addWorkout(w); setOpen(false); }}
          />
        </Dialog>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatRing label={tr("stat.steps")} value={steps} goal={stepGoal} unit="" icon={Footprints} color="primary" />
        <StatRing label={tr("activity.active")} value={activeMin} goal={60} unit="min" icon={Timer} color="violet" />
        <StatRing label={tr("activity.burned")} value={burned} goal={500} unit="kcal" icon={Flame} color="amber" />
        <StatRing label={tr("activity.distance")} value={Math.round(distance * 10) / 10} goal={5} unit="km" icon={MapPin} color="sky" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick logger */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h3 className="font-bold">{tr("activity.quickLog")}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{tr("activity.updateTotals")}</p>
          <QuickLogger
            log={log}
            tr={tr}
            onSave={async (p) => {
              const merged: Partial<DailyLog> = {};
              // Cumulative: add to today's totals.
              if (typeof p.steps === "number") merged.steps = (log?.steps ?? 0) + p.steps;
              if (typeof p.distanceKm === "number")
                merged.distanceKm = Math.round(((log?.distanceKm ?? 0) + p.distanceKm) * 100) / 100;
              // Snapshot readings: latest value wins.
              if (typeof p.sleepHours === "number") merged.sleepHours = p.sleepHours;
              if (typeof p.restingHr === "number") merged.restingHr = p.restingHr;
              await persist(merged);
              toast.success(tr("activity.saved"));
            }}
          />
        </motion.section>

        {/* Recovery */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-violet-500/10 p-5">
          <div className="flex items-center gap-2 text-sm font-bold text-primary"><Heart className="h-4 w-4" /> {tr("activity.recovery")}</div>
          <div className="mt-3 flex items-end gap-3">
            <div className="text-5xl font-black tracking-tight">{recovery}</div>
            <div className="pb-2 text-xs text-muted-foreground">/ 100</div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all"
              style={{ width: `${recovery}%` }} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {recovery >= 75 ? tr("activity.recoveryGood")
              : recovery >= 50 ? tr("activity.recoveryOk")
              : recovery >= 25 ? tr("activity.recoveryLow")
              : tr("activity.recoveryNone")}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
            <Mini label={tr("activity.sleep")} value={`${log?.sleepHours ?? 0}h`} icon={Moon} />
            <Mini label={tr("activity.rhr")} value={log?.restingHr ? `${log.restingHr}` : "—"} icon={Heart} />
            <Mini label={tr("activity.energy")} value={log?.energy ? `${log.energy}/5` : "—"} icon={Zap} />
          </div>
        </motion.section>

        {/* Weekly chart */}
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{tr("activity.weekly")}</h3>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{tr("dash.sevenDays")}</span>
          </div>
          <div className="mt-3 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="oklch(0.66 0.02 250)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.66 0.02 250)" fontSize={10} tickLine={false} axisLine={false} width={28} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 250)", border: "1px solid oklch(0.3 0.02 250)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="active" fill="oklch(0.83 0.22 145)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="stepFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.18 290)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 290)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area dataKey="steps" stroke="oklch(0.7 0.18 290)" fill="url(#stepFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      {/* Workout list */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{tr("activity.todaysWorkouts")}</h3>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {(log?.workouts?.length ?? 0)} {tr("activity.sessions")}
          </span>
        </div>
        {(log?.workouts?.length ?? 0) === 0 ? (
          <div className="mt-6 grid place-items-center gap-2 py-8 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15">
              <ActivityIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{tr("activity.noWorkouts")}</p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {log!.workouts!.map((w) => {
              const Icon = WORKOUT_TYPES.find((t) => t.v === w.type)?.icon ?? Dumbbell;
              return (
                <li key={w.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary/60">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {tr("workout." + w.type)}
                      {w.intensity && (
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          w.intensity === "high" ? "bg-rose-500/15 text-rose-300"
                            : w.intensity === "moderate" ? "bg-amber-500/15 text-amber-300"
                            : "bg-emerald-500/15 text-emerald-300",
                        )}>{tr("intensity." + w.intensity)}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {w.durationMin} min · {w.calories} kcal
                      {w.distanceKm ? ` · ${w.distanceKm} km` : ""}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeWorkout(w.id)} title="Remove">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Mini({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-xl bg-background/40 p-2">
      <div className="flex items-center justify-center gap-1 text-muted-foreground"><Icon className="h-3 w-3" />{label}</div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

function QuickLogger({ log, onSave, tr }: { log: DailyLog | null; onSave: (p: Partial<DailyLog>) => Promise<void>; tr: (k: string) => string }) {
  const [steps, setSteps] = useState("");
  const [sleep, setSleep] = useState("");
  const [rhr, setRhr] = useState("");
  const [distance, setDistance] = useState("");
  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label={tr("activity.steps")} unit="" value={steps} onChange={setSteps} placeholder={String(log?.steps ?? 0)} />
        <Field label={tr("activity.distanceField")} unit="km" value={distance} onChange={setDistance} placeholder={String(log?.distanceKm ?? 0)} step="0.1" />
        <Field label={tr("activity.sleepField")} unit="h" value={sleep} onChange={setSleep} placeholder={String(log?.sleepHours ?? 0)} step="0.5" />
        <Field label={tr("activity.restingHr")} unit="bpm" value={rhr} onChange={setRhr} placeholder={String(log?.restingHr ?? 0)} />
      </div>
      <Button variant="hero" size="sm" className="w-full" onClick={async () => {
        const patch: Partial<DailyLog> = {};
        if (steps) patch.steps = Number(steps);
        if (distance) patch.distanceKm = Number(distance);
        if (sleep) patch.sleepHours = Number(sleep);
        if (rhr) patch.restingHr = Number(rhr);
        if (Object.keys(patch).length === 0) return toast.error(tr("dash.enterValue"));
        await onSave(patch);
        setSteps(""); setSleep(""); setRhr(""); setDistance("");
      }}>{tr("activity.save")}</Button>
    </div>
  );
}

function Field({ label, value, onChange, unit, placeholder, step }: { label: string; value: string; onChange: (v: string) => void; unit: string; placeholder?: string; step?: string }) {
  return (
    <label className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="relative">
        <Input type="number" inputMode="decimal" step={step ?? "1"} value={value}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "0"} className="pr-10" />
        {unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{unit}</span>}
      </div>
    </label>
  );
}

function WorkoutDialog({ weightKg, onAdd, onClose }: { weightKg: number; onAdd: (w: Workout) => Promise<void>; onClose: () => void }) {
  const { t: tr } = useT();
  const [type, setType] = useState("Running");
  const [duration, setDuration] = useState("30");
  const [intensity, setIntensity] = useState<"low" | "moderate" | "high">("moderate");
  const [distance, setDistance] = useState("");
  const cal = estimateCalories(type, Number(duration || 0), weightKg);
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>{tr("activity.dialog.title")}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div>
          <Label className="text-xs">{tr("activity.dialog.type")}</Label>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {WORKOUT_TYPES.map((w) => {
              const Icon = w.icon;
              const active = type === w.v;
              return (
                <button key={w.v} type="button" onClick={() => setType(w.v)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-2 text-[10px] transition",
                    active ? "border-primary bg-primary/10 text-primary" : "border-border/60 hover:bg-secondary/50",
                  )}>
                  <Icon className="h-4 w-4" />{tr("workout." + w.v)}
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{tr("activity.dialog.duration")}</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">{tr("activity.dialog.intensity")}</Label>
            <Select value={intensity} onValueChange={(v) => setIntensity(v as typeof intensity)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{tr("intensity.low")}</SelectItem>
                <SelectItem value="moderate">{tr("intensity.moderate")}</SelectItem>
                <SelectItem value="high">{tr("intensity.high")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(type === "Running" || type === "Walking" || type === "Cycling") && (
            <div className="col-span-2">
              <Label className="text-xs">{tr("activity.dialog.distance")}</Label>
              <Input type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} />
            </div>
          )}
        </div>
        <div className="rounded-xl bg-secondary/50 p-3 text-xs">
          {tr("activity.dialog.estBurn")} <span className="font-bold text-primary">{cal} kcal</span>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>{tr("activity.dialog.cancel")}</Button>
        <Button variant="hero" onClick={() => {
          const d = Number(duration);
          if (!d || d <= 0) return toast.error(tr("activity.dialog.durErr"));
          onAdd({
            id: crypto.randomUUID(),
            type, durationMin: d, calories: cal,
            distanceKm: distance ? Number(distance) : undefined,
            intensity,
          });
        }}>{tr("activity.dialog.add")}</Button>
      </DialogFooter>
    </DialogContent>
  );
}