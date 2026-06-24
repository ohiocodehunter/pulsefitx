import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile } from "@/lib/profile-context";
import { useAuth } from "@/lib/auth-context";
import { getLog, todayKey, type DailyLog } from "@/lib/firestore-data";
import { chatWithCoach } from "@/lib/ai.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({ meta: [{ title: "AI Coach - PulsefitX" }] }),
  component: Coach,
});

type Msg = { role: "user" | "assistant"; text: string };

const starters = [
  "What should I eat for dinner tonight?",
  "Is my calorie goal too aggressive?",
  "How do I increase my protein on a budget?",
  "Suggest a 20-minute workout I can do at home.",
];

function Coach() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [today, setToday] = useState<DailyLog | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => setToday(await getLog(user.uid, todayKey())))();
  }, [user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const r = await chatWithCoach({ data: {
        message: text,
        context: {
          name: profile.name, goal: profile.goal,
          calories: profile.targets.calories, proteinG: profile.targets.proteinG, stepGoal: profile.targets.stepGoal,
          todayCalories: today?.calories ?? 0, todaySteps: today?.steps ?? 0, todayProtein: today?.protein ?? 0,
        },
        history: next.slice(-10),
      }});
      setMessages((m) => [...m, { role: "assistant", text: r.reply }]);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <header className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-primary-foreground">
          <Bot className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black">AI Coach</h1>
          <p className="text-xs text-muted-foreground">Personalized advice based on your day.</p>
        </div>
      </header>

      <div className="mt-6 flex-1 overflow-y-auto rounded-2xl border border-border/60 bg-card/40 p-5">
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center">
            <div className="max-w-md text-center">
              <Sparkles className="mx-auto h-8 w-8 text-primary" />
              <h2 className="mt-3 text-lg font-bold">How can I help you today, {profile.name.split(" ")[0]}?</h2>
              <p className="mt-1 text-sm text-muted-foreground">Ask anything about nutrition, workouts, recovery, or habits.</p>
              <div className="mt-5 grid gap-2 text-left">
                {starters.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm transition-colors hover:border-primary/40">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/60 bg-card",
                )}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border/60 bg-card px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <form className="mt-4 flex items-center gap-2"
        onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <Input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach anything..." className="h-12 rounded-full" maxLength={500} disabled={busy} />
        <Button variant="hero" size="icon" type="submit" disabled={busy || !input.trim()} className="h-12 w-12 rounded-full">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}