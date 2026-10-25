import { Suspense } from "react";
import type { Metadata } from "next";
import { CompanyDetailView } from "@/components/domain/company-detail-view";
import { PageLoader } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Company profile",
  description: "Company profile, contacts, open tasks, notes and activity.",
};

export default function CompanyDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="surface-card">
          <PageLoader />
        </div>
      }
    >
      <CompanyDetailView />
    </Suspense>
  );
}
