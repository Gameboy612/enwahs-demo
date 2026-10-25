"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  Image as ImageIcon,
  Lock,
  Mic,
  Send,
  Sparkles,
} from "lucide-react";
import { CompanyMark } from "@/components/ui/company-mark";
import { ChannelBadge, SentimentBadge } from "@/components/domain/badges";
import { useDemo } from "@/lib/demo-store";
import { DEMO_TODAY } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import type { Message, Thread } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ConversationPanel({ thread }: { thread: Thread }) {
  const { data } = useDemo();
  const { t, pick, formatDate } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const company = data.companies.find((item) => item.id === thread.companyId);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [thread.id]);

  const groups: { date: string; messages: Message[] }[] = [];
  for (const message of thread.messages) {
    const date = message.at.slice(0, 10);
    const group = groups.find((item) => item.date === date);
    if (group) group.messages.push(message);
    else groups.push({ date, messages: [message] });
  }

  const dayLabel = (date: string) => {
    if (date === DEMO_TODAY) return t("inbox.today");
    const yesterday = new Date(`${DEMO_TODAY}T12:00:00+08:00`);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date === yesterday.toISOString().slice(0, 10)) return t("inbox.yesterday");
    return formatDate(date, "long");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          {company && <CompanyMark company={company} size="md" />}
          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-semibold text-ink">
              {pick(thread.groupName)}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <ChannelBadge channel={thread.channel} />
              <SentimentBadge sentiment={thread.sentiment} />
              {company && (
                <span className="truncate text-[10px] text-slate-400">
                  {pick(company.name)}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {company && (
            <Link
              href={`/companies/detail/?id=${encodeURIComponent(company.id)}`}
              className="hidden items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-700 sm:inline-flex"
            >
              {t("inbox.openCompany")}
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          )}
          <a
            href="#ai-panel"
            className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[10px] font-semibold text-brand-700 transition hover:bg-brand-100 xl:hidden"
          >
            <Sparkles className="h-3 w-3 text-gold-500" aria-hidden="true" />
            AI
          </a>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="chat-canvas flex-1 overflow-y-auto px-3 py-4 scrollbar-thin sm:px-5"
      >
        <div className="mx-auto max-w-2xl space-y-5">
          {groups.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="flex items-center justify-center">
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[9px] font-medium text-slate-400 shadow-sm ring-1 ring-line">
                  {dayLabel(group.date)}
                </span>
              </div>
              {group.messages.map((message) => (
                <MessageBubble key={message.id} message={message} thread={thread} />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line bg-white px-3 py-3 sm:px-4">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-slate-50 px-3 py-2">
          <Lock className="h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" />
          <span className="flex-1 truncate text-[11px] text-slate-400">
            {t("inbox.composerPlaceholder")}
          </span>
          <button
            type="button"
            disabled
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-400"
            aria-label={t("inbox.send")}
          >
            <Send className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[9px] text-slate-400">
          {t("inbox.demoNotice")}
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message, thread }: { message: Message; thread: Thread }) {
  const { data } = useDemo();
  const { t, pick, formatDate } = useI18n();
  const company = data.companies.find((item) => item.id === thread.companyId);

  if (message.sender === "ai") {
    return (
      <div className="rounded-xl border border-teal-200/70 bg-gradient-to-br from-teal-50/90 to-brand-50/60 px-3.5 py-3">
        <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-teal-700">
          <Sparkles className="h-3 w-3 text-gold-500" aria-hidden="true" />
          {t("inbox.aiNote")}
          <span className="ml-auto font-normal normal-case tracking-normal text-slate-400">
            {formatDate(message.at, "time")}
          </span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600">
          {pick(message.text)}
        </p>
      </div>
    );
  }

  const isTeam = message.sender === "team";

  return (
    <div className={cn("flex", isTeam ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[86%] sm:max-w-[78%]", isTeam && "text-right")}>
        <p className="mb-1 px-1 text-[9px] font-medium text-slate-400">
          {isTeam ? t("common.team") : message.author}
        </p>
        <div
          className={cn(
            "inline-block rounded-2xl px-3.5 py-2.5 text-left text-[11.5px] leading-relaxed shadow-sm ring-1",
            isTeam
              ? "rounded-br-md bg-brand-600 text-white ring-brand-700/20"
              : "rounded-bl-md bg-white text-slate-700 ring-line",
          )}
        >
          {message.kind === "image" && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/20 bg-gradient-to-br from-slate-100 to-slate-200 px-3 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-slate-500">
                <ImageIcon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span
                  className={cn(
                    "block text-[10px] font-semibold",
                    isTeam ? "text-white" : "text-slate-600",
                  )}
                >
                  {message.meta ? pick(message.meta) : t("inbox.imageAttachment")}
                </span>
                <span
                  className={cn(
                    "block text-[9px]",
                    isTeam ? "text-white/60" : "text-slate-400",
                  )}
                >
                  {t("inbox.imageAttachment")}
                </span>
              </span>
            </div>
          )}

          {message.kind === "voice" && (
            <div className="mb-2 flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  isTeam ? "bg-white/20 text-white" : "bg-teal-50 text-teal-600",
                )}
              >
                <Mic className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="flex items-center gap-0.5">
                {[3, 6, 4, 8, 5, 7, 3, 9, 4, 6, 5, 8, 2, 6].map((height, index) => (
                  <span
                    key={index}
                    className={cn(
                      "w-[2px] rounded-full",
                      isTeam ? "bg-white/70" : "bg-teal-400",
                    )}
                    style={{ height }}
                  />
                ))}
              </span>
              <span
                className={cn(
                  "text-[9px] font-medium",
                  isTeam ? "text-white/70" : "text-slate-400",
                )}
              >
                {message.meta ? pick(message.meta) : ""}
              </span>
            </div>
          )}

          {message.kind === "file" && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-2.5 py-2">
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span className="text-[10px] font-medium">
                {message.meta ? pick(message.meta) : t("inbox.fileAttachment")}
              </span>
            </div>
          )}

          <p>{pick(message.text)}</p>
        </div>
        <p className="mt-1 px-1 text-[9px] text-slate-400">
          {formatDate(message.at, "time")}
          {company && !isTeam ? ` · ${pick(company.shortName)}` : ""}
        </p>
      </div>
    </div>
  );
}
