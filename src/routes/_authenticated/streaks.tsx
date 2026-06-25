import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { computeStreak, getRecentLogs, type DailyLog } from "@/lib/firestore-data";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/streaks")({
  head: () => ({ meta: [{ title: "Streaks - PulsefitX" }] }),
  component: Streaks,
});

function Streaks() {
  const { user } = useAuth();
  const { t: tr } = useT();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  useEffect(() => { if (user) getRecentLogs(user.uid, 60).then(setLogs); }, [user]);
  const streak = computeStreak(logs);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-black sm:text-3xl">{tr("streaks.title")}</h1>
      <div className="rounded-3xl border border-border/60 bg-card/70 p-8 text-center">
        <Flame className="mx-auto h-12 w-12 text-amber-400" />
        <div className="mt-3 text-6xl font-black tracking-tight">{streak}</div>
        <div className="text-sm text-muted-foreground">{tr("streaks.days")}</div>
        <p className="mx-auto mt-6 max-w-sm text-sm text-muted-foreground">{tr("streaks.keep")}</p>
      </div>
    </div>
  );
}
