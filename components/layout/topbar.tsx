"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";
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
  const { t, pick } = useI18n();
  const member = data.team.find((person) => person.id === session?.memberId) ?? data.team[0];

  const root = `/${pathname.split("/").filter(Boolean)[0] ?? ""}`;
  const pageKey = pageKeys[root] ?? "nav.dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-surface/90 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-ink lg:hidden"
          aria-label={t("topbar.menu")}
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        <Link href="/dashboard/" className="lg:hidden" aria-label={t("nav.dashboard")}>
          <Logo size="sm" showText={false} />
        </Link>

        <h1 className="hidden text-[13px] font-semibold tracking-tight text-ink lg:block">
          {t(pageKey)}
        </h1>

        <div className="flex-1" />

        <button
          type="button"
          onClick={onOpenCommand}
          className="hidden h-8 items-center gap-2 rounded-lg border border-line bg-white px-2.5 text-[11px] text-slate-400 transition hover:border-brand-200 hover:text-slate-600 sm:flex"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden md:inline">{t("common.search")}</span>
          <kbd className="hidden rounded border border-line px-1 font-sans text-[9px] md:inline">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenCommand}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-ink sm:hidden"
          aria-label={t("topbar.searchAria")}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>

        <LanguageSwitcher />

        <NotificationsMenu />

        <Link
          href="/settings/"
          className="ml-1 rounded-full transition hover:opacity-80"
          aria-label={t("topbar.profile")}
          title={pick(member.name)}
        >
          <Avatar name={pick(member.name)} color={member.accent} size="sm" />
        </Link>
      </div>
    </header>
  );
}
