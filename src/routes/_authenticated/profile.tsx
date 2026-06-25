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
    if (file.size > 5 * 1024 * 1024) return toast.error("Image too large (max 5MB)");
    const url = await fileToResizedDataUrl(file, 256);
    setAvatar(url);
    toast.success("Avatar updated — remember to save");
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
      toast.success("Profile saved");
    } catch (e) { toast.error((e as Error).message); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!user) return;
    if (confirmText !== "DELETE") return toast.error('Type "DELETE" to confirm');
    setDeleting(true);
    try {
      await deleteAllUserData(user.uid);
      await deleteAccount(needsPassword ? password : undefined);
      toast.success("Account deleted");
      navigate({ to: "/", replace: true });
    } catch (e) {
      const msg = (e as Error).message;
      toast.error(msg.includes("wrong-password") ? "Incorrect password" : msg);
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-black sm:text-3xl">Your Profile</h1>
        <p className="text-sm text-muted-foreground">Personal details that shape your plan & coaching.</p>
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
            <div className="text-lg font-bold">{form.name || "Unnamed"}</div>
            <div className="truncate text-sm text-muted-foreground">{user?.email}</div>
            {avatar && (
              <button onClick={() => setAvatar(undefined)} className="mt-1 text-xs text-muted-foreground underline">Remove photo</button>
            )}
          </div>
        </div>
      </section>

      {/* Basic */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Basic Info</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Age"><Input type="number" value={form.age} onChange={(e) => set("age", Number(e.target.value))} /></Field>
          <Field label="Gender">
            <Select value={form.gender} onValueChange={(v) => set("gender", v as typeof form.gender)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Height (cm)"><Input type="number" value={form.heightCm} onChange={(e) => set("heightCm", Number(e.target.value))} /></Field>
          <Field label="Weight (kg)"><Input type="number" step="0.1" value={form.weightKg} onChange={(e) => set("weightKg", Number(e.target.value))} /></Field>
          <Field label="Bio">
            <Textarea rows={2} value={form.bio} onChange={(e) => set("bio", e.target.value)} placeholder="Tell us about your fitness journey" />
          </Field>
        </div>
      </section>

      {/* Plan */}
      <section className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Plan Preferences</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Goal">
            <Select value={form.goal} onValueChange={(v) => set("goal", v as typeof form.goal)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">Weight Loss</SelectItem>
                <SelectItem value="maintain">Maintain</SelectItem>
                <SelectItem value="gain">Weight Gain</SelectItem>
                <SelectItem value="muscle">Muscle Gain</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Activity Level">
            <Select value={form.activity} onValueChange={(v) => set("activity", v as typeof form.activity)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Lightly Active</SelectItem>
                <SelectItem value="moderate">Moderately Active</SelectItem>
                <SelectItem value="active">Very Active</SelectItem>
                <SelectItem value="very_active">Athlete</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Diet">
            <Select value={form.diet} onValueChange={(v) => set("diet", v as typeof form.diet)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Lifestyle">
            <Select value={form.lifestyle} onValueChange={(v) => set("lifestyle", v as typeof form.lifestyle)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hostel">Hostel</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="solo">Solo Living</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Budget">
            <Select value={form.budget} onValueChange={(v) => set("budget", v as typeof form.budget)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => signOut()}>Sign out</Button>
          <Button variant="hero" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
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
            <h3 className="font-bold text-destructive">Danger Zone</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete your account, profile, logs and history. This action cannot be undone.
            </p>
          </div>
          <Button variant="destructive" onClick={() => { setStep(1); setConfirmText(""); setPassword(""); setDelOpen(true); }}>
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </div>
      </section>

      <Dialog open={delOpen} onOpenChange={(o) => { if (!deleting) setDelOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          {step === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> Delete your account?
                </DialogTitle>
                <DialogDescription>
                  This will permanently erase your profile, all daily logs, workouts, weight history and sign-in credentials.
                  You will not be able to recover any of this data.
                </DialogDescription>
              </DialogHeader>
              <ul className="space-y-1 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground">
                <li>• {profile.name || user?.email}</li>
                <li>• All meal, workout and recovery logs</li>
                <li>• Weight & body composition history</li>
              </ul>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDelOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={() => setStep(2)}>I understand, continue</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> Final confirmation
                </DialogTitle>
                <DialogDescription>
                  Type <span className="font-mono font-bold text-destructive">DELETE</span> below to confirm.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder='Type "DELETE"' />
                {needsPassword && (
                  <div>
                    <Label className="text-xs">Confirm your password</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setStep(1)} disabled={deleting}>Back</Button>
                <Button variant="destructive" onClick={confirmDelete}
                  disabled={deleting || confirmText !== "DELETE" || (needsPassword && !password)}>
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Permanently delete
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