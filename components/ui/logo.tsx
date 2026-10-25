"use client";

import { useI18n } from "@/lib/i18n";
import { asset, cn } from "@/lib/utils";

const textSizes = {
  xs: "text-[10px]",
  sm: "text-[13px]",
  md: "text-[15px]",
  lg: "text-[17px]",
  xl: "text-[21px]",
  "2xl": "text-[26px]",
};

const markSizes = {
  xs: "h-6 w-6 rounded-md p-0.5",
  sm: "h-8 w-8 rounded-lg p-0.5",
  md: "h-10 w-10 rounded-xl p-1",
  lg: "h-12 w-12 rounded-xl p-1",
  xl: "h-16 w-16 rounded-2xl p-1.5",
  "2xl": "h-24 w-24 rounded-3xl p-2",
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
          "flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-sm ring-1 ring-black/5",
          markSizes[size],
        )}
      >
        <img
          src={asset("/logo-enwahs.png")}
          alt={t("app.name")}
          className="h-full w-full object-contain"
        />
      </span>
      {showText && (
        <span
          className={cn(
            "truncate font-semibold leading-none tracking-[-0.02em]",
            textSizes[size],
            dark ? "text-white" : "text-ink",
          )}
        >
          Enwahs{" "}
          <span className={dark ? "text-teal-300" : "text-teal-600"}>CRM</span>
        </span>
      )}
    </div>
  );
}
