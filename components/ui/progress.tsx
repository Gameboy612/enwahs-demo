import { cn } from "@/lib/utils";

const tones = {
  brand: "bg-brand-500",
  teal: "bg-teal-500",
  gold: "bg-gold-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  slate: "bg-slate-400",
};

export function Progress({
  value,
  tone = "teal",
  className,
  trackClassName,
  label,
  showValue = false,
}: {
  value: number;
  tone?: keyof typeof tones;
  className?: string;
  trackClassName?: string;
  label?: string;
  showValue?: boolean;
}) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-500">
          <span>{label}</span>
          {showValue && <span className="tabular-nums">{clamped}%</span>}
        </div>
      )}
      <div
        className={cn("h-1.5 w-full overflow-hidden rounded-full bg-slate-100", trackClassName)}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", tones[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
