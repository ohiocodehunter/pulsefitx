import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center"><Logo /></Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#home" className="text-foreground/90 underline-offset-8 hover:underline">Home</a>
          <a href="#features" className="text-foreground/70 hover:text-foreground">Features</a>
          <a href="#how" className="text-foreground/70 hover:text-foreground">How It Works</a>
          <a href="#plans" className="text-foreground/70 hover:text-foreground">Plans</a>
          <a href="#about" className="text-foreground/70 hover:text-foreground">About Us</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/auth">
            <Button variant="hero" size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}