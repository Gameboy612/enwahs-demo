"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Globe2,
  Hash,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Send,
  Sparkles,
  StickyNote,
  UserRound,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CompanyMark } from "@/components/ui/company-mark";
import { DonutChart } from "@/components/ui/charts";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/input";
import { ChannelIcon } from "@/components/ui/channel-icon";
import {
  CompanyStatusBadge,
  RiskBadge,
  ServiceBadge,
  TaskStatusBadge,
} from "@/components/domain/badges";
import { CompanyFormModal } from "@/components/domain/company-form-modal";
import { TaskModal } from "@/components/domain/task-modal";
import { TaskRow } from "@/components/domain/task-row";
import { useAuth } from "@/lib/auth";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import {
  healthBand,
  nextDeadline,
  visibleTaskForCompany,
} from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Tab = "overview" | "tasks" | "activity" | "notes";

const healthTone = {
  healthy: "bg-teal-500",
  watch: "bg-gold-500",
  risk: "bg-red-500",
};

export function CompanyDetailView() {
  const searchParams = useSearchParams();
  const { data, hydrated, addNote } = useDemo();
  const { session } = useAuth();
  const { t, pick, formatDate, formatNumber, dueLabel } = useI18n();
  const { toast } = useToast();
  const id = searchParams.get("id") ?? "";
  const company = data.companies.find((item) => item.id === id);
  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [note, setNote] = useState("");

  const member = data.team.find((person) => person.id === session?.memberId) ?? data.team[0];
  const companyTasks = company
    ? visibleTaskForCompany(data.tasks, company.id)
    : { open: [], done: [], all: [] };
  const deadline = company ? nextDeadline(data.tasks, company.id) : undefined;
  const thread = data.threads.find((item) => item.companyId === company?.id);

  const activity = useMemo(() => {
    if (!company) return [];
    const events: { id: string; at: string; kind: "note" | "task" | "message"; text: string }[] = [
      ...company.notes.map((item) => ({
        id: `note-${item.id}`,
        at: item.at,
        kind: "note" as const,
        text: pick(item.text),
      })),
      ...data.tasks
        .filter((task) => task.companyId === company.id)
        .map((task) => ({
          id: `task-${task.id}`,
          at: task.createdAt,
          kind: "task" as const,
          text: pick(task.title),
        })),
    ];
    if (thread) {
      const last = thread.messages[thread.messages.length - 1];
      if (last) {
        events.push({
          id: `thread-${thread.id}`,
          at: last.at,
          kind: "message" as const,
          text: pick(thread.groupName),
        });
      }
    }
    return events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 8);
  }, [company, data.tasks, pick, thread]);

  if (!hydrated) {
    return (
      <div className="surface-card">
        <PageLoader />
      </div>
    );
  }

  if (!company) {
    return (
      <EmptyState
        icon={<Building2 className="h-5 w-5" />}
        title={t("companies.notFound")}
        description={t("companies.notFoundHint")}
        action={
          <Link href="/companies/">
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              {t("companies.back")}
            </Button>
          </Link>
        }
      />
    );
  }

  const band = healthBand(company.healthScore);
  const tabItems: { value: Tab; label: string; count?: number }[] = [
    { value: "overview", label: t("companies.tabs.overview") },
    { value: "tasks", label: t("companies.tabs.tasks"), count: companyTasks.all.length },
    { value: "activity", label: t("companies.tabs.activity") },
    { value: "notes", label: t("companies.tabs.notes"), count: company.notes.length },
  ];

  const submitNote = () => {
    if (!note.trim()) return;
    addNote(company.id, note.trim(), member.id);
    setNote("");
    toast(t("toast.noteAdded"));
  };

  return (
    <div className="space-y-5">
      <Link
        href="/companies/"
        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        {t("companies.back")}
      </Link>

      <div className="surface-card overflow-hidden">
        <div className="relative overflow-hidden border-b border-line bg-gradient-to-r from-brand-950 via-brand-800 to-teal-800 px-5 py-5 text-white sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(201,162,39,0.18),transparent_30%),radial-gradient(circle_at_15%_90%,rgba(87,197,182,0.18),transparent_35%)]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <CompanyMark company={company} size="xl" className="ring-2 ring-white/20" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {pick(company.name)}
                  </h1>
                  <CompanyStatusBadge status={company.status} />
                  <RiskBadge risk={company.risk} />
                </div>
                <p className="mt-1 text-[11px] text-white/55">
                  {pick(company.industry)} · {t("common.since")} {company.since}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {company.services.map((service) => (
                    <ServiceBadge
                      key={service}
                      service={service}
                      className="border-white/10 bg-white/10 text-white/75 ring-white/10"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {thread && (
                <Link href={`/inbox/?thread=${encodeURIComponent(thread.id)}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                    leftIcon={<MessageSquare className="h-3.5 w-3.5" />}
                  >
                    {t("companies.viewInbox")}
                  </Button>
                </Link>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                onClick={() => setEditOpen(true)}
                leftIcon={<Pencil className="h-3.5 w-3.5" />}
              >
                {t("common.edit")}
              </Button>
              <Button
                size="sm"
                className="bg-white text-brand-800 hover:bg-teal-50"
                onClick={() => {
                  setEditingTask(null);
                  setTaskOpen(true);
                }}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                {t("tasks.add")}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <HeaderStat
            icon={<MessageSquare className="h-4 w-4" />}
            label={t("companies.totalOpenTasks")}
            value={formatNumber(companyTasks.open.length)}
          />
          <HeaderStat
            icon={<CheckCircle2 className="h-4 w-4" />}
            label={t("companies.completedTasks")}
            value={formatNumber(companyTasks.done.length)}
          />
          <HeaderStat
            icon={<Sparkles className="h-4 w-4" />}
            label={t("companies.health")}
            value={`${company.healthScore}/100`}
          />
          <HeaderStat
            icon={<CalendarClock className="h-4 w-4" />}
            label={t("companies.nextDeadline")}
            value={deadline ? dueLabel(deadline.due) : "—"}
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-line no-scrollbar">
        {tabItems.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            aria-selected={tab === item.value}
            role="tab"
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-[11px] font-semibold transition",
              tab === item.value
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-400 hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                  tab === item.value
                    ? "bg-brand-50 text-brand-600"
                    : "bg-slate-100 text-slate-400",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-teal-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-ink">
                      {t("companies.aiSummary")}
                    </h3>
                    <p className="mt-0.5 text-[9px] text-slate-400">
                      {t("inbox.aiDisclosure")}
                    </p>
                  </div>
                </div>
                <Badge tone="gold">{t("app.demo")}</Badge>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-[12px] leading-relaxed text-slate-600">
                  {pick(company.aiSummary)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-[13px] font-semibold text-ink">
                    {t("companies.openTasksTitle")}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {t("dashboard.priorityTasksSub")}
                  </p>
                </div>
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => {
                    setEditingTask(null);
                    setTaskOpen(true);
                  }}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  {t("tasks.add")}
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 pt-3">
                {companyTasks.open.slice(0, 4).map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onOpen={(item) => {
                      setEditingTask(item);
                      setTaskOpen(true);
                    }}
                  />
                ))}
                {companyTasks.open.length === 0 && (
                  <p className="py-6 text-center text-[11px] text-slate-400">
                    {t("companies.noOpenTasks")}
                  </p>
                )}
                {companyTasks.open.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setTab("tasks")}
                    className="w-full rounded-xl border border-dashed border-line py-2 text-[10px] font-medium text-slate-400 transition hover:border-brand-200 hover:text-brand-600"
                  >
                    {t("companies.viewAllTasks")} ({companyTasks.open.length})
                  </button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-[13px] font-semibold text-ink">
                    {t("companies.recentActivity")}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {t("companies.activityTimeline")}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <ActivityTimeline events={activity.slice(0, 4)} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("companies.keyContact")}
                </h3>
                <UserRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex items-center gap-3">
                  <Avatar name={pick(company.contact.name)} color={company.accent} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {pick(company.contact.name)}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {pick(company.contact.title)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5">
                  <ContactLine
                    icon={<Mail className="h-3.5 w-3.5" />}
                    href={`mailto:${company.contact.email}`}
                    value={company.contact.email}
                  />
                  <ContactLine
                    icon={<Phone className="h-3.5 w-3.5" />}
                    href={`tel:${company.contact.phone.replace(/\s/g, "")}`}
                    value={company.contact.phone}
                  />
                  {company.contact.wechat && (
                    <ContactLine
                      icon={<MessageSquare className="h-3.5 w-3.5" />}
                      value={company.contact.wechat}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("companies.health")}
                </h3>
                <span className="text-[10px] text-slate-400">
                  {t("dashboard.healthHint")}
                </span>
              </CardHeader>
              <CardContent className="flex items-center gap-5 pt-3">
                <DonutChart
                  data={[
                    {
                      label: t("companies.health"),
                      value: company.healthScore,
                      color:
                        band === "healthy"
                          ? "#159895"
                          : band === "watch"
                            ? "#c9a227"
                            : "#dc2626",
                    },
                    {
                      label: "",
                      value: 100 - company.healthScore,
                      color: "#eef3f3",
                    },
                  ]}
                  size={108}
                  thickness={10}
                  centerValue={company.healthScore}
                  centerLabel={t("companies.health")}
                />
                <div className="flex-1">
                  <Badge
                    tone={band === "healthy" ? "teal" : band === "watch" ? "gold" : "red"}
                    dot
                  >
                    {band === "healthy"
                      ? t("reports.healthy")
                      : band === "watch"
                        ? t("reports.watch")
                        : t("reports.highRisk")}
                  </Badge>
                  <div className="mt-3 space-y-1.5 text-[10px] text-slate-500">
                    <p className="flex items-center justify-between gap-2">
                      <span>{t("common.lastContact")}</span>
                      <span className="font-medium text-ink">
                        {formatDate(company.lastContact, "short")}
                      </span>
                    </p>
                    <p className="flex items-center justify-between gap-2">
                      <span>{t("common.since")}</span>
                      <span className="font-medium text-ink">{company.since}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("companies.companyDetails")}
                </h3>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-3">
                <DetailLine
                  icon={<Hash className="h-3.5 w-3.5" />}
                  label={t("companies.brLabel")}
                  value={company.brNumber}
                />
                <DetailLine
                  icon={<CalendarClock className="h-3.5 w-3.5" />}
                  label={t("companies.sinceLabel")}
                  value={company.since}
                />
                <DetailLine
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label={t("common.address")}
                  value={pick(company.address)}
                  multiline
                />
                {company.website && (
                  <DetailLine
                    icon={<Globe2 className="h-3.5 w-3.5" />}
                    label={t("common.website")}
                    value={company.website}
                  />
                )}
                <div className="flex items-start gap-2.5 border-t border-line/70 pt-2.5">
                  <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <div className="flex flex-1 flex-wrap gap-1">
                    {company.services.map((service) => (
                      <ServiceBadge key={service} service={service} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {thread && (
              <Card>
                <CardHeader>
                  <h3 className="text-[13px] font-semibold text-ink">
                    {t("companies.messageThread")}
                  </h3>
                  <ChannelIcon channel={thread.channel} size={16} />
                </CardHeader>
                <CardContent className="pt-3">
                  <p className="text-[11px] font-medium text-ink">{pick(thread.groupName)}</p>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-500">
                    {thread.messages[thread.messages.length - 1]
                      ? pick(thread.messages[thread.messages.length - 1].text)
                      : ""}
                  </p>
                  <Link
                    href={`/inbox/?thread=${encodeURIComponent(thread.id)}`}
                    className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 hover:text-brand-800"
                  >
                    {t("companies.viewInbox")}
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">{t("companies.openTasksTitle")}</h2>
            <Button
              size="sm"
              onClick={() => {
                setEditingTask(null);
                setTaskOpen(true);
              }}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              {t("tasks.add")}
            </Button>
          </div>
          <div className="space-y-2">
            {companyTasks.open.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onOpen={(item) => {
                  setEditingTask(item);
                  setTaskOpen(true);
                }}
              />
            ))}
            {companyTasks.open.length === 0 && (
              <EmptyState title={t("companies.noOpenTasks")} />
            )}
          </div>

          <div className="pt-2">
            <h2 className="mb-2 text-sm font-semibold text-ink">
              {t("companies.completedTasks")}
            </h2>
            <div className="space-y-2">
              {companyTasks.done.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onOpen={(item) => {
                    setEditingTask(item);
                    setTaskOpen(true);
                  }}
                />
              ))}
              {companyTasks.done.length === 0 && (
                <EmptyState title={t("companies.noCompletedTasks")} />
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("companies.activityTimeline")}
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {t("companies.recentActivity")}
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ActivityTimeline events={activity} detailed />
            </CardContent>
          </Card>
          {thread && (
            <Card>
              <CardHeader>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("companies.messageThread")}
                </h3>
              </CardHeader>
              <CardContent className="space-y-3 pt-3">
                <div className="flex items-center gap-2">
                  <ChannelIcon channel={thread.channel} size={16} />
                  <span className="text-[11px] font-semibold text-ink">
                    {pick(thread.groupName)}
                  </span>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500">
                  {thread.messages[thread.messages.length - 1]
                    ? pick(thread.messages[thread.messages.length - 1].text)
                    : ""}
                </p>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[10px] text-slate-400">
                    {t("inbox.unreadCount", { count: thread.unread })}
                  </span>
                  <Link
                    href={`/inbox/?thread=${encodeURIComponent(thread.id)}`}
                    className="text-[10px] font-semibold text-brand-600 hover:text-brand-800"
                  >
                    {t("companies.viewInbox")}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === "notes" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-ink">
                {t("companies.companyNotes")}
              </h3>
              <span className="text-[10px] text-slate-400">
                {formatNumber(company.notes.length)}
              </span>
            </CardHeader>
            <CardContent className="space-y-3 pt-3">
              {company.notes.map((item) => {
                const author = data.team.find((person) => person.id === item.authorId);
                return (
                  <div key={item.id} className="rounded-xl border border-line bg-white p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {author && (
                          <Avatar name={pick(author.name)} color={author.accent} size="xs" />
                        )}
                        <span className="text-[10px] font-semibold text-ink">
                          {author ? pick(author.name) : ""}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400">
                        {formatDate(item.at, "datetime")}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                      {pick(item.text)}
                    </p>
                  </div>
                );
              })}
              {company.notes.length === 0 && (
                <p className="py-8 text-center text-[11px] text-slate-400">
                  {t("companies.noNotes")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-[13px] font-semibold text-ink">{t("companies.addNote")}</h3>
              <StickyNote className="h-4 w-4 text-gold-500" aria-hidden="true" />
            </CardHeader>
            <CardContent className="pt-3">
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t("companies.notePlaceholder")}
                className="min-h-[120px]"
              />
              <Button
                className="mt-2 w-full"
                onClick={submitNote}
                disabled={!note.trim()}
                leftIcon={<Send className="h-3.5 w-3.5" />}
              >
                {t("companies.addNote")}
              </Button>
              <p className="mt-2 text-[9px] leading-relaxed text-slate-400">
                {t("app.fictional")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <CompanyFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        company={company}
      />
      <TaskModal
        open={taskOpen}
        onClose={() => {
          setTaskOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        initialCompanyId={company.id}
      />
    </div>
  );
}

function HeaderStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 ring-1 ring-line">
        {icon}
      </span>
      <div>
        <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-[13px] font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

function ContactLine({
  icon,
  value,
  href,
}: {
  icon: React.ReactNode;
  value: string;
  href?: string;
}) {
  const content = (
    <span className="inline-flex min-w-0 items-center gap-2 text-[10.5px] text-slate-600">
      <span className="text-slate-400">{icon}</span>
      <span className="truncate">{value}</span>
    </span>
  );
  return href ? (
    <a href={href} className="block transition hover:text-brand-700">
      {content}
    </a>
  ) : (
    content
  );
}

function DetailLine({
  icon,
  label,
  value,
  multiline,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className={cn("mt-0.5 text-[10.5px] text-slate-600", multiline && "leading-relaxed")}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ActivityTimeline({
  events,
  detailed = false,
}: {
  events: { id: string; at: string; kind: "note" | "task" | "message"; text: string }[];
  detailed?: boolean;
}) {
  const { t, formatDate } = useI18n();
  const icons = {
    note: StickyNote,
    task: CheckCircle2,
    message: MessageSquare,
  };
  const tones = {
    note: "bg-gold-50 text-gold-600",
    task: "bg-brand-50 text-brand-600",
    message: "bg-teal-50 text-teal-600",
  };
  if (events.length === 0) {
    return <p className="py-4 text-center text-[10px] text-slate-400">{t("companies.noActivity")}</p>;
  }
  return (
    <ol className="relative space-y-3 border-l border-line pl-4">
      {events.map((event) => {
        const Icon = icons[event.kind];
        return (
          <li key={event.id} className="relative">
            <span
              className={cn(
                "absolute -left-[26px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white",
                tones[event.kind],
              )}
            >
              <Icon className="h-2.5 w-2.5" aria-hidden="true" />
            </span>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {event.kind === "note"
                    ? t("common.notes")
                    : event.kind === "task"
                      ? t("common.openTasks")
                      : t("companies.messageThread")}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[11px] leading-relaxed text-slate-600",
                    detailed && "max-w-xl",
                  )}
                >
                  {event.text}
                </p>
              </div>
              <span className="shrink-0 text-[9px] text-slate-400">
                {formatDate(event.at, "short")}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
