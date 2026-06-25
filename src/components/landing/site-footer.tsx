import { Gift, Brain, Shield, Globe, Heart } from "lucide-react";
import { useT } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useT();
  const items = [
    { icon: Gift, key: "free", color: "text-primary" },
    { icon: Brain, key: "ai", color: "text-violet-400" },
    { icon: Shield, key: "privacy", color: "text-sky-400" },
    { icon: Globe, key: "global", color: "text-amber-400" },
    { icon: Heart, key: "heart", color: "text-rose-400" },
  ];
  return (
    <footer className="border-t border-border/40 bg-background/60 py-8">
      <div className="container mx-auto grid grid-cols-2 gap-6 px-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map(({ icon: Icon, key, color }) => (
          <div key={key} className="flex items-start gap-3">
            <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${color}`} />
            <div className="min-w-0">
              <div className="text-sm font-semibold">{t(`footer.${key}.label`)}</div>
              <div className="text-xs text-muted-foreground">{t(`footer.${key}.sub`)}</div>
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}