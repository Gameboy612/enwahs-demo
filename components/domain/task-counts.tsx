"use client";

import { CircleCheck, LoaderCircle, ScrollText } from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function TaskCounts() {
  const { data } = useDemo();
  const { t } = useI18n();
  const counts = [
    {
      key: "todo",
      label: t("status.todo"),
      value: data.tasks.filter((task) => task.status === "todo").length,
      icon: ScrollText,
      tone: "bg-white text-slate-900 ring-1 ring-line",
    },
    {
      key: "doing",
      label: t("status.doing"),
      value: data.tasks.filter((task) => task.status === "doing").length,
      icon: LoaderCircle,
      tone: "bg-amber-50 text-amber-500",
    },
    {
      key: "done",
      label: t("status.done"),
      value: data.tasks.filter((task) => task.status === "done").length,
      icon: CircleCheck,
      tone: "bg-slate-100 text-slate-500",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {counts.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="surface-card px-3 py-4 sm:px-4 sm:py-5">
            <div className="flex items-center justify-between gap-1.5">
              <span className="whitespace-nowrap text-[10px] font-medium text-slate-400">
                {item.label}
              </span>
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8", item.tone)}>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">
              {item.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
