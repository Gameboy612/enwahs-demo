"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarClock, MessageSquare, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CompanyMark } from "@/components/ui/company-mark";
import { CompanyStatusBadge, RiskBadge, ServiceBadge } from "@/components/domain/badges";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { healthBand, nextDeadline, openTasksForCompany } from "@/lib/selectors";
import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

const healthTone = {
  healthy: "bg-teal-500",
  watch: "bg-gold-500",
  risk: "bg-red-500",
};

export function CompanyCard({ company }: { company: Company }) {
  const { data } = useDemo();
  const { t, pick, formatDate, dueLabel } = useI18n();
  const open = openTasksForCompany(data.tasks, company.id);
  const deadline = nextDeadline(data.tasks, company.id);
  const band = healthBand(company.healthScore);

  return (
    <Link
      href={`/companies/detail/?id=${encodeURIComponent(company.id)}`}
      className="group surface-card relative flex flex-col overflow-hidden p-4 transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full opacity-[0.06]"
        style={{ backgroundColor: company.accent }}
      />
      <div className="flex items-start gap-3">
        <CompanyMark company={company} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[13px] font-semibold text-ink">
                {pick(company.name)}
              </h3>
              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                {pick(company.industry)}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand-500" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <CompanyStatusBadge status={company.status} />
            <RiskBadge risk={company.risk} />
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {company.services.slice(0, 3).map((service) => (
          <ServiceBadge key={service} service={service} />
        ))}
        {company.services.length > 3 && (
          <span className="text-[10px] text-slate-400">+{company.services.length - 3}</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line/70 pt-3">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
            {t("companies.totalOpenTasks")}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <MessageSquare className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
            {open.length}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
            {t("companies.health")}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full", healthTone[band])}
                style={{ width: `${company.healthScore}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 tabular-nums">
              {company.healthScore}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line/70 pt-3 text-[10px] text-slate-400">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Users className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{pick(company.contact.name)}</span>
        </span>
        {deadline ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-slate-500">
            <CalendarClock className="h-3 w-3" aria-hidden="true" />
            {dueLabel(deadline.due)}
          </span>
        ) : (
          <span>{formatDate(company.lastContact, "short")}</span>
        )}
      </div>
    </Link>
  );
}

export function CompanyTable({ companies }: { companies: Company[] }) {
  const { data } = useDemo();
  const { t, pick, formatDate } = useI18n();

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-slate-50/60 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <th className="px-5 py-3">{t("common.company")}</th>
              <th className="px-3 py-3">{t("companies.statusLabel")}</th>
              <th className="px-3 py-3">{t("companies.servicesLabel")}</th>
              <th className="px-3 py-3 text-center">{t("companies.totalOpenTasks")}</th>
              <th className="px-3 py-3">{t("companies.health")}</th>
              <th className="px-3 py-3">{t("common.lastContact")}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line/70">
            {companies.map((company) => {
              const open = openTasksForCompany(data.tasks, company.id);
              return (
                <tr key={company.id} className="group transition hover:bg-slate-50/60">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/companies/detail/?id=${encodeURIComponent(company.id)}`}
                      className="flex items-center gap-3"
                    >
                      <CompanyMark company={company} size="sm" />
                      <span className="min-w-0">
                        <span className="block max-w-[240px] truncate text-xs font-semibold text-ink group-hover:text-brand-700">
                          {pick(company.name)}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                          {pick(company.industry)}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3.5">
                    <CompanyStatusBadge status={company.status} />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex max-w-[190px] flex-wrap gap-1">
                      {company.services.slice(0, 2).map((service) => (
                        <ServiceBadge key={service} service={service} />
                      ))}
                      {company.services.length > 2 && (
                        <span className="text-[10px] text-slate-400">
                          +{company.services.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-center text-xs font-semibold tabular-nums text-ink">
                    {open.length}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn("h-full rounded-full", healthTone[healthBand(company.healthScore)])}
                          style={{ width: `${company.healthScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 tabular-nums">
                        {company.healthScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-[10px] text-slate-500">
                    {formatDate(company.lastContact, "short")}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/companies/detail/?id=${encodeURIComponent(company.id)}`}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-600 opacity-0 transition group-hover:opacity-100"
                    >
                      {t("common.overview")}
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CompanyContact({ company }: { company: Company }) {
  const { pick } = useI18n();
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={pick(company.contact.name)} color={company.accent} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold text-ink">
          {pick(company.contact.name)}
        </p>
        <p className="truncate text-[9px] text-slate-400">{pick(company.contact.title)}</p>
      </div>
    </div>
  );
}
