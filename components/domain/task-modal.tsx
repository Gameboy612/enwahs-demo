"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Circle,
  Flag,
  MessageSquare,
  Search,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CompanyMark } from "@/components/ui/company-mark";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth";
import { DEMO_TODAY } from "@/lib/constants";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type { Channel, Localized, Task, TaskPriority, TaskStatus } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type FormState = {
  title: string;
  description: string;
  companyId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
  channel: Channel;
  blocked: boolean;
};

const toLocalized = (value: string): Localized => ({
  en: value,
  zhHant: value,
  zhHans: value,
});

export function TaskModal({
  open,
  onClose,
  task,
  initialStatus = "todo",
  initialCompanyId,
}: {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  initialStatus?: TaskStatus;
  initialCompanyId?: string;
}) {
  const { data, addTask, updateTask, deleteTask } = useDemo();
  const { session } = useAuth();
  const { t, pick, formatDate } = useI18n();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(() => ({
    title: "",
    description: "",
    companyId: initialCompanyId ?? data.companies[0]?.id ?? "",
    assigneeId: session?.memberId ?? data.team[0]?.id ?? "",
    status: initialStatus,
    priority: "medium",
    due: DEMO_TODAY,
    channel: "internal",
    blocked: false,
  }));
  const [errors, setErrors] = useState<{ title?: string; company?: string }>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
    setAssigneeOpen(false);
    setAssigneeSearch("");
    setErrors({});
    if (task) {
      setForm({
        title: pick(task.title),
        description: pick(task.description),
        companyId: task.companyId,
        assigneeId: task.assigneeId,
        status: task.status,
        priority: task.priority,
        due: task.due,
        channel: task.channel,
        blocked: task.blocked ?? false,
      });
    } else {
      setForm({
        title: "",
        description: "",
        companyId: initialCompanyId ?? data.companies[0]?.id ?? "",
        assigneeId: session?.memberId ?? data.team[0]?.id ?? "",
        status: initialStatus,
        priority: "medium",
        due: DEMO_TODAY,
        channel: "internal",
        blocked: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task?.id, initialCompanyId, initialStatus]);

  const company = data.companies.find((item) => item.id === form.companyId);
  const selectedAssignee = data.team.find((member) => member.id === form.assigneeId);
  const teamMatches = data.team.filter((member) =>
    [pick(member.name), pick(member.title)]
      .join(" ")
      .toLowerCase()
      .includes(assigneeSearch.trim().toLowerCase()),
  );
  const update = (patch: Partial<FormState>) =>
    setForm((current) => ({ ...current, ...patch }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!form.title.trim()) nextErrors.title = t("tasks.titleError");
    if (!form.companyId) nextErrors.company = t("tasks.selectCompanyError");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (task) {
      updateTask(task.id, {
        title: form.title === pick(task.title) ? task.title : toLocalized(form.title.trim()),
        description:
          form.description === pick(task.description)
            ? task.description
            : toLocalized(form.description.trim()),
        companyId: form.companyId,
        assigneeId: form.assigneeId,
        status: form.status,
        priority: form.priority,
        due: form.due,
        channel: form.channel,
        blocked: form.blocked,
      });
      toast(t("toast.taskUpdated"));
    } else {
      addTask({
        title: toLocalized(form.title.trim()),
        description: toLocalized(form.description.trim()),
        companyId: form.companyId,
        assigneeId: form.assigneeId,
        status: form.status,
        priority: form.priority,
        due: form.due,
        channel: form.channel,
        blocked: form.blocked,
      });
      toast(t("toast.taskCreated"));
    }
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id);
    toast(t("toast.taskDeleted"), "warning");
    onClose();
  };

  const statusOptions = [
    { value: "todo", label: t("status.todo") },
    { value: "doing", label: t("status.doing") },
    { value: "done", label: t("status.done") },
  ];
  const priorityOptions = [
    { value: "high", label: t("common.high") },
    { value: "medium", label: t("common.medium") },
    { value: "low", label: t("common.low") },
  ];
  const channelOptions = [
    { value: "whatsapp", label: t("channel.whatsapp") },
    { value: "wechat", label: t("channel.wechat") },
    { value: "email", label: t("channel.email") },
    { value: "internal", label: t("channel.internal") },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? t("tasks.editTask") : t("tasks.newTask")}
      size="xl"
      closeLabel={t("common.close")}
      headerActions={
        confirmingDelete ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </>
        ) : (
          <>
            {task && (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label={t("tasks.deleteTask")}
                title={t("tasks.deleteTask")}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <Button
              type="submit"
              form="task-form"
              size="sm"
              leftIcon={<Check className="h-3.5 w-3.5" />}
            >
              {task ? t("common.save") : t("tasks.createTask")}
            </Button>
          </>
        )
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6">
        <div
          className="relative overflow-hidden rounded-xl border border-line p-4"
          style={{
            background: `linear-gradient(135deg, ${company?.accent ?? "#1a5f7a"}12, transparent)`,
          }}
        >
          <span
            className="absolute inset-y-0 left-0 w-1"
            style={{ backgroundColor: company?.accent ?? "#1a5f7a" }}
          />
          <div className="flex items-center gap-3 pl-1">
            {company ? (
              <CompanyMark company={company} size="md" />
            ) : (
              <span className="h-10 w-10 rounded-xl bg-slate-100" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-ink">
                {company ? pick(company.name) : t("tasks.selectCompany")}
              </p>
              <p className="truncate text-[9px] text-slate-400">
                {company ? pick(company.industry) : "—"}
              </p>
            </div>
            <span className="shrink-0 text-[9px] text-slate-500">{formatDate(form.due, "short")}</span>
          </div>
        </div>

        <div>
          <label htmlFor="task-title" className="sr-only">
            {t("tasks.titleLabel")}
          </label>
          <input
            id="task-title"
            autoFocus
            value={form.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder={t("tasks.titlePlaceholder")}
            aria-invalid={errors.title ? true : undefined}
            className={cn(
              "w-full border-0 border-b border-transparent bg-transparent px-0 pb-2 text-xl font-semibold tracking-[-0.02em] text-ink outline-none placeholder:text-slate-300 focus:border-line focus:ring-0",
              errors.title && "border-red-300",
            )}
          />
          {errors.title && <p className="mt-1 text-[10px] text-red-600">{errors.title}</p>}
        </div>

        <section>
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {t("editor.schedule")}
          </p>
          <div
            className="flex items-center gap-1 rounded-xl border border-line bg-slate-50 p-1"
            role="radiogroup"
            aria-label={t("tasks.statusLabel")}
          >
            {statusOptions.map((option) => {
              const Icon =
                option.value === "doing" ? Clock3 : option.value === "done" ? CheckCircle2 : Circle;
              const selected = form.status === option.value;
              const iconTone =
                option.value === "doing"
                  ? "text-brand-600"
                  : option.value === "done"
                    ? "text-teal-600"
                    : "text-slate-400";
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => update({ status: option.value as TaskStatus })}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition",
                    selected
                      ? "bg-white text-ink shadow-sm ring-1 ring-line"
                      : "text-slate-400 hover:text-ink",
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", iconTone)} aria-hidden="true" />
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Input
              type="date"
              aria-label={t("tasks.dueLabel")}
              value={form.due}
              onChange={(event) => update({ due: event.target.value })}
              className="h-9"
            />
            <Select
              aria-label={t("tasks.priorityLabel")}
              value={form.priority}
              onChange={(event) => update({ priority: event.target.value as TaskPriority })}
              options={priorityOptions}
              className="h-9"
            />
            <Select
              aria-label={t("tasks.channelLabel")}
              value={form.channel}
              onChange={(event) => update({ channel: event.target.value as Channel })}
              options={channelOptions}
              className="h-9"
              containerClassName="col-span-2"
            />
          </div>
        </section>

        <section>
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {t("editor.assignee")}
          </p>
          <div className="overflow-hidden rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setAssigneeOpen((value) => !value)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-slate-50/60"
              aria-expanded={assigneeOpen}
            >
              {selectedAssignee ? (
                <Avatar name={pick(selectedAssignee.name)} color={selectedAssignee.accent} size="md" />
              ) : (
                <span className="h-10 w-10 rounded-full bg-slate-100" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] font-medium text-ink">
                  {selectedAssignee ? pick(selectedAssignee.name) : t("tasks.selectAssignee")}
                </span>
                <span className="mt-0.5 block truncate text-[9px] text-slate-400">
                  {selectedAssignee ? pick(selectedAssignee.title) : ""}
                </span>
              </span>
              {selectedAssignee && (
                <Flag className="h-3.5 w-3.5 text-gold-500" aria-label={t("editor.assignee")} />
              )}
              <ChevronDown
                className={cn("h-3.5 w-3.5 text-slate-400 transition", assigneeOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>
            {assigneeOpen && (
              <div className="border-t border-line bg-slate-50/60 p-2">
                <Input
                  value={assigneeSearch}
                  onChange={(event) => setAssigneeSearch(event.target.value)}
                  placeholder={t("editor.searchPeople")}
                  leftIcon={<Search className="h-3.5 w-3.5" />}
                  aria-label={t("editor.searchPeople")}
                  className="h-8 bg-white text-[11px]"
                />
                <div className="mt-1 max-h-52 overflow-y-auto scrollbar-thin" role="radiogroup" aria-label={t("editor.assignee")}>
                  {teamMatches.map((member) => {
                    const selected = member.id === form.assigneeId;
                    return (
                      <button
                        key={member.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                          update({ assigneeId: member.id });
                          setAssigneeOpen(false);
                          setAssigneeSearch("");
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition",
                          selected ? "bg-white shadow-sm" : "hover:bg-white/70",
                        )}
                      >
                        <Avatar name={pick(member.name)} color={member.accent} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[10.5px] font-medium text-ink">
                            {pick(member.name)}
                          </span>
                          <span className="mt-0.5 block truncate text-[9px] text-slate-400">
                            {pick(member.title)}
                          </span>
                        </span>
                        {selected ? (
                          <CheckCircle2 className="h-4 w-4 text-teal-600" aria-hidden="true" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300" aria-hidden="true" />
                        )}
                      </button>
                    );
                  })}
                  {teamMatches.length === 0 && (
                    <p className="px-2 py-4 text-center text-[10px] text-slate-400">
                      {t("common.noResults")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section>
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {t("common.company")}
          </p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10" role="radiogroup" aria-label={t("tasks.companyLabel")}>
            {data.companies.map((item) => {
              const selected = item.id === form.companyId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={pick(item.name)}
                  title={pick(item.name)}
                  onClick={() => update({ companyId: item.id })}
                  className={cn(
                    "relative flex items-center justify-center rounded-xl p-1 transition",
                    selected ? "bg-brand-50 ring-2 ring-brand-300" : "hover:bg-slate-50",
                  )}
                >
                  <CompanyMark company={item} size="md" />
                  {selected && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white ring-2 ring-white">
                      <Check className="h-2.5 w-2.5" aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-[11px] font-medium text-slate-600">
            <input
              type="checkbox"
              checked={form.blocked}
              onChange={(event) => update({ blocked: event.target.checked })}
              className="h-3.5 w-3.5 rounded border-line accent-brand-600"
            />
            {t("tasks.blocked")}
          </label>
          {errors.company && <p className="mt-1 text-[10px] text-red-600">{errors.company}</p>}
        </section>

        {task?.sourceThreadId && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-slate-50 px-3 py-2.5">
            <span className="inline-flex items-center gap-2 text-[10px] text-slate-500">
              <MessageSquare className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
              {t("tasks.fromConversation")}
            </span>
            <Link
              href={`/inbox/?thread=${task.sourceThreadId}`}
              onClick={onClose}
              className="text-[10px] font-medium text-brand-600 hover:text-brand-800"
            >
              {t("tasks.viewConversation")}
            </Link>
          </div>
        )}

      </form>
    </Modal>
  );
}
