import { Smartphone, Download, ShieldCheck, Zap } from "lucide-react";
import { useT } from "@/lib/i18n";

export function AndroidApp() {
  const { t } = useT();
  return (
    <section id="android" className="container mx-auto px-4 py-16 sm:px-6 sm:py-20">
      <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-6 sm:p-10">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Smartphone className="h-3.5 w-3.5" /> {t("android.badge")}
            </div>
            <h3 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              {t("android.title")}
            </h3>
            <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
              {t("android.subtitle")}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> {t("android.b1")}</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> {t("android.b2")}</li>
              <li className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" /> {t("android.b3")}</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://github.com/ohiocodehunter/PulseFitX/releases"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
              >
                <Download className="h-4 w-4" /> {t("android.download")}
              </a>
              <span className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
                {t("android.requirements")}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{t("android.note")}</p>
          </div>

          <div className="relative mx-auto flex w-full max-w-xs items-center justify-center">
            <div className="absolute inset-0 -z-10 rounded-[3rem] bg-primary/20 blur-3xl" />
            <div className="relative h-[460px] w-[230px] rounded-[2.5rem] border-[10px] border-foreground/80 bg-background shadow-2xl">
              <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-foreground/80" />
              <div className="h-full w-full overflow-hidden rounded-[1.9rem] bg-gradient-to-b from-primary/30 via-background to-violet-500/20 p-4">
                <div className="mt-8 text-center text-xs font-medium text-muted-foreground">PulsefitX</div>
                <div className="mt-1 text-center text-2xl font-black text-foreground">12,480</div>
                <div className="text-center text-[11px] text-muted-foreground">{t("android.steps")}</div>
                <div className="mx-auto mt-6 h-32 w-32 rounded-full border-[10px] border-primary/40 border-t-primary" />
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground">
                  <div className="rounded-lg bg-card/60 p-2"><div className="text-sm font-bold text-foreground">1,820</div>kcal</div>
                  <div className="rounded-lg bg-card/60 p-2"><div className="text-sm font-bold text-foreground">128g</div>protein</div>
                  <div className="rounded-lg bg-card/60 p-2"><div className="text-sm font-bold text-foreground">7h</div>sleep</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
