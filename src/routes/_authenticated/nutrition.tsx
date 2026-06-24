import { createFileRoute } from "@tanstack/react-router";
import { Apple } from "lucide-react";
import { ComingSoon } from "@/components/app/coming-soon";

export const Route = createFileRoute("/_authenticated/nutrition")({
  head: () => ({ meta: [{ title: "Nutrition - PulsefitX" }] }),
  component: () => (
    <ComingSoon icon={Apple} title="Nutrition Tracker"
      desc="Detailed macro and micronutrient tracking. For now, use Quick Log on your Dashboard." />
  ),
});
