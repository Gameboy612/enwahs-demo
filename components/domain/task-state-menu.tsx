"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  CircleCheck,
  LoaderCircle,
  Pause,
  ScrollText,
  TriangleAlert,
} from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusIcons = {
  todo: ScrollText,
  doing: LoaderCircle,
  done: CircleCheck,
};

export function TaskStateMenu({
  task,
  variant = "icon",
}: {
  task: Task;
  variant?: "icon" | "dropdown";
}) {
  const { setTaskStatus, updateTask } = useDemo();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuWidth = 176;
      const preferredLeft = variant === "dropdown" ? rect.right - menuWidth : rect.left;
      setPosition({
        top: Math.min(rect.bottom + 6, window.innerHeight - 220),
        left: Math.max(8, Math.min(preferredLeft, window.innerWidth - menuWidth - 8)),
      });
    };
    place();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, variant]);

  const Icon = statusIcons[task.status];
  const chooseStatus = (status: TaskStatus) => {
    setTaskStatus(task.id, status);
    setOpen(false);
  };

  const triggerClassName =
    variant === "dropdown"
      ? cn(
          "flex h-7 shrink-0 items-center justify-center gap-1 rounded-lg border px-1.5 text-[9px] font-medium transition sm:h-8 sm:w-[88px] sm:justify-between sm:gap-1.5 sm:px-2 sm:text-[10px]",
          task.status === "done"
            ? "border-teal-200 bg-teal-50 text-teal-600 hover:border-teal-300"
            : task.status === "doing"
              ? "border-brand-200 bg-brand-50 text-brand-600 hover:border-brand-300"
              : "border-line bg-white text-slate-500 hover:border-brand-300 hover:text-ink",
        )
      : cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
          task.status === "done"
            ? "border-teal-500 bg-teal-500 text-white"
            : task.status === "doing"
              ? "border-brand-300 bg-brand-50 text-brand-600"
              : "border-slate-300 bg-white text-slate-400 hover:border-brand-300",
        );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("tasks.statusLabel")}: ${t(`status.${task.status}`)}`}
        title={t("tasks.statusLabel")}
        className={triggerClassName}
      >
        <Icon className={cn(variant === "dropdown" ? "h-3 w-3 shrink-0" : "h-2.5 w-2.5")} aria-hidden="true" />
        {variant === "dropdown" && (
          <>
            <span className="hidden truncate sm:inline">{t(`status.${task.status}`)}</span>
            <ChevronDown className="h-2.5 w-2.5 shrink-0 opacity-60" aria-hidden="true" />
          </>
        )}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={t("tasks.statusLabel")}
            style={{ top: position.top, left: position.left }}
            className="fixed z-[120] w-44 rounded-xl border border-line bg-white p-1 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {(["todo", "doing", "done"] as TaskStatus[]).map((status) => {
              const StatusIcon = statusIcons[status];
              const selected = task.status === status;
              return (
                <button
                  key={status}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => chooseStatus(status)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <StatusIcon
                    className={cn(
                      "h-3.5 w-3.5",
                      status === "doing"
                        ? "text-brand-600"
                        : status === "done"
                          ? "text-teal-600"
                          : "text-slate-400",
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{t(`status.${status}`)}</span>
                  {selected && <Check className="h-3 w-3 text-brand-600" aria-hidden="true" />}
                </button>
              );
            })}
            <div className="my-1 h-px bg-line" />
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={Boolean(task.blocked)}
              onClick={() => {
                updateTask(task.id, { blocked: !task.blocked });
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Pause className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
              <span className="flex-1">{t("tasks.blocked")}</span>
              {task.blocked && <Check className="h-3 w-3 text-brand-600" aria-hidden="true" />}
            </button>
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={task.priority === "high"}
              onClick={() => {
                updateTask(task.id, { priority: task.priority === "high" ? "medium" : "high" });
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <TriangleAlert className="h-3.5 w-3.5 text-red-500" aria-hidden="true" />
              <span className="flex-1">{t("tasks.urgent")}</span>
              {task.priority === "high" && (
                <Check className="h-3 w-3 text-brand-600" aria-hidden="true" />
              )}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
