"use client";

import { useMemo } from "react";
import { TaskItem } from "@/components/domain/task-item";
import { useI18n } from "@/lib/i18n";
import type { Task } from "@/lib/types";

type GroupKey = "overdue" | "today" | "tomorrow" | "week" | "later" | "done";

export function TaskAgenda({
  tasks,
  onOpen,
}: {
  tasks: Task[];
  onOpen: (task: Task) => void;
}) {
  const { t, daysFromToday } = useI18n();

  const groups = useMemo(() => {
    const bucketFor = (task: Task): GroupKey => {
      const diff = daysFromToday(task.due);
      if (task.status === "done" && diff < 0) return "done";
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
            {group.tasks.map((task) => (
              <TaskItem key={task.id} task={task} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
