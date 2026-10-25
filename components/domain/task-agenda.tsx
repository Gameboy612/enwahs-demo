"use client";

import { useMemo } from "react";
import { Pause } from "lucide-react";
import { AssigneeStack } from "@/components/domain/assignee-stack";
import { TaskStateMenu } from "@/components/domain/task-state-menu";
import { CompanyMark } from "@/components/ui/company-mark";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { isOverdue } from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type GroupKey = "overdue" | "today" | "tomorrow" | "week" | "later" | "done";

export function TaskAgenda({
  tasks,
  onOpen,
}: {
  tasks: Task[];
  onOpen: (task: Task) => void;
}) {
  const { data } = useDemo();
  const { t, pick, formatDate, daysFromToday, dueLabel } = useI18n();

  const groups = useMemo(() => {
    const bucketFor = (task: Task): GroupKey => {
      if (task.status === "done") return "done";
      const diff = daysFromToday(task.due);
      if (diff < 0) return "overdue";
      if (diff === 0) return "today";
      if (diff === 1) return "tomorrow";
      if (diff <= 7) return "week";
      return "later";
    };
    const labels: Record<GroupKey, string> = {
      overdue: t("common.overdue"),
      today: t("common.today"),
      tomorrow: t("common.tomorrow"),
      week: t("dashboard.thisWeek"),
      later: t("home.later"),
      done: t("status.done"),
    };
    const order: GroupKey[] = ["overdue", "today", "tomorrow", "week", "later", "done"];
    return order
      .map((key) => ({
        key,
        label: labels[key],
        tasks: tasks.filter((task) => bucketFor(task) === key),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [daysFromToday, t, tasks]);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="mb-1.5 flex items-center justify-between px-1">
            <h2 className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">
              {group.label}
            </h2>
            <span className="text-[9px] text-slate-400">{group.tasks.length}</span>
          </div>
          <div className="surface-card divide-y divide-line/60 overflow-hidden">
            {group.tasks.map((task) => {
              const company = data.companies.find((item) => item.id === task.companyId);
              const assignees = data.team.filter((item) =>
                task.assigneeIds.includes(item.id),
              );
              const done = task.status === "done";
              const overdue = isOverdue(task);
              return (
                <div
                  key={task.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(task)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onOpen(task);
                    }
                  }}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2.5 px-3.5 py-2.5 transition hover:bg-slate-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-300/60 sm:gap-3",
                    done && "opacity-60",
                  )}
                >
                  {company ? (
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
                  )}

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
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
