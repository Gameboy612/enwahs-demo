"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LayoutGrid, List, Plus, Search, X } from "lucide-react";
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

type ViewMode = "grid" | "table";

export function CompaniesView() {
  const router = useRouter();
  const { data } = useDemo();
  const { t, pick } = useI18n();
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
        return [pick(company.name), pick(company.industry), pick(company.contact.name)]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => a.healthScore - b.healthScore);
  }, [data.companies, pick, risk, search, service, status]);

  const openTaskCount = data.tasks.filter(isOpen).length;
  const atRisk = data.companies.filter((company) => company.status === "at-risk").length;
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
        title={t("companies.title")}
        actions={
          <>
            <SegmentedControl
              options={[
                { value: "grid", label: t("companies.grid"), icon: <LayoutGrid className="h-3.5 w-3.5" /> },
                { value: "table", label: t("companies.table"), icon: <List className="h-3.5 w-3.5" /> },
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

      <p className="text-[10px] text-slate-400">
        {data.companies.length} {t("companies.title")} · {openTaskCount}{" "}
        {t("common.openTasks")} · {atRisk} {t("companies.highRisk")}
      </p>

      <div className="surface-card flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("companies.searchPlaceholder")}
          leftIcon={<Search className="h-3.5 w-3.5" />}
          aria-label={t("common.search")}
          containerClassName="flex-1"
          className="h-9"
        />
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <Select
            aria-label={t("companies.statusLabel")}
            value={status}
            onChange={(event) => setStatus(event.target.value as CompanyStatus | "all")}
            options={[
              { value: "all", label: t("companies.allStatuses") },
              { value: "active", label: t("companyStatus.active") },
              { value: "at-risk", label: t("companyStatus.at-risk") },
              { value: "onboarding", label: t("companyStatus.onboarding") },
              { value: "dormant", label: t("companyStatus.dormant") },
            ]}
            containerClassName="min-w-0"
            className="h-9"
          />
          <Select
            aria-label={t("companies.servicesLabel")}
            value={service}
            onChange={(event) => setService(event.target.value as ServiceKey | "all")}
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
            className="h-9"
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
            className="h-9"
          />
        </div>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex h-9 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium text-slate-400 transition hover:bg-slate-50 hover:text-ink"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            {t("common.clearFilters")}
          </button>
        )}
        <span className="shrink-0 text-right text-[9px] text-slate-400">
          {filtered.length}/{data.companies.length}
        </span>
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
