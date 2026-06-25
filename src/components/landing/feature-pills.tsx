import { Utensils, Activity, BarChart3, Globe2 } from "lucide-react";
import { useT } from "@/lib/i18n";

export function FeaturePills() {
  const { t } = useT();
  const pills = [
    { icon: Utensils, key: "meal", color: "text-violet-300", bg: "bg-violet-500/15" },
    { icon: Activity, key: "tracking", color: "text-primary", bg: "bg-primary/15" },
    { icon: BarChart3, key: "analytics", color: "text-amber-300", bg: "bg-amber-500/15" },
    { icon: Globe2, key: "anywhere", color: "text-sky-300", bg: "bg-sky-500/15" },
  ];
  return (
    <div className="container mx-auto px-4 sm:px-6">
      <div className="relative z-10 -mt-10 grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur md:mt-0 md:grid-cols-4">
        {pills.map(({ icon: Icon, key, color, bg }) => (
          <div key={key} className="flex items-center gap-3 rounded-xl p-2">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{t(`pills.${key}.label`)}</div>
              <div className="truncate text-xs text-muted-foreground">{t(`pills.${key}.sub`)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}