"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
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
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CompanyMark } from "@/components/ui/company-mark";
import { EmptyState } from "@/components/ui/empty-state";
import { PageLoader } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/input";
import { ChannelIcon } from "@/components/ui/channel-icon";
import {
  CompanyStatusBadge,
  RiskBadge,
  ServiceBadge,
} from "@/components/domain/badges";
import { CompanyFormModal } from "@/components/domain/company-form-modal";
import { TaskModal } from "@/components/domain/task-modal";
import { TaskRow } from "@/components/domain/task-row";
import { useAuth } from "@/lib/auth";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import {
  healthBand,
  nextDeadline,
  visibleTaskForCompany,
} from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "overview" | "tasks" | "notes";

const healthTone = {
  healthy: "bg-teal-500",
  watch: "bg-gold-500",
  risk: "bg-red-500",
};

export function CompanyDetailView() {
  const searchParams = useSearchParams();
  const { data, hydrated, addNote } = useDemo();
  const { session } = useAuth();
  const { t, pick, formatDate, dueLabel } = useI18n();
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
  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: "overview", label: t("companies.tabs.overview") },
    { value: "tasks", label: t("companies.tabs.tasks"), count: companyTasks.all.length },
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
        className="inline-flex items-center gap-1 text-[10px] text-slate-400 transition hover:text-brand-700"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        {t("companies.back")}
      </Link>

      <header className="surface-card overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
          <CompanyMark company={company} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-ink">
                {pick(company.name)}
              </h1>
              <CompanyStatusBadge status={company.status} />
              <RiskBadge risk={company.risk} />
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              {pick(company.industry)} · {t("common.since")} {company.since}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {company.services.map((service) => (
                <ServiceBadge key={service} service={service} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {thread && (
              <Link
                href={`/inbox/?thread=${encodeURIComponent(thread.id)}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-slate-400 transition hover:text-brand-600"
                aria-label={t("companies.viewInbox")}
              >
                <ChannelIcon channel={thread.channel} size={14} />
              </Link>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditOpen(true)}
              leftIcon={<Pencil className="h-3.5 w-3.5" />}
            >
              {t("common.edit")}
            </Button>
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
        </div>

        <div className="grid grid-cols-2 divide-x divide-line border-t border-line sm:grid-cols-4">
          <MiniStat
            icon={<MessageSquare className="h-3.5 w-3.5" />}
            label={t("companies.totalOpenTasks")}
            value={String(companyTasks.open.length)}
          />
          <MiniStat
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label={t("companies.completedTasks")}
            value={String(companyTasks.done.length)}
          />
          <MiniStat
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label={t("companies.health")}
            value={`${company.healthScore}`}
          />
          <MiniStat
            icon={<CalendarClock className="h-3.5 w-3.5" />}
            label={t("companies.nextDeadline")}
            value={deadline ? dueLabel(deadline.due) : "—"}
          />
        </div>
      </header>

      <div className="flex gap-1 border-b border-line">
        {tabs.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              "relative -mb-px border-b-2 px-3 py-2.5 text-[11px] font-medium transition",
              tab === item.value
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-400 hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className="ml-1 text-[9px] text-slate-400">{item.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <section className="surface-card p-5">
              <p className="inline-flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                <Sparkles className="h-3 w-3 text-gold-500" aria-hidden="true" />
                {t("companies.aiSummary")}
              </p>
              <p className="mt-2 line-clamp-3 text-[11.5px] leading-relaxed text-slate-600">
                {pick(company.aiSummary)}
              </p>
            </section>

            <section className="surface-card">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-xs font-semibold text-ink">
                  {t("companies.openTasksTitle")}
                </h2>
                <Link
                  href="/tasks/"
                  className="text-[9px] text-slate-400 hover:text-brand-600"
                >
                  {t("common.viewAll")}
                </Link>
              </div>
              <div className="space-y-2 px-3 pb-3">
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
                  <p className="py-6 text-center text-[10px] text-slate-400">
                    {t("companies.noOpenTasks")}
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-4">
            <section className="surface-card p-5">
              <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                {t("companies.keyContact")}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar name={pick(company.contact.name)} color={company.accent} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-ink">
                    {pick(company.contact.name)}
                  </p>
                  <p className="truncate text-[9px] text-slate-400">
                    {pick(company.contact.title)}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 text-[10px] text-slate-500">
                <a
                  href={`mailto:${company.contact.email}`}
                  className="flex items-center gap-2 hover:text-brand-700"
                >
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span className="truncate">{company.contact.email}</span>
                </a>
                <a
                  href={`tel:${company.contact.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 hover:text-brand-700"
                >
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span>{company.contact.phone}</span>
                </a>
                {company.contact.wechat && (
                  <p className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3 text-slate-400" />
                    <span>{company.contact.wechat}</span>
                  </p>
                )}
              </div>
            </section>

            <section className="surface-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                  {t("companies.health")}
                </p>
                <span className="text-[11px] font-semibold tabular-nums text-ink">
                  {company.healthScore}
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full", healthTone[band])}
                  style={{ width: `${company.healthScore}%` }}
                />
              </div>
              <p className="mt-2 text-[9px] text-slate-400">
                {t("common.lastContact")} {formatDate(company.lastContact, "short")}
              </p>
            </section>

            <section className="surface-card p-5">
              <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                {t("companies.companyDetails")}
              </p>
              <div className="mt-3 space-y-2 text-[10px] text-slate-500">
                <p className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-slate-400" />
                  {company.brNumber}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                  <span className="leading-relaxed">{pick(company.address)}</span>
                </p>
                {company.website && (
                  <p className="flex items-center gap-2">
                    <Globe2 className="h-3 w-3 text-slate-400" />
                    {company.website}
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === "tasks" && (
        <div className="space-y-4">
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
            {companyTasks.open.length === 0 && <EmptyState title={t("companies.noOpenTasks")} />}
          </div>
          {companyTasks.done.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                {t("companies.completedTasks")}
              </p>
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
            </div>
          )}
        </div>
      )}

      {tab === "notes" && (
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="surface-card p-4 lg:col-span-2">
            <div className="space-y-3">
              {company.notes.map((item) => {
                const author = data.team.find((person) => person.id === item.authorId);
                return (
                  <div key={item.id} className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 text-[10px] font-medium text-ink">
                        {author && (
                          <Avatar name={pick(author.name)} color={author.accent} size="xs" />
                        )}
                        {author ? pick(author.name) : ""}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {formatDate(item.at, "short")}
                      </span>
                    </div>
                    <p className="mt-2 text-[10.5px] leading-relaxed text-slate-600">
                      {pick(item.text)}
                    </p>
                  </div>
                );
              })}
              {company.notes.length === 0 && (
                <p className="py-8 text-center text-[10px] text-slate-400">
                  {t("companies.noNotes")}
                </p>
              )}
            </div>
          </section>

          <section className="surface-card p-4">
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={t("companies.notePlaceholder")}
              className="min-h-[110px]"
            />
            <Button
              className="mt-2 w-full"
              size="sm"
              onClick={submitNote}
              disabled={!note.trim()}
              leftIcon={<Send className="h-3.5 w-3.5" />}
            >
              {t("companies.addNote")}
            </Button>
          </section>
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

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3">
      <span className="text-slate-300">{icon}</span>
      <div>
        <p className="text-[8px] uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-[11px] font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}
