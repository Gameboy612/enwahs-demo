"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TaskCard } from "@/components/domain/task-card";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const columnTone: Record<TaskStatus, string> = {
  todo: "bg-slate-300",
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

  return (
    <div className="grid gap-3 md:grid-cols-3">
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
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setOver(null);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragging && dragging.status !== status) setTaskStatus(dragging.id, status);
              setDragging(null);
              setOver(null);
            }}
            className={cn(
              "flex min-h-[300px] flex-col rounded-xl border border-line bg-slate-50/50 p-2",
              over === status && "border-brand-300 bg-brand-50/40",
            )}
          >
            <div className="flex items-center gap-2 px-1.5 pb-2 pt-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", columnTone[status])} />
              <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {t(`status.${status}`)}
              </h3>
              <span className="text-[9px] text-slate-400">{list.length}</span>
              <button
                type="button"
                onClick={() => onCreate(status)}
                className="ml-auto rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-brand-600"
                aria-label={t("tasks.add")}
              >
                <Plus className="h-3 w-3" aria-hidden="true" />
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
                    "flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 text-[9px] text-slate-400",
                    over === status && "border-brand-300 text-brand-500",
                  )}
                >
                  {over === status ? t("tasks.dropHere") : ""}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
