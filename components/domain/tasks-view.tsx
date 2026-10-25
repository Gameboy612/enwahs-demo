"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarClock, CheckCircle2, CheckSquare, LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented";
import { TaskBoard } from "@/components/domain/task-board";
import { TaskFilterBar, defaultTaskFilters, type TaskFiltersState } from "@/components/domain/task-filters";
import { TaskModal } from "@/components/domain/task-modal";
import { TaskRow } from "@/components/domain/task-row";
import { useAuth } from "@/lib/auth";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import {
  isDueThisWeek,
  isDueToday,
  isOverdue,
  isOpen,
  openTasks,
} from "@/lib/selectors";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "board";

export function TasksView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useDemo();
  const { session } = useAuth();
  const { t, pick, formatNumber } = useI18n();
  const [filters, setFilters] = useState<TaskFiltersState>(defaultTaskFilters);
  const [view, setView] = useState<ViewMode>("list");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>("todo");
  const currentMemberId = session?.memberId ?? data.team[0]?.id ?? "";

  const queryTaskId = searchParams.get("task");
  const queryAssignee = searchParams.get("assignee");

  useEffect(() => {
    if (queryAssignee && data.team.some((member) => member.id === queryAssignee)) {
      setFilters((current) => ({ ...current, assigneeId: queryAssignee }));
    }
  }, [data.team, queryAssignee]);

  useEffect(() => {
    if (!queryTaskId) return;
    const task = data.tasks.find((item) => item.id === queryTaskId);
    if (task) {
      setEditingTask(task);
      setModalOpen(true);
      router.replace("/tasks/", { scroll: false });
    }
  }, [data.tasks, queryTaskId, router]);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return data.tasks
      .filter((task) => {
        if (filters.status !== "all" && task.status !== filters.status) return false;
        if (filters.priority !== "all" && task.priority !== filters.priority) return false;
        if (filters.assigneeId !== "all" && task.assigneeId !== filters.assigneeId) return false;
        if (filters.companyId !== "all" && task.companyId !== filters.companyId) return false;
        if (filters.channel !== "all" && task.channel !== filters.channel) return false;
        if (filters.quick === "mine" && task.assigneeId !== currentMemberId) return false;
        if (filters.quick === "overdue" && !isOverdue(task)) return false;
        if (filters.quick === "high" && task.priority !== "high") return false;
        if (filters.quick === "week" && !isDueThisWeek(task)) return false;
        if (query) {
          const company = data.companies.find((item) => item.id === task.companyId);
          const assignee = data.team.find((item) => item.id === task.assigneeId);
          const haystack = [
            pick(task.title),
            pick(task.description),
            company ? pick(company.name) : "",
            assignee ? pick(assignee.name) : "",
            ...task.tags.map((tag) => pick(tag)),
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (b.status === "done" && a.status !== "done") return -1;
        if (a.due !== b.due) return a.due.localeCompare(b.due);
        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority];
      });
  }, [currentMemberId, data.companies, data.tasks, data.team, filters, pick]);

  const open = openTasks(data.tasks);
  const summary = [
    {
      label: t("tasks.allTasks"),
      value: open.length,
      icon: CheckSquare,
      tone: "text-brand-600 bg-brand-50",
    },
    {
      label: t("common.dueToday"),
      value: open.filter(isDueToday).length,
      icon: CalendarClock,
      tone: "text-gold-600 bg-gold-50",
    },
    {
      label: t("common.overdue"),
      value: open.filter(isOverdue).length,
      icon: CalendarClock,
      tone: "text-red-600 bg-red-50",
    },
    {
      label: t("status.done"),
      value: data.tasks.filter((task) => task.status === "done").length,
      icon: CheckCircle2,
      tone: "text-teal-600 bg-teal-50",
    },
  ];

  const openNew = (status: TaskStatus = "todo") => {
    setEditingTask(null);
    setInitialStatus(status);
    setModalOpen(true);
  };

  const openTask = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("nav.workspace")}
        title={t("tasks.title")}
        description={t("tasks.subtitle")}
        actions={
          <>
            <SegmentedControl
              options={[
                { value: "list", label: t("tasks.list"), icon: <List className="h-3.5 w-3.5" /> },
                { value: "board", label: t("tasks.board"), icon: <LayoutGrid className="h-3.5 w-3.5" /> },
              ]}
              value={view}
              onChange={setView}
              ariaLabel={t("tasks.title")}
            />
            <Button
              onClick={() => openNew("todo")}
              leftIcon={<Plus className="h-4 w-4" />}
              size="md"
            >
              {t("tasks.add")}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3 shadow-card"
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  item.tone,
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                  {item.label}
                </p>
                <p className="text-lg font-semibold leading-tight text-ink tabular-nums">
                  {formatNumber(item.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <TaskFilterBar
        filters={filters}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        onClear={() => setFilters(defaultTaskFilters)}
        team={data.team}
        companies={data.companies}
        shown={filtered.length}
        total={data.tasks.length}
        currentMemberId={currentMemberId}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-5 w-5" />}
          title={t("tasks.empty")}
          description={t("tasks.emptyHint")}
          action={
            <Button onClick={() => openNew("todo")} leftIcon={<Plus className="h-4 w-4" />}>
              {t("tasks.add")}
            </Button>
          }
        />
      ) : view === "list" ? (
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskRow key={task.id} task={task} onOpen={openTask} />
          ))}
        </div>
      ) : (
        <div>
          <p className="mb-2 text-[10px] text-slate-400">{t("tasks.boardHint")}</p>
          <TaskBoard tasks={filtered} onOpen={openTask} onCreate={openNew} />
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        initialStatus={initialStatus}
      />
    </div>
  );
}
