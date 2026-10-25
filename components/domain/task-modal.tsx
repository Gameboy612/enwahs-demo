"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronDown,
  Circle,
  CircleCheck,
  LoaderCircle,
  MessageSquare,
  Plus,
  ScrollText,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CompanyMark } from "@/components/ui/company-mark";
import { Input, Select, Switch, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth";
import { DEMO_TODAY } from "@/lib/constants";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type {
  AssigneeRole,
  Channel,
  Localized,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type FormState = {
  title: string;
  description: string;
  companyId: string;
  assigneeIds: string[];
  assigneeRoles: Record<string, AssigneeRole>;
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

const defaultAssigneeRoles = (
  assigneeIds: string[],
  roles: Record<string, AssigneeRole> = {},
): Record<string, AssigneeRole> =>
  Object.fromEntries(
    assigneeIds.map((id, index) => [id, roles[id] ?? (index === 0 ? "lead" : "support")]),
  );

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
  const [form, setForm] = useState<FormState>(() => {
    const assigneeIds = [session?.memberId ?? data.team[0]?.id ?? ""].filter(Boolean);
    return {
      title: "",
      description: "",
      companyId: initialCompanyId ?? data.companies[0]?.id ?? "",
      assigneeIds,
      assigneeRoles: defaultAssigneeRoles(assigneeIds),
      status: initialStatus,
    priority: "medium",
    due: DEMO_TODAY,
      channel: "internal",
      blocked: false,
    };
  });
  const [errors, setErrors] = useState<{
    title?: string;
    company?: string;
    assignee?: string;
  }>({});
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [draftAssigneeIds, setDraftAssigneeIds] = useState<string[]>([]);
  const [companyPickerOpen, setCompanyPickerOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirmingDelete(false);
    setAssigneePickerOpen(false);
    setAssigneeSearch("");
    setDraftAssigneeIds([]);
    setCompanyPickerOpen(false);
    setErrors({});
    if (task) {
      setForm({
        title: pick(task.title),
        description: pick(task.description),
        companyId: task.companyId,
        assigneeIds: task.assigneeIds,
        assigneeRoles: defaultAssigneeRoles(task.assigneeIds, task.assigneeRoles),
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
        assigneeIds: [session?.memberId ?? data.team[0]?.id ?? ""].filter(Boolean),
        assigneeRoles: defaultAssigneeRoles([
          session?.memberId ?? data.team[0]?.id ?? "",
        ].filter(Boolean)),
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
  const selectedAssignees = data.team.filter((member) => form.assigneeIds.includes(member.id));
  const teamMatches = data.team.filter((member) =>
    [pick(member.name), pick(member.title)]
      .join(" ")
      .toLowerCase()
      .includes(assigneeSearch.trim().toLowerCase()),
  );
  const update = (patch: Partial<FormState>) =>
    setForm((current) => ({ ...current, ...patch }));

  const removeAssignee = (memberId: string) => {
    const assigneeIds = form.assigneeIds.filter((id) => id !== memberId);
    const assigneeRoles = { ...form.assigneeRoles };
    const removedRole = assigneeRoles[memberId];
    delete assigneeRoles[memberId];
    if (removedRole === "lead" && assigneeIds.length > 0) {
      assigneeRoles[assigneeIds[0]] = "lead";
    }
    update({ assigneeIds, assigneeRoles });
  };

  const openAssigneePicker = () => {
    setDraftAssigneeIds(form.assigneeIds);
    setAssigneeSearch("");
    setAssigneePickerOpen(true);
  };

  const closeAssigneePicker = () => {
    setAssigneePickerOpen(false);
    setAssigneeSearch("");
  };

  const toggleDraftAssignee = (memberId: string) => {
    setDraftAssigneeIds((current) =>
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId],
    );
  };

  const commitAssigneePicker = () => {
    const nextRoles: Record<string, AssigneeRole> = {};
    draftAssigneeIds.forEach((id, index) => {
      nextRoles[id] = form.assigneeRoles[id] ?? (index === 0 ? "lead" : "support");
    });
    if (draftAssigneeIds.length > 0 && !Object.values(nextRoles).includes("lead")) {
      nextRoles[draftAssigneeIds[0]] = "lead";
    }
    update({ assigneeIds: draftAssigneeIds, assigneeRoles: nextRoles });
    if (draftAssigneeIds.length > 0) {
      setErrors((current) => ({ ...current, assignee: undefined }));
    }
    closeAssigneePicker();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!form.title.trim()) nextErrors.title = t("tasks.titleError");
    if (!form.companyId) nextErrors.company = t("tasks.selectCompanyError");
    if (form.assigneeIds.length === 0) nextErrors.assignee = t("tasks.assigneeError");
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
        assigneeIds: form.assigneeIds,
        assigneeRoles: form.assigneeRoles,
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
        assigneeIds: form.assigneeIds,
        assigneeRoles: form.assigneeRoles,
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
    <>
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
        <form id="task-form" onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => setCompanyPickerOpen(true)}
              className="relative mt-0.5 shrink-0 rounded-xl transition hover:opacity-90"
              aria-label={t("tasks.selectCompany")}
              title={t("tasks.selectCompany")}
            >
              {company ? (
                <CompanyMark company={company} size="lg" />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100" />
              )}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-line">
                <ChevronDown className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
            </button>

            <div className="min-w-0 flex-1">
              <label htmlFor="task-title" className="sr-only">
                {t("tasks.titleLabel")}
              </label>
              <input
                id="task-title"
                autoFocus
                data-autofocus
                value={form.title}
                onChange={(event) => update({ title: event.target.value })}
                placeholder={t("tasks.titlePlaceholder")}
                aria-invalid={errors.title ? true : undefined}
                className={cn(
                  "w-full border-0 border-b border-transparent bg-transparent px-0 pb-2 text-xl font-semibold tracking-[-0.02em] text-ink outline-none placeholder:text-slate-300 focus:border-line focus:ring-0 sm:text-2xl",
                  errors.title && "border-red-300",
                )}
              />
              {errors.title && <p className="mt-1 text-[10px] text-red-600">{errors.title}</p>}
              <p className="mt-1 truncate text-[9px] text-slate-400">
                {company
                  ? `${pick(company.name)} · ${pick(company.industry)}`
                  : t("tasks.selectCompany")}
              </p>
              {errors.company && <p className="mt-1 text-[10px] text-red-600">{errors.company}</p>}
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="flex flex-col gap-5">
              <section>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
                    {t("editor.assignees")}
                  </h3>
                  <button
                    type="button"
                    onClick={openAssigneePicker}
                    className="inline-flex items-center gap-1 text-[9px] font-medium text-brand-600 transition hover:text-brand-800"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                    {t("common.add")}
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-line">
                  {selectedAssignees.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 border-b border-line/60 px-3 py-2.5 last:border-b-0"
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
                      <select
                        aria-label={`${t("editor.role")} ${pick(member.name)}`}
                        value={form.assigneeRoles[member.id] ?? (index === 0 ? "lead" : "support")}
                        onChange={(event) =>
                          update({
                            assigneeRoles: {
                              ...form.assigneeRoles,
                              [member.id]: event.target.value as AssigneeRole,
                            },
                          })
                        }
                        className="h-7 shrink-0 rounded-lg border border-line bg-white px-1.5 text-[9px] font-medium text-slate-600 outline-none focus:border-brand-300"
                      >
                        <option value="lead">{t("assigneeRole.lead")}</option>
                        <option value="reviewer">{t("assigneeRole.reviewer")}</option>
                        <option value="support">{t("assigneeRole.support")}</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeAssignee(member.id)}
                        className="rounded-md p-1 text-slate-300 transition hover:bg-slate-50 hover:text-slate-500"
                        aria-label={`${t("common.delete")} ${pick(member.name)}`}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </div>
                  ))}

                  {selectedAssignees.length === 0 && (
                    <button
                      type="button"
                      onClick={openAssigneePicker}
                      className="flex w-full items-center justify-center gap-1.5 px-3 py-4 text-center text-[10px] text-slate-400 transition hover:bg-slate-50/60 hover:text-brand-600"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                      {t("editor.noAssignees")}
                    </button>
                  )}
                </div>
                {errors.assignee && <p className="mt-1 text-[10px] text-red-600">{errors.assignee}</p>}
              </section>

              <section className="flex min-h-[180px] flex-1 flex-col">
                <h3 className="mb-2 text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  {t("common.notes")}
                </h3>
                <Textarea
                  value={form.description}
                  onChange={(event) => update({ description: event.target.value })}
                  placeholder={t("tasks.descriptionPlaceholder")}
                  aria-label={t("common.notes")}
                  className="min-h-[132px] flex-1 rounded-xl bg-white text-[12px]"
                />
              </section>
            </div>

            <aside className="order-first space-y-4 lg:order-none">
              <div className="rounded-xl border border-line bg-slate-50/50 p-4">
                <h3 className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  {t("editor.details")}
                </h3>
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="mb-1.5 text-[9px] font-medium text-slate-400">
                      {t("tasks.statusLabel")}
                    </p>
                    <div
                      className="flex items-center gap-1 rounded-xl border border-line bg-white p-1"
                      role="radiogroup"
                      aria-label={t("tasks.statusLabel")}
                    >
                      {statusOptions.map((option) => {
                        const Icon =
                          option.value === "doing"
                            ? LoaderCircle
                            : option.value === "done"
                              ? CircleCheck
                              : ScrollText;
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
                              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-1.5 py-1.5 text-[9px] font-medium transition",
                              selected
                                ? "bg-slate-50 text-ink shadow-sm ring-1 ring-line"
                                : "text-slate-400 hover:text-ink",
                            )}
                          >
                            <Icon className={cn("h-3.5 w-3.5", iconTone)} aria-hidden="true" />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Input
                    type="date"
                    label={t("tasks.dueLabel")}
                    value={form.due}
                    onChange={(event) => update({ due: event.target.value })}
                    className="h-9 bg-white"
                  />
                  <Select
                    label={t("tasks.priorityLabel")}
                    value={form.priority}
                    onChange={(event) => update({ priority: event.target.value as TaskPriority })}
                    options={priorityOptions}
                    className="h-9 bg-white"
                  />
                  <Select
                    label={t("tasks.channelLabel")}
                    value={form.channel}
                    onChange={(event) => update({ channel: event.target.value as Channel })}
                    options={channelOptions}
                    className="h-9 bg-white"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-line p-4">
                <Switch
                  checked={form.blocked}
                  onChange={(checked) => update({ blocked: checked })}
                  label={t("tasks.blocked")}
                />
                {task?.sourceThreadId && (
                  <Link
                    href={`/inbox/?thread=${task.sourceThreadId}`}
                    onClick={onClose}
                    className="mt-1 flex items-center gap-2 border-t border-line/60 pt-3 text-[10px] font-medium text-brand-600 hover:text-brand-800"
                  >
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("tasks.viewConversation")}
                  </Link>
                )}
              </div>
            </aside>
          </div>
        </form>
      </Modal>

      <Modal
        open={companyPickerOpen}
        onClose={() => setCompanyPickerOpen(false)}
        title={t("tasks.selectCompany")}
        size="md"
        zIndex={110}
        closeLabel={t("common.close")}
      >
        <div
          className="grid grid-cols-4 gap-3 p-5 sm:grid-cols-5"
          role="radiogroup"
          aria-label={t("tasks.companyLabel")}
        >
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
                onClick={() => {
                  update({ companyId: item.id });
                  setCompanyPickerOpen(false);
                }}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition",
                  selected
                    ? "border-brand-300 bg-brand-50/50"
                    : "border-line hover:border-brand-200",
                )}
              >
                <span className="relative">
                  <CompanyMark company={item} size="lg" />
                  {selected && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white ring-2 ring-white">
                      <Check className="h-2.5 w-2.5" aria-hidden="true" />
                    </span>
                  )}
                </span>
                <span className="w-full truncate text-center text-[9px] text-slate-500">
                  {pick(item.shortName)}
                </span>
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={assigneePickerOpen}
        onClose={closeAssigneePicker}
        title={t("editor.assignees")}
        description={t("editor.assigneesHint")}
        size="md"
        zIndex={120}
        closeLabel={t("common.close")}
        footer={
          <>
            <span className="mr-auto text-[10px] font-medium text-slate-400">
              {t("editor.selectedCount", { count: draftAssigneeIds.length })}
            </span>
            <Button variant="secondary" size="sm" onClick={closeAssigneePicker}>
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={commitAssigneePicker}
              leftIcon={<Check className="h-3.5 w-3.5" />}
            >
              {t("common.done")}
            </Button>
          </>
        }
      >
        <div className="p-4 sm:p-5">
          <Input
            value={assigneeSearch}
            onChange={(event) => setAssigneeSearch(event.target.value)}
            placeholder={t("editor.searchPeople")}
            leftIcon={<Search className="h-3.5 w-3.5" />}
            aria-label={t("editor.searchPeople")}
            data-autofocus
            className="h-9 bg-white text-[12px]"
          />
          <div
            className="mt-2 max-h-[44vh] overflow-y-auto scrollbar-thin"
            role="group"
            aria-label={t("editor.assignees")}
          >
            {teamMatches.map((member) => {
              const selected = draftAssigneeIds.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => toggleDraftAssignee(member.id)}
                  className={cn(
                    "mb-1 flex w-full items-center gap-3 rounded-xl border px-2.5 py-2 text-left transition last:mb-0",
                    selected
                      ? "border-teal-200 bg-teal-50/60"
                      : "border-transparent hover:bg-slate-50",
                  )}
                >
                  <Avatar name={pick(member.name)} color={member.accent} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-medium text-ink">
                      {pick(member.name)}
                    </span>
                    <span className="mt-0.5 block truncate text-[9px] text-slate-400">
                      {pick(member.title)}
                    </span>
                  </span>
                  {selected ? (
                    <CircleCheck className="h-4 w-4 text-teal-600" aria-hidden="true" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300" aria-hidden="true" />
                  )}
                </button>
              );
            })}
            {teamMatches.length === 0 && (
              <p className="px-2 py-8 text-center text-[10px] text-slate-400">
                {t("common.noResults")}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
