import { Star } from "lucide-react";
import { useT } from "@/lib/i18n";
import avatar1 from "@/assets/avatars/avatar-1.jpg";
import avatar2 from "@/assets/avatars/avatar-2.jpg";
import avatar3 from "@/assets/avatars/avatar-3.jpg";
import avatar4 from "@/assets/avatars/avatar-4.jpg";

export function Testimonials() {
  const { t } = useT();
  const items = [
    { key: "t1", img: avatar1 },
    { key: "t2", img: avatar2 },
    { key: "t3", img: avatar3 },
    { key: "t4", img: avatar4 },
  ];
  return (
    <section className="container mx-auto px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{t("testimonials.eyebrow")}</span>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{t("testimonials.title")}</h2>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <figure key={it.key} className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur">
            <div className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
              "{t(`testimonials.${it.key}.quote`)}"
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <img src={it.img} alt="" width={40} height={40} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{t(`testimonials.${it.key}.name`)}</div>
                <div className="truncate text-xs text-muted-foreground">{t(`testimonials.${it.key}.role`)}</div>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}