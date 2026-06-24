import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { useAuth } from "@/lib/auth-context";
import { getRecentLogs, type DailyLog } from "@/lib/firestore-data";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports - PulsefitX" }] }),
  component: Reports,
});

function Reports() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  useEffect(() => { if (user) getRecentLogs(user.uid, 30).then(setLogs); }, [user]);
  const data = logs.map((l) => ({ day: l.date.slice(5), calories: l.calories, steps: l.steps, water: l.water }));
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black sm:text-3xl">Reports</h1>
      <Chart title="Calories — last 30 days">
        <LineChart data={data}>
          <XAxis dataKey="day" stroke="oklch(0.66 0.02 250)" fontSize={10} />
          <YAxis stroke="oklch(0.66 0.02 250)" fontSize={10} />
          <Tooltip contentStyle={{ background: "oklch(0.21 0.025 250)", border: "1px solid oklch(0.3 0.02 250)", borderRadius: 8 }} />
          <Line type="monotone" dataKey="calories" stroke="oklch(0.83 0.22 145)" strokeWidth={2} dot={false} />
        </LineChart>
      </Chart>
      <Chart title="Steps — last 30 days">
        <BarChart data={data}>
          <XAxis dataKey="day" stroke="oklch(0.66 0.02 250)" fontSize={10} />
          <YAxis stroke="oklch(0.66 0.02 250)" fontSize={10} />
          <Tooltip contentStyle={{ background: "oklch(0.21 0.025 250)", border: "1px solid oklch(0.3 0.02 250)", borderRadius: 8 }} />
          <Bar dataKey="steps" fill="oklch(0.7 0.18 290)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </Chart>
    </div>
  );
}

function Chart({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
      <h3 className="font-bold">{title}</h3>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}
