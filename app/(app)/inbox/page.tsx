import { Suspense } from "react";
import type { Metadata } from "next";
import { InboxView } from "@/components/domain/inbox-view";
import { PageLoader } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Inbox",
  description:
    "A read-only demo of WhatsApp and WeChat conversations with AI summaries and extracted tasks.",
};

export default function InboxPage() {
  return (
    <Suspense
      fallback={
        <div className="surface-card">
          <PageLoader />
        </div>
      }
    >
      <InboxView />
    </Suspense>
  );
}
