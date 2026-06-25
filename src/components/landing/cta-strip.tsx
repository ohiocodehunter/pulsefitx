import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import avatar1 from "@/assets/avatars/avatar-1.jpg";
import avatar2 from "@/assets/avatars/avatar-2.jpg";
import avatar3 from "@/assets/avatars/avatar-3.jpg";

const ctaAvatars = [avatar1, avatar2, avatar3];

export function CtaStrip() {
  const { t } = useT();
  return (
    <section className="container mx-auto px-4 pb-16 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-violet-500/30 p-6 sm:p-8" style={{ backgroundImage: "var(--gradient-cta)" }}>
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-black text-white sm:text-3xl">{t("cta.title")}</h3>
            <p className="mt-2 max-w-xl text-sm text-white/80">{t("cta.subtitle")}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden -space-x-2 sm:flex">
              {ctaAvatars.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  loading="lazy"
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full border-2 border-violet-300/60 object-cover"
                />
              ))}
            </div>
            <div>
              <Link to="/auth">
                <Button size="lg" className="rounded-full bg-white text-violet-900 hover:bg-white/90">
                  {t("cta.button")} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <div className="mt-1.5 text-center text-[11px] text-white/70">{t("cta.noCard")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}