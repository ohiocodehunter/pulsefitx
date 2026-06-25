import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Apple, Activity, BarChart3, Bot, Utensils, Flame, LogOut, Menu, X, User as UserIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

const nav = [
  { to: "/dashboard", key: "app.nav.dashboard", icon: LayoutDashboard },
  { to: "/nutrition", key: "app.nav.nutrition", icon: Apple },
  { to: "/activity", key: "app.nav.activity", icon: Activity },
  { to: "/coach", key: "app.nav.coach", icon: Bot },
  { to: "/meals", key: "app.nav.meals", icon: Utensils },
  { to: "/streaks", key: "app.nav.streaks", icon: Flame },
  { to: "/reports", key: "app.nav.reports", icon: BarChart3 },
  { to: "/profile", key: "app.nav.profile", icon: UserIcon },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur lg:flex">
        <SidebarContent onNavigate={() => setOpen(false)} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/80 backdrop-blur" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border/60 bg-sidebar">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen((o) => !o)} className="rounded-md p-1.5 hover:bg-muted" aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Logo />
          <div className="ml-auto"><LanguageSwitcher /></div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const { t } = useT();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      <div className="flex items-center justify-between px-5 py-5">
        <Logo />
        <LanguageSwitcher />
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, key, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4" /> {t(key)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/60 p-4">
        <div className="flex items-center gap-3">
          <Link to="/profile" onClick={onNavigate} className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-violet-500 text-sm font-bold text-primary-foreground">
            {profile.avatarDataUrl ? (
              <img src={profile.avatarDataUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              (profile.name || user?.email || "?").charAt(0).toUpperCase()
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{profile.name || t("app.nav.member")}</div>
            <div className="truncate text-[11px] text-muted-foreground">{user?.email}</div>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} title={t("app.nav.signOut")}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}