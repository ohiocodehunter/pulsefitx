import { Apple, Footprints, LineChart, Bot, ArrowRight } from "lucide-react";

const cards = [
  { icon: Apple, title: "AI Nutrition Plans", desc: "Personalized meal plans based on your goal, lifestyle and available foods.", color: "text-rose-300", bg: "bg-rose-500/15" },
  { icon: Footprints, title: "Activity Tracking", desc: "Track steps, workouts, calories, water intake and sleep in real-time.", color: "text-primary", bg: "bg-primary/15" },
  { icon: LineChart, title: "Progress Analytics", desc: "Beautiful charts and insights to help you understand your progress.", color: "text-amber-300", bg: "bg-amber-500/15" },
  { icon: Bot, title: "AI Coach", desc: "Get smart recommendations and daily motivation from your AI coach.", color: "text-violet-300", bg: "bg-violet-500/15" },
];

export function FeatureCards() {
  return (
    <section id="features" className="container mx-auto px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Everything You Need</span>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">All-in-One Fitness Solution</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          PulsefitX combines AI technology with proven fitness science to deliver personalized guidance that actually works.
        </p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="group rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_30px_-10px_oklch(0.83_0.22_145/0.4)]">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <h3 className="mt-4 text-base font-bold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-80 transition-opacity group-hover:opacity-100">
              Learn more <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}