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
import { DEMO_TIMEZONE, DEMO_TODAY, STORAGE_KEYS } from "@/lib/constants";
import type { Language, Localized } from "@/lib/types";

/**
 * Every string lives in one row: [English, Traditional Chinese, Simplified Chinese].
 * Keeping the three translations adjacent makes drift obvious during review.
 */
const strings = {
  "app.name": ["Enwahs CRM", "Enwahs CRM", "Enwahs CRM"],
  "app.descriptor": ["Client operations workspace", "客戶營運工作台", "客户运营工作台"],
  "app.demo": ["Demo", "演示", "演示"],
  "app.demoMode": ["Demo mode", "演示模式", "演示模式"],
  "app.fictional": [
    "Fictional client data for demonstration only.",
    "僅供演示的虛構客戶資料。",
    "仅供演示的虚构客户资料。",
  ],
  "app.dataAsOf": ["Demo data as of {date}", "演示資料截至 {date}", "演示数据截至 {date}"],
  "app.version": ["Version {version}", "版本 {version}", "版本 {version}"],

  "common.demoLine": ["Demo · fictional data", "演示 · 虛構資料", "演示 · 虚构数据"],
  "common.search": ["Search", "搜尋", "搜索"],
  "common.searchPlaceholder": [
    "Search companies, tasks, people…",
    "搜尋公司、任務、成員…",
    "搜索公司、任务、成员…",
  ],
  "common.all": ["All", "全部", "全部"],
  "common.viewAll": ["View all", "查看全部", "查看全部"],
  "common.cancel": ["Cancel", "取消", "取消"],
  "common.save": ["Save", "儲存", "保存"],
  "common.saveChanges": ["Save changes", "儲存變更", "保存更改"],
  "common.add": ["Add", "新增", "添加"],
  "common.edit": ["Edit", "編輯", "编辑"],
  "common.delete": ["Delete", "刪除", "删除"],
  "common.close": ["Close", "關閉", "关闭"],
  "common.confirm": ["Confirm", "確認", "确认"],
  "common.reset": ["Reset", "重設", "重置"],
  "common.export": ["Export", "匯出", "导出"],
  "common.back": ["Back", "返回", "返回"],
  "common.loading": ["Loading…", "載入中…", "加载中…"],
  "common.noResults": ["No results", "沒有結果", "没有结果"],
  "common.optional": ["Optional", "選填", "选填"],
  "common.today": ["Today", "今天", "今天"],
  "common.tomorrow": ["Tomorrow", "明天", "明天"],
  "common.yesterday": ["Yesterday", "昨天", "昨天"],
  "common.overdue": ["Overdue", "已逾期", "已逾期"],
  "common.dueToday": ["Due today", "今天到期", "今天到期"],
  "common.dueInDays": ["Due in {days} days", "{days} 天後到期", "{days} 天后到期"],
  "common.overdueByDays": ["{days} days overdue", "逾期 {days} 天", "逾期 {days} 天"],
  "common.dueOn": ["Due {date}", "{date} 到期", "{date} 到期"],
  "common.high": ["High", "高", "高"],
  "common.medium": ["Medium", "中", "中"],
  "common.low": ["Low", "低", "低"],
  "common.status": ["Status", "狀態", "状态"],
  "common.priority": ["Priority", "優先級", "优先级"],
  "common.assignee": ["Assignee", "負責人", "负责人"],
  "common.company": ["Company", "公司", "公司"],
  "common.channel": ["Channel", "頻道", "频道"],
  "common.dueDate": ["Due date", "截止日期", "截止日期"],
  "common.unassigned": ["Unassigned", "未分配", "未分配"],
  "common.done": ["Done", "已完成", "已完成"],
  "common.markDone": ["Mark done", "標記完成", "标记完成"],
  "common.reopen": ["Reopen", "重新開啟", "重新打开"],
  "common.details": ["Details", "詳情", "详情"],
  "common.notes": ["Notes", "備註", "备注"],
  "common.activity": ["Activity", "動態", "动态"],
  "common.overview": ["Overview", "概覽", "概览"],
  "common.contact": ["Contact", "聯絡人", "联系人"],
  "common.contacts": ["Contacts", "聯絡人", "联系人"],
  "common.tags": ["Tags", "標籤", "标签"],
  "common.since": ["Client since", "合作始於", "合作始于"],
  "common.lastContact": ["Last contact", "最後聯絡", "最后联系"],
  "common.openTasks": ["Open tasks", "待辦任務", "待办任务"],
  "common.health": ["Health", "健康度", "健康度"],
  "common.risk": ["Risk", "風險", "风险"],
  "common.services": ["Services", "服務", "服务"],
  "common.address": ["Address", "地址", "地址"],
  "common.email": ["Email", "電郵", "邮箱"],
  "common.phone": ["Phone", "電話", "电话"],
  "common.website": ["Website", "網站", "网站"],
  "common.role": ["Role", "角色", "角色"],
  "common.team": ["Team", "團隊", "团队"],
  "common.capacity": ["Capacity", "工作量上限", "工作量上限"],
  "common.hours": ["hours", "小時", "小时"],
  "common.languages": ["Languages", "語言", "语言"],
  "common.showMore": ["Show more", "顯示更多", "显示更多"],
  "common.showLess": ["Show less", "收起", "收起"],
  "common.minutesShort": ["min", "分鐘", "分钟"],
  "common.hoursShort": ["h", "小時", "小时"],
  "common.daysShort": ["d", "天", "天"],
  "common.tasks": ["tasks", "項任務", "项任务"],
  "common.messages": ["messages", "則訊息", "条消息"],
  "common.filters": ["Filters", "篩選", "筛选"],
  "common.clearFilters": ["Clear filters", "清除篩選", "清除筛选"],
  "common.showing": ["Showing {shown} of {total}", "顯示 {shown} / {total}", "显示 {shown} / {total}"],
  "common.error": ["Something went wrong.", "發生錯誤。", "发生错误。"],
  "common.required": ["Required", "必填", "必填"],

  "day.mon": ["Mon", "週一", "周一"],
  "day.tue": ["Tue", "週二", "周二"],
  "day.wed": ["Wed", "週三", "周三"],
  "day.thu": ["Thu", "週四", "周四"],
  "day.fri": ["Fri", "週五", "周五"],
  "day.sat": ["Sat", "週六", "周六"],
  "day.sun": ["Sun", "週日", "周日"],

  "nav.workspace": ["Workspace", "工作台", "工作台"],
  "nav.manage": ["Manage", "管理", "管理"],
  "nav.dashboard": ["Home", "首頁", "首页"],
  "nav.tasks": ["Tasks", "任務", "任务"],
  "nav.companies": ["Companies", "公司", "公司"],
  "nav.inbox": ["Inbox", "收件匣", "收件箱"],
  "nav.reports": ["Reports", "報告", "报告"],
  "nav.team": ["Team", "團隊", "团队"],
  "nav.settings": ["Settings", "設定", "设置"],
  "nav.signOut": ["Sign out", "登出", "退出登录"],
  "nav.demoWorkspace": ["Enwahs demo workspace", "Enwahs 演示工作台", "Enwahs 演示工作台"],
  "nav.help": ["Demo guide", "演示指南", "演示指南"],

  "status.todo": ["Todo", "待辦", "待办"],
  "status.doing": ["Doing", "進行中", "进行中"],
  "status.done": ["Done", "已完成", "已完成"],
  "companyStatus.active": ["Active", "活躍", "活跃"],
  "companyStatus.at-risk": ["At risk", "高風險", "高风险"],
  "companyStatus.onboarding": ["Onboarding", "新客戶", "新客户"],
  "companyStatus.dormant": ["Dormant", "休眠", "休眠"],
  "risk.low": ["Low", "低", "低"],
  "risk.medium": ["Medium", "中", "中"],
  "risk.high": ["High", "高", "高"],
  "service.audit": ["Audit", "審計", "审计"],
  "service.tax": ["Tax", "稅務", "税务"],
  "service.companySecretarial": ["Company secretary", "公司秘書", "公司秘书"],
  "service.accounts": ["Accounts", "會計", "会计"],
  "service.payroll": ["Payroll", "薪酬", "薪酬"],
  "service.funding": ["Government funding", "政府資助", "政府资助"],
  "service.advisory": ["Advisory", "顧問", "顾问"],
  "role.partner": ["Partner", "合夥人", "合伙人"],
  "role.lead": ["CS Team Lead", "客戶服務主管", "客户服务主管"],
  "role.associate": ["Associate", "專員", "专员"],
  "role.assistant": ["CS Assistant", "客戶服務助理", "客户服务助理"],
  "channel.whatsapp": ["WhatsApp", "WhatsApp", "WhatsApp"],
  "channel.wechat": ["WeChat", "微信", "微信"],
  "channel.email": ["Email", "電郵", "邮箱"],
  "channel.internal": ["Internal", "內部", "内部"],
  "sentiment.positive": ["Positive", "正面", "正面"],
  "sentiment.neutral": ["Neutral", "中性", "中性"],
  "sentiment.negative": ["Needs attention", "需關注", "需关注"],

  "topbar.searchAria": ["Search workspace", "搜尋工作台", "搜索工作台"],
  "topbar.notifications": ["Notifications", "通知", "通知"],
  "topbar.noNotifications": ["You're all caught up.", "暫時沒有新通知。", "暂时没有新通知。"],
  "topbar.viewAll": ["View all notifications", "查看所有通知", "查看所有通知"],
  "topbar.commandHint": ["Press ⌘K to search", "按 ⌘K 搜尋", "按 ⌘K 搜索"],
  "topbar.menu": ["Open menu", "開啟選單", "打开菜单"],
  "topbar.profile": ["Profile", "個人資料", "个人资料"],
  "topbar.demo": ["Demo", "演示", "演示"],

  "notifications.title": ["Notifications", "通知", "通知"],
  "notifications.markAll": ["Mark all as read", "全部標為已讀", "全部标为已读"],
  "notifications.empty": ["You're all caught up.", "暫時沒有新通知。", "暂时没有新通知。"],
  "notifications.viewAll": ["View all", "查看全部", "查看全部"],
  "notifications.justNow": ["Just now", "剛剛", "刚刚"],
  "notifications.minutesAgo": ["{count} min ago", "{count} 分鐘前", "{count} 分钟前"],
  "notifications.hoursAgo": ["{count} hr ago", "{count} 小時前", "{count} 小时前"],
  "notifications.daysAgo": ["{count} d ago", "{count} 天前", "{count} 天前"],

  "login.headlineShort": [
    "Client work, in one view.",
    "客戶事務，一目了然。",
    "客户事务，一目了然。",
  ],
  "login.sublineShort": [
    "WhatsApp, WeChat, companies and tasks. One workspace.",
    "WhatsApp、微信、公司與任務，一個工作台。",
    "WhatsApp、微信、公司与任务，一个工作台。",
  ],
  "login.disclaimerShort": [
    "Demo · fictional data · no live connections.",
    "演示 · 虛構資料 · 無真實連接。",
    "演示 · 虚构数据 · 无真实连接。",
  ],
  "login.badge": [
    "Internal demo for the Enwahs team",
    "Enwahs 團隊內部演示",
    "Enwahs 团队内部演示",
  ],
  "login.headline": [
    "Every client request, in one calm view.",
    "所有客戶需求，盡在一處。",
    "所有客户需求，尽在一处。",
  ],
  "login.subhead": [
    "A preview of how Enwahs can bring WhatsApp and WeChat work, company context and open tasks into one internal workspace.",
    "預覽 Enwahs 如何把 WhatsApp、微信工作、公司資料與待辦任務整合到同一個內部工作台。",
    "预览 Enwahs 如何把 WhatsApp、微信工作、公司资料与待办任务整合到同一个内部工作台。",
  ],
  "login.featureInbox": [
    "WhatsApp + WeChat conversations with AI-extracted tasks",
    "WhatsApp + 微信對話，自動擷取任務",
    "WhatsApp + 微信对话，自动提取任务",
  ],
  "login.featureCompanies": [
    "One client profile for every company and contact",
    "每間公司與聯絡人一個完整檔案",
    "每家公司与联系人一个完整档案",
  ],
  "login.featureTasks": [
    "A shared to-do board with owners and reminders",
    "共用待辦看板，專人負責與提醒",
    "共享待办看板，专人负责与提醒",
  ],
  "login.cardTitle": ["Enter the demo workspace", "進入演示工作台", "进入演示工作台"],
  "login.cardSubtitle": [
    "No credentials needed.",
    "無需帳號密碼。",
    "无需账号密码。",
  ],
  "login.viewAs": ["Preview as", "預覽身份", "预览身份"],
  "login.enter": ["Enter demo workspace", "進入演示工作台", "进入演示工作台"],
  "login.entering": ["Opening workspace…", "正在開啟工作台…", "正在打开工作台…"],
  "login.partnerDesc": [
    "Firm-wide view, client relationships and approvals.",
    "全所視角、客戶關係與審批。",
    "全所视角、客户关系与审批。",
  ],
  "login.leadDesc": [
    "Daily inbox, task allocation and team workload.",
    "每日收件匣、任務分配與團隊工作量。",
    "每日收件箱、任务分配与团队工作量。",
  ],
  "login.assistantDesc": [
    "Assigned tasks, company notes and follow-ups.",
    "指派任務、公司備註與跟進。",
    "指派任务、公司备注与跟进。",
  ],
  "login.disclaimer": [
    "This is a clickable UI demo. Client data is fictional, and WhatsApp/WeChat messages are simulated — nothing is sent, received or connected.",
    "這是一個可操作的介面演示。客戶資料均為虛構，WhatsApp／微信訊息為模擬內容，不會收發或連接任何真實訊息。",
    "这是一个可操作的界面演示。客户资料均为虚构，WhatsApp/微信消息为模拟内容，不会收发或连接任何真实消息。",
  ],
  "login.clients": ["1,400+ clients served", "服務超過 1,400 名客戶", "服务超过 1,400 名客户"],
  "login.teamStat": ["30-person team", "30 人團隊", "30 人团队"],
  "login.offices": ["Hong Kong · Shenzhen", "香港 · 深圳", "香港 · 深圳"],
  "login.channels": [
    "One view across WhatsApp and WeChat",
    "WhatsApp 與微信一目了然",
    "WhatsApp 与微信一目了然",
  ],
  "login.copyright": [
    "© {year} Enwahs Accounting & Taxation Limited. Demo build.",
    "© {year} 安華司會計稅務有限公司。演示版本。",
    "© {year} 安华司会计税务有限公司。演示版本。",
  ],
  "login.language": ["Language", "語言", "语言"],

  "dashboard.greetingMorning": ["Good morning, {name}", "早晨，{name}", "早上好，{name}"],
  "dashboard.greetingAfternoon": ["Good afternoon, {name}", "午安，{name}", "下午好，{name}"],
  "dashboard.greetingEvening": ["Good evening, {name}", "晚上好，{name}", "晚上好，{name}"],
  "dashboard.subtitle": [
    "Here's what needs your attention across the firm today.",
    "這是今天全所需要關注的事項。",
    "这是今天全所需要关注的事项。",
  ],
  "dashboard.newTask": ["New task", "新任務", "新任务"],
  "dashboard.addCompany": ["Add company", "新增公司", "添加公司"],
  "dashboard.openInbox": ["Open inbox", "開啟收件匣", "打开收件箱"],
  "dashboard.kpi.openTasks": ["Open tasks", "待辦任務", "待办任务"],
  "dashboard.kpi.dueToday": ["Due today", "今天到期", "今天到期"],
  "dashboard.kpi.atRisk": ["At-risk clients", "高風險客戶", "高风险客户"],
  "dashboard.kpi.avgResponse": ["Avg. response", "平均回覆時間", "平均回复时间"],
  "dashboard.kpi.openHint": [
    "Across {count} active clients",
    "分佈於 {count} 間活躍公司",
    "分布于 {count} 家活跃公司",
  ],
  "dashboard.kpi.dueHint": ["{count} already overdue", "其中 {count} 項已逾期", "其中 {count} 项已逾期"],
  "dashboard.kpi.riskHint": [
    "Needs a relationship check-in",
    "需要關係跟進",
    "需要关系跟进",
  ],
  "dashboard.kpi.responseHint": ["Down 6 min this week", "本週減少 6 分鐘", "本周减少 6 分钟"],
  "dashboard.kpi.minutes": ["min", "分鐘", "分钟"],
  "dashboard.aiBrief": ["AI daily brief", "AI 每日簡報", "AI 每日简报"],
  "dashboard.brief1": [
    "3 clients waiting on documents",
    "3 間公司等待文件",
    "3 家公司等待文件",
  ],
  "dashboard.brief2": [
    "Golden Harbour · offshore claim",
    "金港海鮮 · 離岸申索",
    "金港海鲜 · 离岸申索",
  ],
  "dashboard.brief3": [
    "2 payroll confirmations this week",
    "2 項薪酬確認本週到期",
    "2 项薪酬确认本周到期",
  ],
  "dashboard.aiBriefHeadline": [
    "Three things worth your attention",
    "今天值得留意的三件事",
    "今天值得留意的三件事",
  ],
  "dashboard.aiBriefSub": [
    "Synthesised from {count} conversations across WhatsApp and WeChat",
    "綜合 {count} 段 WhatsApp 與微信對話",
    "综合 {count} 段 WhatsApp 与微信对话",
  ],
  "dashboard.aiBriefItem1": [
    "3 clients are waiting on documents; the oldest request is 4 days old.",
    "3 間公司正等待文件，最久的請求已達 4 天。",
    "3 家公司正等待文件，最久的请求已达 4 天。",
  ],
  "dashboard.aiBriefItem2": [
    "Golden Harbour's offshore claim needs a reply before Thursday.",
    "金港海鮮的離岸申索需於星期四前回覆。",
    "金港海鲜的离岸申索需于星期四前回复。",
  ],
  "dashboard.aiBriefItem3": [
    "Payroll confirmations for Blue Bay and Orient Pearl are due this week.",
    "藍灣教育與東方明珠的薪酬確認本週到期。",
    "蓝湾教育与东方明珠的薪酬确认本周到期。",
  ],
  "dashboard.aiBriefCta": ["Review in inbox", "在收件匣查看", "在收件箱查看"],
  "dashboard.pipeline": ["Task pipeline", "任務進度", "任务进度"],
  "dashboard.pipelineSub": [
    "{open} open · {done} completed",
    "{open} 項待辦 · {done} 項完成",
    "{open} 项待办 · {done} 项完成",
  ],
  "dashboard.weeklyVolume": ["Conversation volume", "對話量", "对话量"],
  "dashboard.weeklyVolumeSub": ["Last 7 days", "過去 7 天", "过去 7 天"],
  "dashboard.priorityTasks": ["Priority tasks", "優先任務", "优先任务"],
  "dashboard.priorityTasksSub": [
    "Sorted by due date and client risk",
    "按截止日期與客戶風險排序",
    "按截止日期与客户风险排序",
  ],
  "dashboard.recentConversations": ["Recent conversations", "最近對話", "最近对话"],
  "dashboard.recentConversationsSub": [
    "WhatsApp and WeChat, in one place",
    "WhatsApp 與微信，集中一處",
    "WhatsApp 与微信，集中一处",
  ],
  "dashboard.companyHealth": ["Company health", "公司健康度", "公司健康度"],
  "dashboard.companyHealthSub": [
    "Clients that need a closer look",
    "需要多加留意的客戶",
    "需要多加留意的客户",
  ],
  "dashboard.upcomingDeadlines": ["Upcoming deadlines", "即將到期", "即将到期"],
  "dashboard.quickActions": ["Quick actions", "快速操作", "快速操作"],
  "dashboard.today": ["Today", "今天", "今天"],
  "dashboard.thisWeek": ["This week", "本週", "本周"],
  "dashboard.thisMonth": ["This month", "本月", "本月"],
  "dashboard.overdueCount": ["{count} overdue", "{count} 項逾期", "{count} 项逾期"],
  "dashboard.dueThisWeek": [
    "{count} due this week",
    "本週 {count} 項到期",
    "本周 {count} 项到期",
  ],
  "dashboard.viewTasks": ["View tasks", "查看任務", "查看任务"],
  "dashboard.viewCompanies": ["View companies", "查看公司", "查看公司"],
  "dashboard.viewInbox": ["View inbox", "查看收件匣", "查看收件箱"],
  "dashboard.emptyTasks": [
    "Nothing urgent. Enjoy the calm.",
    "暫時沒有緊急事項，享受片刻寧靜。",
    "暂时没有紧急事项，享受片刻宁静。",
  ],
  "dashboard.unread": ["{count} unread", "{count} 則未讀", "{count} 条未读"],
  "dashboard.demoBanner": [
    "You're viewing a demo with fictional data.",
    "你正在查看使用虛構資料的演示。",
    "你正在查看使用虚构数据的演示。",
  ],
  "dashboard.dismiss": ["Dismiss", "關閉", "关闭"],
  "dashboard.healthHint": [
    "Higher is healthier. Scores blend payment, response and task age.",
    "分數越高越健康，綜合付款、回覆與任務帳齡。",
    "分数越高越健康，综合付款、回复与任务账龄。",
  ],

  "home.title": ["Todo", "待辦", "待办"],
  "home.searchPlaceholder": ["Search todos…", "搜尋待辦…", "搜索待办…"],
  "home.later": ["Later", "稍後", "稍后"],
  "tasks.title": ["Tasks", "任務", "任务"],
  "tasks.blocked": ["Blocked", "受阻", "受阻"],
  "editor.schedule": ["Schedule", "時間", "时间"],
  "editor.assignee": ["Person in charge", "負責人", "负责人"],
  "editor.assignees": ["Assignees", "負責人", "负责人"],
  "editor.details": ["Details", "詳情", "详情"],
  "editor.role": ["Role", "角色", "角色"],
  "assigneeRole.lead": ["Lead", "主責", "主责"],
  "assigneeRole.reviewer": ["Reviewer", "覆核", "复核"],
  "assigneeRole.support": ["Support", "協助", "协助"],
  "editor.searchPeople": ["Search team…", "搜尋成員…", "搜索成员…"],
  "editor.noAssignees": ["No one assigned", "尚未指派", "尚未指派"],
  "editor.assigneesHint": [
    "Select the team members responsible for this task.",
    "選擇負責此任務的團隊成員。",
    "选择负责此任务的团队成员。",
  ],
  "editor.selectedCount": ["{count} selected", "已選 {count} 位", "已选 {count} 位"],
  "tasks.urgent": ["Urgent", "緊急", "紧急"],
  "tasks.subtitle": [
    "Every commitment, owner and deadline in one shared board.",
    "所有承諾、負責人與截止日期，集中在同一個看板。",
    "所有承诺、负责人与截止日期，集中在同一个看板。",
  ],
  "tasks.add": ["New task", "新任務", "新任务"],
  "tasks.list": ["List", "列表", "列表"],
  "tasks.board": ["Board", "看板", "看板"],
  "tasks.searchPlaceholder": [
    "Search tasks or companies…",
    "搜尋任務或公司…",
    "搜索任务或公司…",
  ],
  "tasks.allStatuses": ["All statuses", "所有狀態", "所有状态"],
  "tasks.allPriorities": ["All priorities", "所有優先級", "所有优先级"],
  "tasks.allAssignees": ["All assignees", "所有負責人", "所有负责人"],
  "tasks.allCompanies": ["All companies", "所有公司", "所有公司"],
  "tasks.allChannels": ["All channels", "所有頻道", "所有频道"],
  "tasks.empty": ["No tasks match these filters.", "沒有符合篩選條件的任務。", "没有符合筛选条件的任务。"],
  "tasks.emptyHint": [
    "Try clearing a filter or create a new task.",
    "嘗試清除篩選或建立新任務。",
    "尝试清除筛选或创建新任务。",
  ],
  "tasks.clearFilters": ["Clear filters", "清除篩選", "清除筛选"],
  "tasks.count": ["{count} tasks", "{count} 項任務", "{count} 项任务"],
  "tasks.newTask": ["New task", "新任務", "新任务"],
  "tasks.editTask": ["Edit task", "編輯任務", "编辑任务"],
  "tasks.titleLabel": ["Task title", "任務名稱", "任务名称"],
  "tasks.titlePlaceholder": [
    "e.g. Chase October bank statements",
    "例如：追收 10 月銀行月結單",
    "例如：追收 10 月银行月结单",
  ],
  "tasks.description": ["Description", "描述", "描述"],
  "tasks.descriptionPlaceholder": [
    "Add context, next steps or a client reference…",
    "加入背景、下一步或客戶參考…",
    "添加背景、下一步或客户参考…",
  ],
  "tasks.companyLabel": ["Company", "公司", "公司"],
  "tasks.assigneeLabel": ["Assignee", "負責人", "负责人"],
  "tasks.assigneeError": ["Choose at least one assignee", "請選擇至少一位負責人", "请选择至少一位负责人"],
  "tasks.priorityLabel": ["Priority", "優先級", "优先级"],
  "tasks.statusLabel": ["Status", "狀態", "状态"],
  "tasks.channelLabel": ["Channel", "頻道", "频道"],
  "tasks.dueLabel": ["Due date", "截止日期", "截止日期"],
  "tasks.createTask": ["Create task", "建立任務", "创建任务"],
  "tasks.deleteTask": ["Delete task", "刪除任務", "删除任务"],
  "tasks.deleteConfirm": [
    "Delete this task? This cannot be undone in the demo.",
    "刪除此任務？演示中無法復原。",
    "删除此任务？演示中无法恢复。",
  ],
  "tasks.taskCreated": ["Task created", "任務已建立", "任务已创建"],
  "tasks.taskUpdated": ["Task updated", "任務已更新", "任务已更新"],
  "tasks.taskDeleted": ["Task deleted", "任務已刪除", "任务已删除"],
  "tasks.source": ["Source", "來源", "来源"],
  "tasks.fromConversation": ["From conversation", "來自對話", "来自对话"],
  "tasks.viewConversation": ["View conversation", "查看對話", "查看对话"],
  "tasks.subtasks": ["Checklist", "檢查清單", "检查清单"],
  "tasks.addSubtask": ["Add checklist item", "新增檢查項目", "添加检查项"],
  "tasks.noSubtasks": ["No checklist items yet.", "尚未有檢查項目。", "尚未有检查项。"],
  "tasks.boardHint": [
    "Drag a card to change its status.",
    "拖曳卡片以變更狀態。",
    "拖动卡片以更改状态。",
  ],
  "tasks.selectCompany": ["Select a company", "選擇公司", "选择公司"],
  "tasks.selectAssignee": ["Select an assignee", "選擇負責人", "选择负责人"],
  "tasks.selectPriority": ["Select priority", "選擇優先級", "选择优先级"],
  "tasks.selectStatus": ["Select status", "選擇狀態", "选择状态"],
  "tasks.selectChannel": ["Select channel", "選擇頻道", "选择频道"],
  "tasks.overdueOnly": ["Overdue only", "僅顯示逾期", "仅显示逾期"],
  "tasks.highPriority": ["High priority", "高優先級", "高优先级"],
  "tasks.quickFilters": ["Quick filters", "快速篩選", "快速筛选"],
  "tasks.noDueDate": ["No due date", "未設截止日期", "未设截止日期"],
  "tasks.dueThisWeek": ["Due this week", "本週到期", "本周到期"],
  "tasks.allTasks": ["All tasks", "所有任務", "所有任务"],
  "tasks.mine": ["My tasks", "我的任務", "我的任务"],
  "tasks.team": ["Team tasks", "團隊任務", "团队任务"],
  "tasks.dropHere": ["Drop here", "放開以移至這裡", "松开以移到这里"],
  "tasks.dragHint": ["Drag to update", "拖曳以更新", "拖动以更新"],
  "tasks.createdBy": ["Demo workspace", "演示工作台", "演示工作台"],
  "tasks.selectCompanyError": ["Choose a company for this task.", "請為此任務選擇公司。", "请为此任务选择公司。"],
  "tasks.titleError": ["Give this task a title.", "請輸入任務名稱。", "请输入任务名称。"],

  "companies.title": ["Companies", "公司", "公司"],
  "companies.subtitle": [
    "Every client relationship, with the context your team needs.",
    "每個客戶關係，連同團隊所需的完整背景。",
    "每个客户关系，连同团队所需的完整背景。",
  ],
  "companies.add": ["Add company", "新增公司", "添加公司"],
  "companies.searchPlaceholder": [
    "Search by company, contact or industry…",
    "按公司、聯絡人或行業搜尋…",
    "按公司、联系人或行业搜索…",
  ],
  "companies.grid": ["Cards", "卡片", "卡片"],
  "companies.table": ["Table", "表格", "表格"],
  "companies.allStatuses": ["All statuses", "所有狀態", "所有状态"],
  "companies.allServices": ["All services", "所有服務", "所有服务"],
  "companies.allRisks": ["All risk levels", "所有風險級別", "所有风险级别"],
  "companies.empty": [
    "No companies match these filters.",
    "沒有符合篩選條件的公司。",
    "没有符合筛选条件的公司。",
  ],
  "companies.emptyHint": [
    "Try a different search or add a new company.",
    "嘗試其他搜尋或新增公司。",
    "尝试其他搜索或添加公司。",
  ],
  "companies.newCompany": ["New company", "新公司", "新公司"],
  "companies.editCompany": ["Edit company", "編輯公司", "编辑公司"],
  "companies.companyName": ["Company name", "公司名稱", "公司名称"],
  "companies.companyNamePlaceholder": [
    "e.g. Harbourview Logistics Ltd.",
    "例如：海景物流有限公司",
    "例如：海景物流有限公司",
  ],
  "companies.industry": ["Industry", "行業", "行业"],
  "companies.industryPlaceholder": [
    "e.g. Logistics & trading",
    "例如：物流及貿易",
    "例如：物流及贸易",
  ],
  "companies.statusLabel": ["Client status", "客戶狀態", "客户状态"],
  "companies.riskLabel": ["Risk level", "風險級別", "风险级别"],
  "companies.servicesLabel": ["Services", "服務", "服务"],
  "companies.contactName": ["Primary contact", "主要聯絡人", "主要联系人"],
  "companies.contactTitle": ["Contact title", "聯絡人職銜", "联系人职衔"],
  "companies.contactEmail": ["Contact email", "聯絡人電郵", "联系人邮箱"],
  "companies.contactPhone": ["Contact phone", "聯絡人電話", "联系人电话"],
  "companies.addressLabel": ["Address", "地址", "地址"],
  "companies.brLabel": ["Business registration no.", "商業登記號碼", "商业登记号码"],
  "companies.sinceLabel": ["Client since", "合作始於", "合作始于"],
  "companies.websiteLabel": ["Website", "網站", "网站"],
  "companies.notesLabel": ["Notes", "備註", "备注"],
  "companies.notesPlaceholder": ["Add a relationship note…", "新增關係備註…", "添加关系备注…"],
  "companies.tagsLabel": ["Tags", "標籤", "标签"],
  "companies.tagsPlaceholder": [
    "e.g. Priority, Mainland, Audit",
    "例如：重點、內地、審計",
    "例如：重点、内地、审计",
  ],
  "companies.createCompany": ["Create company", "建立公司", "创建公司"],
  "companies.deleteCompany": ["Delete company", "刪除公司", "删除公司"],
  "companies.deleteConfirm": [
    "Delete this company and its demo data?",
    "刪除此公司及其演示資料？",
    "删除此公司及其演示数据？",
  ],
  "companies.added": ["Company added", "公司已新增", "公司已添加"],
  "companies.updated": ["Company updated", "公司已更新", "公司已更新"],
  "companies.deleted": ["Company deleted", "公司已刪除", "公司已删除"],
  "companies.count": ["{count} companies", "{count} 間公司", "{count} 家公司"],
  "companies.totalOpenTasks": ["Open tasks", "待辦任務", "待办任务"],
  "companies.highRisk": ["High-risk clients", "高風險客戶", "高风险客户"],
  "companies.portfolioHealth": ["Portfolio health", "客戶組合健康度", "客户组合健康度"],
  "companies.companyProfile": ["Company profile", "公司檔案", "公司档案"],
  "companies.contactDetails": ["Contact details", "聯絡資料", "联系信息"],
  "companies.companyDetails": ["Company details", "公司資料", "公司信息"],
  "companies.aiSummary": ["AI relationship summary", "AI 關係摘要", "AI 关系摘要"],
  "companies.recentActivity": ["Recent activity", "最近動態", "最近动态"],
  "companies.openTasksTitle": ["Open tasks", "待辦任務", "待办任务"],
  "companies.completedTasks": ["Completed", "已完成", "已完成"],
  "companies.companyNotes": ["Notes", "備註", "备注"],
  "companies.addNote": ["Add note", "新增備註", "添加备注"],
  "companies.notePlaceholder": ["Write a note for the team…", "為團隊寫下備註…", "为团队写下备注…"],
  "companies.noNotes": ["No notes yet. Add the first one.", "尚未有備註，新增第一則吧。", "尚未有备注，添加第一条吧。"],
  "companies.noOpenTasks": ["No open tasks for this company.", "此公司沒有待辦任務。", "此公司没有待办任务。"],
  "companies.noCompletedTasks": ["No completed tasks yet.", "尚未有已完成任務。", "尚未有已完成任务。"],
  "companies.back": ["Back to companies", "返回公司列表", "返回公司列表"],
  "companies.notFound": ["Company not found", "找不到公司", "找不到公司"],
  "companies.notFoundHint": [
    "This company may have been removed or the link is out of date.",
    "此公司可能已被移除，或連結已失效。",
    "此公司可能已被移除，或链接已失效。",
  ],
  "companies.keyContact": ["Key contact", "主要聯絡人", "主要联系人"],
  "companies.relationshipSince": ["Relationship since", "合作始於", "合作始于"],
  "companies.servicesProvided": ["Services provided", "提供服務", "提供服务"],
  "companies.health": ["Health", "健康度", "健康度"],
  "companies.nextDeadline": ["Next deadline", "下個截止日期", "下个截止日期"],
  "companies.viewAllTasks": ["View all tasks", "查看所有任務", "查看所有任务"],
  "companies.activityTimeline": ["Activity timeline", "動態時間軸", "动态时间轴"],
  "companies.messageThread": ["Conversation", "對話", "对话"],
  "companies.viewInbox": ["View in inbox", "在收件匣查看", "在收件箱查看"],
  "companies.notesSaved": ["Note added", "備註已新增", "备注已添加"],
  "companies.primary": ["Primary", "主要", "主要"],
  "companies.contactPerson": ["Contact", "聯絡人", "联系人"],
  "companies.lastUpdated": ["Last updated", "最後更新", "最后更新"],
  "companies.companyId": ["Company ID", "公司編號", "公司编号"],
  "companies.tabs.overview": ["Overview", "概覽", "概览"],
  "companies.tabs.tasks": ["Tasks", "任務", "任务"],
  "companies.tabs.activity": ["Activity", "動態", "动态"],
  "companies.tabs.notes": ["Notes", "備註", "备注"],
  "companies.noActivity": ["No recent activity recorded.", "暫無近期動態。", "暂无近期动态。"],
  "companies.demoNote": [
    "This company is stored locally in your browser for the demo.",
    "此公司僅儲存在瀏覽器本機，供演示使用。",
    "此公司仅存储在浏览器本地，供演示使用。",
  ],

  "inbox.title": ["Inbox", "收件匣", "收件箱"],
  "inbox.subtitle": [
    "WhatsApp and WeChat conversations, with the next action already extracted.",
    "WhatsApp 與微信對話，下一個行動已自動整理。",
    "WhatsApp 与微信对话，下一个行动已自动整理。",
  ],
  "inbox.allChannels": ["All channels", "所有頻道", "所有频道"],
  "inbox.searchPlaceholder": ["Search conversations…", "搜尋對話…", "搜索对话…"],
  "inbox.unread": ["Unread", "未讀", "未读"],
  "inbox.noThreads": [
    "No conversations match this filter.",
    "沒有符合篩選條件的對話。",
    "没有符合筛选条件的对话。",
  ],
  "inbox.selectThread": ["Select a conversation", "選擇一段對話", "选择一段对话"],
  "inbox.selectThreadHint": [
    "Choose a WhatsApp or WeChat thread to see the AI summary and extracted tasks.",
    "選擇 WhatsApp 或微信對話，查看 AI 摘要與擷取的任務。",
    "选择 WhatsApp 或微信对话，查看 AI 摘要与提取的任务。",
  ],
  "inbox.aiAssistant": ["AI assistant", "AI 助理", "AI 助理"],
  "inbox.aiSummary": ["Conversation summary", "對話摘要", "对话摘要"],
  "inbox.extractedTasks": ["Extracted tasks", "擷取的任務", "提取的任务"],
  "inbox.createTask": ["Create task", "建立任務", "创建任务"],
  "inbox.suggestedReply": ["Suggested reply", "建議回覆", "建议回复"],
  "inbox.demoReply": [
    "Thanks, I've noted this and will follow up today.",
    "收到，我已記錄，今天會跟進。",
    "收到，我已记录，今天会跟进。",
  ],
  "inbox.composerPlaceholder": [
    "Messaging is disabled in this demo",
    "演示中已停用訊息發送",
    "演示中已禁用消息发送",
  ],
  "inbox.send": ["Send", "發送", "发送"],
  "inbox.demoNotice": [
    "Read-only demo — no messages are sent or received.",
    "唯讀演示 — 不會收發任何訊息。",
    "只读演示 — 不会收发任何消息。",
  ],
  "inbox.participants": ["Participants", "參與者", "参与者"],
  "inbox.group": ["Group", "群組", "群组"],
  "inbox.openCompany": ["Open company", "開啟公司", "打开公司"],
  "inbox.responseTime": ["Avg. response", "平均回覆", "平均回复"],
  "inbox.sentiment": ["Sentiment", "情緒", "情绪"],
  "inbox.messagesCount": ["{count} messages", "{count} 則訊息", "{count} 条消息"],
  "inbox.unreadCount": ["{count} unread", "{count} 則未讀", "{count} 条未读"],
  "inbox.voiceNote": ["Voice note · {duration}", "語音訊息 · {duration}", "语音消息 · {duration}"],
  "inbox.imageAttachment": ["Image attachment", "圖片附件", "图片附件"],
  "inbox.fileAttachment": ["File attachment", "檔案附件", "文件附件"],
  "inbox.aiNote": ["AI note", "AI 備註", "AI 备注"],
  "inbox.channelFilter": ["Channel", "頻道", "频道"],
  "inbox.threadCount": ["{count} conversations", "{count} 段對話", "{count} 段对话"],
  "inbox.threadsShort": ["conversations", "段對話", "段对话"],
  "inbox.demoBadge": ["Simulated", "模擬", "模拟"],
  "inbox.markRead": ["Mark as read", "標為已讀", "标为已读"],
  "inbox.noUnread": ["No unread conversations", "沒有未讀對話", "没有未读对话"],
  "inbox.replyCopied": ["Reply copied", "回覆已複製", "回复已复制"],
  "inbox.aiDisclosure": [
    "AI summaries and task suggestions are illustrative in this demo.",
    "本演示中的 AI 摘要與任務建議僅供示範。",
    "本演示中的 AI 摘要与任务建议仅供示范。",
  ],
  "inbox.openTasksFor": ["Open tasks for {company}", "{company} 的待辦任務", "{company} 的待办任务"],
  "inbox.viewAllTasks": ["View all tasks", "查看所有任務", "查看所有任务"],
  "inbox.jumpToLatest": ["Jump to latest", "跳到最新", "跳到最新"],
  "inbox.readOnly": ["Read-only", "唯讀", "只读"],
  "inbox.today": ["Today", "今天", "今天"],
  "inbox.yesterday": ["Yesterday", "昨天", "昨天"],
  "inbox.aiExtracted": ["AI-extracted", "AI 擷取", "AI 提取"],
  "inbox.confidence": ["Confidence", "信心度", "置信度"],
  "inbox.highConfidence": ["High", "高", "高"],
  "inbox.mediumConfidence": ["Medium", "中", "中"],

  "reports.title": ["Reports", "報告", "报告"],
  "reports.subtitle": [
    "A clear read on workload, response times and client health.",
    "清晰掌握工作量、回覆時間與客戶健康度。",
    "清晰掌握工作量、回复时间与客户健康度。",
  ],
  "reports.range": ["Reporting period", "報告期間", "报告期间"],
  "reports.last30": ["Last 30 days", "過去 30 天", "过去 30 天"],
  "reports.thisQuarter": ["This quarter", "本季度", "本季度"],
  "reports.throughput": ["Task throughput", "任務完成量", "任务完成量"],
  "reports.throughputSub": ["Tasks created vs completed", "建立與完成的任務", "创建与完成的任务"],
  "reports.avgCompletion": ["Avg. completion", "平均完成時間", "平均完成时间"],
  "reports.sla": ["On-time rate", "準時完成率", "准时完成率"],
  "reports.channelMix": ["Channel mix", "頻道分佈", "频道分布"],
  "reports.volumeTrend": ["Conversation volume", "對話量趨勢", "对话量趋势"],
  "reports.teamWorkload": ["Team workload", "團隊工作量", "团队工作量"],
  "reports.clientHealth": ["Client health", "客戶健康度", "客户健康度"],
  "reports.onTime": ["On time", "準時", "准时"],
  "reports.overdue": ["Overdue", "逾期", "逾期"],
  "reports.completed": ["Completed", "已完成", "已完成"],
  "reports.tasksClosed": ["Tasks closed", "已完成任務", "已完成任务"],
  "reports.hoursSaved": ["Hours saved by AI", "AI 節省工時", "AI 节省工时"],
  "reports.responseTime": ["Avg. first response", "平均首次回覆", "平均首次回复"],
  "reports.aiHandled": ["AI-handled requests", "AI 處理請求", "AI 处理请求"],
  "reports.export": ["Export report", "匯出報告", "导出报告"],
  "reports.note": [
    "Figures are illustrative and generated from the demo dataset.",
    "數據僅供示範，並由演示資料集生成。",
    "数据仅供示范，并由演示数据集生成。",
  ],
  "reports.week": ["Week", "週", "周"],
  "reports.month": ["Month", "月", "月"],
  "reports.value": ["Value", "數值", "数值"],
  "reports.workloadHint": [
    "Open tasks weighted by priority",
    "按優先級加權的待辦任務",
    "按优先级加权的待办任务",
  ],
  "reports.capacity": ["Capacity", "容量", "容量"],
  "reports.utilization": ["Utilisation", "使用率", "使用率"],
  "reports.assigned": ["Assigned", "已分配", "已分配"],
  "reports.available": ["Available", "可承接", "可承接"],
  "reports.overCapacity": ["Over capacity", "超出負荷", "超出负荷"],
  "reports.teamPerformance": ["Team performance", "團隊表現", "团队表现"],
  "reports.completionRate": ["Completion rate", "完成率", "完成率"],
  "reports.tasksDone": ["Tasks done", "完成任務", "完成任务"],
  "reports.totalOpen": ["Total open", "總待辦", "总待办"],
  "reports.thisWeek": ["This week", "本週", "本周"],
  "reports.vsLast": ["vs last period", "與上期比較", "与上期比较"],
  "reports.minutes": ["min", "分鐘", "分钟"],
  "reports.hours": ["hrs", "小時", "小时"],
  "reports.monthlyVolume": ["Monthly volume", "每月對話量", "每月对话量"],
  "reports.departmentLoad": ["Department load", "部門工作量", "部门工作量"],
  "reports.allClients": ["All clients", "所有客戶", "所有客户"],
  "reports.healthy": ["Healthy", "健康", "健康"],
  "reports.watch": ["Watch", "留意", "留意"],
  "reports.highRisk": ["High risk", "高風險", "高风险"],
  "reports.noData": ["No data for this period.", "此期間沒有資料。", "此期间没有数据。"],
  "reports.totalTasks": ["Total tasks", "任務總數", "任务总数"],
  "reports.openNow": ["Open now", "目前待辦", "目前待办"],
  "reports.avgAge": ["Avg. task age", "平均任務帳齡", "平均任务账龄"],
  "reports.days": ["days", "天", "天"],
  "reports.exported": ["Report exported", "報告已匯出", "报告已导出"],

  "team.title": ["Team", "團隊", "团队"],
  "team.subtitle": [
    "Who is carrying what, and where the capacity is.",
    "誰負責什麼，以及團隊還有多少空間。",
    "谁负责什么，以及团队还有多少空间。",
  ],
  "team.searchPlaceholder": ["Search team members…", "搜尋團隊成員…", "搜索团队成员…"],
  "team.members": ["{count} members", "{count} 位成員", "{count} 位成员"],
  "team.workload": ["Workload", "工作量", "工作量"],
  "team.openTasks": ["Open tasks", "待辦任務", "待办任务"],
  "team.capacity": ["Capacity", "工作量上限", "工作量上限"],
  "team.utilization": ["Utilisation", "使用率", "使用率"],
  "team.languages": ["Languages", "語言", "语言"],
  "team.email": ["Email", "電郵", "邮箱"],
  "team.phone": ["Phone", "電話", "电话"],
  "team.viewTasks": ["View tasks", "查看任務", "查看任务"],
  "team.available": ["Available", "可承接", "可承接"],
  "team.busy": ["Busy", "繁忙", "繁忙"],
  "team.overCapacity": ["Over capacity", "超出負荷", "超出负荷"],
  "team.teamLead": ["Team lead", "團隊主管", "团队主管"],
  "team.partner": ["Partner", "合夥人", "合伙人"],
  "team.associate": ["Associate", "專員", "专员"],
  "team.assistant": ["Assistant", "助理", "助理"],
  "team.allRoles": ["All roles", "所有角色", "所有角色"],
  "team.filterRole": ["Filter by role", "按角色篩選", "按角色筛选"],
  "team.capacityHint": [
    "Based on open tasks, priority and due dates.",
    "根據待辦任務、優先級與截止日期估算。",
    "根据待办任务、优先级与截止日期估算。",
  ],
  "team.workloadDistribution": ["Workload distribution", "工作量分佈", "工作量分布"],
  "team.thisWeek": ["This week", "本週", "本周"],
  "team.contact": ["Contact", "聯絡", "联系"],
  "team.location": ["Location", "地點", "地点"],
  "team.hongKong": ["Hong Kong", "香港", "香港"],
  "team.shenzhen": ["Shenzhen", "深圳", "深圳"],
  "team.role": ["Role", "角色", "角色"],
  "team.noMembers": ["No team members match this search.", "沒有符合搜尋的團隊成員。", "没有符合搜索的团队成员。"],
  "team.openTaskList": ["Open tasks", "待辦任務", "待办任务"],
  "team.noOpenTasks": ["No open tasks assigned.", "沒有指派的待辦任務。", "没有指派的待办任务。"],
  "team.languageCantonese": ["Cantonese", "廣東話", "粤语"],
  "team.languageEnglish": ["English", "英語", "英语"],
  "team.languageMandarin": ["Mandarin", "普通話", "普通话"],
  "team.utilisationHint": [
    "Weighted open tasks against weekly capacity.",
    "按每週容量計算加權待辦任務。",
    "按每周容量计算加权待办任务。",
  ],
  "team.memberProfile": ["Team member", "團隊成員", "团队成员"],
  "team.assignedTasks": ["Assigned tasks", "已指派任務", "已指派任务"],

  "settings.title": ["Settings", "設定", "设置"],
  "settings.subtitle": [
    "Personalise the demo workspace and manage its data.",
    "個人化演示工作台並管理資料。",
    "个性化演示工作台并管理数据。",
  ],
  "settings.profile": ["Profile", "個人資料", "个人资料"],
  "settings.profileHint": [
    "How you appear in the demo workspace.",
    "你在演示工作台中的顯示方式。",
    "你在演示工作台中的显示方式。",
  ],
  "settings.displayName": ["Display name", "顯示名稱", "显示名称"],
  "settings.email": ["Email", "電郵", "邮箱"],
  "settings.role": ["Role", "角色", "角色"],
  "settings.language": ["Language", "語言", "语言"],
  "settings.languageHint": [
    "Switch the interface language at any time.",
    "隨時切換介面語言。",
    "随时切换界面语言。",
  ],
  "settings.notifications": ["Notifications", "通知", "通知"],
  "settings.notificationsHint": [
    "Choose which demo alerts you would like to see.",
    "選擇你想看到的演示提示。",
    "选择你想看到的演示提醒。",
  ],
  "settings.dailyBrief": ["AI daily brief", "AI 每日簡報", "AI 每日简报"],
  "settings.dailyBriefHint": [
    "A morning summary of client activity and open items.",
    "每早摘要客戶動態與待辦事項。",
    "每早摘要客户动态与待办事项。",
  ],
  "settings.taskReminders": ["Task reminders", "任務提醒", "任务提醒"],
  "settings.taskRemindersHint": [
    "Alerts for tasks that are due or overdue.",
    "到期或逾期任務的提示。",
    "到期或逾期任务的提醒。",
  ],
  "settings.weeklyReport": ["Weekly report", "每週報告", "每周报告"],
  "settings.weeklyReportHint": [
    "A Monday digest of workload and client health.",
    "每週一的工作量與客戶健康度摘要。",
    "每周一的工作量与客户健康度摘要。",
  ],
  "settings.channelAlerts": ["Channel alerts", "頻道提示", "频道提醒"],
  "settings.channelAlertsHint": [
    "New unread WhatsApp or WeChat conversations.",
    "新的未讀 WhatsApp 或微信對話。",
    "新的未读 WhatsApp 或微信对话。",
  ],
  "settings.demoData": ["Demo data", "演示資料", "演示数据"],
  "settings.demoDataHint": [
    "All changes are stored in this browser only.",
    "所有變更僅儲存在此瀏覽器。",
    "所有更改仅存储在此浏览器。",
  ],
  "settings.resetDemo": ["Reset demo data", "重設演示資料", "重置演示数据"],
  "settings.resetDemoHint": [
    "Restore the original fictional dataset and sign-in state.",
    "還原原始虛構資料與登入狀態。",
    "还原原始虚构数据与登录状态。",
  ],
  "settings.resetConfirm": [
    "Reset all demo data? Your local changes will be lost.",
    "重設所有演示資料？本機變更將會遺失。",
    "重置所有演示数据？本地更改将会丢失。",
  ],
  "settings.resetDone": ["Demo data reset", "演示資料已重設", "演示数据已重置"],
  "settings.exportData": ["Export demo data", "匯出演示資料", "导出演示数据"],
  "settings.exportHint": [
    "Download the current workspace as JSON.",
    "以 JSON 下載目前工作台資料。",
    "以 JSON 下载当前工作台数据。",
  ],
  "settings.exportDone": ["Export downloaded", "已下載匯出檔案", "已下载导出文件"],
  "settings.about": ["About this demo", "關於本演示", "关于本演示"],
  "settings.aboutHint": [
    "A static UI demo built for the Enwahs team.",
    "為 Enwahs 團隊建立的靜態介面演示。",
    "为 Enwahs 团队构建的静态界面演示。",
  ],
  "settings.version": ["Version", "版本", "版本"],
  "settings.builtFor": ["Built for", "建立對象", "构建对象"],
  "settings.builtForValue": [
    "Enwahs Accounting & Taxation Limited",
    "安華司會計稅務有限公司",
    "安华司会计税务有限公司",
  ],
  "settings.disclaimer": ["Disclaimer", "聲明", "声明"],
  "settings.disclaimerText": [
    "This demo uses fictional client data. WhatsApp and WeChat are simulated for interface preview only; no real accounts are connected and no messages are sent or received.",
    "本演示使用虛構客戶資料。WhatsApp 與微信僅為介面預覽而模擬，並未連接任何真實帳戶，亦不會收發訊息。",
    "本演示使用虚构客户数据。WhatsApp 与微信仅为界面预览而模拟，并未连接任何真实账户，也不会收发消息。",
  ],
  "settings.signOut": ["Sign out of demo", "登出演示", "退出演示"],
  "settings.saved": ["Settings saved", "設定已儲存", "设置已保存"],
  "settings.signedInAs": ["Signed in as", "目前登入", "当前登录"],
  "settings.appearance": ["Appearance", "外觀", "外观"],
  "settings.appearanceHint": [
    "The demo uses the Enwahs light brand theme.",
    "本演示採用 Enwahs 淺色品牌主題。",
    "本演示采用 Enwahs 浅色品牌主题。",
  ],
  "settings.lightTheme": ["Light brand theme", "淺色品牌主題", "浅色品牌主题"],
  "settings.dataStored": ["Stored locally", "儲存於本機", "存储于本地"],
  "settings.dataAsOf": ["Demo data as of", "演示資料截至", "演示数据截至"],
  "settings.workspace": ["Workspace", "工作台", "工作台"],
  "settings.demoControls": ["Demo controls", "演示控制", "演示控制"],

  "command.title": ["Quick search", "快速搜尋", "快速搜索"],
  "command.placeholder": [
    "Search pages, companies and tasks…",
    "搜尋頁面、公司與任務…",
    "搜索页面、公司与任务…",
  ],
  "command.pages": ["Pages", "頁面", "页面"],
  "command.companies": ["Companies", "公司", "公司"],
  "command.tasks": ["Tasks", "任務", "任务"],
  "command.noResults": [
    "No matches. Try a company or task name.",
    "沒有符合結果。試試公司或任務名稱。",
    "没有匹配结果。试试公司或任务名称。",
  ],
  "command.hint": [
    "Use ↑ ↓ to navigate, Enter to open, Esc to close.",
    "使用 ↑ ↓ 導覽，Enter 開啟，Esc 關閉。",
    "使用 ↑ ↓ 导航，Enter 打开，Esc 关闭。",
  ],
  "command.open": ["Open", "開啟", "打开"],

  "notFound.title": ["Page not found", "找不到頁面", "找不到页面"],
  "notFound.subtitle": [
    "The page you're looking for doesn't exist in this demo.",
    "此演示中沒有你要找的頁面。",
    "此演示中没有你要找的页面。",
  ],
  "notFound.back": ["Back to workspace", "返回工作台", "返回工作台"],
  "notFound.login": ["Back to sign in", "返回登入", "返回登录"],

  "footer.demo": ["Demo build", "演示版本", "演示版本"],
  "footer.fictional": ["Fictional data for demonstration only.", "僅供演示的虛構資料。", "仅供演示的虚构数据。"],
  "footer.asOf": ["Data as of {date}", "資料截至 {date}", "数据截至 {date}"],
  "footer.builtBy": ["Built by Wankun System", "由 Wankun System 建立", "由 Wankun System 构建"],

  "toast.taskCreated": ["Task created", "任務已建立", "任务已创建"],
  "toast.taskUpdated": ["Task updated", "任務已更新", "任务已更新"],
  "toast.taskDeleted": ["Task deleted", "任務已刪除", "任务已删除"],
  "toast.companyAdded": ["Company added", "公司已新增", "公司已添加"],
  "toast.companyUpdated": ["Company updated", "公司已更新", "公司已更新"],
  "toast.companyDeleted": ["Company deleted", "公司已刪除", "公司已删除"],
  "toast.noteAdded": ["Note added", "備註已新增", "备注已添加"],
  "toast.settingsSaved": ["Settings saved", "設定已儲存", "设置已保存"],
  "toast.dataReset": ["Demo data reset", "演示資料已重設", "演示数据已重置"],
  "toast.exported": ["Export downloaded", "已下載匯出檔案", "已下载导出文件"],
  "toast.taskFromMessage": ["Task created from conversation", "已從對話建立任務", "已从对话创建任务"],
  "toast.hint": ["Demo only — changes stay in your browser.", "僅供演示 — 變更只保留在你的瀏覽器。", "仅供演示 — 更改只保留在你的浏览器。"],
} satisfies Record<string, [string, string, string]>;

