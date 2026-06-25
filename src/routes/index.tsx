import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { Hero } from "@/components/landing/hero";
import { FeaturePills } from "@/components/landing/feature-pills";
import { FeatureCards } from "@/components/landing/feature-cards";
import { CtaStrip } from "@/components/landing/cta-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsBand } from "@/components/landing/stats-band";
import { Testimonials } from "@/components/landing/testimonials";
import { Faq } from "@/components/landing/faq";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PulsefitX — AI Fitness Coach" },
      { name: "description", content: "Your AI fitness coach that builds personalized plans, tracks progress and helps you live better." },
      { property: "og:title", content: "PulsefitX — AI Fitness Coach" },
      { property: "og:description", content: "Personalized nutrition, activity tracking and an AI coach in one beautiful app." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <FeaturePills />
        <StatsBand />
        <FeatureCards />
        <HowItWorks />
        <Testimonials />
        <Faq />
        <CtaStrip />
      </main>
      <SiteFooter />
    </div>
  );
}
