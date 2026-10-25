"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Database,
  Download,
  Languages,
  LogOut,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Switch } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { APP_VERSION } from "@/lib/constants";
import { useDemo } from "@/lib/demo-store";
import { LANGUAGE_OPTIONS, useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { asset, cn } from "@/lib/utils";

export function SettingsView() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { data, updateSettings, resetData, exportData } = useDemo();
  const { t, pick, lang, setLang } = useI18n();
  const { toast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  const member = data.team.find((person) => person.id === session?.memberId) ?? data.team[0];

  const toggle =
    (key: keyof typeof data.settings) =>
    (value: boolean) =>
      updateSettings({ [key]: value });

  const handleReset = () => {
    resetData();
    toast(t("toast.dataReset"), "info");
    signOut();
    router.push("/");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("settings.title")}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              signOut();
              router.push("/");
            }}
            leftIcon={<LogOut className="h-3.5 w-3.5" />}
          >
            {t("settings.signOut")}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-ink">{t("settings.profile")}</h2>
            <UserRound className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={pick(member.name)} color={member.accent} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{pick(member.name)}</p>
              <p className="truncate text-[10px] text-slate-400">{pick(member.title)}</p>
              <p className="mt-1 truncate text-[9px] text-slate-400">
                {member.email} · {member.phone}
              </p>
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-ink">{t("settings.language")}</h2>
            <Languages className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("settings.language")}>
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
                    "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] font-medium transition",
                    active
                      ? "border-brand-200 bg-brand-50/60 text-brand-800"
                      : "border-line text-slate-500 hover:border-brand-200",
                  )}
                >
                  {option.label}
                  {active && <Check className="h-3 w-3 text-teal-600" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="surface-card p-5">
          <h2 className="text-xs font-semibold text-ink">{t("settings.notifications")}</h2>
          <div className="mt-1 divide-y divide-line/60">
            <Switch
              checked={data.settings.dailyBrief}
              onChange={toggle("dailyBrief")}
              label={t("settings.dailyBrief")}
            />
            <Switch
              checked={data.settings.taskReminders}
              onChange={toggle("taskReminders")}
              label={t("settings.taskReminders")}
            />
            <Switch
              checked={data.settings.weeklyReport}
              onChange={toggle("weeklyReport")}
              label={t("settings.weeklyReport")}
            />
            <Switch
              checked={data.settings.channelAlerts}
              onChange={toggle("channelAlerts")}
              label={t("settings.channelAlerts")}
            />
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-ink">{t("settings.demoData")}</h2>
            <Database className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                exportData();
                toast(t("toast.exported"));
              }}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              {t("settings.exportData")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setConfirmReset(true)}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              {t("settings.resetDemo")}
            </Button>
          </div>
        </section>

        <section className="surface-card p-5 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <img
                src={asset("/logo-enwahs.png")}
                alt="Enwahs"
                className="h-10 w-10 rounded-lg bg-white object-contain ring-1 ring-line"
              />
              <div>
                <p className="text-xs font-medium text-ink">Enwahs CRM</p>
                <p className="text-[9px] text-slate-400">{t("settings.builtForValue")}</p>
              </div>
            </div>
            <span className="text-[9px] text-slate-400">
              {t("settings.version")} {APP_VERSION}
            </span>
          </div>
          <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[9px] leading-relaxed text-slate-400">
            <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-teal-600" aria-hidden="true" />
            {t("login.disclaimerShort")}
          </p>
        </section>
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
