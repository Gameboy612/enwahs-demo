"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CompanyMark } from "@/components/ui/company-mark";
import { ChannelIcon } from "@/components/ui/channel-icon";
import { Input } from "@/components/ui/input";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";
import { DEMO_TODAY } from "@/lib/constants";
import type { Channel, Thread } from "@/lib/types";
import { cn } from "@/lib/utils";

export type InboxChannelFilter = "all" | Extract<Channel, "whatsapp" | "wechat">;

export function ThreadList({
  threads,
  selectedId,
  onSelect,
  filter,
  onFilter,
}: {
  threads: Thread[];
  selectedId: string | null;
  onSelect: (thread: Thread) => void;
  filter: InboxChannelFilter;
  onFilter: (filter: InboxChannelFilter) => void;
}) {
  const { data } = useDemo();
  const { t, pick, formatDate } = useI18n();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...threads]
      .filter((thread) => (filter === "all" ? true : thread.channel === filter))
      .filter((thread) => {
        if (!query) return true;
        const company = data.companies.find((item) => item.id === thread.companyId);
        return [pick(thread.groupName), company ? pick(company.name) : ""]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  }, [data.companies, filter, pick, search, threads]);

  const filters: { value: InboxChannelFilter; label: string }[] = [
    { value: "all", label: t("common.all") },
    { value: "whatsapp", label: t("channel.whatsapp") },
    { value: "wechat", label: t("channel.wechat") },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-line px-4 pb-3 pt-4">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="eyebrow">{t("nav.workspace")}</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">
              {t("inbox.title")}
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {t("inbox.threadCount", { count: filtered.length })}
          </span>
        </div>
        <div className="mt-3">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("inbox.searchPlaceholder")}
            leftIcon={<Search className="h-3.5 w-3.5" />}
            aria-label={t("common.search")}
            className="h-9 bg-slate-50 text-xs"
          />
        </div>
        <div className="mt-2.5 flex items-center gap-1">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilter(item.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition",
                filter === item.value
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-500 hover:bg-white hover:text-ink",
              )}
            >
              {item.value !== "all" && (
                <ChannelIcon
                  channel={item.value}
                  size={11}
                  muted={filter === item.value}
                />
              )}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.length === 0 ? (
          <p className="px-4 py-12 text-center text-xs text-slate-400">
            {t("inbox.noThreads")}
          </p>
        ) : (
          filtered.map((thread) => {
            const company = data.companies.find((item) => item.id === thread.companyId);
            const active = selectedId === thread.id;
            const lastMessage = thread.messages[thread.messages.length - 1];
            const today = thread.lastAt.slice(0, 10) === DEMO_TODAY;
            return (
              <button
                key={thread.id}
                type="button"
                onClick={() => onSelect(thread)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-line/60 px-4 py-3 text-left transition",
                  active
                    ? "bg-brand-50/70"
                    : "hover:bg-slate-50/70",
                )}
              >
                <span className="relative shrink-0">
                  {company ? (
                    <CompanyMark company={company} size="md" />
                  ) : (
                    <span className="h-10 w-10 rounded-xl bg-slate-100" />
                  )}
                  <span
                    className={cn(
                      "absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white",
                      thread.channel === "whatsapp" ? "bg-[#25D366]" : "bg-[#07C160]",
                    )}
                  >
                    <ChannelIcon
                      channel={thread.channel}
                      size={9}
                      className="brightness-0 invert"
                    />
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-[11.5px] font-semibold text-ink">
                      {company ? pick(company.shortName) : pick(thread.groupName)}
                    </span>
                    <span className="shrink-0 text-[9px] text-slate-400">
                      {today
                        ? formatDate(thread.lastAt, "time")
                        : formatDate(thread.lastAt, "short")}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-slate-500">
                    {pick(thread.groupName)}
                  </span>
                  <span className="mt-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[10px] text-slate-400">
                      {lastMessage ? pick(lastMessage.text) : ""}
                    </span>
                    {thread.unread > 0 && (
                      <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-teal-500 px-1 text-[9px] font-bold text-white">
                        {thread.unread}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-line bg-slate-50/60 px-4 py-2.5">
        <p className="text-[9px] leading-relaxed text-slate-400">
          {t("inbox.demoNotice")}
        </p>
      </div>
    </div>
  );
}
