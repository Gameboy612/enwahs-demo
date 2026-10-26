import { DEMO_TODAY } from "@/lib/constants";
import type { Company, Task, TaskPriority, TeamMember, Thread } from "@/lib/types";

export const effortHours: Record<TaskPriority, number> = {
  high: 8,
  medium: 5,
  low: 2,
};

export function isOpen(task: Task): boolean {
  return task.status !== "done";
}

export function isOverdue(task: Task): boolean {
  return isOpen(task) && task.due < DEMO_TODAY;
}

export function isDueToday(task: Task): boolean {
  return isOpen(task) && task.due === DEMO_TODAY;
}

export function isDueThisWeek(task: Task): boolean {
  if (!isOpen(task)) return false;
  const due = new Date(`${task.due}T12:00:00+08:00`).getTime();
  const today = new Date(`${DEMO_TODAY}T12:00:00+08:00`).getTime();
  const diff = Math.round((due - today) / 86_400_000);
  return diff >= 0 && diff <= 7;
}

export function openTasks(tasks: Task[]): Task[] {
  return tasks.filter(isOpen);
}

export function tasksForCompany(tasks: Task[], companyId: string): Task[] {
  return tasks.filter((task) => task.companyId === companyId);
}

export function openTasksForCompany(tasks: Task[], companyId: string): Task[] {
  return tasksForCompany(tasks, companyId).filter(isOpen);
}

export function completedTasksForCompany(tasks: Task[], companyId: string): Task[] {
  return tasksForCompany(tasks, companyId).filter((task) => task.status === "done");
}

export function sortByDue(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.due !== b.due) return a.due.localeCompare(b.due);
    return a.title.en.localeCompare(b.title.en);
  });
}

export function nextDeadline(tasks: Task[], companyId: string): Task | undefined {
  return sortByDue(openTasksForCompany(tasks, companyId))[0];
}

export function statusCounts(tasks: Task[]) {
  return {
    todo: tasks.filter((task) => task.status === "todo").length,
    doing: tasks.filter((task) => task.status === "doing").length,
    done: tasks.filter((task) => task.status === "done").length,
  };
}

export function priorityCounts(tasks: Task[]) {
  return {
    high: tasks.filter((task) => task.priority === "high").length,
    medium: tasks.filter((task) => task.priority === "medium").length,
    low: tasks.filter((task) => task.priority === "low").length,
  };
}

export function memberLoad(member: TeamMember, tasks: Task[]) {
  const assigned = openTasks(tasks).filter((task) => task.assigneeIds.includes(member.id));
  const weightedHours = assigned.reduce(
    (total, task) => total + effortHours[task.priority],
    0,
  );
  const utilization = Math.round((weightedHours / member.capacityHours) * 100);
  return {
    assigned,
    weightedHours,
    utilization,
    availableHours: Math.max(member.capacityHours - weightedHours, 0),
  };
}

export function healthBand(score: number): "healthy" | "watch" | "risk" {
  if (score >= 85) return "healthy";
  if (score >= 70) return "watch";
  return "risk";
}

export function averageResponse(threads: Thread[]): number {
  if (threads.length === 0) return 0;
  return Math.round(
    threads.reduce((total, thread) => total + thread.responseMinutes, 0) /
      threads.length,
  );
}

export function unreadCount(threads: Thread[]): number {
  return threads.reduce((total, thread) => total + thread.unread, 0);
}

export function priorityScore(task: Task): number {
  return task.priority === "high" ? 3 : task.priority === "medium" ? 2 : 1;
}

export function priorityQueue(
  tasks: Task[],
  companies: Company[],
  limit = 6,
): Task[] {
  const riskFor = (task: Task) =>
    companies.find((company) => company.id === task.companyId)?.risk ?? "low";
  const riskScore = (risk: string) => (risk === "high" ? 3 : risk === "medium" ? 2 : 1);
  return [...openTasks(tasks)]
    .sort((a, b) => {
      const byDue = a.due.localeCompare(b.due);
      if (byDue !== 0) return byDue;
      const byRisk = riskScore(riskFor(b)) - riskScore(riskFor(a));
      if (byRisk !== 0) return byRisk;
      return priorityScore(b) - priorityScore(a);
    })
    .slice(0, limit);
}

export function deadlineBuckets(tasks: Task[]) {
  const open = openTasks(tasks);
  return {
    today: open.filter(isDueToday),
    thisWeek: open.filter(isDueThisWeek),
    overdue: open.filter(isOverdue),
  };
}

export function companyStats(tasks: Task[], companies: Company[]) {
  const open = openTasks(tasks);
  return {
    total: companies.length,
    active: companies.filter((company) => company.status === "active").length,
    atRisk: companies.filter((company) => company.status === "at-risk").length,
    onboarding: companies.filter((company) => company.status === "onboarding").length,
    openTasks: open.length,
    highRiskTasks: open.filter((task) => task.priority === "high").length,
    portfolioHealth: Math.round(
      companies.reduce((total, company) => total + company.healthScore, 0) /
        Math.max(companies.length, 1),
    ),
  };
}

export function companyById(companies: Company[], id: string): Company | undefined {
  return companies.find((company) => company.id === id);
}

export function memberById(team: TeamMember[], id: string): TeamMember | undefined {
  return team.find((member) => member.id === id);
}

export function visibleCompanies(
  companies: Company[],
  member: TeamMember | undefined,
): Company[] {
  if (!member || member.role === "partner") return companies;
  return companies.filter((company) => company.ownerId === member.id);
}

export function visibleTaskForCompany(tasks: Task[], companyId: string) {
  const companyTasks = tasksForCompany(tasks, companyId);
  return {
    open: sortByDue(companyTasks.filter(isOpen)),
    done: sortByDue(companyTasks.filter((task) => task.status === "done")),
    all: sortByDue(companyTasks),
  };
}
