"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Menu, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useAuth } from "@/lib/auth";
import { DEMO_TODAY } from "@/lib/constants";
import { useDemo } from "@/lib/demo-store";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { NotificationsMenu } from "@/components/layout/notifications-menu";

const pageKeys: Record<string, TranslationKey> = {
  "/dashboard": "nav.dashboard",
  "/tasks": "nav.tasks",
  "/companies": "nav.companies",
  "/inbox": "nav.inbox",
  "/reports": "nav.reports",
  "/team": "nav.team",
  "/settings": "nav.settings",
};

export function Topbar({
  onOpenMenu,
  onOpenCommand,
}: {
  onOpenMenu: () => void;
  onOpenCommand: () => void;
}) {
  const pathname = usePathname();
  const { session } = useAuth();
  const { data } = useDemo();
  const { t, pick, formatDate } = useI18n();
  const member = data.team.find((person) => person.id === session?.memberId) ?? data.team[0];

  const root = `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
  const pageKey = pageKeys[root] ?? "nav.dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-surface/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-slate-500 shadow-sm transition hover:text-ink lg:hidden"
          aria-label={t("topbar.menu")}
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
            {t("nav.demoWorkspace")}
          </p>
          <h2 className="truncate text-sm font-semibold text-ink sm:text-[15px]">
            {t(pageKey)}
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenCommand}
          className="group hidden h-9 items-center gap-2 rounded-xl border border-line bg-white px-3 text-xs text-slate-400 shadow-sm transition hover:border-brand-200 hover:text-slate-600 md:flex"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="w-28 text-left">{t("common.search")}</span>
          <kbd className="rounded-md border border-line bg-slate-50 px-1.5 py-0.5 font-sans text-[9px] font-semibold text-slate-400">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenCommand}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-slate-500 shadow-sm transition hover:text-ink md:hidden"
          aria-label={t("topbar.searchAria")}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="hidden items-center gap-1.5 rounded-xl border border-line bg-white px-2.5 py-2 text-[10px] font-medium text-slate-500 shadow-sm xl:flex">
          <CalendarDays className="h-3 w-3 text-brand-500" aria-hidden="true" />
          {formatDate(DEMO_TODAY, "long")}
        </div>

        <LanguageSwitcher />

        <NotificationsMenu />

        <Link
          href="/settings/"
          className="flex items-center gap-2.5 rounded-xl p-1 pr-2 transition hover:bg-white hover:shadow-sm"
          aria-label={t("topbar.profile")}
        >
          <Avatar name={pick(member.name)} color={member.accent} size="sm" />
          <span className="hidden min-w-0 xl:block">
            <span className="block max-w-[120px] truncate text-[11px] font-semibold leading-tight text-ink">
              {pick(member.name)}
            </span>
            <span className="block max-w-[120px] truncate text-[9px] leading-tight text-slate-400">
              {pick(member.title)}
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
}
