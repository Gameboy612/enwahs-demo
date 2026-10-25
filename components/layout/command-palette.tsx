"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Building2,
  CheckSquare,
  CornerDownLeft,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Users,
  BarChart3,
  X,
} from "lucide-react";
import { CompanyMark } from "@/components/ui/company-mark";
import { useDemo } from "@/lib/demo-store";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Result = {
  id: string;
  section: "pages" | "companies" | "tasks";
  title: string;
  subtitle?: string;
  href: string;
  icon?: typeof LayoutDashboard;
  company?: { shortName: { en: string; zhHant: string; zhHans: string }; accent: string };
};

const pageResults: {
  href: string;
  key: TranslationKey;
  icon: typeof LayoutDashboard;
}[] = [
  { href: "/dashboard/", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/tasks/", key: "nav.tasks", icon: CheckSquare },
  { href: "/companies/", key: "nav.companies", icon: Building2 },
  { href: "/inbox/", key: "nav.inbox", icon: MessageSquare },
  { href: "/reports/", key: "nav.reports", icon: BarChart3 },
  { href: "/team/", key: "nav.team", icon: Users },
  { href: "/settings/", key: "nav.settings", icon: Settings },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { data } = useDemo();
  const { t, pick } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = original;
      window.clearTimeout(timer);
    };
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const normalized = query.trim().toLowerCase();
    const pages = pageResults
      .filter((page) => !normalized || t(page.key).toLowerCase().includes(normalized))
      .map<Result>((page) => ({
        id: `page-${page.href}`,
        section: "pages",
        title: t(page.key),
        href: page.href,
        icon: page.icon,
      }));

    const companies = data.companies
      .filter((company) => {
        if (!normalized) return true;
        return [pick(company.name), pick(company.industry), pick(company.shortName)]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .slice(0, normalized ? 6 : 4)
      .map<Result>((company) => ({
        id: `company-${company.id}`,
        section: "companies",
        title: pick(company.name),
        subtitle: pick(company.industry),
        href: `/companies/detail/?id=${encodeURIComponent(company.id)}`,
        company: company,
      }));

    const tasks = data.tasks
      .filter((task) => {
        if (!normalized) return task.status !== "done";
        const company = data.companies.find((item) => item.id === task.companyId);
        return [pick(task.title), company ? pick(company.name) : ""]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      })
      .slice(0, normalized ? 7 : 4)
      .map<Result>((task) => {
        const company = data.companies.find((item) => item.id === task.companyId);
        return {
          id: `task-${task.id}`,
          section: "tasks",
          title: pick(task.title),
          subtitle: company ? pick(company.name) : undefined,
          href: `/tasks/?task=${encodeURIComponent(task.id)}`,
        };
      });

    return [...pages, ...companies, ...tasks];
  }, [data.companies, data.tasks, pick, query, t]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const active = listRef.current?.querySelector<HTMLElement>(
      `[data-result-index="${activeIndex}"]`,
    );
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const select = (result: Result) => {
    onOpenChange(false);
    router.push(result.href);
  };

  if (!mounted || !open) return null;

  const grouped = {
    pages: results.filter((result) => result.section === "pages"),
    companies: results.filter((result) => result.section === "companies"),
    tasks: results.filter((result) => result.section === "tasks"),
  };

  const flat = [...grouped.pages, ...grouped.companies, ...grouped.tasks];

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center bg-brand-950/45 px-4 pt-[12vh] backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("command.title")}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-white shadow-2xl animate-scale-in"
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((index) => Math.min(index + 1, flat.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
              } else if (event.key === "Enter" && flat[activeIndex]) {
                event.preventDefault();
                select(flat[activeIndex]);
              } else if (event.key === "Escape") {
                onOpenChange(false);
              }
            }}
            placeholder={t("command.placeholder")}
            className="h-8 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-slate-400"
            aria-label={t("command.placeholder")}
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-ink"
            aria-label={t("common.close")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={listRef}
          className="max-h-[55vh] overflow-y-auto p-2 scrollbar-thin"
          role="listbox"
          aria-label={t("command.title")}
        >
          {flat.length === 0 ? (
            <p className="px-3 py-10 text-center text-xs text-slate-400">
              {t("command.noResults")}
            </p>
          ) : (
            <>
              {grouped.pages.length > 0 && (
                <Section label={t("command.pages")}>
                  {grouped.pages.map((result) => (
                    <ResultRow
                      key={result.id}
                      result={result}
                      active={flat.indexOf(result) === activeIndex}
                      index={flat.indexOf(result)}
                      onSelect={select}
                    />
                  ))}
                </Section>
              )}
              {grouped.companies.length > 0 && (
                <Section label={t("command.companies")}>
                  {grouped.companies.map((result) => (
                    <ResultRow
                      key={result.id}
                      result={result}
                      active={flat.indexOf(result) === activeIndex}
                      index={flat.indexOf(result)}
                      onSelect={select}
                    />
                  ))}
                </Section>
              )}
              {grouped.tasks.length > 0 && (
                <Section label={t("command.tasks")}>
                  {grouped.tasks.map((result) => (
                    <ResultRow
                      key={result.id}
                      result={result}
                      active={flat.indexOf(result) === activeIndex}
                      index={flat.indexOf(result)}
                      onSelect={select}
                    />
                  ))}
                </Section>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-slate-50/70 px-4 py-2.5 text-[10px] text-slate-400">
          <span>{t("command.hint")}</span>
          <span className="inline-flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
            {t("command.open")}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      {children}
    </div>
  );
}

function ResultRow({
  result,
  active,
  index,
  onSelect,
}: {
  result: Result;
  active: boolean;
  index: number;
  onSelect: (result: Result) => void;
}) {
  const Icon = result.icon;
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      data-result-index={index}
      onMouseEnter={() => undefined}
      onClick={() => onSelect(result)}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
        active ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50",
      )}
    >
      {result.company ? (
        <CompanyMark company={result.company} size="sm" />
      ) : Icon ? (
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            active ? "bg-white text-brand-600" : "bg-slate-100 text-slate-500",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <CheckSquare className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-semibold">{result.title}</span>
        {result.subtitle && (
          <span className="mt-0.5 block truncate text-[10px] text-slate-400">
            {result.subtitle}
          </span>
        )}
      </span>
      {active && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-brand-400" />}
    </button>
  );
}
