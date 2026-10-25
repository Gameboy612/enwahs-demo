"use client";

import { useEffect, useState } from "react";
import { Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useDemo, type CompanyDraft } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import type {
  Company,
  CompanyStatus,
  Localized,
  RiskLevel,
  ServiceKey,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const serviceKeys: ServiceKey[] = [
  "audit",
  "tax",
  "companySecretarial",
  "accounts",
  "payroll",
  "funding",
  "advisory",
];

const toLocalized = (value: string): Localized => ({
  en: value,
  zhHant: value,
  zhHans: value,
});

type FormState = {
  name: string;
  industry: string;
  status: CompanyStatus;
  risk: RiskLevel;
  services: ServiceKey[];
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  phone: string;
  email: string;
  address: string;
  brNumber: string;
  since: string;
  tags: string;
};

const emptyForm = (): FormState => ({
  name: "",
  industry: "",
  status: "onboarding",
  risk: "low",
  services: ["accounts"],
  contactName: "",
  contactTitle: "",
  contactEmail: "",
  contactPhone: "",
  phone: "",
  email: "",
  address: "",
  brNumber: "",
  since: String(new Date().getFullYear()),
  tags: "",
});

export function CompanyFormModal({
  open,
  onClose,
  company,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  company?: Company | null;
  onCreated?: (company: Company) => void;
}) {
  const { addCompany, updateCompany } = useDemo();
  const { t, pick } = useI18n();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (company) {
      setForm({
        name: pick(company.name),
        industry: pick(company.industry),
        status: company.status,
        risk: company.risk,
        services: company.services,
        contactName: pick(company.contact.name),
        contactTitle: pick(company.contact.title),
        contactEmail: company.contact.email,
        contactPhone: company.contact.phone,
        phone: company.phone,
        email: company.email,
        address: pick(company.address),
        brNumber: company.brNumber,
        since: company.since,
        tags: company.tags.map((tag) => pick(tag)).join(", "),
      });
    } else {
      setForm(emptyForm());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, company?.id]);

  const update = (patch: Partial<FormState>) =>
    setForm((current) => ({ ...current, ...patch }));

  const toggleService = (service: ServiceKey) => {
    setForm((current) => ({
      ...current,
      services: current.services.includes(service)
        ? current.services.filter((item) => item !== service)
        : [...current.services, service],
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError(t("companies.companyNamePlaceholder"));
      return;
    }
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map(toLocalized);

    if (company) {
      updateCompany(company.id, {
        name: form.name === pick(company.name) ? company.name : toLocalized(form.name.trim()),
        shortName:
          form.name === pick(company.name) ? company.shortName : toLocalized(form.name.trim()),
        industry:
          form.industry === pick(company.industry)
            ? company.industry
            : toLocalized(form.industry.trim()),
        status: form.status,
        risk: form.risk,
        services: form.services,
        contact: {
          ...company.contact,
          name:
            form.contactName === pick(company.contact.name)
              ? company.contact.name
              : toLocalized(form.contactName.trim()),
          title:
            form.contactTitle === pick(company.contact.title)
              ? company.contact.title
              : toLocalized(form.contactTitle.trim()),
          email: form.contactEmail,
          phone: form.contactPhone,
        },
        phone: form.phone,
        email: form.email,
        address:
          form.address === pick(company.address)
            ? company.address
            : toLocalized(form.address.trim()),
        brNumber: form.brNumber,
        since: form.since,
        tags,
      });
      toast(t("toast.companyUpdated"));
    } else {
      const draft: CompanyDraft = {
        name: toLocalized(form.name.trim()),
        industry: toLocalized(form.industry.trim()),
        status: form.status,
        risk: form.risk,
        services: form.services,
        contactName: toLocalized(form.contactName.trim()),
        contactTitle: toLocalized(form.contactTitle.trim()),
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        phone: form.phone,
        email: form.email,
        address: toLocalized(form.address.trim()),
        brNumber: form.brNumber,
        since: form.since,
        tags,
      };
      const created = addCompany(draft);
      toast(t("toast.companyAdded"));
      onCreated?.(created);
    }
    onClose();
  };

  const statusOptions = [
    { value: "active", label: t("companyStatus.active") },
    { value: "at-risk", label: t("companyStatus.at-risk") },
    { value: "onboarding", label: t("companyStatus.onboarding") },
    { value: "dormant", label: t("companyStatus.dormant") },
  ];
  const riskOptions = [
    { value: "low", label: t("risk.low") },
    { value: "medium", label: t("risk.medium") },
    { value: "high", label: t("risk.high") },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={company ? t("companies.editCompany") : t("companies.newCompany")}
      description={t("companies.companyProfile")}
      size="lg"
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="company-form">
            {company ? t("common.saveChanges") : t("companies.createCompany")}
          </Button>
        </>
      }
    >
      <form id="company-form" onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          <Building2 className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
          {t("companies.companyDetails")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("companies.companyName")}
            value={form.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder={t("companies.companyNamePlaceholder")}
            error={error ?? undefined}
            required
            autoFocus
          />
          <Input
            label={t("companies.industry")}
            value={form.industry}
            onChange={(event) => update({ industry: event.target.value })}
            placeholder={t("companies.industryPlaceholder")}
          />
          <Select
            label={t("companies.statusLabel")}
            value={form.status}
            onChange={(event) => update({ status: event.target.value as CompanyStatus })}
            options={statusOptions}
          />
          <Select
            label={t("companies.riskLabel")}
            value={form.risk}
            onChange={(event) => update({ risk: event.target.value as RiskLevel })}
            options={riskOptions}
          />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-600">
            {t("companies.servicesLabel")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {serviceKeys.map((service) => {
              const selected = form.services.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                    selected
                      ? "border-brand-300 bg-brand-50 text-brand-700"
                      : "border-line bg-white text-slate-500 hover:border-brand-200",
                  )}
                >
                  {selected && <Check className="h-3 w-3" aria-hidden="true" />}
                  {t(`service.${service}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("companies.brLabel")}
            value={form.brNumber}
            onChange={(event) => update({ brNumber: event.target.value })}
            placeholder="51234567"
          />
          <Input
            label={t("companies.sinceLabel")}
            value={form.since}
            onChange={(event) => update({ since: event.target.value })}
            placeholder="2019"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("common.phone")}
            value={form.phone}
            onChange={(event) => update({ phone: event.target.value })}
            placeholder="+852 2345 6789"
          />
          <Input
            type="email"
            label={t("common.email")}
            value={form.email}
            onChange={(event) => update({ email: event.target.value })}
            placeholder="accounts@company.hk"
          />
        </div>

        <Textarea
          label={t("common.address")}
          value={form.address}
          onChange={(event) => update({ address: event.target.value })}
          className="min-h-[72px]"
        />

        <div className="border-t border-line pt-4">
          <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {t("companies.contactDetails")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("companies.contactName")}
              value={form.contactName}
              onChange={(event) => update({ contactName: event.target.value })}
            />
            <Input
              label={t("companies.contactTitle")}
              value={form.contactTitle}
              onChange={(event) => update({ contactTitle: event.target.value })}
            />
            <Input
              type="email"
              label={t("companies.contactEmail")}
              value={form.contactEmail}
              onChange={(event) => update({ contactEmail: event.target.value })}
            />
            <Input
              label={t("companies.contactPhone")}
              value={form.contactPhone}
              onChange={(event) => update({ contactPhone: event.target.value })}
            />
          </div>
        </div>

        <Input
          label={t("companies.tagsLabel")}
          value={form.tags}
          onChange={(event) => update({ tags: event.target.value })}
          placeholder={t("companies.tagsPlaceholder")}
          hint={t("common.optional")}
        />
      </form>
    </Modal>
  );
}
