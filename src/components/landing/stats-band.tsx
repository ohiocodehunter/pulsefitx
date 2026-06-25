import { useT } from "@/lib/i18n";

export function StatsBand() {
  const { t } = useT();
  const stats = [
    { value: "10K+", key: "users" },
    { value: "1.2M", key: "meals" },
    { value: "98%", key: "retention" },
    { value: "4.9★", key: "rating" },
  ];
  return (
    <section className="container mx-auto px-4 py-10 sm:px-6">
      <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.key} className="text-center">
            <div className="text-3xl font-black text-gradient-primary sm:text-4xl">{s.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{t(`stats.${s.key}`)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}