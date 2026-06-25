import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useT } from "@/lib/i18n";

export function Faq() {
  const { t } = useT();
  const [open, setOpen] = useState<number | null>(0);
  const items = [0, 1, 2, 3, 4];
  return (
    <section id="faq" className="container mx-auto px-4 py-16 sm:px-6">
      <div className="text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">{t("faq.eyebrow")}</span>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{t("faq.title")}</h2>
      </div>
      <div className="mx-auto mt-8 max-w-2xl divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/60 backdrop-blur">
        {items.map((i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold"
                aria-expanded={isOpen}
              >
                <span>{t(`faq.q${i + 1}.q`)}</span>
                {isOpen ? <Minus className="h-4 w-4 shrink-0 text-primary" /> : <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-muted-foreground">{t(`faq.q${i + 1}.a`)}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}