export type TranslationKey = keyof typeof strings;

const languageIndex: Record<Language, 0 | 1 | 2> = {
  en: 0,
  "zh-Hant": 1,
  "zh-Hans": 2,
};

const locales: Record<Language, string> = {
  en: "en-HK",
  "zh-Hant": "zh-HK",
  "zh-Hans": "zh-CN",
};

export const LANGUAGE_OPTIONS: { code: Language; short: string; label: string }[] = [
  { code: "zh-Hant", short: "繁", label: "繁體中文" },
  { code: "zh-Hans", short: "简", label: "简体中文" },
  { code: "en", short: "EN", label: "English" },
];

export function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "zh-Hant" || value === "zh-Hans";
}

export function pick(localized: Localized, lang: Language): string {
  if (lang === "en") return localized.en;
  if (lang === "zh-Hant") return localized.zhHant;
  return localized.zhHans;
}

function parseDate(value: string): Date {
  return new Date(value.length === 10 ? `${value}T12:00:00+08:00` : value);
}

function daysBetween(from: string, to: string): number {
  const a = parseDate(from);
  const b = parseDate(to);
  const aDay = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bDay = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bDay - aDay) / 86_400_000);
}

type Interpolations = Record<string, string | number>;

type I18nValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Interpolations) => string;
  pick: (localized: Localized) => string;
  locale: string;
  formatDate: (
    value: string,
    style?: "short" | "medium" | "long" | "month" | "time" | "datetime",
  ) => string;
  formatNumber: (value: number) => string;
  dueLabel: (due: string, done?: boolean) => string;
  daysFromToday: (date: string) => number;
  dateLocale: string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("zh-Hant");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEYS.language);
      if (isLanguage(stored)) setLangState(stored);
    } catch {
      // localStorage may be unavailable in private contexts; default is fine.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.language, next);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const t = (key: TranslationKey, vars?: Interpolations) => {
      const row = strings[key];
      let text = row[languageIndex[lang]] || row[0] || key;
      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          text = text.split(`{${name}}`).join(String(replacement));
        }
      }
      return text;
    };

    const formatDate = (
      value: string,
      style: "short" | "medium" | "long" | "month" | "time" | "datetime" = "short",
    ) => {
      const date = parseDate(value);
      if (Number.isNaN(date.getTime())) return value;
      const options: Intl.DateTimeFormatOptions =
        style === "short"
          ? { day: "numeric", month: "short", timeZone: DEMO_TIMEZONE }
          : style === "medium"
            ? { day: "numeric", month: "short", year: "numeric", timeZone: DEMO_TIMEZONE }
            : style === "long"
              ? {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  timeZone: DEMO_TIMEZONE,
                }
              : style === "month"
                ? { month: "short", year: "numeric", timeZone: DEMO_TIMEZONE }
                : style === "time"
                  ? {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: DEMO_TIMEZONE,
                    }
                  : {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: DEMO_TIMEZONE,
                    };
      return new Intl.DateTimeFormat(locales[lang], options).format(date);
    };

    const dueLabel = (due: string, done = false) => {
      if (done) return formatDate(due, "short");
      const diff = daysBetween(DEMO_TODAY, due);
      if (diff < 0) return t("common.overdueByDays", { days: Math.abs(diff) });
      if (diff === 0) return t("common.dueToday");
      if (diff === 1) return t("common.tomorrow");
      if (diff <= 7) return t("common.dueInDays", { days: diff });
      return t("common.dueOn", { date: formatDate(due, "short") });
    };

    return {
      lang,
      setLang,
      t,
      pick: (localized: Localized) => pick(localized, lang),
      locale: locales[lang],
      dateLocale: locales[lang],
      formatDate,
      formatNumber: (value: number) => new Intl.NumberFormat(locales[lang]).format(value),
      dueLabel,
      daysFromToday: (date: string) => daysBetween(DEMO_TODAY, date),
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
