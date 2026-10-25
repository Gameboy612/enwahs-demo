"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Plus,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/domain/badges";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { openTasksForCompany } from "@/lib/selectors";
import type { Thread } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function AiInsightPanel({ thread }: { thread: Thread }) {
  const { data, addExtractedTask } = useDemo();
  const { t, pick, dueLabel } = useI18n();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const company = data.companies.find((item) => item.id === thread.companyId);
  const companyOpen = company ? openTasksForCompany(data.tasks, company.id) : [];

  const isCreated = (titleEn: string) =>
    data.tasks.some(
      (task) => task.sourceThreadId === thread.id && task.title.en === titleEn,
    );

  const copyReply = async () => {
    try {
      await navigator.clipboard.writeText(t("inbox.demoReply"));
      setCopied(true);
      toast(t("inbox.replyCopied"), "info");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast(t("common.error"), "error");
    }
  };

  return (
    <div id="ai-panel" className="flex h-full min-h-0 flex-col scroll-mt-24">
      <div className="relative overflow-hidden border-b border-line bg-gradient-to-br from-brand-950 via-brand-800 to-teal-800 px-4 py-4 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-gold-400/20 blur-2xl" />
        <div className="relative flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5 text-gold-300" aria-hidden="true" />
            </span>
            {t("inbox.aiAssistant")}
          </span>
          <Badge tone="gold" className="border-0 bg-white/10 text-gold-200 ring-white/15">
            {t("inbox.demoBadge")}
          </Badge>
        </div>
        <p className="relative mt-2.5 text-[10px] leading-relaxed text-white/55">
          {t("inbox.aiDisclosure")}
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3.5 scrollbar-thin">
        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {t("inbox.aiSummary")}
          </h3>
          <div className="rounded-xl border border-line bg-slate-50/70 p-3">
            <p className="text-[11px] leading-relaxed text-slate-600">
              {pick(thread.aiSummary)}
            </p>
            <div className="mt-2.5 flex items-center gap-3 border-t border-line/70 pt-2 text-[9px] text-slate-400">
              <span>
                {t("inbox.responseTime")}: {thread.responseMinutes} {t("common.minutesShort")}
              </span>
              <span className="h-2.5 w-px bg-line" />
              <span>{t("inbox.messagesCount", { count: thread.messages.length })}</span>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {t("inbox.extractedTasks")}
            </h3>
            <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[9px] font-semibold text-teal-700">
              {thread.extractedTasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {thread.extractedTasks.map((extracted) => {
              const assignee = data.team.find((member) => member.id === extracted.assigneeId);
              const created = isCreated(extracted.title.en);
              return (
                <div
                  key={extracted.id}
                  className={cn(
                    "rounded-xl border p-2.5 transition",
                    created ? "border-teal-200 bg-teal-50/40" : "border-line bg-white",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold leading-snug text-ink">
                      {pick(extracted.title)}
                    </p>
                    <PriorityBadge priority={extracted.priority} withIcon={false} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[9.5px] leading-relaxed text-slate-400">
                    {pick(extracted.description)}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[9px] text-slate-400">
                      {assignee && (
                        <Avatar name={pick(assignee.name)} color={assignee.accent} size="xs" />
                      )}
                      <span className="truncate">{assignee ? pick(assignee.name) : ""}</span>
                      <span className="text-slate-300">·</span>
                      <span>{dueLabel(extracted.due)}</span>
                    </span>
                    {created ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-teal-700">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        {t("common.done")}
                      </span>
                    ) : (
                      <Button
                        variant="soft"
                        size="sm"
                        className="h-6 px-2 text-[9px]"
                        onClick={() => {
                          addExtractedTask(thread, extracted);
                          toast(t("toast.taskFromMessage"));
                        }}
                        leftIcon={<Plus className="h-2.5 w-2.5" />}
                      >
                        {t("inbox.createTask")}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            {thread.extractedTasks.length === 0 && (
              <p className="rounded-xl border border-dashed border-line px-3 py-5 text-center text-[10px] text-slate-400">
                {t("tasks.empty")}
              </p>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {t("inbox.suggestedReply")}
          </h3>
          <div className="rounded-xl border border-line bg-white p-3">
            <p className="text-[10.5px] leading-relaxed text-slate-600">
              {t("inbox.demoReply")}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-line/70 pt-2">
              <span className="text-[9px] text-slate-400">
                {t("inbox.demoBadge")}
              </span>
              <button
                type="button"
                onClick={copyReply}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                {copied ? (
                  <Check className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Copy className="h-3 w-3" aria-hidden="true" />
                )}
                {copied ? t("common.done") : t("inbox.suggestedReply")}
              </button>
            </div>
          </div>
        </section>

        {company && (
          <section className="rounded-xl border border-line bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold text-slate-500">
                {t("inbox.openTasksFor", { company: pick(company.shortName) })}
              </span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                {companyOpen.length}
              </span>
            </div>
            <div className="mt-2 space-y-1.5">
              {companyOpen.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-2">
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
                  <span className="min-w-0 flex-1 truncate text-[9.5px] text-slate-500">
                    {pick(task.title)}
                  </span>
                  <span className="shrink-0 text-[9px] text-slate-400">
                    {dueLabel(task.due)}
                  </span>
                </div>
              ))}
              {companyOpen.length === 0 && (
                <p className="py-2 text-[9.5px] text-slate-400">
                  {t("companies.noOpenTasks")}
                </p>
              )}
            </div>
            <div className="mt-2.5 flex items-center gap-2 border-t border-line/70 pt-2">
              <Link
                href={`/companies/detail/?id=${encodeURIComponent(company.id)}`}
                className="inline-flex items-center gap-1 text-[9px] font-semibold text-brand-600 hover:text-brand-800"
              >
                {t("inbox.openCompany")}
                <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
              </Link>
              <Link
                href="/tasks/"
                className="ml-auto text-[9px] font-semibold text-slate-500 hover:text-ink"
              >
                {t("inbox.viewAllTasks")}
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
