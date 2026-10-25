"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarClock,
  CheckSquare,
  Plus,
  Sparkles,
  Timer,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CompanyMark } from "@/components/ui/company-mark";
import { ChannelIcon } from "@/components/ui/channel-icon";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { TaskModal } from "@/components/domain/task-modal";
import { CompanyFormModal } from "@/components/domain/company-form-modal";
import { useAuth } from "@/lib/auth";
import { DEMO_TODAY } from "@/lib/constants";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import {
  averageResponse,
  companyStats,
  isDueToday,
  isOverdue,
  openTasks,
  priorityQueue,
} from "@/lib/selectors";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { data } = useDemo();
  const { session } = useAuth();
  const { t, pick, formatDate, dueLabel } = useI18n();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);

  const member = data.team.find((person) => person.id === session?.memberId) ?? data.team[0];
  const stats = companyStats(data.tasks, data.companies);
  const open = openTasks(data.tasks);
  const dueToday = open.filter(isDueToday);
  const overdue = open.filter(isOverdue);
  const avgResponse = averageResponse(data.threads);
  const queue = priorityQueue(data.tasks, data.companies, 5);

  const upcoming = useMemo(
    () =>
      open
        .filter((task) => task.due >= DEMO_TODAY)
        .sort((a, b) => a.due.localeCompare(b.due))
        .slice(0, 4),
    [open],
  );

  const recentThreads = useMemo(
    () =>
      [...data.threads]
        .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
        .slice(0, 3),
    [data.threads],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard.greetingMorning", { name: pick(member.name) })}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setCompanyModalOpen(true)}
              leftIcon={<Building2 className="h-4 w-4" />}
            >
              {t("dashboard.addCompany")}
            </Button>
            <Button
              onClick={() => setTaskModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t("dashboard.newTask")}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <StatCard
          label={t("dashboard.kpi.openTasks")}
          value={open.length}
          icon={<CheckSquare className="h-4 w-4" />}
          tone="brand"
        />
        <StatCard
          label={t("dashboard.kpi.dueToday")}
          value={dueToday.length}
          hint={overdue.length ? `${overdue.length} ${t("common.overdue")}` : undefined}
          icon={<CalendarClock className="h-4 w-4" />}
          tone="gold"
        />
        <StatCard
          label={t("dashboard.kpi.atRisk")}
          value={stats.atRisk}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="red"
        />
        <StatCard
          label={t("dashboard.kpi.avgResponse")}
          value={`${avgResponse} ${t("dashboard.kpi.minutes")}`}
          icon={<Timer className="h-4 w-4" />}
          tone="teal"
        />
      </div>

      <section className="surface-card p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
            {t("dashboard.aiBrief")}
          </span>
          <Link
            href="/inbox/"
            className="inline-flex items-center gap-1 text-[10px] font-medium text-brand-600 hover:text-brand-800"
          >
            {t("dashboard.openInbox")}
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {[t("dashboard.brief1"), t("dashboard.brief2"), t("dashboard.brief3")].map(
            (item) => (
              <p
                key={item}
                className="rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] leading-snug text-slate-600"
              >
                {item}
              </p>
            ),
          )}
        </div>
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-3">
        <section className="surface-card xl:col-span-2">
          <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
            <h2 className="text-xs font-semibold text-ink">{t("dashboard.priorityTasks")}</h2>
            <Link
              href="/tasks/"
              className="text-[10px] font-medium text-brand-600 hover:text-brand-800"
            >
              {t("dashboard.viewTasks")}
            </Link>
          </div>
          <div className="divide-y divide-line/60">
            {queue.map((task) => {
              const company = data.companies.find((item) => item.id === task.companyId);
              const assignee = data.team.find((item) => item.id === task.assigneeId);
              const late = isOverdue(task);
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => router.push(`/tasks/?task=${encodeURIComponent(task.id)}`)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50/60"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      task.priority === "high"
                        ? "bg-red-500"
                        : task.priority === "medium"
                          ? "bg-gold-500"
                          : "bg-slate-300",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-medium text-ink">
                      {pick(task.title)}
                    </span>
                    {company && (
                      <span className="mt-0.5 flex items-center gap-1.5 text-[9px] text-slate-400">
                        <CompanyMark
                          company={company}
                          size="xs"
                          className="h-3.5 w-3.5 rounded-[4px] text-[6px]"
                        />
                        {pick(company.shortName)}
                      </span>
                    )}
                  </span>
                  {assignee && (
                    <Avatar name={pick(assignee.name)} color={assignee.accent} size="xs" />
                  )}
                  <span
                    className={cn(
                      "w-[72px] shrink-0 text-right text-[10px]",
                      late ? "text-red-500" : "text-slate-400",
                    )}
                  >
                    {dueLabel(task.due)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="min-w-0 space-y-4">
          <section className="surface-card">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-xs font-semibold text-ink">
                {t("dashboard.upcomingDeadlines")}
              </h2>
              <span className="text-[9px] text-slate-400">{t("dashboard.thisWeek")}</span>
            </div>
            <div className="space-y-1 px-3 pb-3">
              {upcoming.map((task) => {
                const company = data.companies.find((item) => item.id === task.companyId);
                return (
                  <Link
                    key={task.id}
                    href={`/tasks/?task=${encodeURIComponent(task.id)}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                  >
                    <span className="w-12 shrink-0 text-[9px] text-slate-400">
                      {formatDate(task.due, "short")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10.5px] font-medium text-ink">
                        {pick(task.title)}
                      </span>
                      <span className="block truncate text-[9px] text-slate-400">
                        {company ? pick(company.shortName) : ""}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="surface-card">
            <div className="flex items-center justify-between px-5 py-4">
              <h2 className="text-xs font-semibold text-ink">
                {t("dashboard.recentConversations")}
              </h2>
              <Link href="/inbox/" className="text-[9px] text-slate-400 hover:text-brand-600">
                {t("common.viewAll")}
              </Link>
            </div>
            <div className="space-y-1 px-3 pb-3">
              {recentThreads.map((thread) => {
                const company = data.companies.find((item) => item.id === thread.companyId);
                return (
                  <Link
                    key={thread.id}
                    href={`/inbox/?thread=${encodeURIComponent(thread.id)}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                  >
                    {company && <CompanyMark company={company} size="sm" />}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[10.5px] font-medium text-ink">
                          {company ? pick(company.shortName) : pick(thread.groupName)}
                        </span>
                        <ChannelIcon channel={thread.channel} size={10} />
                        {thread.unread > 0 && (
                          <span className="ml-auto text-[9px] font-medium text-teal-600">
                            {thread.unread}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[9px] text-slate-400">
                        {thread.messages[thread.messages.length - 1]
                          ? pick(thread.messages[thread.messages.length - 1].text)
                          : ""}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} />
      <CompanyFormModal
        open={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        onCreated={(company) => {
          router.push(`/companies/detail/?id=${encodeURIComponent(company.id)}`);
        }}
      />
    </div>
  );
}
