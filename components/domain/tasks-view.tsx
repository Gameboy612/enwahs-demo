"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckSquare, LayoutGrid, List, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented";
import { TaskBoard } from "@/components/domain/task-board";
import {
  TaskFilterBar,
  defaultTaskFilters,
  type TaskFiltersState,
} from "@/components/domain/task-filters";
import { TaskAgenda } from "@/components/domain/task-agenda";
import { TaskModal } from "@/components/domain/task-modal";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { isDueToday, isOverdue, openTasks } from "@/lib/selectors";
import type { Task, TaskStatus } from "@/lib/types";

type ViewMode = "list" | "board";

export function TasksView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useDemo();
  const { t, pick } = useI18n();
  const [filters, setFilters] = useState<TaskFiltersState>(defaultTaskFilters);
  const [view, setView] = useState<ViewMode>("board");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>("todo");

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
        if (
          filters.assigneeId !== "all" &&
          !task.assigneeIds.includes(filters.assigneeId)
        ) {
          return false;
        }
        if (query) {
          const company = data.companies.find((item) => item.id === task.companyId);
          const assignees = data.team.filter((item) => task.assigneeIds.includes(item.id));
          const haystack = [
            pick(task.title),
            company ? pick(company.name) : "",
            ...assignees.map((assignee) => pick(assignee.name)),
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
  }, [data.companies, data.tasks, data.team, filters, pick]);

  const open = openTasks(data.tasks);
  const dueToday = open.filter(isDueToday).length;
  const overdue = open.filter(isOverdue).length;

  const openNew = (status: TaskStatus = "todo") => {
    setEditingTask(null);
    setInitialStatus(status);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("tasks.title")}
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
            <Button onClick={() => openNew("todo")} leftIcon={<Plus className="h-4 w-4" />}>
              {t("tasks.add")}
            </Button>
          </>
        }
      />

      <p className="text-[10px] text-slate-400">
        {open.length} {t("common.openTasks")} · {dueToday} {t("common.today")} ·{" "}
        {overdue} {t("common.overdue")}
      </p>

      <TaskFilterBar
        filters={filters}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        onClear={() => setFilters(defaultTaskFilters)}
        team={data.team}
        shown={filtered.length}
        total={data.tasks.length}
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
        <TaskAgenda
          tasks={filtered}
          onOpen={(item) => {
            setEditingTask(item);
            setModalOpen(true);
          }}
        />
      ) : (
        <TaskBoard
          tasks={filtered}
          onOpen={(item) => {
            setEditingTask(item);
            setModalOpen(true);
          }}
          onCreate={openNew}
        />
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
