"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedData } from "@/data/seed";
import { DEMO_TODAY, STORAGE_KEYS } from "@/lib/constants";
import type {
  Channel,
  Company,
  CompanyStatus,
  DemoSettings,
  DemoData,
  Localized,
  RiskLevel,
  ServiceKey,
  Task,
  AssigneeRole,
  TaskPriority,
  TaskStatus,
  Thread,
  ExtractedTask,
} from "@/lib/types";

const L = (en: string, zhHant: string, zhHans: string): Localized => ({
  en,
  zhHant,
  zhHans,
});

const ACCENTS = ["#1a5f7a", "#159895", "#57c5b6", "#c9a227", "#6366f1", "#d97706"];

export type TaskDraft = {
  title: Localized;
  description: Localized;
  companyId: string;
  assigneeIds: string[];
  assigneeRoles?: Record<string, AssigneeRole>;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
  channel: Channel;
  tags?: Localized[];
  checklist?: { id: string; label: Localized; done: boolean }[];
  sourceThreadId?: string;
  blocked?: boolean;
};

export type CompanyDraft = {
  name: Localized;
  industry: Localized;
  status: CompanyStatus;
  risk: RiskLevel;
  services: ServiceKey[];
  contactName: Localized;
  contactTitle: Localized;
  contactEmail: string;
  contactPhone: string;
  phone: string;
  email: string;
  address: Localized;
  brNumber: string;
  since: string;
  tags?: Localized[];
};

type DemoContextValue = {
  data: DemoData;
  hydrated: boolean;
  addTask: (draft: TaskDraft) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  toggleChecklist: (taskId: string, checklistId: string) => void;
  addCompany: (draft: CompanyDraft) => Company;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  addNote: (companyId: string, text: string, authorId: string) => void;
  updateSettings: (patch: Partial<DemoSettings>) => void;
  resetData: () => void;
  exportData: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addExtractedTask: (thread: Thread, extracted: ExtractedTask) => Task;
};

const DemoContext = createContext<DemoContextValue | null>(null);

function cloneSeed(): DemoData {
  return typeof structuredClone === "function"
    ? structuredClone(seedData)
    : JSON.parse(JSON.stringify(seedData));
}


function normalizeDemoData(input: DemoData): DemoData {
  const tasks = input.tasks.map((task) => {
    const legacy = task as Task & { assigneeId?: string };
    const assigneeIds =
      Array.isArray(legacy.assigneeIds) && legacy.assigneeIds.length > 0
        ? legacy.assigneeIds
        : legacy.assigneeId
          ? [legacy.assigneeId]
          : [];
    return { ...task, assigneeIds };
  });
  const threads = input.threads.map((thread) => ({
    ...thread,
    extractedTasks: (thread.extractedTasks ?? []).map((extracted) => {
      const legacy = extracted as typeof extracted & { assigneeId?: string };
      const assigneeIds =
        Array.isArray(legacy.assigneeIds) && legacy.assigneeIds.length > 0
          ? legacy.assigneeIds
          : legacy.assigneeId
            ? [legacy.assigneeId]
            : [];
      return { ...extracted, assigneeIds };
    }),
  }));
  return { ...input, tasks, threads };
}

function isDemoData(value: unknown): value is DemoData {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<DemoData>;
  return (
    Array.isArray(candidate.companies) &&
    Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.team) &&
    Array.isArray(candidate.threads) &&
    Array.isArray(candidate.notifications) &&
    !!candidate.settings
  );
}

