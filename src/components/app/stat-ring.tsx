import { motion } from "framer-motion";
import type { ComponentType } from "react";

export function StatRing({
  label, value, goal, unit, icon: Icon, color = "primary",
}: {
  label: string;
  value: number;
  goal: number;
  unit: string;
  icon: ComponentType<{ className?: string }>;
  color?: "primary" | "violet" | "sky" | "amber";
}) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  const colors: Record<string, string> = {
    primary: "oklch(0.83 0.22 145)",
    violet: "oklch(0.7 0.18 290)",
    sky: "oklch(0.78 0.17 220)",
    amber: "oklch(0.82 0.17 80)",
  };
  const stroke = colors[color];
  const c = 2 * Math.PI * 26;
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" /> {label}
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground">{pct}%</span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <div className="text-xl font-bold leading-none">{value.toLocaleString()}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">/ {goal.toLocaleString()} {unit}</div>
        </div>
        <svg viewBox="0 0 60 60" className="h-14 w-14 -rotate-90">
          <circle cx="30" cy="30" r="26" fill="none" stroke="oklch(0.3 0.02 250)" strokeWidth="6" />
          <motion.circle
            cx="30" cy="30" r="26" fill="none" stroke={stroke} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (c * pct) / 100 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </svg>
      </div>
    </div>
  );
}