import { useT, type Lang } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useT();
  return (
    <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-card/60 p-0.5 text-xs">
      <Languages className="ml-1.5 hidden h-3.5 w-3.5 text-muted-foreground sm:inline-block" aria-hidden />
      {(["en", "ja"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`inline-flex h-7 min-w-[36px] items-center justify-center rounded-full px-2 font-semibold leading-none transition-colors sm:min-w-[44px] sm:px-2.5 ${
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l === "en" ? "EN" : "日本語"}
        </button>
      ))}
    </div>
  );
}