import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, Star, Activity, Flame } from "lucide-react";
import heroImg from "@/assets/hero-models.png";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="container mx-auto grid items-center gap-10 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-2 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
            AI Powered Fitness Coach
          </span>
          <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Train Smart.<br />
            Eat Right.<br />
            <span className="text-gradient-primary">Live Better.</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
            Your AI fitness coach that builds personalized plans, tracks progress and helps you become the best version of yourself.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Start Your Journey <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <a href="#how">
              <Button variant="outline" size="xl" className="rounded-full">
                See How It Works <PlayCircle className="ml-1 h-4 w-4" />
              </Button>
            </a>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/40 to-violet-500/40"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="font-semibold">4.9/5</span>
              <span className="text-muted-foreground">Loved by 10,000+ users</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[420px] w-[420px] rounded-full border border-primary/20" />
            <div className="absolute h-[320px] w-[320px] rounded-full border border-primary/30" />
            <div className="absolute h-[220px] w-[220px] rounded-full border border-primary/40" />
            <div className="absolute h-[140px] w-[140px] rounded-full bg-primary/15 blur-2xl" />
          </div>
          <img
            src={heroImg}
            alt="Two athletic models representing the PulsefitX community"
            width={1024}
            height={1536}
            className="relative z-10 mx-auto h-auto w-full max-w-md drop-shadow-[0_30px_60px_oklch(0.83_0.22_145/0.25)]"
          />
          <motion.div
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute right-0 top-6 z-20 hidden w-44 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-card backdrop-blur sm:block"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                Calories
              </div>
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">64%</span>
            </div>
            <div className="mt-1 text-lg font-bold">
              1,350 <span className="text-xs font-medium text-muted-foreground">/ 2,100</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">kcal</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-12 left-0 z-20 hidden w-52 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-card backdrop-blur sm:block"
          >
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" /> Steps
            </div>
            <div className="mt-1 text-lg font-bold">
              7,842 <span className="text-xs font-medium text-muted-foreground">/ 10,000</span>
            </div>
            <div className="mt-2 flex h-8 items-end gap-0.5">
              {[40, 60, 30, 80, 55, 70, 90, 45, 65, 75, 50, 85].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${h}%` }} />
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.7 }}
            className="absolute -bottom-2 right-0 z-20 hidden w-48 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-card backdrop-blur sm:block"
          >
            <div className="text-xs text-muted-foreground">Weight</div>
            <div className="mt-0.5 text-lg font-bold">
              68.5 <span className="text-xs font-medium text-muted-foreground">kg</span>
            </div>
            <div className="text-[10px] text-primary">2.4 kg this month</div>
            <svg viewBox="0 0 100 24" className="mt-1 h-6 w-full text-primary">
              <polyline fill="none" stroke="currentColor" strokeWidth="2" points="0,18 15,14 30,16 45,10 60,12 75,6 90,8 100,4" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}