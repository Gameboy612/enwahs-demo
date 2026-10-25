"use client";

import { useI18n } from "@/lib/i18n";
import { asset, cn } from "@/lib/utils";

const markSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export function Logo({
  tone = "light",
  size = "md",
  showText = true,
  className,
}: {
  tone?: "light" | "dark";
  size?: keyof typeof markSizes;
  showText?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const dark = tone === "dark";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5",
          markSizes[size],
        )}
      >
        <img
          src={asset("/logo-enwahs.png")}
          alt="Enwahs Accounting & Taxation Limited"
          className="h-full w-full object-contain p-0.5"
        />
      </span>
      {showText && (
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "truncate text-[15px] font-semibold leading-tight tracking-tight",
                dark ? "text-white" : "text-ink",
              )}
            >
              Enwahs <span className={dark ? "text-teal-300" : "text-teal-600"}>CRM</span>
            </span>
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em]",
                dark
                  ? "bg-white/10 text-white/70 ring-1 ring-white/10"
                  : "bg-brand-50 text-brand-600 ring-1 ring-brand-100",
              )}
            >
              {t("app.demo")}
            </span>
          </span>
          <span
            className={cn(
              "mt-0.5 block truncate text-[10px] leading-tight",
              dark ? "text-white/50" : "text-slate-400",
            )}
          >
            {t("app.descriptor")}
          </span>
        </span>
      )}
    </div>
  );
}
