"use client";

import Link from "next/link";
import { Compass, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export function NotFoundView() {
  const { session } = useAuth();
  const { t } = useI18n();
  return (
    <div className="brand-mesh relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-12 text-white">
      <div className="brand-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="relative w-full max-w-md text-center">
        <div className="flex justify-center">
          <Logo tone="dark" size="lg" />
        </div>
        <p className="mt-10 text-[88px] font-semibold leading-none tracking-[-0.06em] text-white/10">
          404
        </p>
        <div className="mx-auto -mt-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
          <Compass className="h-5 w-5 text-teal-300" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{t("notFound.title")}</h1>
        <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-white/50">
          {t("notFound.subtitle")}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <Link href={session ? "/dashboard/" : "/"}>
            <Button
              className="bg-white text-brand-800 hover:bg-teal-50"
              leftIcon={<LayoutDashboard className="h-4 w-4" />}
            >
              {session ? t("notFound.back") : t("notFound.login")}
            </Button>
          </Link>
          <Link href="/companies/">
            <Button
              variant="secondary"
              className="border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            >
              {t("nav.companies")}
            </Button>
          </Link>
        </div>
        <p className="mt-10 text-[9px] text-white/30">{t("footer.fictional")}</p>
      </div>
    </div>
  );
}
