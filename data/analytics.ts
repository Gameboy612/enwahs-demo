import type { MonthlyVolume } from "@/lib/types";

export type WeeklyVolumePoint = {
  day: string;
  whatsapp: number;
  wechat: number;
  email: number;
};

export type ThroughputPoint = {
  month: string;
  created: number;
  completed: number;
};

export const monthlyVolume: MonthlyVolume[] = [
  { month: "2026-05", whatsapp: 418, wechat: 296, email: 142 },
  { month: "2026-06", whatsapp: 462, wechat: 318, email: 151 },
  { month: "2026-07", whatsapp: 438, wechat: 342, email: 138 },
  { month: "2026-08", whatsapp: 486, wechat: 371, email: 164 },
  { month: "2026-09", whatsapp: 512, wechat: 408, email: 172 },
  { month: "2026-10", whatsapp: 468, wechat: 392, email: 159 },
];

export const weeklyVolume: WeeklyVolumePoint[] = [
  { day: "mon", whatsapp: 74, wechat: 58, email: 21 },
  { day: "tue", whatsapp: 92, wechat: 64, email: 18 },
  { day: "wed", whatsapp: 81, wechat: 71, email: 24 },
  { day: "thu", whatsapp: 96, wechat: 66, email: 19 },
  { day: "fri", whatsapp: 88, wechat: 59, email: 22 },
  { day: "sat", whatsapp: 34, wechat: 28, email: 7 },
  { day: "sun", whatsapp: 18, wechat: 14, email: 4 },
];

export const taskThroughput: ThroughputPoint[] = [
  { month: "2026-05", created: 64, completed: 58 },
  { month: "2026-06", created: 72, completed: 66 },
  { month: "2026-07", created: 68, completed: 63 },
  { month: "2026-08", created: 79, completed: 71 },
  { month: "2026-09", created: 84, completed: 77 },
  { month: "2026-10", created: 76, completed: 69 },
];

export const responseTrend = [
  { week: "w40", minutes: 31 },
  { week: "w41", minutes: 27 },
  { week: "w42", minutes: 25 },
  { week: "w43", minutes: 18 },
];
