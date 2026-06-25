import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

export function SiteHeader() {
  const { t } = useT();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center"><Logo /></Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#home" className="text-foreground/90 underline-offset-8 hover:underline">{t("nav.home")}</a>
          <a href="#features" className="text-foreground/70 hover:text-foreground">{t("nav.features")}</a>
          <a href="#how" className="text-foreground/70 hover:text-foreground">{t("nav.how")}</a>
          <a href="#plans" className="text-foreground/70 hover:text-foreground">{t("nav.plans")}</a>
          <a href="#about" className="text-foreground/70 hover:text-foreground">{t("nav.about")}</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link to="/auth" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">{t("nav.login")}</Button>
          </Link>
          <Link to="/auth">
            <Button variant="hero" size="sm">{t("nav.getStarted")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}