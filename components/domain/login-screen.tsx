"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChannelIcon } from "@/components/ui/channel-icon";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { openTasks, unreadCount } from "@/lib/selectors";
import type { DemoRole } from "@/lib/types";
import { cn } from "@/lib/utils";

const roleMembers: Record<DemoRole, string> = {
  partner: "carlos",
  lead: "michelle",
  assistant: "anna",
};

const roleKeys: Record<DemoRole, "login.partnerDesc" | "login.leadDesc" | "login.assistantDesc"> = {
  partner: "login.partnerDesc",
  lead: "login.leadDesc",
  assistant: "login.assistantDesc",
};

const roleLabels: Record<DemoRole, "role.partner" | "role.lead" | "role.assistant"> = {
  partner: "role.partner",
  lead: "role.lead",
  assistant: "role.assistant",
};

export function LoginScreen() {
  const router = useRouter();
  const { session, ready, signIn } = useAuth();
  const { data } = useDemo();
  const { t, pick, formatDate } = useI18n();
  const [role, setRole] = useState<DemoRole>("partner");
  const [entering, setEntering] = useState(false);

  const memberId = roleMembers[role];
  const member = data.team.find((person) => person.id === memberId) ?? data.team[0];
  const previewTasks = openTasks(data.tasks).slice(0, 3);
  const unread = unreadCount(data.threads);

  useEffect(() => {
    if (ready && session) router.replace("/dashboard/");
  }, [ready, router, session]);

  const handleEnter = () => {
    setEntering(true);
    window.setTimeout(() => {
      signIn(memberId);
      router.push("/dashboard/");
    }, 420);
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      {/* Brand narrative — desktop */}
      <section className="brand-mesh relative hidden w-[56%] shrink-0 flex-col justify-between overflow-hidden p-10 text-white lg:flex xl:p-14">
        <div className="brand-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -left-10 top-1/2 h-96 w-96 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-10 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />

        <div className="relative">
          <Logo tone="dark" size="lg" />
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-semibold tracking-wide text-white/75 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
            {t("login.badge")}
          </div>
          <h1 className="mt-5 max-w-[660px] text-balance text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] xl:text-[48px]">
            {t("login.headline")}
          </h1>
          <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-white/60 xl:text-sm">
            {t("login.subhead")}
          </p>
        </div>

        <div className="relative mt-8 max-w-xl">
          <div className="grid gap-3 sm:grid-cols-3">
            <Feature icon={MessageSquareText} label={t("login.featureInbox")} />
            <Feature icon={Building2} label={t("login.featureCompanies")} />
            <Feature icon={CheckCircle2} label={t("login.featureTasks")} />
          </div>

          <div className="mt-7 rounded-2xl border border-white/15 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300/30 to-gold-500/20 text-gold-200">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] font-semibold text-white/85">
                  {t("dashboard.aiBrief")}
                </span>
              </div>
              <span className="text-[9px] font-medium text-white/35">
                {t("dashboard.today")}
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {previewTasks.map((task, index) => {
                const company = data.companies.find((item) => item.id === task.companyId);
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-brand-950/20 px-3 py-2.5"
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        index === 0 ? "bg-gold-300" : "bg-teal-300",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium text-white/80">
                        {pick(task.title)}
                      </span>
                      <span className="block truncate text-[9px] text-white/35">
                        {company ? pick(company.shortName) : ""} · {formatDate(task.due, "short")}
                      </span>
                    </span>
                    <ChannelIcon channel={task.channel} size={13} />
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 text-[9px] text-white/40">
              <span className="inline-flex items-center gap-1.5">
                <ChannelIcon channel="whatsapp" size={11} />
                <ChannelIcon channel="wechat" size={11} />
                {t("login.channels")}
              </span>
              <span>{unread} {t("inbox.unread")}</span>
            </div>
          </div>
        </div>

        <div className="relative mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-[11px] text-white/50">
          <span className="inline-flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-teal-300" />
            {t("login.clients")}
          </span>
          <span className="h-3 w-px bg-white/15" />
          <span>{t("login.teamStat")}</span>
          <span className="h-3 w-px bg-white/15" />
          <span>{t("login.offices")}</span>
        </div>
      </section>

      {/* Login panel */}
      <section className="relative flex flex-1 flex-col bg-surface">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(87,197,182,0.13),transparent_45%),radial-gradient(circle_at_10%_90%,rgba(26,95,122,0.08),transparent_40%)]" />
        <div className="relative flex items-center justify-between px-5 py-4 sm:px-8">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full border border-line bg-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:inline-flex">
              {t("app.demoMode")}
            </span>
            <LanguageSwitcher />
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-5 py-6 sm:px-8">
          <div className="w-full max-w-[440px]">
            <div className="surface-card overflow-hidden p-6 shadow-lift sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">{t("login.badge")}</p>
                  <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.03em] text-ink">
                    {t("login.cardTitle")}
                  </h2>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                    {t("login.cardSubtitle")}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-[11px] font-semibold text-slate-500">
                  {t("login.viewAs")}
                </p>
                <div className="space-y-2" role="radiogroup" aria-label={t("login.viewAs")}>
                  {(Object.keys(roleMembers) as DemoRole[]).map((option) => {
                    const person = data.team.find(
                      (memberItem) => memberItem.id === roleMembers[option],
                    );
                    if (!person) return null;
                    const active = role === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setRole(option)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                          active
                            ? "border-brand-300 bg-brand-50/50 shadow-sm ring-1 ring-brand-200/60"
                            : "border-line bg-white hover:border-brand-200 hover:bg-slate-50/60",
                        )}
                      >
                        <Avatar
                          name={pick(person.name)}
                          color={person.accent}
                          size="sm"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-xs font-semibold text-ink">
                              {pick(person.name)}
                            </span>
                            <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-500 ring-1 ring-line">
                              {t(roleLabels[option])}
                            </span>
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                            {t(roleKeys[option])}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                            active ? "border-teal-500 bg-teal-500" : "border-slate-300 bg-white",
                          )}
                        >
                          {active && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="button"
                size="lg"
                onClick={handleEnter}
                loading={entering}
                className="mt-5 w-full"
                rightIcon={!entering ? <ArrowRight className="h-4 w-4" /> : undefined}
              >
                {entering ? t("login.entering") : t("login.enter")}
              </Button>

              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-line bg-slate-50/70 p-3">
                <ShieldCheck
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600"
                  aria-hidden="true"
                />
                <p className="text-[10px] leading-relaxed text-slate-500">
                  {t("login.disclaimer")}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
                  <ChannelIcon channel="whatsapp" size={13} />
                  <ChannelIcon channel="wechat" size={13} />
                  {t("inbox.demoBadge")}
                </span>
                <span className="text-[10px] text-slate-400">
                  {ready && session ? t("dashboard.viewInbox") : "v1.0.0"}
                </span>
              </div>
            </div>

            <p className="mt-5 text-center text-[10px] leading-relaxed text-slate-400">
              {t("login.copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>

        <div className="relative px-5 pb-5 text-center text-[9px] text-slate-400 sm:px-8">
          {t("footer.builtBy")} · {t("footer.fictional")}
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  label,
}: {
  icon: typeof MessageSquareText;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
      <Icon className="h-4 w-4 text-teal-300" aria-hidden="true" />
      <p className="mt-2 text-[10px] font-medium leading-relaxed text-white/65">{label}</p>
    </div>
  );
}
