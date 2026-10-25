"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckSquare,
  Languages,
  Mail,
  MapPin,
  Phone,
  Search,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Progress } from "@/components/ui/progress";
import { HorizontalBar } from "@/components/ui/charts";
import { TaskStatusBadge } from "@/components/domain/badges";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { memberLoad, openTasks } from "@/lib/selectors";
import type { MemberRole, TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

const roleTone: Record<MemberRole, "brand" | "teal" | "gold" | "neutral"> = {
  partner: "brand",
  lead: "teal",
  associate: "gold",
  assistant: "neutral",
};

const languageKey: Record<string, "team.languageCantonese" | "team.languageEnglish" | "team.languageMandarin"> = {
  cantonese: "team.languageCantonese",
  english: "team.languageEnglish",
  mandarin: "team.languageMandarin",
};

export function TeamView() {
  const { data } = useDemo();
  const { t, pick, formatNumber, dueLabel } = useI18n();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<MemberRole | "all">("all");
  const [selected, setSelected] = useState<TeamMember | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return data.team
      .filter((member) => role === "all" || member.role === role)
      .filter((member) => {
        if (!query) return true;
        return [pick(member.name), pick(member.title), member.email]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [data.team, pick, role, search]);

  const loads = data.team.map((member) => memberLoad(member, data.tasks));
  const avgUtilization = Math.round(
    loads.reduce((total, load) => total + load.utilization, 0) / Math.max(loads.length, 1),
  );
  const available = loads.filter((load) => load.utilization < 80).length;
  const assignedOpen = openTasks(data.tasks).length;

  const roleOptions = [
    { value: "all", label: t("team.allRoles") },
    { value: "partner", label: t("role.partner") },
    { value: "lead", label: t("role.lead") },
    { value: "associate", label: t("role.associate") },
    { value: "assistant", label: t("role.assistant") },
  ];

  const selectedLoad = selected ? memberLoad(selected, data.tasks) : null;
  const selectedTasks = selected
    ? openTasks(data.tasks).filter((task) => task.assigneeId === selected.id)
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("nav.manage")}
        title={t("team.title")}
        description={t("team.subtitle")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("team.searchPlaceholder")}
              leftIcon={<Search className="h-4 w-4" />}
              aria-label={t("common.search")}
              containerClassName="w-full sm:w-60"
              className="h-9"
            />
            <Select
              aria-label={t("team.filterRole")}
              value={role}
              onChange={(event) => setRole(event.target.value as MemberRole | "all")}
              options={roleOptions}
              containerClassName="w-36"
              className="h-9"
            />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <TeamStat
          icon={<Users className="h-4 w-4" />}
          label={t("team.title")}
          value={formatNumber(data.team.length)}
          tone="bg-brand-50 text-brand-600"
        />
        <TeamStat
          icon={<CheckSquare className="h-4 w-4" />}
          label={t("team.openTasks")}
          value={formatNumber(assignedOpen)}
          tone="bg-teal-50 text-teal-600"
        />
        <TeamStat
          icon={<ArrowUpRight className="h-4 w-4" />}
          label={t("team.utilization")}
          value={`${avgUtilization}%`}
          tone="bg-gold-50 text-gold-600"
        />
        <TeamStat
          icon={<Users className="h-4 w-4" />}
          label={t("team.available")}
          value={formatNumber(available)}
          suffix={`/ ${data.team.length}`}
          tone="bg-slate-100 text-slate-500"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={t("team.noMembers")} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((member) => {
            const load = memberLoad(member, data.tasks);
            const over = load.utilization > 100;
            const busy = load.utilization >= 80;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelected(member)}
                className="group surface-card relative overflow-hidden p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-2">
                  <Avatar name={pick(member.name)} color={member.accent} size="lg" />
                  <Badge tone={roleTone[member.role]}>{t(`role.${member.role}`)}</Badge>
                </div>
                <h3 className="mt-3 text-[13px] font-semibold text-ink">
                  {pick(member.name)}
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-400">{pick(member.title)}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-2.5 w-2.5" aria-hidden="true" />
                    {member.location === "shenzhen" ? t("team.shenzhen") : t("team.hongKong")}
                  </span>
                  <span className="h-2.5 w-px bg-line" />
                  <span className="inline-flex items-center gap-1">
                    <Languages className="h-2.5 w-2.5" aria-hidden="true" />
                    {member.languages
                      .map((language) => t(languageKey[language] ?? "team.languageEnglish"))
                      .join(" · ")}
                  </span>
                </div>

                <div className="mt-3 rounded-xl bg-slate-50/70 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2 text-[9px]">
                    <span className="font-medium text-slate-500">{t("team.utilization")}</span>
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        over ? "text-red-600" : busy ? "text-gold-600" : "text-teal-700",
                      )}
                    >
                      {load.utilization}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(load.utilization, 100)}
                    tone={over ? "red" : busy ? "gold" : "teal"}
                    className="mt-1.5"
                    trackClassName="h-1"
                  />
                  <div className="mt-1.5 flex items-center justify-between text-[9px] text-slate-400">
                    <span>{load.assigned.length} {t("team.openTasks")}</span>
                    <span>
                      {load.weightedHours}h / {member.capacityHours}h
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[9px] font-semibold",
                      over ? "text-red-600" : busy ? "text-gold-600" : "text-teal-700",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        over ? "bg-red-500" : busy ? "bg-gold-500" : "bg-teal-500",
                      )}
                    />
                    {over ? t("team.overCapacity") : busy ? t("team.busy") : t("team.available")}
                  </span>
                  <span className="text-[9px] font-semibold text-brand-600 opacity-0 transition group-hover:opacity-100">
                    {t("common.details")} →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <div>
            <h3 className="text-[13px] font-semibold text-ink">
              {t("team.workloadDistribution")}
            </h3>
            <p className="mt-0.5 text-[10px] text-slate-400">{t("team.utilisationHint")}</p>
          </div>
          <Link
            href="/tasks/"
            className="text-[10px] font-semibold text-brand-600 hover:text-brand-800"
          >
            {t("team.openTaskList")}
          </Link>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
          {data.team.map((member) => {
            const load = memberLoad(member, data.tasks);
            return (
              <div key={member.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-[10.5px] font-medium text-slate-600">
                    <Avatar name={pick(member.name)} color={member.accent} size="xs" />
                    {pick(member.name)}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {load.assigned.length} {t("common.tasks")}
                  </span>
                </div>
                <HorizontalBar
                  label=""
                  value={load.utilization}
                  max={100}
                  color={
                    load.utilization > 100
                      ? "#dc2626"
                      : load.utilization > 80
                        ? "#c9a227"
                        : "#159895"
                  }
                  suffix="%"
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={t("team.memberProfile")}
        description={
          selected
            ? `${pick(selected.name)} · ${pick(selected.title)}`
            : undefined
        }
        size="lg"
        closeLabel={t("common.close")}
        footer={
          selected ? (
            <Link href={`/tasks/?assignee=${encodeURIComponent(selected.id)}`}>
              <Button leftIcon={<ArrowUpRight className="h-4 w-4" />}>
                {t("team.viewTasks")}
              </Button>
            </Link>
          ) : null
        }
      >
        {selected && selectedLoad && (
          <div className="space-y-4 px-6 py-5">
            <div className="flex items-center gap-4">
              <Avatar name={pick(selected.name)} color={selected.accent} size="xl" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-ink">{pick(selected.name)}</p>
                  <Badge tone={roleTone[selected.role]}>{t(`role.${selected.role}`)}</Badge>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">{pick(selected.title)}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3 w-3" aria-hidden="true" />
                    {selected.email}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3" aria-hidden="true" />
                    {selected.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <MiniStat label={t("team.openTasks")} value={String(selectedLoad.assigned.length)} />
              <MiniStat label={t("team.capacity")} value={`${selected.capacityHours}h`} />
              <MiniStat label={t("team.utilization")} value={`${selectedLoad.utilization}%`} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[11px] font-semibold text-ink">
                  {t("team.assignedTasks")}
                </h3>
                <span className="text-[9px] text-slate-400">
                  {selectedLoad.weightedHours}h {t("common.hours")}
                </span>
              </div>
              <div className="space-y-1.5">
                {selectedTasks.map((task) => {
                  const company = data.companies.find((item) => item.id === task.companyId);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 rounded-xl border border-line px-3 py-2.5"
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          task.priority === "high"
                            ? "bg-red-500"
                            : task.priority === "medium"
                              ? "bg-gold-500"
                              : "bg-slate-300",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-ink">
                          {pick(task.title)}
                        </p>
                        <p className="truncate text-[9px] text-slate-400">
                          {company ? pick(company.name) : ""} · {dueLabel(task.due)}
                        </p>
                      </div>
                      <TaskStatusBadge status={task.status} />
                    </div>
                  );
                })}
                {selectedTasks.length === 0 && (
                  <p className="rounded-xl border border-dashed border-line py-6 text-center text-[10px] text-slate-400">
                    {t("team.noOpenTasks")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[10px] text-slate-500">
              <Languages className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
              {selected.languages
                .map((language) => t(languageKey[language] ?? "team.languageEnglish"))
                .join(" · ")}
              <span className="ml-auto inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {selected.location === "shenzhen" ? t("team.shenzhen") : t("team.hongKong")}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function TeamStat({
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
        <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-lg font-semibold leading-tight text-ink tabular-nums">
          {value}
          {suffix && <span className="ml-1 text-[10px] font-medium text-slate-400">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line bg-slate-50/60 px-3 py-2.5">
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink tabular-nums">{value}</p>
    </div>
  );
}
