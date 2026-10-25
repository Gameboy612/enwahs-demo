"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { ChannelIcon } from "@/components/ui/channel-icon";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { averageResponse, openTasks, unreadCount } from "@/lib/selectors";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  key:
    | "nav.dashboard"
    | "nav.tasks"
    | "nav.companies"
    | "nav.inbox"
    | "nav.reports"
    | "nav.team"
    | "nav.settings";
  icon: typeof LayoutDashboard;
  badge?: number;
};

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { data } = useDemo();
  const { t, pick, formatNumber } = useI18n();

  const member = data.team.find((person) => person.id === session?.memberId) ?? data.team[0];
  const openTaskCount = openTasks(data.tasks).length;
  const unread = unreadCount(data.threads);
  const avgResponse = averageResponse(data.threads);

  const workspaceItems: NavItem[] = [
    { href: "/dashboard/", key: "nav.dashboard", icon: LayoutDashboard },
    { href: "/tasks/", key: "nav.tasks", icon: CheckSquare, badge: openTaskCount },
    { href: "/companies/", key: "nav.companies", icon: Building2 },
    { href: "/inbox/", key: "nav.inbox", icon: MessageSquare, badge: unread },
  ];
  const manageItems: NavItem[] = [
    { href: "/reports/", key: "nav.reports", icon: BarChart3 },
    { href: "/team/", key: "nav.team", icon: Users },
    { href: "/settings/", key: "nav.settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard/") return pathname === "/dashboard" || pathname === "/dashboard/";
    return pathname === href.replace(/\/$/, "") || pathname.startsWith(href);
  };

  const handleSignOut = () => {
    signOut();
    router.replace("/");
    onClose();
  };

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition",
          active
            ? "bg-white/10 text-white shadow-inner ring-1 ring-white/10"
            : "text-white/60 hover:bg-white/5 hover:text-white",
        )}
      >
        {active && (
          <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-teal-300" />
        )}
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition",
            active ? "text-teal-300" : "text-white/45 group-hover:text-teal-300",
          )}
          aria-hidden="true"
        />
        <span className="flex-1 truncate">{t(item.key)}</span>
        {item.badge !== undefined && item.badge > 0 && (
          <span
            className={cn(
              "min-w-[20px] rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold tabular-nums",
              active
                ? "bg-teal-300 text-brand-950"
                : "bg-white/10 text-white/70 group-hover:bg-white/15",
            )}
          >
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={t("common.close")}
          className="fixed inset-0 z-40 bg-brand-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "brand-mesh fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col overflow-hidden text-white transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Primary navigation"
      >
        <div className="brand-grid pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative flex items-center justify-between px-5 pb-2 pt-5">
          <Logo tone="dark" size="md" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mx-5 mt-4 rounded-xl border border-white/10 bg-white/[0.06] p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
            <Sparkles className="h-3 w-3 text-gold-300" aria-hidden="true" />
            {t("app.demoMode")}
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/60">
            {t("app.fictional")}
          </p>
        </div>

        <nav className="relative mt-6 flex-1 space-y-6 overflow-y-auto px-3 pb-4 scrollbar-thin">
          <div>
            <p className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">
              {t("nav.workspace")}
            </p>
            <div className="space-y-1">{workspaceItems.map(renderItem)}</div>
          </div>
          <div>
            <p className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30">
              {t("nav.manage")}
            </p>
            <div className="space-y-1">{manageItems.map(renderItem)}</div>
          </div>

          <div className="mx-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-white/45">
                {t("inbox.responseTime")}
              </span>
              <span className="text-[11px] font-semibold text-teal-300">
                {avgResponse} {t("common.minutesShort")}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#25D366]/15">
                <ChannelIcon channel="whatsapp" size={13} />
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#07C160]/15">
                <ChannelIcon channel="wechat" size={13} />
              </span>
              <span className="ml-auto text-[10px] text-white/35">
                {formatNumber(data.threads.length)} {t("inbox.threadsShort")}
              </span>
            </div>
          </div>
        </nav>

        <div className="relative border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={pick(member.name)} color={member.accent} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-white">
                {pick(member.name)}
              </p>
              <p className="truncate text-[10px] text-white/45">{pick(member.title)}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
              aria-label={t("nav.signOut")}
              title={t("nav.signOut")}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
