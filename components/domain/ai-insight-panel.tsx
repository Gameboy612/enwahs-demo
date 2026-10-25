"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const company = data.companies.find((item) => item.id === thread.companyId);
  const companyOpen = company ? openTasksForCompany(data.tasks, company.id) : [];

  const isCreated = (titleEn: string) =>
    data.tasks.some(
      (task) => task.sourceThreadId === thread.id && task.title.en === titleEn,
    );

  return (
    <div id="ai-panel" className="flex h-full min-h-0 flex-col scroll-mt-24">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-600">
          <Sparkles className="h-3.5 w-3.5 text-gold-500" aria-hidden="true" />
          {t("inbox.aiAssistant")}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-medium text-slate-400">
          {t("inbox.demoBadge")}
        </span>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 scrollbar-thin">
        <section>
          <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
            {t("inbox.aiSummary")}
          </p>
          <p className="mt-1.5 line-clamp-5 text-[10.5px] leading-relaxed text-slate-600">
            {pick(thread.aiSummary)}
          </p>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
              {t("inbox.extractedTasks")}
            </p>
            <span className="text-[9px] text-slate-400">{thread.extractedTasks.length}</span>
          </div>
          <div className="space-y-1.5">
            {thread.extractedTasks.map((extracted) => {
              const created = isCreated(extracted.title.en);
              return (
                <div
                  key={extracted.id}
                  className={cn(
                    "rounded-lg border px-2.5 py-2",
                    created ? "border-teal-200 bg-teal-50/40" : "border-line",
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                        extracted.priority === "high"
                          ? "bg-red-500"
                          : extracted.priority === "medium"
                            ? "bg-gold-500"
                            : "bg-slate-300",
                      )}
                    />
                    <p className="flex-1 text-[10.5px] font-medium leading-snug text-ink">
                      {pick(extracted.title)}
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2 pl-3.5">
                    <span className="text-[9px] text-slate-400">{dueLabel(extracted.due)}</span>
                    {created ? (
                      <span className="inline-flex items-center gap-1 text-[9px] text-teal-600">
                        <CheckCircle2 className="h-2.5 w-2.5" aria-hidden="true" />
                        {t("common.done")}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          addExtractedTask(thread, extracted);
                          toast(t("toast.taskFromMessage"));
                        }}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[9px] font-medium text-brand-600 transition hover:bg-brand-50"
                      >
                        <Plus className="h-2.5 w-2.5" aria-hidden="true" />
                        {t("inbox.createTask")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {company && (
          <section className="flex items-center justify-between border-t border-line pt-3 text-[9px]">
            <Link
              href={`/companies/detail/?id=${encodeURIComponent(company.id)}`}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-brand-600"
            >
              {companyOpen.length} {t("common.openTasks")}
              <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
            </Link>
            <Link href="/tasks/" className="text-brand-600 hover:text-brand-800">
              {t("inbox.viewAllTasks")}
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
