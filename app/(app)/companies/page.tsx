import type { Metadata } from "next";
import { CompaniesView } from "@/components/domain/companies-view";

export const metadata: Metadata = {
  title: "Companies",
  description: "Client company profiles, contacts, services, health and open work.",
};

export default function CompaniesPage() {
  return <CompaniesView />;
}
