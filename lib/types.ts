export type Language = "en" | "zh-Hant" | "zh-Hans";

export type Localized = {
  en: string;
  zhHant: string;
  zhHans: string;
};

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "high" | "medium" | "low";
export type Channel = "whatsapp" | "wechat" | "email" | "internal";
export type CompanyStatus = "active" | "at-risk" | "onboarding" | "dormant";
export type RiskLevel = "low" | "medium" | "high";
export type Sentiment = "positive" | "neutral" | "negative";
export type MemberRole = "partner" | "lead" | "associate" | "assistant";

export type ServiceKey =
  | "audit"
  | "tax"
  | "companySecretarial"
  | "accounts"
  | "payroll"
  | "funding"
  | "advisory";

export type TeamMember = {
  id: string;
  name: Localized;
  title: Localized;
  email: string;
  phone: string;
  role: MemberRole;
  capacityHours: number;
  languages: string[];
  location: "hong-kong" | "shenzhen";
  accent: string;
};

export type Contact = {
  name: Localized;
  title: Localized;
  email: string;
  phone: string;
  wechat?: string;
};

export type CompanyNote = {
  id: string;
  authorId: string;
  text: Localized;
  at: string;
};

export type Company = {
  id: string;
  name: Localized;
  shortName: Localized;
  industry: Localized;
  status: CompanyStatus;
  risk: RiskLevel;
  services: ServiceKey[];
  contact: Contact;
  phone: string;
  email: string;
  address: Localized;
  brNumber: string;
  since: string;
  website?: string;
  tags: Localized[];
  accent: string;
  healthScore: number;
  lastContact: string;
  notes: CompanyNote[];
  aiSummary: Localized;
};

export type ChecklistItem = {
  id: string;
  label: Localized;
  done: boolean;
};

export type Task = {
  id: string;
  title: Localized;
  description: Localized;
  companyId: string;
  assigneeId: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
  channel: Channel;
  createdAt: string;
  tags: Localized[];
  checklist: ChecklistItem[];
  sourceThreadId?: string;
  blocked?: boolean;
};

export type MessageKind = "text" | "image" | "voice" | "file" | "note";

export type Message = {
  id: string;
  sender: "client" | "team" | "ai" | "system";
  author: string;
  text: Localized;
  at: string;
  kind: MessageKind;
  meta?: Localized;
};

export type ExtractedTask = {
  id: string;
  title: Localized;
  description: Localized;
  priority: TaskPriority;
  due: string;
  assigneeId: string;
  channel: Channel;
};

export type Thread = {
  id: string;
  companyId: string;
  channel: Extract<Channel, "whatsapp" | "wechat">;
  groupName: Localized;
  contactName: string;
  unread: number;
  lastAt: string;
  messages: Message[];
  aiSummary: Localized;
  extractedTasks: ExtractedTask[];
  sentiment: Sentiment;
  responseMinutes: number;
};

export type AppNotification = {
  id: string;
  type: "task" | "message" | "mention" | "due";
  title: Localized;
  body: Localized;
  at: string;
  read: boolean;
  href: string;
};

export type DemoSettings = {
  dailyBrief: boolean;
  taskReminders: boolean;
  weeklyReport: boolean;
  channelAlerts: boolean;
};

export type DemoData = {
  companies: Company[];
  tasks: Task[];
  team: TeamMember[];
  threads: Thread[];
  notifications: AppNotification[];
  settings: DemoSettings;
};

export type AuthSession = {
  memberId: string;
  signedInAt: string;
};

export type DemoRole = "partner" | "lead" | "assistant";

export type MonthlyVolume = {
  month: string;
  whatsapp: number;
  wechat: number;
  email: number;
};

export type LocalizedTuple = [string, string, string];
