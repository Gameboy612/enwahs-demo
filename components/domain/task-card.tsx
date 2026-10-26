"use client";

import { CalendarDays, CheckSquare, Pause } from "lucide-react";
import { AssigneeStack } from "@/components/domain/assignee-stack";
import { CompanyMark } from "@/components/ui/company-mark";
import { ChannelIcon } from "@/components/ui/channel-icon";
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
  const assignees = data.team.filter((member) => task.assigneeIds.includes(member.id));
  const done = task.status === "done";
  const overdue = isOverdue(task);
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
        "cursor-grab rounded-xl border border-line p-3 transition hover:border-brand-200 active:cursor-grabbing",
        task.status === "doing" ? "bg-amber-50/60" : "bg-white",
        done && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          {task.blocked && <Pause className="h-2.5 w-2.5 text-amber-500" aria-label={t("tasks.blocked")} />}
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
            task.priority === "high"
              ? "bg-red-500"
              : task.priority === "medium"
                ? "bg-gold-500"
                : "bg-slate-300",
            )}
            title={t(`common.${task.priority}`)}
          />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[9px]",
            overdue ? "text-red-500" : "text-slate-400",
          )}
        >
          <CalendarDays className="h-2.5 w-2.5" aria-hidden="true" />
          {dueLabel(task.due, done)}
        </span>
      </div>

      <p
        className={cn(
          "mt-2 text-[11.5px] font-medium leading-snug text-ink",
          done && "text-slate-400 line-through",
        )}
      >
        {pick(task.title)}
      </p>

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line/60 pt-2">
        <span className="flex min-w-0 items-center gap-1.5 text-[9px] text-slate-400">
          {company && <CompanyMark company={company} size="xs" className="h-3.5 w-3.5 rounded-[4px] text-[6px]" />}
          <span className="truncate">{company ? pick(company.shortName) : ""}</span>
          <ChannelIcon channel={task.channel} size={9} />
          {task.checklist.length > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <CheckSquare className="h-2.5 w-2.5" aria-hidden="true" />
              {checked}/{task.checklist.length}
            </span>
          )}
        </span>
        <AssigneeStack members={assignees} />
      </div>
    </div>
  );
}
