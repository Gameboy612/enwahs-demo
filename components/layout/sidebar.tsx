"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  CheckSquare,
  ListTodo,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { openTasks, unreadCount } from "@/lib/selectors";
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
  icon: typeof ListTodo;
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
  const { t, pick } = useI18n();

  const member = data.team.find((person) => person.id === session?.memberId) ?? data.team[0];
  const unread = unreadCount(data.threads);

  const items: NavItem[] = [
    { href: "/dashboard/", key: "nav.dashboard", icon: ListTodo },
    { href: "/tasks/", key: "nav.tasks", icon: CheckSquare, badge: openTasks(data.tasks).length },
    { href: "/companies/", key: "nav.companies", icon: Building2 },
    { href: "/inbox/", key: "nav.inbox", icon: MessageSquare, badge: unread },
    { href: "/reports/", key: "nav.reports", icon: BarChart3 },
    { href: "/team/", key: "nav.team", icon: Users },
    { href: "/settings/", key: "nav.settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard/") return pathname === "/dashboard" || pathname === "/dashboard/";
    return pathname === href.replace(/\/$/, "") || pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={t("common.close")}
          className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-line bg-white transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Primary navigation"
      >
        <div className="flex items-center justify-between px-5 pb-6 pt-6">
          <Link href="/dashboard/" onClick={onClose} aria-label={t("nav.dashboard")}>
            <Logo size="lg" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-ink lg:hidden"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition",
                  active
                    ? "bg-brand-50 text-brand-800"
                    : "text-slate-500 hover:bg-slate-50 hover:text-ink",
                )}
              >
                <Icon
                  className={cn("h-4 w-4", active ? "text-brand-600" : "text-slate-400")}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{t(item.key)}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[10px] font-medium tabular-nums text-slate-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Avatar name={pick(member.name)} color={member.accent} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-ink">{pick(member.name)}</p>
              <p className="truncate text-[9px] text-slate-400">{pick(member.title)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                signOut();
                router.replace("/");
                onClose();
              }}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-ink"
              aria-label={t("nav.signOut")}
              title={t("nav.signOut")}
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <p className="px-2 pb-1 pt-2 text-[9px] text-slate-400">
            {t("common.demoLine")}
          </p>
        </div>
      </aside>
    </>
  );
}
