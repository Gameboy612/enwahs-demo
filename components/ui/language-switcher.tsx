"use client";

import { Languages } from "lucide-react";
import { LANGUAGE_OPTIONS, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  tone = "light",
  compact = true,
  className,
}: {
  tone?: "light" | "dark";
  compact?: boolean;
  className?: string;
}) {
  const { lang, setLang, t } = useI18n();
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border p-0.5",
        dark ? "border-white/15 bg-white/5" : "border-line bg-slate-50",
        className,
      )}
      role="group"
      aria-label={t("login.language")}
    >
      {!compact && (
        <Languages
          className={cn(
            "ml-1.5 h-3.5 w-3.5",
            dark ? "text-white/50" : "text-slate-400",
          )}
          aria-hidden="true"
        />
      )}
      {LANGUAGE_OPTIONS.map((option) => {
        const active = option.code === lang;
        return (
          <button
            key={option.code}
            type="button"
            onClick={() => setLang(option.code)}
            aria-pressed={active}
            title={option.label}
            className={cn(
              "rounded-[9px] px-2 py-1 text-[11px] font-semibold transition",
              active
                ? dark
                  ? "bg-white text-brand-800 shadow-sm"
                  : "bg-white text-brand-700 shadow-sm ring-1 ring-line/80"
                : dark
                  ? "text-white/60 hover:bg-white/10 hover:text-white"
                  : "text-slate-500 hover:bg-white hover:text-ink",
            )}
          >
            {compact ? option.short : option.label}
          </button>
        );
      })}
    </div>
  );
}
