import { UserPlus, Sparkles, TrendingUp } from "lucide-react";
import { useT } from "@/lib/i18n";

export function HowItWorks() {
  const { t } = useT();
  const steps = [
    { icon: UserPlus, key: "s1" },
    { icon: Sparkles, key: "s2" },
    { icon: TrendingUp, key: "s3" },
  ];
  return (
    <section id="how" className="container mx-auto px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{t("how.eyebrow")}</span>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{t("how.title")}</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.key} className="relative rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur">
            <div className="absolute -top-3 left-6 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground shadow-[0_0_20px_oklch(0.83_0.22_145/0.5)]">{i + 1}</div>
            <div className="mt-2 grid h-12 w-12 place-items-center rounded-xl bg-primary/10">
              <s.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-bold">{t(`how.${s.key}.title`)}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{t(`how.${s.key}.desc`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}