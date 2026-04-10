// ═══════════════════════════════════════
//  Data layer · localStorage wrapper
//  Supports AI settings, feature toggles, review time, chat history, agent plans
// ═══════════════════════════════════════

const STORAGE_KEY = 'yogurt_todo_v2';
const SETTINGS_KEY = 'yogurt_settings_v2';
const CHAT_HISTORY_KEY = 'yogurt_chat_history';
const AGENT_PLANS_KEY = 'yogurt_agent_plans';
const HISTORY_KEY = 'yogurt_task_history';

// ── Task data ──

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { tasks: parsed.tasks || [], completed: parsed.completed || [] };
    }
  } catch {}
  // Migrate from V1
  try {
    const v1raw = localStorage.getItem('shouzhang_todo_v1');
    if (v1raw) {
      const v1 = JSON.parse(v1raw);
      const data = { tasks: v1.tasks || [], completed: v1.completed || [] };
      saveData(data);
      return data;
    }
  } catch {}
  return { tasks: [], completed: [] };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Chat history (multi-turn memory) ──

function loadChatHistory() {
  try {
    const raw = localStorage.getItem(CHAT_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveChatHistory(history) {
  // Keep last 50 messages to avoid storage bloat
  const trimmed = history.slice(-50);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
  return trimmed;
}

function clearChatHistory() {
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

// ── Agent plans (auto-planned task suggestions) ──

function loadAgentPlans() {
  try {
    const raw = localStorage.getItem(AGENT_PLANS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { plans: [], lastPlanDate: null };
}

function saveAgentPlans(plans) {
  localStorage.setItem(AGENT_PLANS_KEY, JSON.stringify(plans));
}

// ── AI settings (with feature toggles and review time) ──

const DEFAULT_SETTINGS = {
  vendor: '',
  model: '',
  apiKey: '',
  // Feature toggles
  features: {
    decompose: true,
    chat: true,
    review: true,
    priority: true,
    autoPlan: true  // NEW: auto daily planning
  },
  // Review settings
  reviewTime: '21:00',
  // NEW: Agent personality
  agentName: 'Agent'
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        features: { ...DEFAULT_SETTINGS.features, ...(parsed.features || {}) }
      };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS, features: { ...DEFAULT_SETTINGS.features } };
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ── Task history (for history log & dashboard) ──

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addHistoryEntry(entry) {
  const history = loadHistory();
  history.unshift(entry);
  // Keep last 200 entries to avoid storage bloat
  const trimmed = history.slice(0, 200);
  saveHistory(trimmed);
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

// ── Dashboard statistics ──

function getDashboardStats() {
  const history = loadHistory();
  const allCompleted = appData.completed;
  const allTasks = appData.tasks;

  // Today stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCompleted = allCompleted.filter(c => new Date(c.completedAt) >= todayStart);
  const todayCreated = allTasks.filter(tk => tk.createdAt && new Date(tk.createdAt) >= todayStart);
  const todayTotal = todayCompleted.length + todayCreated.length;
  const todayRate = todayTotal > 0 ? Math.round((todayCompleted.length / todayTotal) * 100) : 0;

  // Week stats
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekCompleted = allCompleted.filter(c => new Date(c.completedAt) >= weekStart);

  // Streak: consecutive days with at least 1 completion
  let streak = 0;
  const checkDate = new Date(todayStart);
  while (true) {
    const nextDay = new Date(checkDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const dayCompleted = allCompleted.filter(c => {
      const d = new Date(c.completedAt);
      return d >= checkDate && d < nextDay;
    });
    if (dayCompleted.length > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If checking today and nothing yet, skip to yesterday
      if (checkDate.getTime() === todayStart.getTime()) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  // 7-day trend (last 7 days)
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(todayStart);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const done = allCompleted.filter(c => {
      const d = new Date(c.completedAt);
      return d >= dayStart && d < dayEnd;
    }).length;
    trend.push(done);
  }

  // Time period distribution
  const periods = { morning: 0, afternoon: 0, evening: 0 };
  allCompleted.forEach(c => {
    const h = new Date(c.completedAt).getHours();
    if (h >= 6 && h < 12) periods.morning++;
    else if (h >= 12 && h < 18) periods.afternoon++;
    else periods.evening++;
  });

  // Tag distribution
  const tags = {};
  [...allCompleted, ...allTasks].forEach(item => {
    if (item.tag) {
      tags[item.tag] = (tags[item.tag] || 0) + 1;
    }
  });

  // Total all-time stats
  const totalCompleted = allCompleted.length;
  const avgPerDay = totalCompleted > 0
    ? (totalCompleted / Math.max(1, Math.ceil((Date.now() - new Date(allCompleted[0]?.completedAt || Date.now()).getTime()) / 86400000))).toFixed(1)
    : '0';

  return {
    today: { completed: todayCompleted.length, created: todayCreated.length, total: todayTotal, rate: todayRate },
    week: { completed: weekCompleted.length },
    streak,
    trend,
    periods,
    tags,
    totalCompleted,
    avgPerDay: parseFloat(avgPerDay)
  };
}

// ── History visualization data (Apple Health style) ──

function getHistoryVizData(daysBack = 28) {
  const history = loadHistory();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyStats = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const dayStart = new Date(today);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const dayEntries = history.filter(e => {
      const d = new Date(e.ts);
      return d >= dayStart && d < dayEnd;
    });

    const completed = dayEntries.filter(e => e.type === 'complete').length;
    const added = dayEntries.filter(e => e.type === 'add').length;
    const deleted = dayEntries.filter(e => e.type === 'delete').length;

    dailyStats.push({
      date: new Date(dayStart),
      completed,
      added,
      deleted,
      total: dayEntries.length
    });
  }

  // Weekly aggregation (last 4 weeks)
  const weeklyData = [];
  for (let w = 0; w < Math.ceil(daysBack / 7); w++) {
    const weekStart = w * 7;
    const weekSlice = dailyStats.slice(weekStart, weekStart + 7);
    if (weekSlice.length === 0) break;

    const weekCompleted = weekSlice.reduce((s, d) => s + d.completed, 0);
    const weekAdded = weekSlice.reduce((s, d) => s + d.added, 0);
    weeklyData.push({
      days: weekSlice,
      completed: weekCompleted,
      added: weekAdded,
      avgPerDay: (weekCompleted / weekSlice.length).toFixed(1)
    });
  }

  return { dailyStats, weeklyData, daysBack };
}

// ── Init ──
let appData = loadData();
let aiSettings = loadSettings();
let chatHistory = loadChatHistory();
let agentPlans = loadAgentPlans();
