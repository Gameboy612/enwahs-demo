"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Inbox } from "lucide-react";
import { AiInsightPanel } from "@/components/domain/ai-insight-panel";
import { ConversationPanel } from "@/components/domain/conversation-panel";
import { ThreadList, type InboxChannelFilter } from "@/components/domain/thread-list";
import { EmptyState } from "@/components/ui/empty-state";
import { useDemo } from "@/lib/demo-store";
import { useI18n } from "@/lib/i18n";

export function InboxView() {
  const { data } = useDemo();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryThread = searchParams.get("thread");
  const [filter, setFilter] = useState<InboxChannelFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(
    queryThread ?? data.threads[0]?.id ?? null,
  );

  useEffect(() => {
    if (queryThread && data.threads.some((thread) => thread.id === queryThread)) {
      setSelectedId(queryThread);
    }
  }, [data.threads, queryThread]);

  useEffect(() => {
    if (!selectedId && data.threads.length > 0) setSelectedId(data.threads[0].id);
  }, [data.threads, selectedId]);

  const selected = useMemo(
    () => data.threads.find((thread) => thread.id === selectedId) ?? null,
    [data.threads, selectedId],
  );

  const handleSelect = (threadId: string) => {
    setSelectedId(threadId);
    router.replace(`/inbox/?thread=${encodeURIComponent(threadId)}`, { scroll: false });
  };

  if (data.threads.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="h-5 w-5" />}
        title={t("inbox.noThreads")}
        description={t("inbox.selectThreadHint")}
      />
    );
  }

  return (
    <div className="grid gap-3 xl:h-[calc(100vh-10.5rem)] xl:min-h-[620px] xl:grid-cols-[300px_minmax(0,1fr)_336px] xl:gap-4">
      <aside className="surface-card h-[380px] overflow-hidden xl:h-full">
        <ThreadList
          threads={data.threads}
          selectedId={selectedId}
          onSelect={(thread) => handleSelect(thread.id)}
          filter={filter}
          onFilter={setFilter}
        />
      </aside>

      <section className="surface-card h-[620px] overflow-hidden xl:h-full">
        {selected ? (
          <ConversationPanel thread={selected} />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title={t("inbox.selectThread")}
              description={t("inbox.selectThreadHint")}
            />
          </div>
        )}
      </section>

      <aside className="surface-card h-[640px] overflow-hidden xl:h-full">
        {selected ? <AiInsightPanel thread={selected} /> : null}
      </aside>
    </div>
  );
}
