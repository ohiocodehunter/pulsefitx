import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, Loader2, Save, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { calcTargets } from "@/lib/calculations";
import { saveProfile, deleteAllUserData } from "@/lib/firestore-data";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/profile")({
  ssr: false,
  head: () => ({ meta: [{ title: "Profile - PulsefitX" }] }),
  component: ProfilePage,
});

async function fileToResizedDataUrl(file: File, max = 256): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function ProfilePage() {
  const { user, deleteAccount, signOut } = useAuth();
  const { profile, setProfile } = useProfile();
  const { t: tr } = useT();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: profile.name,
    bio: profile.bio ?? "",
    age: profile.age,
    gender: profile.gender,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    goal: profile.goal,
    activity: profile.activity,
    diet: profile.diet,
    lifestyle: profile.lifestyle,
    budget: profile.budget,
  });
  const [avatar, setAvatar] = useState<string | undefined>(profile.avatarDataUrl);
  const [saving, setSaving] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const needsPassword = !!user?.providerData.some((p) => p.providerId === "password");

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const onAvatar = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) return toast.error(tr("profile.tooLarge"));
    const url = await fileToResizedDataUrl(file, 256);
    setAvatar(url);
    toast.success(tr("profile.avatarUpdated"));
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const targets = calcTargets({
        age: Number(form.age), gender: form.gender,
        heightCm: Number(form.heightCm), weightKg: Number(form.weightKg),
        activity: form.activity, goal: form.goal,
      });
      const next = {
        ...profile, ...form,
        age: Number(form.age), heightCm: Number(form.heightCm), weightKg: Number(form.weightKg),
        avatarDataUrl: avatar, targets,
      };
      await saveProfile(user.uid, next);
      setProfile(next);
      toast.success(tr("profile.saved"));
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!user) return;
    if (confirmText !== "DELETE") return toast.error(tr("profile.del.typeErr"));
    setDeleting(true);
    try {
      await deleteAllUserData(user.uid);
      await deleteAccount(needsPassword ? password : undefined);
      toast.success(tr("profile.del.success"));
      navigate({ to: "/", replace: true });
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg.includes("wrong-password") ? tr("profile.del.wrongPw") : msg);
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-black sm:text-3xl">{tr("profile.title")}</h1>
        <p className="text-sm text-muted-foreground">{tr("profile.subtitle")}</p>
      </header>

      {/* Avatar card */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-violet-500 text-2xl font-bold text-primary-foreground">
              {avatar ? <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
                : (form.name || user?.email || "?").charAt(0).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-border bg-background text-primary hover:bg-primary/10"
              aria-label="Change avatar"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onAvatar(f); }} />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold">{form.name || tr("profile.unnamed")}</div>
            <div className="truncate text-sm text-muted-foreground">{user?.email}</div>
            {avatar && (
              <button onClick={() => setAvatar(undefined)} className="mt-1 text-xs text-muted-foreground underline">{tr("profile.removePhoto")}</button>
            )}
          </div>
        </div>
      </section>

      {/* Basic */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{tr("profile.basic")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={tr("profile.name")}><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label={tr("profile.age")}><Input type="number" value={form.age} onChange={(e) => set("age", Number(e.target.value))} /></Field>
          <Field label={tr("profile.gender")}>
            <Select value={form.gender} onValueChange={(v) => set("gender", v as typeof form.gender)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{tr("profile.male")}</SelectItem>
                <SelectItem value="female">{tr("profile.female")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={tr("profile.height")}><Input type="number" value={form.heightCm} onChange={(e) => set("heightCm", Number(e.target.value))} /></Field>
          <Field label={tr("profile.weight")}><Input type="number" step="0.1" value={form.weightKg} onChange={(e) => set("weightKg", Number(e.target.value))} /></Field>
          <Field label={tr("profile.bio")}>
            <Textarea rows={2} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder={tr("profile.bioPlaceholder")} />
          </Field>
        </div>
      </section>

      {/* Plan */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{tr("profile.plan")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={tr("profile.goal")}>
            <Select value={form.goal} onValueChange={(v) => set("goal", v as typeof form.goal)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">{tr("goal.lose")}</SelectItem>
                <SelectItem value="maintain">{tr("goal.maintain")}</SelectItem>
                <SelectItem value="gain">{tr("goal.gain")}</SelectItem>
                <SelectItem value="muscle">{tr("goal.muscle")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={tr("profile.activity")}>
            <Select value={form.activity} onValueChange={(v) => set("activity", v as typeof form.activity)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">{tr("profile.sedentary")}</SelectItem>
                <SelectItem value="light">{tr("profile.light")}</SelectItem>
                <SelectItem value="moderate">{tr("profile.moderate")}</SelectItem>
                <SelectItem value="active">{tr("profile.veryActive")}</SelectItem>
                <SelectItem value="very_active">{tr("profile.athlete")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={tr("profile.diet")}>
            <Select value={form.diet} onValueChange={(v) => set("diet", v as typeof form.diet)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetarian">{tr("profile.vegetarian")}</SelectItem>
                <SelectItem value="non_vegetarian">{tr("profile.nonVeg")}</SelectItem>
                <SelectItem value="vegan">{tr("profile.vegan")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={tr("profile.lifestyle")}>
            <Select value={form.lifestyle} onValueChange={(v) => set("lifestyle", v as typeof form.lifestyle)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hostel">{tr("profile.hostel")}</SelectItem>
                <SelectItem value="home">{tr("profile.home")}</SelectItem>
                <SelectItem value="office">{tr("profile.office")}</SelectItem>
                <SelectItem value="solo">{tr("profile.solo")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label={tr("profile.budget")}>
            <Select value={form.budget} onValueChange={(v) => set("budget", v as typeof form.budget)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{tr("profile.low")}</SelectItem>
                <SelectItem value="medium">{tr("profile.medium")}</SelectItem>
                <SelectItem value="high">{tr("profile.high")}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => signOut()}>{tr("profile.signOut")}</Button>
          <Button variant="hero" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {tr("profile.save")}
          </Button>
        </div>
      </section>

      {/* Danger */}
      <section className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-destructive/15 text-destructive">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-destructive">{tr("profile.danger")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{tr("profile.dangerDesc")}</p>
          </div>
          <Button variant="destructive" onClick={() => { setStep(1); setConfirmText(""); setPassword(""); setDelOpen(true); }}>
            <Trash2 className="h-4 w-4" /> {tr("profile.delete")}
          </Button>
        </div>
      </section>

      <Dialog open={delOpen} onOpenChange={(o) => { if (!deleting) setDelOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          {step === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> {tr("profile.del.title")}
                </DialogTitle>
                <DialogDescription>{tr("profile.del.desc")}</DialogDescription>
              </DialogHeader>
              <ul className="space-y-1 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
                <li>• {profile.name || user?.email}</li>
                <li>• {tr("profile.del.logs")}</li>
                <li>• {tr("profile.del.weight")}</li>
              </ul>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDelOpen(false)}>{tr("profile.del.cancel")}</Button>
                <Button variant="destructive" onClick={() => setStep(2)}>{tr("profile.del.continue")}</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> {tr("profile.del.final")}
                </DialogTitle>
                <DialogDescription>
                  {tr("profile.del.typeDelete")} <span className="font-mono font-bold text-destructive">DELETE</span> {tr("profile.del.toConfirm")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={tr("profile.del.placeholder")} />
                {needsPassword && (
                  <div>
                    <Label className="text-xs">{tr("profile.del.password")}</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setStep(1)} disabled={deleting}>{tr("profile.del.back")}</Button>
                <Button variant="destructive" onClick={confirmDelete}
                  disabled={deleting || confirmText !== "DELETE" || (needsPassword && !password)}>
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {tr("profile.del.perm")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}