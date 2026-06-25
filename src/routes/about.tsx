import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { ArrowRight, Linkedin, ShieldCheck, Heart, Globe2, Github } from "lucide-react";
import founderImg from "@/assets/team/profile-photo.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PulsefitX" },
      { name: "description", content: "PulsefitX is an AI-powered fitness coach built by an indie developer for people who want an honest, private, free way to train and eat better." },
      { property: "og:title", content: "About PulsefitX" },
      { property: "og:description", content: "Meet the team behind PulsefitX — built for real lifestyles in Tokyo, Lagos, Madrid and beyond." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { t } = useT();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-16 sm:px-6">
        <section className="mx-auto max-w-3xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">{t("about.eyebrow")}</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t("about.title")}</h1>
          <p className="mt-5 text-base text-muted-foreground sm:text-lg">{t("about.intro")}</p>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mt-4 text-lg font-bold">{t("about.mission.title")}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t("about.mission.desc")}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15">
              <ShieldCheck className="h-5 w-5 text-violet-300" />
            </div>
            <h2 className="mt-4 text-lg font-bold">{t("about.values.title")}</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-primary">•</span>{t("about.values.privacy")}</li>
              <li className="flex gap-2"><span className="text-primary">•</span>{t("about.values.free")}</li>
              <li className="flex gap-2"><span className="text-primary">•</span>{t("about.values.global")}</li>
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <div className="text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-primary">{t("about.dev.eyebrow")}</span>
          </div>
          <div className="mt-8 grid items-center gap-8 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur sm:p-10 md:grid-cols-[auto_1fr]">
            <div className="relative mx-auto">
              <div className="absolute -inset-3 rounded-full bg-primary/20 blur-2xl" aria-hidden />
              <img
                src={founderImg}
                alt={t("about.dev.name")}
                width={192}
                height={192}
                loading="lazy"
                className="relative h-40 w-40 rounded-full border-2 border-primary/40 object-cover shadow-[0_0_40px_-10px_oklch(0.83_0.22_145/0.6)] sm:h-48 sm:w-48"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl font-black">{t("about.dev.name")}</h2>
              <div className="mt-1 text-sm font-semibold text-primary">{t("about.dev.role")}</div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t("about.dev.bio")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="https://www.linkedin.com/in/ohiocodehunter/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-xs font-semibold hover:border-primary/40 hover:text-primary"
                >
                  <Linkedin className="h-3.5 w-3.5" />
                  {t("about.dev.linkedin")}
                </a>
                <a
                  href="https://github.com/ohiocodehunter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-xs font-semibold hover:border-primary/40 hover:text-primary"
                >
                  <Github className="h-3.5 w-3.5" />
                  {t("about.dev.github")}
                </a>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  <Globe2 className="h-3 w-3" /> {t("about.dev.location")}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 overflow-hidden rounded-3xl border border-violet-500/30 p-8 text-center" style={{ backgroundImage: "var(--gradient-cta)" }}>
          <h2 className="text-2xl font-black text-white sm:text-3xl">{t("about.cta.title")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/80">{t("about.cta.desc")}</p>
          <div className="mt-5 flex justify-center">
            <Link to="/auth">
              <Button size="lg" className="rounded-full bg-white text-violet-900 hover:bg-white/90">
                {t("about.cta.button")} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}