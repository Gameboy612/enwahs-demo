import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "teal"
  | "gold"
  | "red"
  | "amber"
  | "slate"
  | "outline";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-600 ring-slate-200/70",
  brand: "bg-brand-50 text-brand-700 ring-brand-200/70",
  teal: "bg-teal-50 text-teal-700 ring-teal-200/70",
  gold: "bg-gold-50 text-gold-700 ring-gold-200/70",
  red: "bg-red-50 text-red-700 ring-red-200/70",
  amber: "bg-amber-50 text-amber-700 ring-amber-200/70",
  slate: "bg-slate-700 text-white ring-slate-700",
  outline: "bg-white text-slate-600 ring-line",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot = false,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-5 ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "red"
              ? "bg-red-500"
              : tone === "amber"
                ? "bg-amber-500"
                : tone === "teal"
                  ? "bg-teal-500"
                  : tone === "gold"
                    ? "bg-gold-500"
                    : tone === "brand"
                      ? "bg-brand-500"
                      : "bg-slate-400",
          )}
        />
      )}
      {children}
    </span>
  );
}
