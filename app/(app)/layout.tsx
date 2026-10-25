"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageLoader } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, ready } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (ready && !session) {
      router.replace("/");
    }
  }, [ready, router, session]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <PageLoader label={t("common.loading")} />
      </div>
    );
  }

  if (!session) return null;

  return <AppShell>{children}</AppShell>;
}
