"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth";
import { DEMO_TODAY } from "@/lib/constants";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type { Channel, Localized, Task, TaskPriority, TaskStatus } from "@/lib/types";
import { useToast } from "@/components/ui/toast";

type FormState = {
  title: string;
  description: string;
  companyId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
  channel: Channel;
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
  const { t, pick } = useI18n();
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
      });
    }
    // Only re-initialise when the modal opens or the edited task changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task?.id, initialCompanyId, initialStatus]);

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
        title:
          form.title === pick(task.title) ? task.title : toLocalized(form.title.trim()),
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
      description={
        task
          ? pick(data.companies.find((company) => company.id === task.companyId)?.name ?? task.title)
          : t("tasks.descriptionPlaceholder")
      }
      size="lg"
      closeLabel={t("common.close")}
      footer={
        confirmingDelete ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-600">{t("tasks.deleteConfirm")}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setConfirmingDelete(false)}>
                {t("common.cancel")}
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                {t("tasks.deleteTask")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {task && (
              <Button
                variant="ghost"
                size="sm"
                className="mr-auto text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setConfirmingDelete(true)}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              >
                {t("common.delete")}
              </Button>
            )}
            <Button variant="secondary" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" form="task-form">
              {task ? t("common.saveChanges") : t("tasks.createTask")}
            </Button>
          </>
        )
      }
    >
      <form id="task-form" onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        <Input
          label={t("tasks.titleLabel")}
          value={form.title}
          onChange={(event) => update({ title: event.target.value })}
          placeholder={t("tasks.titlePlaceholder")}
          error={errors.title}
          required
          autoFocus
        />
        <Textarea
          label={t("tasks.description")}
          value={form.description}
          onChange={(event) => update({ description: event.target.value })}
          placeholder={t("tasks.descriptionPlaceholder")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label={t("tasks.companyLabel")}
            value={form.companyId}
            onChange={(event) => update({ companyId: event.target.value })}
            options={data.companies.map((company) => ({
              value: company.id,
              label: pick(company.name),
            }))}
            placeholder={t("tasks.selectCompany")}
            error={errors.company}
            required
          />
          <Select
            label={t("tasks.assigneeLabel")}
            value={form.assigneeId}
            onChange={(event) => update({ assigneeId: event.target.value })}
            options={data.team.map((member) => ({
              value: member.id,
              label: `${pick(member.name)} · ${pick(member.title)}`,
            }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            label={t("tasks.statusLabel")}
            value={form.status}
            onChange={(event) => update({ status: event.target.value as TaskStatus })}
            options={statusOptions}
          />
          <Select
            label={t("tasks.priorityLabel")}
            value={form.priority}
            onChange={(event) => update({ priority: event.target.value as TaskPriority })}
            options={priorityOptions}
          />
          <Input
            type="date"
            label={t("tasks.dueLabel")}
            value={form.due}
            onChange={(event) => update({ due: event.target.value })}
          />
        </div>
        <Select
          label={t("tasks.channelLabel")}
          value={form.channel}
          onChange={(event) => update({ channel: event.target.value as Channel })}
          options={channelOptions}
        />

        {task?.sourceThreadId && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-slate-50 px-3.5 py-3">
            <span className="inline-flex items-center gap-2 text-[11px] text-slate-500">
              <MessageSquare className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
              {t("tasks.fromConversation")}
            </span>
            <Link
              href={`/inbox/?thread=${task.sourceThreadId}`}
              onClick={onClose}
              className="text-[11px] font-semibold text-brand-600 hover:text-brand-800"
            >
              {t("tasks.viewConversation")}
            </Link>
          </div>
        )}
      </form>
    </Modal>
  );
}
