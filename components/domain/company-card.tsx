"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { CompanyMark } from "@/components/ui/company-mark";
import { TaskItem } from "@/components/domain/task-item";
import { CompanyStatusBadge, ServiceBadge } from "@/components/domain/badges";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { healthBand, openTasksForCompany, sortByDue } from "@/lib/selectors";
import type { Company } from "@/lib/types";
import { cn } from "@/lib/utils";

const healthTone = {
  healthy: "bg-teal-500",
  watch: "bg-gold-500",
  risk: "bg-red-500",
};

export function CompanyCard({ company }: { company: Company }) {

  const { data } = useDemo();
  const { t, pick } = useI18n();
  const open = sortByDue(openTasksForCompany(data.tasks, company.id));
  const [visible, setVisible] = useState(2);
  const shown = open.slice(0, visible);
  const remaining = Math.max(open.length - visible, 0);

  return (
    <div className="group surface-card flex h-full flex-col p-4 transition hover:border-brand-200">
      <Link
        href={`/companies/detail/?id=${encodeURIComponent(company.id)}`}
        className="flex items-start gap-3"
      >
        <CompanyMark company={company} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[12px] font-medium text-ink">
              {pick(company.name)}
            </h3>
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-brand-500" />
          </div>
          <p className="mt-0.5 truncate text-[9px] text-slate-400">
            {pick(company.industry)}
          </p>
          <div className="mt-1.5">
            <CompanyStatusBadge status={company.status} />
          </div>
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap gap-1">
        {company.services.slice(0, 2).map((service) => (
          <ServiceBadge key={service} service={service} />
        ))}
      </div>

      <div className="mt-3 border-t border-line/60 pt-2.5">
        {open.length === 0 ? (
          <p className="py-2 text-[9px] text-slate-400">{t("companies.noPendingTasks")}</p>
        ) : (
          <div className="space-y-1">
            {shown.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                variant="compact"
                showCompany={false}
                href={`/tasks/?task=${encodeURIComponent(task.id)}`}
              />
            ))}
            {remaining > 0 && (
              <button
                type="button"
                onClick={() => setVisible((value) => value + 5)}
                aria-expanded={visible > 2}
                className="mt-1 inline-flex items-center gap-1 rounded-md px-1 py-1 text-[9px] font-medium text-brand-600 transition hover:bg-brand-50 hover:text-brand-800"
              >
                <ChevronDown className="h-3 w-3" aria-hidden="true" />
                +{Math.min(remaining, 5)} {t("common.more")}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line/60 pt-3">
        <span className="text-[10px] text-slate-400">
          {open.length} {t("common.openTasks")}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-1 w-12 overflow-hidden rounded-full bg-slate-100">
            <span
              className={cn("block h-full rounded-full", healthTone[healthBand(company.healthScore)])}
              style={{ width: `${company.healthScore}%` }}
            />
          </span>
          <span className="text-[9px] tabular-nums text-slate-400">{company.healthScore}</span>
        </span>
      </div>
    </div>
  );
}

export function CompanyTable({ companies }: { companies: Company[] }) {
  const { data } = useDemo();
  const { t, pick, formatDate } = useI18n();

  return (
    <div className="surface-card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line text-[9px] uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">{t("common.company")}</th>
              <th className="px-3 py-3 font-medium">{t("common.status")}</th>
              <th className="px-3 py-3 text-center font-medium">{t("companies.totalOpenTasks")}</th>
              <th className="px-3 py-3 font-medium">{t("companies.health")}</th>
              <th className="px-3 py-3 font-medium">{t("common.lastContact")}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {companies.map((company) => {
              const open = openTasksForCompany(data.tasks, company.id);
              return (
                <tr key={company.id} className="group hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <Link
                      href={`/companies/detail/?id=${encodeURIComponent(company.id)}`}
                      className="flex items-center gap-3"
                    >
                      <CompanyMark company={company} size="sm" />
                      <span className="min-w-0">
                        <span className="block max-w-[260px] truncate text-[11px] font-medium text-ink">
                          {pick(company.name)}
                        </span>
                        <span className="block truncate text-[9px] text-slate-400">
                          {pick(company.industry)}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <CompanyStatusBadge status={company.status} />
                  </td>
                  <td className="px-3 py-3 text-center text-[11px] tabular-nums text-ink">
                    {open.length}
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-14 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className={cn("block h-full rounded-full", healthTone[healthBand(company.healthScore)])}
                          style={{ width: `${company.healthScore}%` }}
                        />
                      </span>
                      <span className="text-[9px] text-slate-400">{company.healthScore}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[9px] text-slate-400">
                    {formatDate(company.lastContact, "short")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/companies/detail/?id=${encodeURIComponent(company.id)}`}
                      className="inline-flex text-slate-300 hover:text-brand-600"
                      aria-label={t("common.overview")}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
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
