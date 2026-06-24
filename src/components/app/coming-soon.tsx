import type { ComponentType } from "react";

export function ComingSoon({ icon: Icon, title, desc }: { icon: ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/15">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h1 className="mt-4 text-2xl font-black">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground">
        Coming soon
      </div>
    </div>
  );
}