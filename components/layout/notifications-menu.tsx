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
  X,
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

function useRelativeLabel() {
  const { t } = useI18n();
  return (iso: string) => {
    const seconds = secondsAgo(iso);
    if (seconds < 60) return t("notifications.justNow");
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t("notifications.minutesAgo", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("notifications.hoursAgo", { count: hours });
    return t("notifications.daysAgo", { count: Math.floor(hours / 24) });
  };
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
  due: "bg-red-50 text-red-600",
};

function NotificationRow({
  notification,
  onRead,
  onClose,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onClose: () => void;
}) {
  const { pick } = useI18n();
  const relative = useRelativeLabel();
  const Icon = icons[notification.type];
  return (
    <Link
      href={notification.href}
      onClick={() => {
        onRead(notification.id);
        onClose();
      }}
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition hover:bg-slate-50",
        !notification.read && "bg-teal-50/40",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          iconTones[notification.type],
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold text-ink">
            {pick(notification.title)}
          </span>
          <span className="shrink-0 text-[10px] text-slate-400">
            {relative(notification.at)}
          </span>
        </span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
          {pick(notification.body)}
        </span>
      </span>
      {!notification.read && (
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
      )}
    </Link>
  );
}

export function NotificationsMenu() {
  const { data, markNotificationRead, markAllNotificationsRead } = useDemo();
  const { t, pick, formatNumber } = useI18n();
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("topbar.notifications")}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-500 transition hover:border-line hover:bg-white hover:text-ink"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-scale-in"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
            <div>
              <p className="text-sm font-semibold text-ink">{t("notifications.title")}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {formatNumber(unread)} {t("inbox.unread")}
              </p>
            </div>
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold text-brand-600 transition hover:bg-brand-50"
            >
              <CheckCheck className="h-3 w-3" aria-hidden="true" />
              {t("notifications.markAll")}
            </button>
          </div>

          <div className="max-h-[420px] divide-y divide-line/70 overflow-y-auto scrollbar-thin">
            {sorted.length === 0 ? (
              <p className="px-4 py-10 text-center text-xs text-slate-400">
                {t("notifications.empty")}
              </p>
            ) : (
              sorted.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onRead={markNotificationRead}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-line bg-slate-50/60 px-4 py-2.5">
            <span className="text-[10px] text-slate-400">
              {pick({
                en: "Simulated notifications",
                zhHant: "模擬通知",
                zhHans: "模拟通知",
              })}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-ink"
              aria-label={t("common.close")}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
