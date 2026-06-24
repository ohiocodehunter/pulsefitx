import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({ meta: [{ title: "Activity - PulsefitX" }] }),
  component: () => (
    <ComingSoon icon={Activity} title="Activity & Workouts"
      desc="Steps, workouts, distance and active time. Log steps from the Dashboard for now." />
  ),
});
