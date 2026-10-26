"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { CompanyCard } from "@/components/domain/company-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { TaskAgenda } from "@/components/domain/task-agenda";
import { TaskModal } from "@/components/domain/task-modal";
import { DEMO_TODAY } from "@/lib/constants";
import { useAuth } from "@/lib/auth";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { isOverdue, nextDeadline, visibleCompanies } from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type HomeFilter = "all" | "todo" | "doing" | "done" | "urgent" | "blocked";
export default function HomePage() {
  const { data } = useDemo();
  const { session } = useAuth();
  const { t, pick, formatDate } = useI18n();
  const [filter, setFilter] = useState<HomeFilter>("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const tabs: { key: HomeFilter; label: string; icon: LucideIcon; tone: string }[] = [
    { key: "all", label: t("common.all"), icon: LayoutGrid, tone: "text-slate-400" },
    { key: "todo", label: t("status.todo"), icon: ScrollText, tone: "text-slate-900" },
    { key: "doing", label: t("status.doing"), icon: LoaderCircle, tone: "text-amber-500" },
    { key: "done", label: t("status.done"), icon: CircleCheck, tone: "text-slate-400" },
    { key: "urgent", label: t("tasks.urgent"), icon: TriangleAlert, tone: "text-red-500" },
    { key: "blocked", label: t("tasks.blocked"), icon: Pause, tone: "text-amber-500" },
  ];

  const member = data.team.find((person) => person.id === session?.memberId);
  const companies = useMemo(
    () => visibleCompanies(data.companies, member),
    [data.companies, member],
  );
  const companyCards = useMemo(
    () =>
      companies
        .map((company) => ({ company, next: nextDeadline(data.tasks, company.id) }))
        .sort((a, b) => {
          if (!a.next && !b.next) return 0;
          if (!a.next) return 1;
          if (!b.next) return -1;
          return a.next.due.localeCompare(b.next.due);
        }),
    [companies, data.tasks],
  );
  const accessibleCompanyIds = useMemo(
    () => new Set(companies.map((company) => company.id)),
    [companies],
  );

  const tasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.tasks
      .filter((task) => accessibleCompanyIds.has(task.companyId))
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
  }, [accessibleCompanyIds, data.companies, data.team, data.tasks, filter, pick, search]);

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
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {formatDate(DEMO_TODAY, "long")}
        </h1>
        <Button
          onClick={createTask}
          leftIcon={<Plus className="h-4 w-4" />}
          className="shrink-0"
        >
          {t("tasks.add")}
        </Button>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <h2 className="text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">
            {t("home.companyTracker")}
          </h2>
          <Link
            href="/companies/"
            className="text-[9px] font-medium text-brand-600 transition hover:text-brand-800"
          >
            {t("home.viewAllCompanies")}
          </Link>
        </div>
        {companyCards.length === 0 ? (
          <p className="surface-card px-3 py-4 text-[10px] text-slate-400">
            {t("companies.empty")}
          </p>
        ) : (
          <div className="-mx-4 overflow-x-auto px-4 pb-2 scrollbar-thin sm:mx-0 sm:px-0">
            <div className="flex w-max snap-x snap-mandatory gap-3">
              {companyCards.map(({ company }) => (
                <div
                  key={company.id}
                  className="w-[78vw] max-w-[300px] shrink-0 snap-start sm:w-[300px]"
                >
                  <CompanyCard company={company} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

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
          containerClassName="sm:w-72"
          className="h-9 bg-white text-[11px]"
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
