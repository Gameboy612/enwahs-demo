"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  MessageSquare,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DonutChart,
  DonutLegend,
  GroupedBarChart,
  HorizontalBar,
  StackedBarChart,
} from "@/components/ui/charts";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedControl } from "@/components/ui/segmented";
import { StatCard } from "@/components/ui/stat-card";
import { monthlyVolume, taskThroughput } from "@/data/analytics";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import {
  averageResponse,
  healthBand,
  isOpen,
  memberLoad,
  openTasks,
} from "@/lib/selectors";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Range = "last30" | "quarter";

export function ReportsView() {
  const { data } = useDemo();
  const { t, pick, formatDate, formatNumber } = useI18n();
  const { toast } = useToast();
  const [range, setRange] = useState<Range>("last30");

  // Charts always show the six-month trend; the range selector controls the
  // headline KPI window so the visualisation never collapses to one bar.
  const months = monthlyVolume;
  const throughput = taskThroughput;
  const rangeThroughput =
    range === "last30" ? taskThroughput.slice(-1) : taskThroughput.slice(-3);
  const current = monthlyVolume[monthlyVolume.length - 1];
  const open = openTasks(data.tasks);
  const avgResponse = averageResponse(data.threads);
  const completed = rangeThroughput.reduce((total, point) => total + point.completed, 0);
  const created = rangeThroughput.reduce((total, point) => total + point.created, 0);

  const healthCounts = useMemo(() => {
    return data.companies.reduce(
      (counts, company) => {
        const band = healthBand(company.healthScore);
        counts[band] += 1;
        return counts;
      },
      { healthy: 0, watch: 0, risk: 0 },
    );
  }, [data.companies]);

  const workload = data.team
    .map((member) => ({ member, load: memberLoad(member, data.tasks) }))
    .sort((a, b) => b.load.utilization - a.load.utilization);
  const exportReport = () => {
    const header = [
      "ID",
      t("tasks.titleLabel"),
      t("common.company"),
      t("common.assignee"),
      t("common.status"),
      t("common.priority"),
      t("common.dueDate"),
      t("common.channel"),
    ];
    const rows = data.tasks.map((task) => {
      const company = data.companies.find((item) => item.id === task.companyId);
      const assignee = data.team.find((item) => item.id === task.assigneeId);
      return [
        task.id,
        pick(task.title),
        company ? pick(company.name) : "",
        assignee ? pick(assignee.name) : "",
        t(`status.${task.status}`),
        t(`common.${task.priority}`),
        task.due,
        t(`channel.${task.channel}`),
      ];
    });
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `enwahs-crm-report-${range}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast(t("reports.exported"));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("reports.title")}
        actions={
          <>
            <SegmentedControl
              options={[
                { value: "last30", label: t("reports.last30") },
                { value: "quarter", label: t("reports.thisQuarter") },
              ]}
              value={range}
              onChange={setRange}
              ariaLabel={t("reports.range")}
            />
            <Button
              variant="secondary"
              onClick={exportReport}
              leftIcon={<Download className="h-4 w-4" />}
            >
              {t("reports.export")}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("reports.tasksClosed")}
          value={formatNumber(completed)}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone="teal"
        />
        <StatCard
          label={t("reports.avgCompletion")}
          value={`2.4 ${t("reports.days")}`}
          icon={<Clock3 className="h-4 w-4" />}
          tone="brand"
        />
        <StatCard
          label={t("reports.responseTime")}
          value={`${avgResponse} ${t("reports.minutes")}`}
          icon={<Timer className="h-4 w-4" />}
          tone="gold"
        />
        <StatCard
          label={t("reports.aiHandled")}
          value="64%"
          icon={<Sparkles className="h-4 w-4" />}
          tone="brand"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <h3 className="text-[13px] font-semibold text-ink">{t("reports.throughput")}</h3>
            </div>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-semibold text-teal-700">
              {formatNumber(created)} → {formatNumber(completed)}
            </span>
          </CardHeader>
          <CardContent className="pt-4">
            <GroupedBarChart
              data={throughput.map((point) => ({
                label: formatDate(`${point.month}-01`, "month"),
                values: { created: point.created, completed: point.completed },
              }))}
              series={[
                { key: "created", label: t("tasks.add"), color: "#aedbde" },
                { key: "completed", label: t("reports.completed"), color: "#159895" },
              ]}
              height={190}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h3 className="text-[13px] font-semibold text-ink">{t("reports.channelMix")}</h3>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {formatDate(`${current.month}-01`, "month")}
              </p>
            </div>
            <MessageSquare className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5 pt-4 sm:flex-row sm:justify-center xl:flex-col">
            <DonutChart
              data={[
                { label: t("channel.whatsapp"), value: current.whatsapp, color: "#25D366" },
                { label: t("channel.wechat"), value: current.wechat, color: "#07C160" },
                { label: t("channel.email"), value: current.email, color: "#94a3b8" },
              ]}
              size={150}
              thickness={17}
              centerValue={formatNumber(current.whatsapp + current.wechat + current.email)}
              centerLabel={t("common.messages")}
            />
            <div className="w-full max-w-[220px]">
              <DonutLegend
                data={[
                  { label: t("channel.whatsapp"), value: current.whatsapp, color: "#25D366" },
                  { label: t("channel.wechat"), value: current.wechat, color: "#07C160" },
                  { label: t("channel.email"), value: current.email, color: "#94a3b8" },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <h3 className="text-[13px] font-semibold text-ink">
                {t("reports.volumeTrend")}
              </h3>
            </div>
            <TrendingUp className="h-4 w-4 text-teal-500" aria-hidden="true" />
          </CardHeader>
          <CardContent className="pt-4">
            <StackedBarChart
              data={months.map((point) => ({
                label: formatDate(`${point.month}-01`, "month"),
                values: {
                  whatsapp: point.whatsapp,
                  wechat: point.wechat,
                  email: point.email,
                },
              }))}
              series={[
                { key: "whatsapp", label: t("channel.whatsapp"), color: "#25D366" },
                { key: "wechat", label: t("channel.wechat"), color: "#07C160" },
                { key: "email", label: t("channel.email"), color: "#94a3b8" },
              ]}
              height={180}
              valueFormatter={(value) => formatNumber(value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h3 className="text-[13px] font-semibold text-ink">{t("reports.clientHealth")}</h3>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {formatNumber(data.companies.length)} {t("companies.title")}
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5 pt-4 sm:flex-row sm:justify-center xl:flex-col">
            <DonutChart
              data={[
                { label: t("reports.healthy"), value: healthCounts.healthy, color: "#159895" },
                { label: t("reports.watch"), value: healthCounts.watch, color: "#c9a227" },
                { label: t("reports.highRisk"), value: healthCounts.risk, color: "#dc2626" },
              ]}
              size={150}
              thickness={17}
              centerValue={data.companies.length}
              centerLabel={t("companies.title")}
            />
            <div className="w-full max-w-[220px]">
              <DonutLegend
                data={[
                  { label: t("reports.healthy"), value: healthCounts.healthy, color: "#159895" },
                  { label: t("reports.watch"), value: healthCounts.watch, color: "#c9a227" },
                  { label: t("reports.highRisk"), value: healthCounts.risk, color: "#dc2626" },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <h3 className="text-[13px] font-semibold text-ink">
                {t("reports.teamWorkload")}
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">
              {open.length} {t("common.openTasks")}
            </span>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-4">
            {workload.map(({ member, load }) => (
              <div key={member.id}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-600">
                    <Avatar name={pick(member.name)} color={member.accent} size="xs" />
                    {pick(member.name)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {load.weightedHours}h / {member.capacityHours}h
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
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h3 className="text-[13px] font-semibold text-ink">
                {t("reports.teamPerformance")}
              </h3>
              <p className="mt-0.5 text-[10px] text-slate-400">{t("team.capacityHint")}</p>
            </div>
          </CardHeader>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-y border-line bg-slate-50/60 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-5 py-2.5">{t("common.team")}</th>
                  <th className="px-3 py-2.5 text-center">{t("common.openTasks")}</th>
                  <th className="px-3 py-2.5">{t("reports.utilization")}</th>
                  <th className="px-5 py-2.5 text-right">{t("common.capacity")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {workload.map(({ member, load }) => (
                  <tr key={member.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={pick(member.name)} color={member.accent} size="xs" />
                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-medium text-ink">
                            {pick(member.name)}
                          </p>
                          <p className="truncate text-[9px] text-slate-400">
                            {pick(member.title)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-[11px] font-semibold tabular-nums text-ink">
                      {load.assigned.length}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
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
                        <span className="text-[10px] text-slate-500">{load.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-right text-[10px] text-slate-400">
                      {member.capacityHours} {t("common.hours")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

    </div>
  );
}
