"use client";

import { CalendarDays, CheckSquare, GripVertical, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CompanyMark } from "@/components/ui/company-mark";
import { ChannelIcon } from "@/components/ui/channel-icon";
import { PriorityBadge } from "@/components/domain/badges";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { isOverdue } from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskCard({
  task,
  onOpen,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  onOpen: (task: Task) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
}) {
  const { data } = useDemo();
  const { t, pick, dueLabel } = useI18n();
  const company = data.companies.find((item) => item.id === task.companyId);
  const assignee = data.team.find((member) => member.id === task.assigneeId);
  const overdue = isOverdue(task);
  const done = task.status === "done";
  const checked = task.checklist.filter((item) => item.done).length;

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", task.id);
        event.dataTransfer.effectAllowed = "move";
        onDragStart(task);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(task);
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        "group cursor-grab rounded-xl border border-line bg-white p-3.5 shadow-card transition hover:-translate-y-px hover:border-brand-200 hover:shadow-lift active:cursor-grabbing",
        done && "bg-slate-50/70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        <GripVertical
          className="h-3.5 w-3.5 text-slate-300 opacity-0 transition group-hover:opacity-100"
          aria-hidden="true"
        />
      </div>

      <p
        className={cn(
          "mt-2.5 text-[12.5px] font-semibold leading-snug text-ink",
          done && "text-slate-400 line-through",
        )}
      >
        {pick(task.title)}
      </p>

      {company && (
        <div className="mt-2 flex items-center gap-2">
          <CompanyMark company={company} size="xs" />
          <span className="truncate text-[10px] text-slate-500">{pick(company.name)}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/70 pt-2.5">
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          {assignee ? (
            <Avatar name={pick(assignee.name)} color={assignee.accent} size="xs" />
          ) : (
            <span className="text-[9px]">{t("common.unassigned")}</span>
          )}
          <ChannelIcon channel={task.channel} size={12} />
          {task.checklist.length > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <CheckSquare className="h-3 w-3" aria-hidden="true" />
              {checked}/{task.checklist.length}
            </span>
          )}
          {task.sourceThreadId && <MessageSquare className="h-3 w-3" aria-hidden="true" />}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10px] font-medium",
            overdue ? "text-red-600" : done ? "text-slate-400" : "text-slate-500",
          )}
        >
          <CalendarDays className="h-3 w-3" aria-hidden="true" />
          {dueLabel(task.due, done)}
        </span>
      </div>
    </div>
  );
}
