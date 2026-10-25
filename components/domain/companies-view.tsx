"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  LayoutGrid,
  List,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented";
import { CompanyCard, CompanyTable } from "@/components/domain/company-card";
import { CompanyFormModal } from "@/components/domain/company-form-modal";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { isOpen } from "@/lib/selectors";
import type { CompanyStatus, RiskLevel, ServiceKey } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "table";

export function CompaniesView() {
  const router = useRouter();
  const { data } = useDemo();
  const { t, pick, formatNumber } = useI18n();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CompanyStatus | "all">("all");
  const [service, setService] = useState<ServiceKey | "all">("all");
  const [risk, setRisk] = useState<RiskLevel | "all">("all");
  const [view, setView] = useState<ViewMode>("grid");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.companies
      .filter((company) => {
        if (status !== "all" && company.status !== status) return false;
        if (service !== "all" && !company.services.includes(service)) return false;
        if (risk !== "all" && company.risk !== risk) return false;
        if (!query) return true;
        return [
          pick(company.name),
          pick(company.industry),
          pick(company.contact.name),
          pick(company.shortName),
          ...company.tags.map((tag) => pick(tag)),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => a.healthScore - b.healthScore);
  }, [data.companies, pick, risk, search, service, status]);

  const openTaskCount = data.tasks.filter(isOpen).length;
  const atRisk = data.companies.filter((company) => company.status === "at-risk").length;
  const avgHealth = Math.round(
    data.companies.reduce((total, company) => total + company.healthScore, 0) /
      Math.max(data.companies.length, 1),
  );
  const activeFilters =
    Number(search.trim() !== "") +
    Number(status !== "all") +
    Number(service !== "all") +
    Number(risk !== "all");

  const clear = () => {
    setSearch("");
    setStatus("all");
    setService("all");
    setRisk("all");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("nav.workspace")}
        title={t("companies.title")}
        description={t("companies.subtitle")}
        actions={
          <>
            <SegmentedControl
              options={[
                {
                  value: "grid",
                  label: t("companies.grid"),
                  icon: <LayoutGrid className="h-3.5 w-3.5" />,
                },
                {
                  value: "table",
                  label: t("companies.table"),
                  icon: <List className="h-3.5 w-3.5" />,
                },
              ]}
              value={view}
              onChange={setView}
              ariaLabel={t("companies.title")}
            />
            <Button
              onClick={() => setModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t("companies.add")}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <PortfolioStat
          icon={<Building2 className="h-4 w-4" />}
          label={t("companies.title")}
          value={formatNumber(data.companies.length)}
          tone="bg-brand-50 text-brand-600"
        />
        <PortfolioStat
          icon={<Users className="h-4 w-4" />}
          label={t("companies.totalOpenTasks")}
          value={formatNumber(openTaskCount)}
          tone="bg-teal-50 text-teal-600"
        />
        <PortfolioStat
          icon={<ShieldAlert className="h-4 w-4" />}
          label={t("companies.highRisk")}
          value={formatNumber(atRisk)}
          tone="bg-red-50 text-red-600"
        />
        <PortfolioStat
          icon={<Sparkles className="h-4 w-4" />}
          label={t("companies.portfolioHealth")}
          value={`${avgHealth}`}
          suffix="/100"
          tone="bg-gold-50 text-gold-600"
        />
      </div>

      <div className="surface-card flex flex-col gap-2.5 p-3.5 sm:p-4 lg:flex-row lg:items-center">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("companies.searchPlaceholder")}
          leftIcon={<Search className="h-4 w-4" />}
          aria-label={t("common.search")}
          containerClassName="lg:max-w-sm"
        />
        <div className="grid grid-cols-3 gap-2 lg:flex lg:flex-1">
          <Select
            aria-label={t("companies.statusLabel")}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as CompanyStatus | "all")
            }
            options={[
              { value: "all", label: t("companies.allStatuses") },
              { value: "active", label: t("companyStatus.active") },
              { value: "at-risk", label: t("companyStatus.at-risk") },
              { value: "onboarding", label: t("companyStatus.onboarding") },
              { value: "dormant", label: t("companyStatus.dormant") },
            ]}
            containerClassName="min-w-0"
          />
          <Select
            aria-label={t("companies.servicesLabel")}
            value={service}
            onChange={(event) =>
              setService(event.target.value as ServiceKey | "all")
            }
            options={[
              { value: "all", label: t("companies.allServices") },
              { value: "audit", label: t("service.audit") },
              { value: "tax", label: t("service.tax") },
              { value: "companySecretarial", label: t("service.companySecretarial") },
              { value: "accounts", label: t("service.accounts") },
              { value: "payroll", label: t("service.payroll") },
              { value: "funding", label: t("service.funding") },
              { value: "advisory", label: t("service.advisory") },
            ]}
            containerClassName="min-w-0"
          />
          <Select
            aria-label={t("companies.riskLabel")}
            value={risk}
            onChange={(event) => setRisk(event.target.value as RiskLevel | "all")}
            options={[
              { value: "all", label: t("companies.allRisks") },
              { value: "low", label: t("risk.low") },
              { value: "medium", label: t("risk.medium") },
              { value: "high", label: t("risk.high") },
            ]}
            containerClassName="min-w-0"
          />
        </div>
        <div className="flex items-center justify-between gap-2 lg:justify-end">
          <span className="text-[10px] text-slate-400">
            {t("common.showing", { shown: filtered.length, total: data.companies.length })}
          </span>
          {activeFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              leftIcon={<X className="h-3.5 w-3.5" />}
            >
              {t("common.clearFilters")}
            </Button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-5 w-5" />}
          title={t("companies.empty")}
          description={t("companies.emptyHint")}
          action={
            <Button onClick={() => setModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
              {t("companies.add")}
            </Button>
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <CompanyTable companies={filtered} />
      )}

      <CompanyFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(company) => {
          router.push(`/companies/detail/?id=${encodeURIComponent(company.id)}`);
        }}
      />
    </div>
  );
}

function PortfolioStat({
  icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white px-3.5 py-3 shadow-card">
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tone)}>
        {icon}
      </span>
      <div>
        <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="text-lg font-semibold leading-tight text-ink tabular-nums">
          {value}
          {suffix && <span className="text-[10px] font-medium text-slate-400">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
