import { Suspense } from "react";
import type { Metadata } from "next";
import { TasksView } from "@/components/domain/tasks-view";
import { PageLoader } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Tasks",
  description: "A shared task board with owners, priorities, channels and deadlines.",
};

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="surface-card">
          <PageLoader />
        </div>
      }
    >
      <TasksView />
    </Suspense>
  );
}
