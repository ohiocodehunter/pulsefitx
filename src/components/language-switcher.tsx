import { useT, type Lang } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useT();
  return (
    <div className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-border/60 bg-card/60 p-0.5 text-xs">
      <Languages className="ml-1 hidden h-3 w-3 text-muted-foreground sm:inline-block" aria-hidden />
      {(["en", "ja"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`inline-flex h-6 min-w-[32px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold leading-none transition-colors sm:h-7 sm:min-w-[44px] sm:px-2.5 sm:text-xs ${
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l === "en" ? "EN" : "日本語"}
        </button>
      ))}
    </div>
  );
}