"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, MessageSquare, Trash2 } from "lucide-react";
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

  useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
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
          {selectedAssignee && (
            <p className="mt-1.5 text-[9px] text-slate-400">
              {pick(selectedAssignee.name)} · {pick(selectedAssignee.title)}
            </p>
          )}
        </div>

        <section>
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {t("editor.schedule")}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Input
              type="date"
              aria-label={t("tasks.dueLabel")}
              value={form.due}
              onChange={(event) => update({ due: event.target.value })}
              className="h-9"
            />
            <Select
              aria-label={t("tasks.statusLabel")}
              value={form.status}
              onChange={(event) => update({ status: event.target.value as TaskStatus })}
              options={statusOptions}
              className="h-9"
            />
            <Select
              aria-label={t("tasks.priorityLabel")}
              value={form.priority}
              onChange={(event) => update({ priority: event.target.value as TaskPriority })}
              options={priorityOptions}
              className="h-9"
            />
          </div>
        </section>

        <section>
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {t("editor.assignment")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Select
              aria-label={t("tasks.assigneeLabel")}
              value={form.assigneeId}
              onChange={(event) => update({ assigneeId: event.target.value })}
              options={data.team.map((member) => ({
                value: member.id,
                label: pick(member.name),
              }))}
              className="h-9"
            />
            <Select
              aria-label={t("tasks.channelLabel")}
              value={form.channel}
              onChange={(event) => update({ channel: event.target.value as Channel })}
              options={channelOptions}
              className="h-9"
            />
          </div>
        </section>

        <section>
          <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
            {t("common.company")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Select
              aria-label={t("tasks.companyLabel")}
              value={form.companyId}
              onChange={(event) => update({ companyId: event.target.value })}
              options={data.companies.map((item) => ({
                value: item.id,
                label: pick(item.name),
              }))}
              className="h-9"
            />
            <label className="flex h-9 items-center gap-2 rounded-xl border border-line bg-white px-3 text-[11px] font-medium text-slate-600">
              <input
                type="checkbox"
                checked={form.blocked}
                onChange={(event) => update({ blocked: event.target.checked })}
                className="h-3.5 w-3.5 rounded border-line accent-brand-600"
              />
              {t("tasks.blocked")}
            </label>
          </div>
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
