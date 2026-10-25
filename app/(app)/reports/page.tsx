import type { Metadata } from "next";
import { ReportsView } from "@/components/domain/reports-view";

export const metadata: Metadata = {
  title: "Reports",
  description: "Task throughput, channel mix, team workload and client health.",
};

export default function ReportsPage() {
  return <ReportsView />;
}