function normalizeAssigneeRoles(
  assigneeIds: string[],
  roles: Record<string, AssigneeRole> = {},
): Record<string, AssigneeRole> {
  return Object.fromEntries(
    assigneeIds.map((id, index) => [id, roles[id] ?? (index === 0 ? "lead" : "support")]),
  );
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function slugify(value: string): string {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "company";
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(() => cloneSeed());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.data);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isDemoData(parsed)) {
          setData({
            ...normalizeDemoData(parsed),
            settings: { ...seedData.settings, ...parsed.settings },
          });
        }
      }
    } catch {
      // A corrupt demo store should never stop the workspace loading.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(data));
    } catch {
      // Storage can be unavailable; the in-memory demo still works.
    }
  }, [data, hydrated]);

  const addTask = useCallback((draft: TaskDraft) => {
    const task: Task = {
      id: makeId("task"),
      title: draft.title,
      description: draft.description,
      companyId: draft.companyId,
      assigneeIds: draft.assigneeIds,
      assigneeRoles: normalizeAssigneeRoles(draft.assigneeIds, draft.assigneeRoles),
      status: draft.status,
      priority: draft.priority,
      due: draft.due,
      channel: draft.channel,
      createdAt: new Date().toISOString(),
      tags: draft.tags ?? [],
      checklist: (draft.checklist ?? []).map((item) => ({ ...item, id: makeId("check") })),
      sourceThreadId: draft.sourceThreadId,
      blocked: draft.blocked ?? false,
    };
    setData((current) => ({ ...current, tasks: [task, ...current.tasks] }));
    return task;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
    }));
  }, []);

  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) => (task.id === id ? { ...task, status } : task)),
    }));
  }, []);

  const toggleChecklist = useCallback((taskId: string, checklistId: string) => {
    setData((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              checklist: task.checklist.map((item) =>
                item.id === checklistId ? { ...item, done: !item.done } : item,
              ),
            }
          : task,
      ),
    }));
  }, []);

  const addCompany = useCallback((draft: CompanyDraft) => {
    const baseId = slugify(draft.name.en);
    const id = `${baseId}-${Math.random().toString(36).slice(2, 6)}`;
    const created: Company = {
      id,
      name: draft.name,
      shortName: draft.name,
      industry: draft.industry,
      status: draft.status,
      risk: draft.risk,
      services: draft.services,
      contact: {
        name: draft.contactName,
        title: draft.contactTitle,
        email: draft.contactEmail,
        phone: draft.contactPhone,
      },
      phone: draft.phone,
      email: draft.email,
      address: draft.address,
      brNumber: draft.brNumber,
      since: draft.since || String(new Date().getFullYear()),
      tags: draft.tags ?? [],
      accent: ACCENTS[Math.floor(Math.random() * ACCENTS.length)],
      healthScore: 72,
      lastContact: new Date().toISOString(),
      notes: [],
      aiSummary: L(
        "A new company added in the demo workspace. Add notes and tasks to build the relationship history.",
        "在演示工作台新增的公司。新增備註與任務以建立關係紀錄。",
        "在演示工作台新增的公司。添加备注与任务以建立关系记录。",
      ),
    };
    setData((current) => ({ ...current, companies: [created, ...current.companies] }));
    return created;
  }, []);

  const updateCompany = useCallback((id: string, patch: Partial<Company>) => {
    setData((current) => ({
      ...current,
      companies: current.companies.map((company) =>
        company.id === id ? { ...company, ...patch } : company,
      ),
    }));
  }, []);

  const deleteCompany = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      companies: current.companies.filter((company) => company.id !== id),
      tasks: current.tasks.filter((task) => task.companyId !== id),
      threads: current.threads.filter((thread) => thread.companyId !== id),
    }));
  }, []);

  const addNote = useCallback((companyId: string, text: string, authorId: string) => {
    setData((current) => ({
      ...current,
      companies: current.companies.map((company) =>
        company.id === companyId
          ? {
              ...company,
              notes: [
                {
                  id: makeId("note"),
                  authorId,
                  text: L(text, text, text),
                  at: new Date().toISOString(),
                },
                ...company.notes,
              ],
              lastContact: new Date().toISOString(),
            }
          : company,
      ),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<DemoSettings>) => {
    setData((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }));
  }, []);

  const resetData = useCallback(() => {
    setData(cloneSeed());
    try {
      window.localStorage.removeItem(STORAGE_KEYS.data);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const exportData = useCallback(() => {
    const payload = JSON.stringify(
      { exportedAt: new Date().toISOString(), demoToday: DEMO_TODAY, ...data },
      null,
      2,
    );
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `enwahs-crm-demo-${DEMO_TODAY}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [data]);

  const markNotificationRead = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      notifications: current.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setData((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    }));
  }, []);

  const addExtractedTask = useCallback(
    (thread: Thread, extracted: ExtractedTask) => {
      const task: Task = {
        id: makeId("task"),
        title: extracted.title,
        description: extracted.description,
        companyId: thread.companyId,
        assigneeIds: extracted.assigneeIds,
        status: "todo",
        priority: extracted.priority,
        due: extracted.due,
        channel: extracted.channel,
        createdAt: new Date().toISOString(),
        tags: [L("AI extracted", "AI 擷取", "AI 提取")],
        checklist: [],
        sourceThreadId: thread.id,
      };
      setData((current) => ({ ...current, tasks: [task, ...current.tasks] }));
      return task;
    },
    [],
  );

  const value = useMemo<DemoContextValue>(
    () => ({
      data,
      hydrated,
      addTask,
      updateTask,
      deleteTask,
      setTaskStatus,
      toggleChecklist,
      addCompany,
      updateCompany,
      deleteCompany,
      addNote,
      updateSettings,
      resetData,
      exportData,
      markNotificationRead,
      markAllNotificationsRead,
      addExtractedTask,
    }),
    [
      data,
      hydrated,
      addTask,
      updateTask,
      deleteTask,
      setTaskStatus,
      toggleChecklist,
      addCompany,
      updateCompany,
      deleteCompany,
      addNote,
      updateSettings,
      resetData,
      exportData,
      markNotificationRead,
      markAllNotificationsRead,
      addExtractedTask,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider");
  return context;
}
