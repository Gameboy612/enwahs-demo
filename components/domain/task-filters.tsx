"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import type {
  Channel,
  Company,
  TaskPriority,
  TaskStatus,
  TeamMember,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export type TaskQuickFilter = "all" | "mine" | "overdue" | "high" | "week";

export type TaskFiltersState = {
  search: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  assigneeId: string;
  companyId: string;
  channel: Channel | "all";
  quick: TaskQuickFilter;
};

export const defaultTaskFilters: TaskFiltersState = {
  search: "",
  status: "all",
  priority: "all",
  assigneeId: "all",
  companyId: "all",
  channel: "all",
  quick: "all",
};

export function countActiveFilters(filters: TaskFiltersState): number {
  return [
    filters.search.trim() !== "",
    filters.status !== "all",
    filters.priority !== "all",
    filters.assigneeId !== "all",
    filters.companyId !== "all",
    filters.channel !== "all",
    filters.quick !== "all",
  ].filter(Boolean).length;
}

export function TaskFilterBar({
  filters,
  onChange,
  onClear,
  team,
  companies,
  shown,
  total,
  currentMemberId,
}: {
  filters: TaskFiltersState;
  onChange: (patch: Partial<TaskFiltersState>) => void;
  onClear: () => void;
  team: TeamMember[];
  companies: Company[];
  shown: number;
  total: number;
  currentMemberId: string;
}) {
  const { t, pick } = useI18n();
  const active = countActiveFilters(filters);

  const quickOptions: { value: TaskQuickFilter; label: string }[] = [
    { value: "all", label: t("tasks.allTasks") },
    { value: "mine", label: t("tasks.mine") },
    { value: "overdue", label: t("common.overdue") },
    { value: "high", label: t("tasks.highPriority") },
    { value: "week", label: t("tasks.dueThisWeek") },
  ];

  return (
    <div className="surface-card p-3.5 sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <Input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder={t("tasks.searchPlaceholder")}
            leftIcon={<Search className="h-4 w-4" />}
            aria-label={t("common.search")}
            containerClassName="lg:max-w-xs"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-1 lg:items-center">
            <Select
              aria-label={t("tasks.statusLabel")}
              value={filters.status}
              onChange={(event) =>
                onChange({ status: event.target.value as TaskFiltersState["status"] })
              }
              options={[
                { value: "all", label: t("tasks.allStatuses") },
                { value: "todo", label: t("status.todo") },
                { value: "doing", label: t("status.doing") },
                { value: "done", label: t("status.done") },
              ]}
              containerClassName="min-w-0"
            />
            <Select
              aria-label={t("tasks.priorityLabel")}
              value={filters.priority}
              onChange={(event) =>
                onChange({ priority: event.target.value as TaskFiltersState["priority"] })
              }
              options={[
                { value: "all", label: t("tasks.allPriorities") },
                { value: "high", label: t("common.high") },
                { value: "medium", label: t("common.medium") },
                { value: "low", label: t("common.low") },
              ]}
              containerClassName="min-w-0"
            />
            <Select
              aria-label={t("tasks.assigneeLabel")}
              value={filters.assigneeId}
              onChange={(event) => onChange({ assigneeId: event.target.value })}
              options={[
                { value: "all", label: t("tasks.allAssignees") },
                { value: currentMemberId, label: t("tasks.mine") },
                ...team
                  .filter((member) => member.id !== currentMemberId)
                  .map((member) => ({ value: member.id, label: pick(member.name) })),
              ]}
              containerClassName="min-w-0"
            />
            <Select
              aria-label={t("tasks.companyLabel")}
              value={filters.companyId}
              onChange={(event) => onChange({ companyId: event.target.value })}
              options={[
                { value: "all", label: t("tasks.allCompanies") },
                ...companies.map((company) => ({
                  value: company.id,
                  label: pick(company.shortName),
                })),
              ]}
              containerClassName="min-w-0"
            />
            <Select
              aria-label={t("tasks.channelLabel")}
              value={filters.channel}
              onChange={(event) =>
                onChange({ channel: event.target.value as TaskFiltersState["channel"] })
              }
              options={[
                { value: "all", label: t("tasks.allChannels") },
                { value: "whatsapp", label: t("channel.whatsapp") },
                { value: "wechat", label: t("channel.wechat") },
                { value: "email", label: t("channel.email") },
                { value: "internal", label: t("channel.internal") },
              ]}
              containerClassName="min-w-0"
            />
            {active > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                leftIcon={<X className="h-3.5 w-3.5" />}
                className="col-span-2 justify-start text-slate-500 sm:col-span-1 lg:shrink-0"
              >
                {t("tasks.clearFilters")}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line/70 pt-2.5">
          <div className="flex flex-wrap items-center gap-1">
            {quickOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ quick: option.value })}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-semibold transition",
                  filters.quick === option.value
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-slate-50 text-slate-500 ring-1 ring-inset ring-line hover:bg-white hover:text-ink",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400">
            {t("common.showing", { shown, total })}
          </p>
        </div>
      </div>
    </div>
  );
}
