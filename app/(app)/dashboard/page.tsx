"use client";

import { useMemo, useState } from "react";
import {
  CircleCheck,
  CheckSquare,
  LayoutGrid,
  LoaderCircle,
  Pause,
  Plus,
  ScrollText,
  Search,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { TaskAgenda } from "@/components/domain/task-agenda";
import { TaskModal } from "@/components/domain/task-modal";
import { DEMO_TODAY } from "@/lib/constants";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { isOverdue } from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type HomeFilter = "all" | "todo" | "doing" | "done" | "urgent" | "blocked";
export default function HomePage() {
  const { data } = useDemo();
  const { t, pick, formatDate } = useI18n();
  const [filter, setFilter] = useState<HomeFilter>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const counts = {
    todo: data.tasks.filter((task) => task.status === "todo").length,
    doing: data.tasks.filter((task) => task.status === "doing").length,
    done: data.tasks.filter((task) => task.status === "done").length,
  };

  const tabs: { key: HomeFilter; label: string; icon: LucideIcon; tone: string }[] = [
    { key: "all", label: t("common.all"), icon: LayoutGrid, tone: "text-slate-400" },
    { key: "todo", label: t("status.todo"), icon: ScrollText, tone: "text-slate-400" },
    { key: "doing", label: t("status.doing"), icon: LoaderCircle, tone: "text-brand-600" },
    { key: "done", label: t("status.done"), icon: CircleCheck, tone: "text-teal-600" },
    { key: "urgent", label: t("tasks.urgent"), icon: TriangleAlert, tone: "text-red-500" },
    { key: "blocked", label: t("tasks.blocked"), icon: Pause, tone: "text-amber-500" },
  ];

  const summary = [
    {
      key: "todo",
      label: t("status.todo"),
      value: counts.todo,
      icon: ScrollText,
      tone: "bg-slate-100 text-slate-400",
    },
    {
      key: "doing",
      label: t("status.doing"),
      value: counts.doing,
      icon: LoaderCircle,
      tone: "bg-brand-50 text-brand-600",
    },
    {
      key: "done",
      label: t("status.done"),
      value: counts.done,
      icon: CircleCheck,
      tone: "bg-teal-50 text-teal-600",
    },
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
        const assignees = data.team.filter((item) => task.assigneeIds.includes(item.id));
        return [
          pick(task.title),
          company ? pick(company.name) : "",
          ...assignees.map((assignee) => pick(assignee.name)),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => a.due.localeCompare(b.due));
  }, [data.companies, data.team, data.tasks, filter, pick, search]);

  const openTask = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const createTask = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t("home.title")}
          </h1>
          <p className="mt-1 text-[10px] text-slate-400">
            {formatDate(DEMO_TODAY, "long")}
          </p>
        </div>
        <Button
          onClick={createTask}
          leftIcon={<Plus className="h-4 w-4" />}
          className="shrink-0"
        >
          {t("tasks.add")}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="surface-card px-3 py-4 sm:px-4 sm:py-5">
              <div className="flex items-center justify-between gap-1.5">
                <span className="whitespace-nowrap text-[10px] font-medium text-slate-400">
                  {item.label}
                </span>
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8", item.tone)}>
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex items-center gap-1 overflow-x-auto no-scrollbar"
          role="tablist"
          aria-label={t("home.title")}
        >
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
                  "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1.5 text-[10px] font-medium transition sm:gap-1.5 sm:px-3 sm:text-[11px]",
                  active
                    ? "bg-brand-600 text-white"
                    : "text-slate-400 hover:bg-slate-50 hover:text-ink",
                )}
              >
                <tab.icon
                  className={cn("h-3 w-3", active ? "text-white" : tab.tone)}
                  aria-hidden="true"
                />
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
            <Button onClick={createTask} leftIcon={<Plus className="h-4 w-4" />}>
              {t("tasks.add")}
            </Button>
          }
        />
      ) : (
        <TaskAgenda tasks={tasks} onOpen={openTask} />
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
