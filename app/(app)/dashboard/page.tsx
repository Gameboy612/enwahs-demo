"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckSquare, Lock, Plus, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CompanyMark } from "@/components/ui/company-mark";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { TaskModal } from "@/components/domain/task-modal";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { isOverdue } from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type HomeFilter = "all" | "todo" | "doing" | "done" | "urgent" | "blocked";

export default function HomePage() {
  const { data } = useDemo();
  const { t, pick, dueLabel } = useI18n();
  const [filter, setFilter] = useState<HomeFilter>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const counts = {
    todo: data.tasks.filter((task) => task.status === "todo").length,
    doing: data.tasks.filter((task) => task.status === "doing").length,
    done: data.tasks.filter((task) => task.status === "done").length,
  };

  const tabs: { key: HomeFilter; label: string }[] = [
    { key: "all", label: t("common.all") },
    { key: "todo", label: t("status.todo") },
    { key: "doing", label: t("status.doing") },
    { key: "done", label: t("status.done") },
    { key: "urgent", label: t("tasks.urgent") },
    { key: "blocked", label: t("tasks.blocked") },
  ];

  const summary = [
    { key: "todo", label: t("status.todo"), value: counts.todo, dot: "bg-slate-300" },
    { key: "doing", label: t("status.doing"), value: counts.doing, dot: "bg-brand-500" },
    { key: "done", label: t("status.done"), value: counts.done, dot: "bg-teal-500" },
  ];

  const tasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.tasks
      .filter((task) => {
        if (filter === "todo") return task.status === "todo";
        if (filter === "doing") return task.status === "doing";
        if (filter === "done") return task.status === "done";
        if (filter === "urgent") return task.status !== "done" && (task.priority === "high" || isOverdue(task));
        if (filter === "blocked") return Boolean(task.blocked);
        return true;
      })
      .filter((task) => {
        if (!query) return true;
        const company = data.companies.find((item) => item.id === task.companyId);
        const assignee = data.team.find((item) => item.id === task.assigneeId);
        return [
          pick(task.title),
          company ? pick(company.name) : "",
          assignee ? pick(assignee.name) : "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (b.status === "done" && a.status !== "done") return -1;
        return a.due.localeCompare(b.due);
      });
  }, [data.companies, data.team, data.tasks, filter, pick, search]);

  const openTask = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PageHeader
        title={t("home.title")}
        actions={
          <Button onClick={() => {
            setEditingTask(null);
            setModalOpen(true);
          }} leftIcon={<Plus className="h-4 w-4" />}>
            {t("tasks.add")}
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-2.5">
        {summary.map((item) => (
          <div key={item.key} className="surface-card px-4 py-3">
            <div className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", item.dot)} />
              <span className="text-[10px] font-medium text-slate-400">{item.label}</span>
            </div>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink tabular-nums">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar" role="tablist" aria-label={t("home.title")}>
          {tabs.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-slate-400 hover:bg-slate-50 hover:text-ink",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("home.searchPlaceholder")}
          leftIcon={<Search className="h-3.5 w-3.5" />}
          aria-label={t("common.search")}
          containerClassName="sm:w-56"
          className="h-8 bg-white text-[11px]"
        />
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-5 w-5" />}
          title={t("tasks.empty")}
          action={
            <Button onClick={() => {
              setEditingTask(null);
              setModalOpen(true);
            }} leftIcon={<Plus className="h-4 w-4" />}>
              {t("tasks.add")}
            </Button>
          }
        />
      ) : (
        <div className="surface-card divide-y divide-line/60 overflow-hidden">
          {tasks.map((task) => {
            const company = data.companies.find((item) => item.id === task.companyId);
            const assignee = data.team.find((item) => item.id === task.assigneeId);
            const done = task.status === "done";
            const overdue = isOverdue(task);
            return (
              <div
                key={task.id}
                role="button"
                tabIndex={0}
                onClick={() => openTask(task)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openTask(task);
                  }
                }}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-4 py-3 transition hover:bg-slate-50/60",
                  done && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                    done
                      ? "border-teal-500 bg-teal-500 text-white"
                      : task.status === "doing"
                        ? "border-brand-400 bg-brand-50"
                        : "border-slate-300 bg-white",
                  )}
                  aria-hidden="true"
                >
                  {done && (
                    <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none">
                      <path d="M2 6.2 4.7 9 10 3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>

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
                      <Lock className="h-2.5 w-2.5 shrink-0 text-amber-500" aria-label={t("tasks.blocked")} />
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[9px] text-slate-400">
                    {company && (
                      <>
                        <CompanyMark company={company} size="xs" className="h-3.5 w-3.5 rounded-[4px] text-[6px]" />
                        <span className="truncate">{pick(company.shortName)}</span>
                      </>
                    )}
                  </span>
                </span>

                {assignee && <Avatar name={pick(assignee.name)} color={assignee.accent} size="xs" />}

                <span
                  className={cn(
                    "flex w-[70px] shrink-0 items-center justify-end gap-1 whitespace-nowrap text-[9px] sm:w-[84px] sm:text-[10px]",
                    done ? "text-slate-400" : overdue ? "text-red-500" : "text-slate-400",
                  )}
                >
                  <CalendarDays className="h-2.5 w-2.5" aria-hidden="true" />
                  {dueLabel(task.due, done)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
      />
    </div>
  );
}
