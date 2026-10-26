"use client";

import { ChevronDown, Languages } from "lucide-react";
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
        "relative inline-flex items-center rounded-xl border",
        dark ? "border-white/15 bg-white/5" : "border-line bg-slate-50",
        className,
      )}
    >
      <Languages
        className={cn(
          "pointer-events-none absolute left-2 h-3.5 w-3.5",
          dark ? "text-white/50" : "text-slate-400",
        )}
        aria-hidden="true"
      />
      <select
        value={lang}
        onChange={(event) => setLang(event.target.value as typeof lang)}
        aria-label={t("login.language")}
        title={LANGUAGE_OPTIONS.find((option) => option.code === lang)?.label}
        className={cn(
          "h-8 cursor-pointer appearance-none rounded-xl bg-transparent pl-7 text-center text-[11px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-brand-300",
          compact ? "w-[58px] pr-5" : "w-[120px] pr-7",
          dark ? "text-white" : "text-slate-600",
        )}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.code} value={option.code} className="text-slate-700">
            {compact ? option.short : option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-2 h-3 w-3",
          dark ? "text-white/50" : "text-slate-400",
        )}
        aria-hidden="true"
      />
    </div>
  );
}
