"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Languages, Mail, MapPin, Phone, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { TaskStatusBadge } from "@/components/domain/badges";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { memberLoad } from "@/lib/selectors";
import type { MemberRole, TeamMember } from "@/lib/types";
import { cn } from "@/lib/utils";

const roleTone: Record<MemberRole, "brand" | "teal" | "gold" | "neutral"> = {
  partner: "brand",
  lead: "teal",
  associate: "gold",
  assistant: "neutral",
};

const languageKey: Record<
  string,
  "team.languageCantonese" | "team.languageEnglish" | "team.languageMandarin"
> = {
  cantonese: "team.languageCantonese",
  english: "team.languageEnglish",
  mandarin: "team.languageMandarin",
};

export function TeamView() {
  const { data } = useDemo();
  const { t, pick, dueLabel } = useI18n();
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

  const selectedLoad = selected ? memberLoad(selected, data.tasks) : null;
  const selectedTasks = selected
    ? data.tasks.filter(
        (task) => task.assigneeIds.includes(selected.id) && task.status !== "done",
      )
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("team.title")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("team.searchPlaceholder")}
              leftIcon={<Search className="h-3.5 w-3.5" />}
              aria-label={t("common.search")}
              containerClassName="w-full sm:w-56"
              className="h-9"
            />
            <Select
              aria-label={t("team.filterRole")}
              value={role}
              onChange={(event) => setRole(event.target.value as MemberRole | "all")}
              options={[
                { value: "all", label: t("team.allRoles") },
                { value: "partner", label: t("role.partner") },
                { value: "lead", label: t("role.lead") },
                { value: "associate", label: t("role.associate") },
                { value: "assistant", label: t("role.assistant") },
              ]}
              containerClassName="w-36"
              className="h-9"
            />
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title={t("team.noMembers")} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((member) => {
            const load = memberLoad(member, data.tasks);
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelected(member)}
                className="surface-card p-4 text-left transition hover:border-brand-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <Avatar name={pick(member.name)} color={member.accent} size="lg" />
                  <Badge tone={roleTone[member.role]}>{t(`role.${member.role}`)}</Badge>
                </div>
                <h3 className="mt-3 truncate text-[12px] font-medium text-ink">
                  {pick(member.name)}
                </h3>
                <p className="mt-0.5 truncate text-[9px] text-slate-400">
                  {pick(member.title)}
                </p>
                <div className="mt-4 flex items-center justify-between text-[9px] text-slate-400">
                  <span>
                    {load.assigned.length} {t("common.openTasks")}
                  </span>
                  <span className="tabular-nums">{load.utilization}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      load.utilization > 100
                        ? "bg-red-500"
                        : load.utilization > 80
                          ? "bg-gold-500"
                          : "bg-teal-500",
                    )}
                    style={{ width: `${Math.min(load.utilization, 100)}%` }}
                  />
                </div>
                <div className="mt-3 border-t border-line/60 pt-2.5">
                  <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
                    {t("team.assignedTasks")}
                  </p>
                  {load.assigned.length === 0 ? (
                    <p className="mt-1.5 text-[9px] text-slate-400">
                      {t("team.noOpenTasks")}
                    </p>
                  ) : (
                    <div className="mt-1.5 space-y-1">
                      {load.assigned.slice(0, 3).map((task) => (
                        <p
                          key={task.id}
                          className="flex items-center gap-1.5 text-[9px] text-slate-500"
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 shrink-0 rounded-full",
                              task.status === "doing"
                                ? "bg-amber-400"
                                : "bg-orange-400",
                            )}
                          />
                          <span className="truncate">{pick(task.title)}</span>
                        </p>
                      ))}
                      {load.assigned.length > 3 && (
                        <p className="text-[8px] text-slate-400">
                          +{load.assigned.length - 3} {t("common.more")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? pick(selected.name) : ""}
        description={selected ? pick(selected.title) : ""}
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
              <div className="space-y-1 text-[10px] text-slate-400">
                <p className="flex items-center gap-2">
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  {selected.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-3 w-3" aria-hidden="true" />
                  {selected.phone}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {selected.location === "shenzhen" ? t("team.shenzhen") : t("team.hongKong")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <MiniStat label={t("team.openTasks")} value={String(selectedLoad.assigned.length)} />
              <MiniStat label={t("team.capacity")} value={`${selected.capacityHours}h`} />
              <MiniStat label={t("team.utilization")} value={`${selectedLoad.utilization}%`} />
            </div>

            <div>
              <h3 className="mb-2 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                {t("team.assignedTasks")}
              </h3>
              <div className="space-y-1.5">
                {selectedTasks.map((task) => {
                  const company = data.companies.find((item) => item.id === task.companyId);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 rounded-lg border border-line px-3 py-2"
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
                        <p className="truncate text-[10px] font-medium text-ink">
                          {pick(task.title)}
                        </p>
                        <p className="truncate text-[9px] text-slate-400">
                          {company ? pick(company.shortName) : ""} · {dueLabel(task.due)}
                        </p>
                      </div>
                      <TaskStatusBadge status={task.status} />
                    </div>
                  );
                })}
                {selectedTasks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-line py-6 text-center text-[10px] text-slate-400">
                    {t("team.noOpenTasks")}
                  </p>
                )}
              </div>
            </div>

            <p className="flex items-center gap-2 text-[9px] text-slate-400">
              <Languages className="h-3 w-3" aria-hidden="true" />
              {selected.languages
                .map((language) => t(languageKey[language] ?? "team.languageEnglish"))
                .join(" · ")}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[8px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-[11px] font-medium tabular-nums text-ink">{value}</p>
    </div>
  );
}
