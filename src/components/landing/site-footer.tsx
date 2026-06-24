import { Gift, Brain, Shield, Globe, Heart } from "lucide-react";

const items = [
  { icon: Gift, label: "100% Free", sub: "All features, always free", color: "text-primary" },
  { icon: Brain, label: "AI Powered", sub: "Smart plans that adapt to you", color: "text-violet-400" },
  { icon: Shield, label: "Privacy First", sub: "Your data is safe and secure", color: "text-sky-400" },
  { icon: Globe, label: "Available Everywhere", sub: "Web, iOS & Android", color: "text-amber-400" },
  { icon: Heart, label: "Built with India", sub: "For a healthier world", color: "text-rose-400" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/60 py-8">
      <div className="container mx-auto grid grid-cols-2 gap-6 px-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map(({ icon: Icon, label, sub, color }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className={`mt-0.5 h-6 w-6 shrink-0 ${color}`} />
            <div className="min-w-0">
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}