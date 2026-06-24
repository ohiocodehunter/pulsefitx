import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaStrip() {
  return (
    <section className="container mx-auto px-4 pb-16 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-violet-500/30 p-6 sm:p-8" style={{ backgroundImage: "var(--gradient-cta)" }}>
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-black text-white sm:text-3xl">Start your fitness journey today</h3>
            <p className="mt-2 max-w-xl text-sm text-white/80">Join thousands of people who are transforming their lives with PulsefitX.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden -space-x-2 sm:flex">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-9 w-9 rounded-full border-2 border-violet-300/60 bg-gradient-to-br from-primary/60 to-violet-500/60" />
              ))}
            </div>
            <div>
              <Link to="/auth">
                <Button size="lg" className="rounded-full bg-white text-violet-900 hover:bg-white/90">
                  Get Started - It's Free <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <div className="mt-1.5 text-center text-[11px] text-white/70">No credit card required</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}