import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { DemoProvider } from "@/lib/demo-store";
import { ToastProvider } from "@/components/ui/toast";
import { asset } from "@/lib/utils";

// metadataBase is the site origin only; asset() already adds the Pages base
// path, so using a URL with /enwahs-demo here would double the sub-path.
const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://wankun.kapakki.com",
);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl.origin),
  title: {
    default: "Enwahs CRM — Client Operations Workspace",
    template: "%s · Enwahs CRM",
  },
  description:
    "A static demo of an internal client operations workspace for Enwahs Accounting & Taxation Limited — company profiles, a shared task board and a simulated WhatsApp/WeChat inbox.",
  applicationName: "Enwahs CRM Demo",
  authors: [{ name: "Wankun System" }],
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: asset("/favicon-32.png"), sizes: "32x32", type: "image/png" }],
    apple: [{ url: asset("/apple-touch-icon.png"), sizes: "180x180" }],
  },
  openGraph: {
    title: "Enwahs CRM — Client Operations Workspace",
    description:
      "A clickable demo workspace for Enwahs Accounting & Taxation Limited. Fictional data; WhatsApp and WeChat are simulated.",
    type: "website",
    locale: "zh_HK",
    images: [{ url: asset("/logo-enwahs.png") }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1a5f7a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <I18nProvider>
          <AuthProvider>
            <DemoProvider>
              <ToastProvider>{children}</ToastProvider>
            </DemoProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
