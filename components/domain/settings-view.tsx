"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Database,
  Download,
  Info,
  Languages,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { APP_VERSION, DEMO_TODAY } from "@/lib/constants";
import { useDemo } from "@/lib/demo-store";
import { LANGUAGE_OPTIONS, useI18n } from "@/lib/i18n";
import { openTasks, unreadCount } from "@/lib/selectors";
import { useToast } from "@/components/ui/toast";
import { asset, cn } from "@/lib/utils";

export function SettingsView() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { data, updateSettings, resetData, exportData } = useDemo();
  const { t, pick, lang, setLang, formatDate, formatNumber } = useI18n();
  const { toast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [saved, setSaved] = useState(false);

  const member = data.team.find((person) => person.id === session?.memberId) ?? data.team[0];
  const open = openTasks(data.tasks).length;
  const unread = unreadCount(data.threads);

  const toggle = (key: keyof typeof data.settings) => (value: boolean) => {
    updateSettings({ [key]: value });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const handleReset = () => {
    resetData();
    toast(t("toast.dataReset"), "info");
    signOut();
    router.push("/");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={t("nav.manage")}
        title={t("settings.title")}
        description={t("settings.subtitle")}
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              signOut();
              router.push("/");
            }}
            leftIcon={<LogOut className="h-4 w-4" />}
          >
            {t("settings.signOut")}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">{t("settings.profile")}</h3>
                <p className="mt-0.5 text-[10px] text-slate-400">{t("settings.profileHint")}</p>
              </div>
              <UserRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar name={pick(member.name)} color={member.accent} size="2xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-ink">{pick(member.name)}</p>
                    <Badge tone="brand">{t(`role.${member.role}`)}</Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">{pick(member.title)}</p>
                  <div className="mt-2 grid gap-1 text-[10px] text-slate-400 sm:grid-cols-2">
                    <span>{member.email}</span>
                    <span>{member.phone}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-slate-50/70 px-3 py-2 text-[10px] text-slate-500">
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">
                    {t("settings.signedInAs")}
                  </p>
                  <p className="mt-0.5 font-semibold text-ink">{pick(member.name)}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line/70 pt-3">
                <ProfileStat label={t("common.openTasks")} value={formatNumber(open)} />
                <ProfileStat label={t("inbox.unread")} value={formatNumber(unread)} />
                <ProfileStat
                  label={t("common.company")}
                  value={formatNumber(data.companies.length)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">{t("settings.language")}</h3>
                <p className="mt-0.5 text-[10px] text-slate-400">{t("settings.languageHint")}</p>
              </div>
              <Languages className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={t("settings.language")}>
                {LANGUAGE_OPTIONS.map((option) => {
                  const active = option.code === lang;
                  return (
                    <button
                      key={option.code}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setLang(option.code)}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition",
                        active
                          ? "border-brand-300 bg-brand-50/50 ring-1 ring-brand-200/60"
                          : "border-line bg-white hover:border-brand-200",
                      )}
                    >
                      <span>
                        <span className="block text-[11px] font-semibold text-ink">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-[9px] text-slate-400">
                          {option.code === "en"
                            ? "English"
                            : option.code === "zh-Hant"
                              ? "Traditional Chinese"
                              : "Simplified Chinese"}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border",
                          active ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300",
                        )}
                      >
                        {active && <Check className="h-2.5 w-2.5" aria-hidden="true" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("settings.notifications")}
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {t("settings.notificationsHint")}
                </p>
              </div>
              {saved && (
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-teal-600">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  {t("settings.saved")}
                </span>
              )}
            </CardHeader>
            <CardContent className="divide-y divide-line/70 pt-0">
              <Switch
                checked={data.settings.dailyBrief}
                onChange={toggle("dailyBrief")}
                label={t("settings.dailyBrief")}
                description={t("settings.dailyBriefHint")}
              />
              <Switch
                checked={data.settings.taskReminders}
                onChange={toggle("taskReminders")}
                label={t("settings.taskReminders")}
                description={t("settings.taskRemindersHint")}
              />
              <Switch
                checked={data.settings.weeklyReport}
                onChange={toggle("weeklyReport")}
                label={t("settings.weeklyReport")}
                description={t("settings.weeklyReportHint")}
              />
              <Switch
                checked={data.settings.channelAlerts}
                onChange={toggle("channelAlerts")}
                label={t("settings.channelAlerts")}
                description={t("settings.channelAlertsHint")}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">
                  {t("settings.demoControls")}
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-400">{t("settings.demoDataHint")}</p>
              </div>
              <Database className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <div className="flex items-center justify-between rounded-xl border border-line bg-slate-50/60 px-3 py-2.5">
                <span className="text-[10px] text-slate-500">{t("settings.dataStored")}</span>
                <Badge tone="teal" dot>
                  {t("app.demo")}
                </Badge>
              </div>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => {
                  exportData();
                  toast(t("toast.exported"));
                }}
                leftIcon={<Download className="h-4 w-4" />}
              >
                {t("settings.exportData")}
              </Button>
              <p className="px-1 text-[9px] leading-relaxed text-slate-400">
                {t("settings.exportHint")}
              </p>
              <div className="divider my-1" />
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setConfirmReset(true)}
                leftIcon={<RotateCcw className="h-4 w-4" />}
              >
                {t("settings.resetDemo")}
              </Button>
              <p className="px-1 text-[9px] leading-relaxed text-slate-400">
                {t("settings.resetDemoHint")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <h3 className="text-[13px] font-semibold text-ink">{t("settings.about")}</h3>
                <p className="mt-0.5 text-[10px] text-slate-400">{t("settings.aboutHint")}</p>
              </div>
              <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <img
                  src={asset("/logo-enwahs.png")}
                  alt="Enwahs"
                  className="h-12 w-12 rounded-xl bg-white object-contain ring-1 ring-line"
                />
                <div>
                  <p className="text-[11px] font-semibold text-ink">Enwahs CRM</p>
                  <p className="mt-0.5 text-[9px] text-slate-400">
                    {t("settings.builtForValue")}
                  </p>
                </div>
              </div>
              <div className="space-y-2 border-t border-line/70 pt-3 text-[10px]">
                <InfoRow label={t("settings.version")} value={APP_VERSION} />
                <InfoRow label={t("settings.dataAsOf")} value={formatDate(DEMO_TODAY, "medium")} />
                <InfoRow label={t("settings.builtFor")} value="Wankun System" />
              </div>
              <div className="rounded-xl border border-line bg-slate-50/70 p-3">
                <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  <ShieldCheck className="h-3 w-3 text-teal-600" aria-hidden="true" />
                  {t("settings.disclaimer")}
                </p>
                <p className="mt-1.5 text-[9px] leading-relaxed text-slate-500">
                  {t("settings.disclaimerText")}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-50 to-teal-50 px-3 py-2.5">
                <Sparkles className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
                <p className="text-[9px] leading-relaxed text-brand-700">
                  {t("settings.appearanceHint")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleReset}
        title={t("settings.resetDemo")}
        description={t("settings.resetConfirm")}
        confirmLabel={t("common.reset")}
        cancelLabel={t("common.cancel")}
        danger
      />
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50/70 px-3 py-2">
      <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink tabular-nums">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-600">{value}</span>
    </div>
  );
}
