"use client";

import { useState } from "react";
import { CalendarDays, MessageSquare, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CompanyMark } from "@/components/ui/company-mark";
import { PriorityBadge } from "@/components/domain/badges";
import { ChannelIcon } from "@/components/ui/channel-icon";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { isOverdue } from "@/lib/selectors";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TaskRow({
  task,
  onOpen,
}: {
  task: Task;
  onOpen: (task: Task) => void;
}) {
  const { data, setTaskStatus, deleteTask } = useDemo();
  const { t, pick, dueLabel } = useI18n();
  const [confirming, setConfirming] = useState(false);
  const company = data.companies.find((item) => item.id === task.companyId);
  const assignee = data.team.find((member) => member.id === task.assigneeId);
  const overdue = isOverdue(task);
  const done = task.status === "done";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(task);
        }
      }}
      className={cn(
        "group relative flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-white p-3.5 shadow-card transition hover:-translate-y-px hover:border-brand-200 hover:shadow-lift sm:items-center sm:p-4",
        done && "bg-slate-50/60 opacity-75",
      )}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setTaskStatus(task.id, done ? "todo" : "done");
        }}
        aria-label={done ? t("common.reopen") : t("common.markDone")}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition sm:mt-0",
          done
            ? "border-teal-500 bg-teal-500 text-white"
            : "border-slate-300 bg-white text-transparent hover:border-teal-500",
        )}
      >
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" aria-hidden="true">
          <path
            d="M2 6.2 4.7 9 10 3.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p
            className={cn(
              "truncate text-[13px] font-semibold text-ink",
              done && "text-slate-400 line-through",
            )}
          >
            {pick(task.title)}
          </p>
          {task.sourceThreadId && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-400 ring-1 ring-line"
              title={t("tasks.fromConversation")}
            >
              <MessageSquare className="h-2.5 w-2.5" aria-hidden="true" />
              {t("tasks.fromConversation")}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-400">
          {company && (
            <span className="inline-flex items-center gap-1.5">
              <CompanyMark company={company} size="xs" className="h-4 w-4 rounded-[5px] text-[7px]" />
              <span className="truncate">{pick(company.name)}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <ChannelIcon channel={task.channel} size={11} />
            {t(`channel.${task.channel}`)}
          </span>
          {task.checklist.length > 0 && (
            <span>
              {task.checklist.filter((item) => item.done).length}/{task.checklist.length}{" "}
              {t("tasks.subtasks")}
            </span>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-3 lg:flex">
        <PriorityBadge priority={task.priority} />
        {assignee && (
          <span className="flex items-center gap-1.5" title={pick(assignee.name)}>
            <Avatar name={pick(assignee.name)} color={assignee.accent} size="xs" />
          </span>
        )}
        <span
          className={cn(
            "inline-flex min-w-[92px] items-center justify-end gap-1 text-[11px] font-medium",
            done
              ? "text-slate-400"
              : overdue
                ? "text-red-600"
                : "text-slate-500",
          )}
        >
          <CalendarDays className="h-3 w-3" aria-hidden="true" />
          {dueLabel(task.due, done)}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 lg:hidden">
        <PriorityBadge priority={task.priority} withIcon={false} />
      </div>

      <div className="hidden shrink-0 items-center gap-0.5 opacity-0 transition group-hover:opacity-100 sm:flex">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpen(task);
          }}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink"
          aria-label={t("common.edit")}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setConfirming(true);
          }}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
          aria-label={t("common.delete")}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {confirming && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-2xl bg-white/95 p-3 backdrop-blur-sm"
          onClick={(event) => event.stopPropagation()}
        >
          <p className="text-[11px] font-medium text-slate-600">
            {t("tasks.deleteConfirm")}
          </p>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-lg border border-line px-2 py-1 text-[10px] font-semibold text-slate-500"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={() => deleteTask(task.id)}
            className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-semibold text-white"
          >
            {t("common.delete")}
          </button>
        </div>
      )}
    </div>
  );
}
