import { Apple, Footprints, LineChart, Bot, ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";

export function FeatureCards() {
  const { t } = useT();
  const cards = [
    { icon: Apple, key: "nutrition", color: "text-rose-300", bg: "bg-rose-500/15" },
    { icon: Footprints, key: "activity", color: "text-primary", bg: "bg-primary/15" },
    { icon: LineChart, key: "progress", color: "text-amber-300", bg: "bg-amber-500/15" },
    { icon: Bot, key: "coach", color: "text-violet-300", bg: "bg-violet-500/15" },
  ];
  return (
    <section id="features" className="container mx-auto px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{t("features.eyebrow")}</span>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{t("features.title")}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{t("features.subtitle")}</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ icon: Icon, key, color, bg }) => (
          <div key={key} className="group rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_0_30px_-10px_oklch(0.83_0.22_145/0.4)]">
            <div className={`grid h-11 w-11 place-items-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <h3 className="mt-4 text-base font-bold">{t(`features.${key}.title`)}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t(`features.${key}.desc`)}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-80 transition-opacity group-hover:opacity-100">
              {t("features.learnMore")} <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}