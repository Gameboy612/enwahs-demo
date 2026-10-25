"use client";

import {
  AlertTriangle,
  Circle,
  CircleCheck,
  Flag,
  LoaderCircle,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ChannelIcon } from "@/components/ui/channel-icon";
import { useI18n } from "@/lib/i18n";
import type {
  Channel,
  CompanyStatus,
  RiskLevel,
  Sentiment,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskStatusBadge({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  const { t } = useI18n();
  const map: Record<TaskStatus, { tone: BadgeTone; icon: typeof Circle }> = {
    todo: { tone: "neutral", icon: ScrollText },
    doing: { tone: "brand", icon: LoaderCircle },
    done: { tone: "teal", icon: CircleCheck },
  };
  const { tone, icon: Icon } = map[status];
  return (
    <Badge tone={tone} className={className}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {t(`status.${status}`)}
    </Badge>
  );
}

export function PriorityBadge({
  priority,
  withIcon = true,
  className,
}: {
  priority: TaskPriority;
  withIcon?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  const map: Record<TaskPriority, { tone: BadgeTone; className: string }> = {
    high: { tone: "red", className: "" },
    medium: { tone: "amber", className: "" },
    low: { tone: "neutral", className: "" },
  };
  const item = map[priority];
  return (
    <Badge tone={item.tone} className={cn(item.className, className)}>
      {withIcon && <Flag className="h-3 w-3" aria-hidden="true" />}
      {t(`common.${priority}`)}
    </Badge>
  );
}

export function CompanyStatusBadge({
  status,
  className,
}: {
  status: CompanyStatus;
  className?: string;
}) {
  const { t } = useI18n();
  const map: Record<CompanyStatus, BadgeTone> = {
    active: "teal",
    "at-risk": "red",
    onboarding: "brand",
    dormant: "neutral",
  };
  return (
    <Badge tone={map[status]} dot className={className}>
      {t(`companyStatus.${status}`)}
    </Badge>
  );
}

export function RiskBadge({
  risk,
  className,
}: {
  risk: RiskLevel;
  className?: string;
}) {
  const { t } = useI18n();
  const map: Record<RiskLevel, { tone: BadgeTone; icon: typeof ShieldCheck }> = {
    low: { tone: "teal", icon: ShieldCheck },
    medium: { tone: "amber", icon: AlertTriangle },
    high: { tone: "red", icon: ShieldAlert },
  };
  const item = map[risk];
  const Icon = item.icon;
  return (
    <Badge tone={item.tone} className={className}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {t(`risk.${risk}`)}
    </Badge>
  );
}

export function ChannelBadge({
  channel,
  className,
}: {
  channel: Channel;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600",
        className,
      )}
    >
      <ChannelIcon channel={channel} size={12} />
      {t(`channel.${channel}`)}
    </span>
  );
}

export function ServiceBadge({
  service,
  className,
}: {
  service:
    | "audit"
    | "tax"
    | "companySecretarial"
    | "accounts"
    | "payroll"
    | "funding"
    | "advisory";
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-inset ring-slate-200/70",
        className,
      )}
    >
      {t(`service.${service}`)}
    </span>
  );
}

export function SentimentBadge({
  sentiment,
  className,
}: {
  sentiment: Sentiment;
  className?: string;
}) {
  const { t } = useI18n();
  const map: Record<Sentiment, BadgeTone> = {
    positive: "teal",
    neutral: "neutral",
    negative: "red",
  };
  return (
    <Badge tone={map[sentiment]} dot className={className}>
      {t(`sentiment.${sentiment}`)}
    </Badge>
  );
}

export function AiTag({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-50 to-teal-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-200/60",
        className,
      )}
    >
      <Sparkles className="h-3 w-3 text-gold-500" aria-hidden="true" />
      {t("inbox.aiExtracted")}
    </span>
  );
}
