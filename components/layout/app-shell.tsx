"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { DEMO_TODAY } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t, formatDate } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-700 focus:shadow-lift"
      >
        Skip to content
      </a>

      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-[272px]">
        <Topbar
          onOpenMenu={() => setMobileOpen(true)}
          onOpenCommand={() => setCommandOpen(true)}
        />
        <main id="main-content" className="flex-1 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1480px] animate-fade-in">{children}</div>
        </main>
        <footer className="border-t border-line/80 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-1.5 text-[10px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {t("footer.fictional")} · {t("footer.asOf", { date: formatDate(DEMO_TODAY, "medium") })}
            </p>
            <p className="flex items-center gap-2">
              <span>{t("footer.demo")}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>Enwahs CRM</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{t("footer.builtBy")}</span>
            </p>
          </div>
        </footer>
      </div>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
