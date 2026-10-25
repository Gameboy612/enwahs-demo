"use client";

import { CalendarDays, CheckSquare, MessageSquare, Pause } from "lucide-react";
import { AssigneeStack } from "@/components/domain/assignee-stack";
import { TaskStateMenu } from "@/components/domain/task-state-menu";
import { CompanyMark } from "@/components/ui/company-mark";
import { ChannelIcon } from "@/components/ui/channel-icon";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { isOverdue } from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskRow({
  task,
  onOpen,
}: {
  task: Task;
  onOpen: (task: Task) => void;
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
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(task);
        }
      }}
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3 transition hover:border-brand-200",
        done && "opacity-60",
      )}
    >
      <TaskStateMenu task={task} />

      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          task.priority === "high"
            ? "bg-red-500"
            : task.priority === "medium"
              ? "bg-gold-500"
              : "bg-slate-300",
        )}
        title={t(`common.${task.priority}`)}
      />

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-[12px] font-medium text-ink",
            done && "text-slate-400 line-through",
          )}
        >
          {pick(task.title)}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-[9px] text-slate-400">
          {company && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <CompanyMark
                company={company}
                size="xs"
                className="h-3.5 w-3.5 rounded-[4px] text-[6px]"
              />
              <span className="truncate">{pick(company.shortName)}</span>
            </span>
          )}
          <ChannelIcon channel={task.channel} size={10} />
          {task.checklist.length > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <CheckSquare className="h-2.5 w-2.5" aria-hidden="true" />
              {checked}/{task.checklist.length}
            </span>
          )}
          {task.sourceThreadId && <MessageSquare className="h-2.5 w-2.5" aria-hidden="true" />}
          {task.blocked && (
            <Pause className="h-2.5 w-2.5 text-amber-500" aria-label={t("tasks.blocked")} />
          )}
        </span>
      </span>

      <AssigneeStack members={assignees} />

      <span
        className={cn(
          "block w-[70px] shrink-0 whitespace-nowrap text-right text-[9px] sm:w-[84px] sm:text-[10px]",
          done ? "text-slate-400" : overdue ? "text-red-500" : "text-slate-400",
        )}
      >
        <CalendarDays className="mr-1 inline h-3 w-3" aria-hidden="true" />
        {dueLabel(task.due, done)}
      </span>
    </div>
  );
}
