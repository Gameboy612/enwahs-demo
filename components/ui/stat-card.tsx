import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-50 text-brand-700 ring-brand-100",
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  gold: "bg-gold-50 text-gold-700 ring-gold-100",
  red: "bg-red-50 text-red-700 ring-red-100",
  slate: "bg-slate-100 text-slate-600 ring-slate-100",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  trend,
  tone = "brand",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  trend?: { direction: "up" | "down" | "flat"; value: string; good?: boolean };
  tone?: keyof typeof tones;
  className?: string;
}) {
  const TrendIcon =
    trend?.direction === "up"
      ? ArrowUpRight
      : trend?.direction === "down"
        ? ArrowDownRight
        : Minus;
  return (
    <div
      className={cn(
        "surface-card group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lift",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-[0.06]"
        style={{ background: "currentColor" }}
      />
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-inset",
              tones[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[28px] font-semibold tracking-[-0.03em] text-ink tabular-nums">
          {value}
        </p>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              trend.good === false
                ? "bg-amber-50 text-amber-700"
                : trend.direction === "flat"
                  ? "bg-slate-100 text-slate-500"
                  : "bg-teal-50 text-teal-700",
            )}
          >
            <TrendIcon className="h-3 w-3" aria-hidden="true" />
            {trend.value}
          </span>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{hint}</p>}
    </div>
  );
}
