"use client";

import Link from "next/link";
import { Pause } from "lucide-react";
import { AssigneeStack } from "@/components/domain/assignee-stack";
import { TaskStateMenu } from "@/components/domain/task-state-menu";
import { CompanyMark } from "@/components/ui/company-mark";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { isOverdue } from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskItem({
  task,
  onOpen,
  href,
  variant = "full",
  showCompany = true,
}: {
  task: Task;
  onOpen?: (task: Task) => void;
  href?: string;
  variant?: "full" | "compact";
  showCompany?: boolean;
}) {
  const { data } = useDemo();
  const { t, pick, formatDate, dueLabel } = useI18n();
  const company = data.companies.find((item) => item.id === task.companyId);
  const assignees = data.team.filter((member) => task.assigneeIds.includes(member.id));
  const done = task.status === "done";
  const overdue = isOverdue(task);

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-line/60 px-2 py-1.5",
          task.status === "doing" ? "bg-amber-50/60" : "bg-white",
        )}
      >
        {href ? (
          <Link href={href} className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-[9.5px] font-medium text-ink",
                done && "text-slate-400 line-through",
              )}
            >
              {pick(task.title)}
            </span>
            <span className="mt-0.5 block truncate text-[8px] text-slate-400">
              {dueLabel(task.due, done)}
            </span>
          </Link>
        ) : (
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-[9.5px] font-medium text-ink",
                done && "text-slate-400 line-through",
              )}
            >
              {pick(task.title)}
            </span>
            <span className="mt-0.5 block truncate text-[8px] text-slate-400">
              {dueLabel(task.due, done)}
            </span>
          </span>
        )}
        {task.blocked && (
          <Pause className="h-2.5 w-2.5 text-amber-500" aria-label={t("tasks.blocked")} />
        )}
        <AssigneeStack members={assignees} max={2} />
        <TaskStateMenu task={task} variant="icon" />
      </div>
    );
  }

  return (
    <div
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={() => onOpen?.(task)}
      onKeyDown={(event) => {
        if (!onOpen || event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(task);
        }
      }}
      className={cn(
        "group flex cursor-pointer items-center gap-2.5 px-3.5 py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-300/60 sm:gap-3",
        task.status === "doing"
          ? "bg-amber-50/60 hover:bg-amber-100/60"
          : "hover:bg-slate-50/60",
        done && "opacity-60",
      )}
    >
      {showCompany && (company ? (
        <span
          role="img"
          aria-label={pick(company.name)}
          title={pick(company.name)}
          className="shrink-0"
        >
          <CompanyMark
            company={company}
            size="sm"
            className="h-7 w-7 rounded-lg text-[10px] sm:h-8 sm:w-8"
          />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="h-7 w-7 shrink-0 rounded-lg bg-slate-100 sm:h-8 sm:w-8"
        />
      ))}

      <time
        dateTime={task.due}
        title={dueLabel(task.due, done)}
        className={cn(
          "flex h-9 w-[52px] shrink-0 items-center justify-center rounded-lg text-[9px] font-medium leading-tight sm:h-10 sm:w-14 sm:text-[10px]",
          done
            ? "bg-slate-50 text-slate-400"
            : overdue
              ? "bg-red-50 text-red-600"
              : "bg-slate-50 text-slate-500",
        )}
      >
        {formatDate(task.due, "short")}
      </time>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "truncate text-[12px] font-medium text-ink",
              done && "text-slate-400 line-through",
            )}
          >
            {pick(task.title)}
          </span>
          {task.blocked && (
            <Pause
              className="h-2.5 w-2.5 shrink-0 text-amber-500"
              aria-label={t("tasks.blocked")}
            />
          )}
        </span>
      </span>

      <AssigneeStack members={assignees} />

      <TaskStateMenu task={task} variant="dropdown" />
    </div>
  );
}
