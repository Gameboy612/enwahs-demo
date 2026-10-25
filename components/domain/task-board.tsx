"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskCard } from "@/components/domain/task-card";
import { Button } from "@/components/ui/button";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const columnTone: Record<TaskStatus, string> = {
  todo: "bg-slate-400",
  doing: "bg-brand-500",
  done: "bg-teal-500",
};

export function TaskBoard({
  tasks,
  onOpen,
  onCreate,
}: {
  tasks: Task[];
  onOpen: (task: Task) => void;
  onCreate: (status: TaskStatus) => void;
}) {
  const { setTaskStatus } = useDemo();
  const { t } = useI18n();
  const [dragging, setDragging] = useState<Task | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);

  const columns: TaskStatus[] = ["todo", "doing", "done"];

  const handleDrop = (status: TaskStatus) => {
    if (dragging && dragging.status !== status) {
      setTaskStatus(dragging.id, status);
    }
    setDragging(null);
    setOver(null);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((status) => {
        const list = tasks.filter((task) => task.status === status);
        return (
          <div
            key={status}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setOver(status);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                setOver(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              handleDrop(status);
            }}
            className={cn(
              "flex min-h-[320px] flex-col rounded-2xl border border-line bg-slate-50/60 p-2.5 transition",
              over === status && "border-brand-300 bg-brand-50/50 ring-2 ring-brand-100",
            )}
          >
            <div className="flex items-center justify-between gap-2 px-1.5 pb-2.5 pt-1">
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", columnTone[status])} />
                <h3 className="text-xs font-semibold text-ink">{t(`status.${status}`)}</h3>
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 ring-1 ring-line">
                  {list.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onCreate(status)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-white hover:text-brand-600"
                aria-label={t("tasks.add")}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {list.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onOpen={onOpen}
                  onDragStart={setDragging}
                  onDragEnd={() => {
                    setDragging(null);
                    setOver(null);
                  }}
                />
              ))}
              {list.length === 0 && (
                <div
                  className={cn(
                    "flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 px-3 py-8 text-center text-[10px] text-slate-400",
                    over === status && "border-brand-300 bg-white/70 text-brand-500",
                  )}
                >
                  {over === status ? t("tasks.dropHere") : t("dashboard.emptyTasks")}
                </div>
              )}
              {list.length > 0 && (
                <button
                  type="button"
                  onClick={() => onCreate(status)}
                  className="mt-0.5 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200 py-2 text-[10px] font-medium text-slate-400 transition hover:border-brand-200 hover:bg-white hover:text-brand-600"
                >
                  <Plus className="h-3 w-3" aria-hidden="true" />
                  {t("tasks.add")}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
