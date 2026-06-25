import { cn } from "@/lib/utils";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-1.5 sm:gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-6 w-6 text-primary sm:h-7 sm:w-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 16h5l3-8 4 16 3-10 3 6h10" />
      </svg>
      {withText && (
        <span className="text-base font-bold tracking-tight sm:text-lg">
          Pulsefit<span className="text-primary">X</span>
        </span>
      )}
    </div>
  );
}