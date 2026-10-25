"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckSquare,
  ChevronRight,
  Clock3,
  Inbox,
  MessageSquare,
  Plus,
  Sparkles,
  Timer,
  TrendingUp,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CompanyMark } from "@/components/ui/company-mark";
import { ChannelIcon } from "@/components/ui/channel-icon";
import { DonutChart, StackedBarChart } from "@/components/ui/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { TaskModal } from "@/components/domain/task-modal";
import { CompanyFormModal } from "@/components/domain/company-form-modal";
import { CompanyStatusBadge, RiskBadge } from "@/components/domain/badges";
import { weeklyVolume } from "@/data/analytics";
import { useAuth } from "@/lib/auth";
import { useDemo } from "@/lib/demo-store";
import { DEMO_TODAY } from "@/lib/constants";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import {
  averageResponse,
  companyStats,
  healthBand,
  isDueToday,
  isOverdue,
  openTasks,
  priorityQueue,
  statusCounts,
} from "@/lib/selectors";
import { cn } from "@/lib/utils";

const healthTone = {
  healthy: "bg-teal-500",
  watch: "bg-gold-500",
  risk: "bg-red-500",
};

export default function DashboardPage() {
  const router = useRouter();
  const { data } = useDemo();
  const { session } = useAuth();
  const { t, pick, formatDate, formatNumber, dueLabel } = useI18n();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);

  const member = data.team.find((person) => person.id === session?.memberId) ?? data.team[0];
  const stats = companyStats(data.tasks, data.companies);
  const open = openTasks(data.tasks);
  const dueToday = open.filter(isDueToday);
  const overdue = open.filter(isOverdue);
  const pipeline = statusCounts(data.tasks);
  const avgResponse = averageResponse(data.threads);
  const queue = priorityQueue(data.tasks, data.companies, 5);

  const donutData = [
    { label: t("status.todo"), value: pipeline.todo, color: "#94a3b8" },
    { label: t("status.doing"), value: pipeline.doing, color: "#1a5f7a" },
    { label: t("status.done"), value: pipeline.done, color: "#159895" },
  ];

  const recentThreads = useMemo(
    () =>
      [...data.threads]
        .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
        .slice(0, 3),
    [data.threads],
  );

  const atRiskCompanies = useMemo(
    () => [...data.companies].sort((a, b) => a.healthScore - b.healthScore).slice(0, 4),
    [data.companies],
  );

  const upcoming = useMemo(
    () =>
      open
        .filter((task) => task.due >= DEMO_TODAY)
        .sort((a, b) => a.due.localeCompare(b.due))
        .slice(0, 4),
    [open],
  );

  return (
    <div className="space-y-5">
      {bannerOpen && (
        <div className="relative overflow-hidden rounded-2xl border border-brand-800/20 bg-brand-950 px-4 py-3 text-white shadow-card">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(87,197,182,0.22),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(201,162,39,0.18),transparent_30%)]" />
          <div className="relative flex items-center gap-3">
            <Sparkles className="h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
            <p className="text-[11px] font-medium text-white/75">
              {t("dashboard.demoBanner")}{" "}
              <span className="text-white/45">{t("app.fictional")}</span>
            </p>
            <button
              type="button"
              onClick={() => setBannerOpen(false)}
              className="ml-auto rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
              aria-label={t("dashboard.dismiss")}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <PageHeader
        eyebrow={formatDate(DEMO_TODAY, "long")}
        title={t("dashboard.greetingMorning", { name: pick(member.name) })}
        description={t("dashboard.subtitle")}
        actions={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCompanyModalOpen(true)}
              leftIcon={<Building2 className="h-4 w-4" />}
            >
              {t("dashboard.addCompany")}
            </Button>
            <Button
              size="md"
              onClick={() => setTaskModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t("dashboard.newTask")}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("dashboard.kpi.openTasks")}
          value={formatNumber(open.length)}
          hint={t("dashboard.kpi.openHint", { count: stats.active + stats.onboarding })}
          icon={<CheckSquare className="h-4 w-4" />}
          tone="brand"
          trend={{ direction: "down", value: "-8%", good: true }}
        />
        <StatCard
          label={t("dashboard.kpi.dueToday")}
          value={formatNumber(dueToday.length)}
          hint={t("dashboard.kpi.dueHint", { count: overdue.length })}
          icon={<CalendarClock className="h-4 w-4" />}
          tone="gold"
        />
        <StatCard
          label={t("dashboard.kpi.atRisk")}
          value={formatNumber(stats.atRisk)}
          hint={t("dashboard.kpi.riskHint")}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone="red"
          trend={{ direction: "flat", value: "2", good: false }}
        />
        <StatCard
          label={t("dashboard.kpi.avgResponse")}
          value={
            <>
              {avgResponse}
              <span className="text-sm font-medium text-slate-400">
                {" "}
                {t("dashboard.kpi.minutes")}
              </span>
            </>
          }
          hint={t("dashboard.kpi.responseHint")}
          icon={<Timer className="h-4 w-4" />}
          tone="teal"
          trend={{ direction: "down", value: "-6 min", good: true }}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <section className="relative overflow-hidden rounded-2xl border border-brand-800/20 bg-gradient-to-br from-brand-950 via-brand-800 to-teal-800 p-5 text-white shadow-card sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-gold-400/15 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/70">
                  <Sparkles className="h-3 w-3 text-gold-300" aria-hidden="true" />
                  {t("dashboard.aiBrief")}
                </span>
                <h2 className="mt-2.5 text-lg font-semibold tracking-tight sm:text-xl">
                  {t("dashboard.aiBriefHeadline")}
                </h2>
                <p className="mt-1 text-[11px] text-white/50">
                  {t("dashboard.aiBriefSub", { count: data.threads.length })}
                </p>
              </div>
              <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 sm:flex">
                <TrendingUp className="h-5 w-5 text-teal-300" aria-hidden="true" />
              </span>
            </div>
            <div className="relative mt-4 space-y-2">
              {[
                t("dashboard.aiBriefItem1"),
                t("dashboard.aiBriefItem2"),
                t("dashboard.aiBriefItem3"),
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-brand-950/20 px-3 py-2.5"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                      index === 0
                        ? "bg-gold-300/20 text-gold-200"
                        : "bg-teal-300/20 text-teal-200",
                    )}
                  >
                    {index + 1}
                  </span>
                  <p className="text-[11px] leading-relaxed text-white/70">{item}</p>
                </div>
              ))}
            </div>
            <div className="relative mt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/inbox/"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] font-semibold text-brand-800 transition hover:bg-teal-50"
              >
                {t("dashboard.aiBriefCta")}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <span className="text-[10px] text-white/40">{t("inbox.demoNotice")}</span>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-[13px] font-semibold text-ink">{t("dashboard.pipeline")}</h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {t("dashboard.pipelineSub", {
                      open: open.length,
                      done: pipeline.done,
                    })}
                  </p>
                </div>
                <Link
                  href="/tasks/"
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-brand-600"
                  aria-label={t("dashboard.viewTasks")}
                >
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </CardHeader>
              <CardContent className="flex items-center gap-5 pb-4">
                <DonutChart
                  data={donutData}
                  size={132}
                  thickness={14}
                  centerValue={open.length}
                  centerLabel={t("dashboard.kpi.openTasks")}
                />
                <div className="flex-1 space-y-2.5">
                  {donutData.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.label}
                        </span>
                        <span className="font-semibold text-ink tabular-nums">
                          {item.value}
                        </span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round((item.value / Math.max(data.tasks.length, 1)) * 100)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-[13px] font-semibold text-ink">
                    {t("dashboard.weeklyVolume")}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {t("dashboard.weeklyVolumeSub")}
                  </p>
                </div>
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-semibold text-teal-700">
                  +12%
                </span>
              </CardHeader>
              <CardContent className="pb-4">
                <StackedBarChart
                  data={weeklyVolume.map((point) => ({
                    label: t(`day.${point.day}` as TranslationKey),
                    values: {
                      whatsapp: point.whatsapp,
                      wechat: point.wechat,
                      email: point.email,
                    },
                  }))}
                  series={[
                    { key: "whatsapp", label: t("channel.whatsapp"), color: "#25D366" },
                    { key: "wechat", label: t("channel.wechat"), color: "#07C160" },
                    { key: "email", label: t("channel.email"), color: "#94a3b8" },
                  ]}
                  height={124}
                  valueFormatter={(value) => formatNumber(value)}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("dashboard.priorityTasks")}
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {t("dashboard.priorityTasksSub")}
                </p>
              </div>
              <Link
                href="/tasks/"
                className="text-[10px] font-semibold text-brand-600 hover:text-brand-800"
              >
                {t("dashboard.viewTasks")}
              </Link>
            </CardHeader>
            <div className="divide-y divide-line/70">
              {queue.map((task) => {
                const company = data.companies.find((item) => item.id === task.companyId);
                const assignee = data.team.find((item) => item.id === task.assigneeId);
                const late = isOverdue(task);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => router.push(`/tasks/?task=${encodeURIComponent(task.id)}`)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50/70"
                  >
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
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
                      <span className="mt-0.5 flex items-center gap-2 text-[9.5px] text-slate-400">
                        {company && (
                          <>
                            <CompanyMark
                              company={company}
                              size="xs"
                              className="h-3.5 w-3.5 rounded-[4px] text-[6px]"
                            />
                            <span className="truncate">{pick(company.shortName)}</span>
                          </>
                        )}
                        <ChannelIcon channel={task.channel} size={10} />
                      </span>
                    </span>
                    {assignee && (
                      <Avatar name={pick(assignee.name)} color={assignee.accent} size="xs" />
                    )}
                    <span
                      className={cn(
                        "hidden w-[92px] shrink-0 text-right text-[10px] font-medium sm:block",
                        late ? "text-red-600" : "text-slate-500",
                      )}
                    >
                      {dueLabel(task.due)}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                  </button>
                );
              })}
              {queue.length === 0 && (
                <p className="px-5 py-8 text-center text-xs text-slate-400">
                  {t("dashboard.emptyTasks")}
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-ink">
                {t("dashboard.quickActions")}
              </h3>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 pt-3">
              <QuickAction
                icon={<Plus className="h-4 w-4" />}
                label={t("dashboard.newTask")}
                onClick={() => setTaskModalOpen(true)}
              />
              <QuickAction
                icon={<Building2 className="h-4 w-4" />}
                label={t("dashboard.addCompany")}
                onClick={() => setCompanyModalOpen(true)}
              />
              <QuickAction
                icon={<Inbox className="h-4 w-4" />}
                label={t("dashboard.openInbox")}
                href="/inbox/"
              />
              <QuickAction
                icon={<MessageSquare className="h-4 w-4" />}
                label={t("nav.team")}
                href="/team/"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("dashboard.upcomingDeadlines")}
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {t("dashboard.thisWeek")}
                </p>
              </div>
              <Clock3 className="h-4 w-4 text-gold-500" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-2 pt-3">
              {upcoming.map((task) => {
                const company = data.companies.find((item) => item.id === task.companyId);
                return (
                  <Link
                    key={task.id}
                    href={`/tasks/?task=${encodeURIComponent(task.id)}`}
                    className="flex items-center gap-3 rounded-xl border border-line/70 px-3 py-2 transition hover:border-brand-200 hover:bg-brand-50/30"
                  >
                    <span className="flex h-9 min-w-[64px] shrink-0 items-center justify-center rounded-lg bg-slate-50 px-2 text-[9px] font-semibold text-slate-500 ring-1 ring-line">
                      {formatDate(task.due, "short")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium text-ink">
                        {pick(task.title)}
                      </span>
                      <span className="block truncate text-[9px] text-slate-400">
                        {company ? pick(company.shortName) : ""} · {dueLabel(task.due)}
                      </span>
                    </span>
                  </Link>
                );
              })}
              {upcoming.length === 0 && (
                <p className="py-4 text-center text-[10px] text-slate-400">
                  {t("dashboard.emptyTasks")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("dashboard.recentConversations")}
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {t("dashboard.recentConversationsSub")}
                </p>
              </div>
              <Link
                href="/inbox/"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-brand-600"
                aria-label={t("dashboard.viewInbox")}
              >
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardHeader>
            <CardContent className="space-y-2 pt-3">
              {recentThreads.map((thread) => {
                const company = data.companies.find((item) => item.id === thread.companyId);
                const last = thread.messages[thread.messages.length - 1];
                return (
                  <Link
                    key={thread.id}
                    href={`/inbox/?thread=${encodeURIComponent(thread.id)}`}
                    className="flex items-start gap-2.5 rounded-xl border border-line/70 px-3 py-2.5 transition hover:border-brand-200 hover:bg-brand-50/30"
                  >
                    {company && <CompanyMark company={company} size="sm" />}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[11px] font-semibold text-ink">
                          {company ? pick(company.shortName) : pick(thread.groupName)}
                        </span>
                        <ChannelIcon channel={thread.channel} size={11} />
                        {thread.unread > 0 && (
                          <span className="ml-auto flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-teal-500 px-1 text-[8px] font-bold text-white">
                            {thread.unread}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[9.5px] text-slate-400">
                        {last ? pick(last.text) : ""}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("dashboard.companyHealth")}
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {t("dashboard.companyHealthSub")}
                </p>
              </div>
              <Link
                href="/companies/"
                className="text-[10px] font-semibold text-brand-600 hover:text-brand-800"
              >
                {t("common.viewAll")}
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              {atRiskCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/detail/?id=${encodeURIComponent(company.id)}`}
                  className="group flex items-center gap-2.5"
                >
                  <CompanyMark company={company} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[11px] font-medium text-ink group-hover:text-brand-700">
                        {pick(company.shortName)}
                      </span>
                      <CompanyStatusBadge status={company.status} />
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            healthTone[healthBand(company.healthScore)],
                          )}
                          style={{ width: `${company.healthScore}%` }}
                        />
                      </span>
                      <span className="text-[9px] font-semibold text-slate-500 tabular-nums">
                        {company.healthScore}
                      </span>
                    </span>
                  </span>
                </Link>
              ))}
              <div className="border-t border-line/70 pt-2">
                <Link
                  href="/companies/"
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-800"
                >
                  {t("dashboard.viewCompanies")}
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            </CardContent>
          </Card>
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

function QuickAction({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-left text-[10.5px] font-medium text-slate-600 transition hover:border-brand-200 hover:bg-brand-50/40 hover:text-brand-700";
  if (href) {
    return (
      <Link href={href} className={className}>
        <span className="text-brand-500">{icon}</span>
        <span className="truncate">{label}</span>
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      <span className="text-brand-500">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
