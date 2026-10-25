"use client";

import { Building2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

const sizes = {
  xs: "h-6 w-6 text-[9px] rounded-lg",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-lg",
};

export function CompanyMark({
  company,
  size = "md",
  className,
}: {
  company: Pick<Company, "shortName" | "accent">;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const { pick } = useI18n();
  const label = pick(company.shortName);
  const first = Array.from(label.trim())[0] ?? "?";
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-semibold text-white shadow-sm ring-1 ring-black/5",
        sizes[size],
        className,
      )}
      style={{
        background: `linear-gradient(140deg, ${company.accent}, ${company.accent}b0)`,
      }}
      aria-hidden="true"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_55%)]" />
      {first ? <span className="relative">{first}</span> : <Building2 className="h-4 w-4" />}
    </span>
  );
}
