"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
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

const roleLabels: Record<DemoRole, "role.partner" | "role.lead" | "role.assistant"> = {
  partner: "role.partner",
  lead: "role.lead",
  assistant: "role.assistant",
};

export function LoginScreen() {
  const router = useRouter();
  const { session, ready, signIn } = useAuth();
  const { data } = useDemo();
  const { t, pick } = useI18n();
  const [role, setRole] = useState<DemoRole>("partner");
  const [entering, setEntering] = useState(false);

  const memberId = roleMembers[role];
  const member = data.team.find((person) => person.id === memberId) ?? data.team[0];
  const unread = unreadCount(data.threads);
  const open = openTasks(data.tasks).length;

  useEffect(() => {
    if (ready && session) router.replace("/dashboard/");
  }, [ready, router, session]);

  const handleEnter = () => {
    setEntering(true);
    window.setTimeout(() => {
      signIn(memberId);
      router.push("/dashboard/");
    }, 350);
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      <section className="brand-mesh relative hidden w-[54%] shrink-0 flex-col justify-between overflow-hidden p-12 text-white lg:flex xl:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(87,197,182,0.18),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(201,162,39,0.12),transparent_35%)]" />
        <div className="pointer-events-none absolute -right-24 top-1/4 h-80 w-80 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-10 top-1/3 h-96 w-96 rounded-full border border-white/[0.06]" />

        <div className="relative">
          <Logo tone="dark" size="2xl" />
        </div>

        <div className="relative max-w-lg">
          <h1 className="text-balance text-[42px] font-semibold leading-[1.08] tracking-[-0.04em] xl:text-[52px]">
            {t("login.headlineShort")}
          </h1>
          <p className="mt-5 max-w-sm text-[13px] leading-relaxed text-white/55">
            {t("login.sublineShort")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <ChannelIcon channel="whatsapp" size={14} /> WhatsApp
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ChannelIcon channel="wechat" size={14} /> WeChat
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-teal-300" />
              {t("nav.tasks")}
            </span>
          </div>
        </div>

        <div className="relative flex items-center gap-5 text-[10px] text-white/35">
          <span>
            {open} {t("common.openTasks")}
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span>
            {unread} {t("inbox.unread")}
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span>
            {data.companies.length} {t("companies.title")}
          </span>
        </div>
      </section>

      <section className="relative flex flex-1 flex-col">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full border border-line bg-white px-2 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-slate-400">
              {t("app.demo")}
            </span>
            <LanguageSwitcher />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[360px]">
            <div className="mb-7">
              <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-ink">
                {t("login.cardTitle")}
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
                {t("login.cardSubtitle")}
              </p>
            </div>

            <div className="space-y-1.5" role="radiogroup" aria-label={t("login.viewAs")}>
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
                        ? "border-brand-200 bg-brand-50/60"
                        : "border-transparent bg-white hover:border-line",
                    )}
                  >
                    <Avatar name={pick(person.name)} color={person.accent} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-ink">
                        {pick(person.name)}
                      </span>
                      <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                        {t(roleLabels[option])}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        active ? "border-teal-500 bg-teal-500 text-white" : "border-slate-200",
                      )}
                    >
                      {active && <Check className="h-2.5 w-2.5" aria-hidden="true" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              size="lg"
              onClick={handleEnter}
              loading={entering}
              className="mt-6 w-full"
              rightIcon={!entering ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              {entering ? t("login.entering") : t("login.enter")}
            </Button>

            <p className="mt-4 text-center text-[9px] leading-relaxed text-slate-400">
              {t("login.disclaimerShort")}
            </p>
          </div>
        </div>

        <div className="px-5 pb-5 text-center text-[9px] text-slate-400 sm:px-8">
          {t("login.copyright", { year: new Date().getFullYear() })}
        </div>
      </section>
    </div>
  );
}
