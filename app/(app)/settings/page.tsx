import type { Metadata } from "next";
import { SettingsView } from "@/components/domain/settings-view";

export const metadata: Metadata = {
  title: "Settings",
  description: "Profile, language, notifications and demo data controls.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
