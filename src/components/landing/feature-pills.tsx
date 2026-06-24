import { Utensils, Activity, BarChart3, Globe2 } from "lucide-react";

const pills = [
  { icon: Utensils, label: "AI Meal Plans", sub: "Personalized for you", color: "text-violet-300", bg: "bg-violet-500/15" },
  { icon: Activity, label: "Real-time Tracking", sub: "Steps, calories & more", color: "text-primary", bg: "bg-primary/15" },
  { icon: BarChart3, label: "Smart Analytics", sub: "Track progress easily", color: "text-amber-300", bg: "bg-amber-500/15" },
  { icon: Globe2, label: "Works Anywhere", sub: "Hostel, Home, Office", color: "text-sky-300", bg: "bg-sky-500/15" },
];

export function FeaturePills() {
  return (
    <div className="container mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur md:grid-cols-4">
        {pills.map(({ icon: Icon, label, sub, color, bg }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl p-2">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{label}</div>
              <div className="truncate text-xs text-muted-foreground">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}