import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function SiteHeader() {
  const { t } = useT();
  const { user, loading } = useAuth();
  const isAuthed = !loading && !!user;
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-40 w-full overflow-x-clip border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-full items-center justify-between gap-2 px-3 sm:px-6">
        <Link to="/" className="flex min-w-0 shrink items-center"><Logo /></Link>
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          <Link to="/" hash="home" className="text-foreground/90 underline-offset-8 hover:underline">{t("nav.home")}</Link>
          <Link to="/" hash="features" className="text-foreground/70 hover:text-foreground">{t("nav.features")}</Link>
          <Link to="/" hash="how" className="text-foreground/70 hover:text-foreground">{t("nav.how")}</Link>
          <Link to="/" hash="plans" className="text-foreground/70 hover:text-foreground">{t("nav.plans")}</Link>
          <Link to="/about" className="text-foreground/70 hover:text-foreground">{t("nav.about")}</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <LanguageSwitcher />
          {isAuthed ? (
            <Link to="/dashboard">
              <Button variant="hero" size="sm" className="px-2.5 text-xs sm:px-3 sm:text-sm">{t("app.nav.dashboard")}</Button>
            </Link>
          ) : (
            <>
              <Link to="/auth" className="hidden md:inline-flex">
                <Button variant="ghost" size="sm">{t("nav.login")}</Button>
              </Link>
              <Link to="/auth" className="hidden sm:inline-flex">
                <Button variant="hero" size="sm" className="px-2.5 text-xs sm:px-3 sm:text-sm">{t("nav.getStarted")}</Button>
              </Link>
            </>
          )}
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/60 text-foreground lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl lg:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-3 text-sm font-medium sm:px-6">
            <Link to="/" hash="home" onClick={close} className="rounded-md px-2 py-2 text-foreground/90 hover:bg-card/60">{t("nav.home")}</Link>
            <Link to="/" hash="features" onClick={close} className="rounded-md px-2 py-2 text-foreground/80 hover:bg-card/60">{t("nav.features")}</Link>
            <Link to="/" hash="how" onClick={close} className="rounded-md px-2 py-2 text-foreground/80 hover:bg-card/60">{t("nav.how")}</Link>
            <Link to="/" hash="plans" onClick={close} className="rounded-md px-2 py-2 text-foreground/80 hover:bg-card/60">{t("nav.plans")}</Link>
            <Link to="/about" onClick={close} className="rounded-md px-2 py-2 text-foreground/80 hover:bg-card/60">{t("nav.about")}</Link>
            {!isAuthed ? (
              <Link to="/auth" onClick={close} className="rounded-md px-2 py-2 text-foreground/80 hover:bg-card/60 sm:hidden">{t("nav.login")}</Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}