import type { Metadata } from "next";
import { TeamView } from "@/components/domain/team-view";

export const metadata: Metadata = {
  title: "Team",
  description: "Team directory, workload, capacity and assigned tasks.",
};

export default function TeamPage() {
  return <TeamView />;
}
