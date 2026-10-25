"use client";

import { Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import type { TaskPriority, TaskStatus, TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

export type TaskQuickFilter = "all" | "mine" | "overdue" | "high" | "week";

export type TaskFiltersState = {
  search: string;
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  assigneeId: string;
  companyId: string;
  channel: string;
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
  ].filter(Boolean).length;
}

export function TaskFilterBar({
  filters,
  onChange,
  onClear,
  team,
  shown,
  total,
}: {
  filters: TaskFiltersState;
  onChange: (patch: Partial<TaskFiltersState>) => void;
  onClear: () => void;
  team: TeamMember[];
  shown: number;
  total: number;
}) {
  const { t, pick } = useI18n();
  const active = countActiveFilters(filters);

  return (
    <div className="surface-card flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
      <Input
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value })}
        placeholder={t("tasks.searchPlaceholder")}
        leftIcon={<Search className="h-3.5 w-3.5" />}
        aria-label={t("common.search")}
        containerClassName="flex-1"
        className="h-9 text-[11px]"
      />
      <div className="grid grid-cols-2 gap-2 sm:flex">
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
          className="h-9 text-[11px]"
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
          className="h-9 text-[11px]"
        />
        <Select
          aria-label={t("tasks.assigneeLabel")}
          value={filters.assigneeId}
          onChange={(event) => onChange({ assigneeId: event.target.value })}
          options={[
            { value: "all", label: t("tasks.allAssignees") },
            ...team.map((member) => ({ value: member.id, label: pick(member.name) })),
          ]}
          containerClassName="col-span-2 min-w-0 sm:col-span-1"
          className="h-9 text-[11px]"
        />
      </div>
      {active > 0 && (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium text-slate-400 transition hover:bg-slate-50 hover:text-ink",
          )}
        >
          <X className="h-3 w-3" aria-hidden="true" />
          {t("common.clearFilters")}
        </button>
      )}
      <span className="shrink-0 text-right text-[9px] text-slate-400">
        {shown}/{total}
      </span>
    </div>
  );
}
