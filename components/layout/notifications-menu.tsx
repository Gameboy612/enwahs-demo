"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AtSign,
  Bell,
  CheckCheck,
  CheckSquare,
  Clock3,
  MessageSquare,
} from "lucide-react";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { DEMO_TODAY } from "@/lib/constants";
import type { AppNotification } from "@/lib/types";
import { cn } from "@/lib/utils";

function secondsAgo(iso: string): number {
  const at = new Date(iso).getTime();
  const today = new Date(`${DEMO_TODAY}T09:30:00+08:00`).getTime();
  return Math.max(Math.round((today - at) / 1000), 0);
}

const icons = {
  task: CheckSquare,
  message: MessageSquare,
  mention: AtSign,
  due: Clock3,
};

const iconTones = {
  task: "bg-brand-50 text-brand-600",
  message: "bg-teal-50 text-teal-600",
  mention: "bg-gold-50 text-gold-600",
  due: "bg-red-50 text-red-500",
};

export function NotificationsMenu() {
  const { data, markNotificationRead, markAllNotificationsRead } = useDemo();
  const { t, pick } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = data.notifications.filter((notification) => !notification.read).length;

  const sorted = useMemo(
    () =>
      [...data.notifications].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
      ),
    [data.notifications],
  );

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const relative = (iso: string) => {
    const seconds = secondsAgo(iso);
    if (seconds < 60) return t("notifications.justNow");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t("notifications.minutesAgo", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("notifications.hoursAgo", { count: hours });
    return t("notifications.daysAgo", { count: Math.floor(hours / 24) });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={t("topbar.notifications")}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-ink"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-surface" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-white shadow-lift animate-scale-in">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[11px] font-medium text-ink">{t("notifications.title")}</p>
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-50 hover:text-ink"
              aria-label={t("notifications.markAll")}
              title={t("notifications.markAll")}
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
            {sorted.map((notification: AppNotification) => {
              const Icon = icons[notification.type];
              return (
                <Link
                  key={notification.id}
                  href={notification.href}
                  onClick={() => {
                    markNotificationRead(notification.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-start gap-2.5 px-4 py-3 transition hover:bg-slate-50",
                    !notification.read && "bg-teal-50/30",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                      iconTones[notification.type],
                    )}
                  >
                    <Icon className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="truncate text-[10.5px] font-medium text-ink">
                        {pick(notification.title)}
                      </span>
                      <span className="shrink-0 text-[8px] text-slate-400">
                        {relative(notification.at)}
                      </span>
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-[9px] text-slate-400">
                      {pick(notification.body)}
                    </span>
                  </span>
                  {!notification.read && (
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
