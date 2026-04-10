// ═══════════════════════════════════════
//  Internationalization (i18n) Module
//  English / Chinese bilingual support
// ═══════════════════════════════════════

const I18N = {
  // ── Language strings ──
  zh: {
    // Toolbar
    appTitle: 'Yogurt to List',
    appTitleSub: 'Agent',
    aiDecompose: 'AI 拆解',
    aiDecomposeTooltip: 'AI 拆解任务',
    aiChatTooltip: '问问 AI',
    settingsTooltip: '设置',
    langSwitch: 'EN',

    // Header
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    dateFmt: (y, m, d, w) => `${y}年${m}月${d}日 · 周${w}`,
    greetings: {
      morning: ['新的一天', '今天也可以慢慢来', '早上好', '又是新的一天'],
      afternoon: ['下午好', '继续加油', '午后的节奏', '不急不躁'],
      evening: ['辛苦了', '该收尾了', '差不多了', '今天也还行']
    },
    timeHints: {
      morning: '早上好，适合做点有创造力的事',
      afternoon: '下午了，来点执行力强的活',
      evening: '晚上了，收收尾，或者早点歇'
    },

    // Tags & Filters
    tagCreative: '创造力',
    tagExecution: '执行力',
    tagClosing: '收尾',
    filterAll: '全部',
    timeMatch: '适合现在做',

    // Input
    inputPlaceholder: '写点要做的事，然后按回车',
    emptyState: '暂时没有待办<br>先去泡杯茶吧',

    // Task
    addStep: '+ 加步骤',
    stepPlaceholder: '写个步骤，回车添加',
    stepCancel: '取消',
    taskTimeFmt: (h, m) => `${h}:${m} 加的`,
    selectedCount: (n) => `已选 ${n} 项`,

    // Encouragement
    encourageLevels: [
      { max: 0, texts: ['新的一天，慢慢来'] },
      { max: 3, texts: ['已经开始了', '不错的开头', '动起来就好'] },
      { max: 6, texts: ['今天状态不错', '节奏很好', '继续这个感觉'] },
      { max: Infinity, texts: ['搞定，收工', '今天太强了', '可以了，歇会吧'] }
    ],
    celebrations: ['搞定 ✓', '不错嘛', '又少一件', '继续～', '稳', '舒服', '干得漂亮'],

    // Footer
    weekCompleted: '本周已完成',
    weekCountUnit: '件',
    exportData: '导出数据',
    importData: '导入数据',
    dailyReviewBtn: '📊 今日复盘',

    // Daily Review Card
    dailyReviewTitle: '今日小结',

    // AI Sidebar
    aiAssistantTitle: 'AI 助手',
    aiWelcome: '你好，有什么可以帮你的吗？可以问我关于任务安排、时间管理，或者随便聊聊。',
    quickActionsLabel: '试试这些：',
    quickActions: ['帮我排优先级', '怎么拆解这个任务', '今天做得怎么样', '给我一些鼓励', '分析我的任务量'],
    aiInputPlaceholder: '随便问问…',
    aiThinking: '想想…',
    copyBtn: '复制',
    regenerateBtn: '重新生成',
    helpfulBtn: '有帮助',
    aiNotConfigured: '还没配置 AI 呢，点右上角的 ⚙ 设置一下。',
    aiErrorPrefix: '出了点问题：',

    // Decompose Panel
    decomposeTitle: 'AI 拆解',
    decomposeIdle: '在输入框中写下你想拆解的任务，<br>然后点击「AI 拆解」按钮',
    decomposeLoading: 'AI 正在思考…',
    decomposeOriginal: '原始任务',
    decomposeResultLabel: '✨ AI 建议拆成以下步骤：',
    decomposeAccept: '✓ 全部采纳',
    decomposeRegenerate: '🔄 重新生成',
    decomposeAccepted: (name, n) => `已把「${name}」拆成 ${n} 个步骤，冲！`,
    decomposeFailed: '拆解失败了：',

    // Review Panel
    reviewTitle: '📊 今日复盘',
    reviewDone: '今日完成',
    reviewRemaining: '未完成',
    reviewSummary: '🌟 AI 总结',
    reviewSuggestion: '💡 明日建议',
    reviewClose: '关闭',
    reviewGenerating: '正在生成…',
    reviewFailedPrefix: '复盘生成失败：',
    reviewDefaultSummary: '今天还算充实',
    reviewDefaultSuggestion: '明天继续加油',

    // Settings
    settingsTitle: '⚙ 设置',
    aiModelConfig: '🤖 AI 模型配置',
    vendorLabel: 'AI 服务商',
    vendorPlaceholder: '请选择…',
    modelLabel: '模型',
    modelPlaceholder: '请先选择服务商',
    modelDesc: '根据服务商的不同，可选模型会自动更新',
    apiKeyLabel: 'API Key',
    apiKeyPlaceholder: 'sk-…',
    apiKeyDesc: '你的 API Key 仅存储在本地，不会上传',
    testConnection: '🔌 测试连接',
    testing: '连接中…',
    testingStatus: '正在测试连接…',
    testSuccess: '连接成功',
    testFailed: '连接失败',
    latencyInfo: (name, model, ms) => `<strong>${name}</strong> · ${model}<br>延迟 <strong>${ms}ms</strong>，API Key 有效`,
    aiFeatureToggles: '📋 AI 功能开关',
    toggleDecompose: '智能任务拆解',
    toggleChat: 'AI 对话助手',
    toggleReview: '每日智能复盘',
    togglePriority: '智能优先级排序',
    reviewSettings: '⏰ 复盘设置',
    reviewTimeLabel: '每日复盘时间',
    resetSettings: '恢复默认',
    saveSettings: '保存设置',
    confirmReset: '确定要恢复默认设置吗？',
    settingsSaved: '设置已保存',
    selectVendor: '请选择一个 AI 服务商',
    selectModel: '请选择模型',
    enterApiKey: '请输入 API Key',
    selectVendorFirst: '先选一个服务商',
    enterApiKeyFirst: '先填 API Key',

    // Import/Export
    importFailed: '格式不对，换个文件试试',
    importReadFailed: '读取失败，文件可能损坏了',
    exportFilename: (y, m, d) => `YogurtToList_${y}${m}${d}.json`,

    // Misc
    me: '我',
    vendorRequired: '请先在设置中配置 AI 厂商和 API Key',
    dailyReviewInlineNotConfigured: '还没配置 AI，点右上角 ⚙ 设置一下。',
    dailyReviewInlineFailed: '生成失败：',
    dailyReviewInlineGenerating: '正在生成…',

    // Agent features
    agentNewChat: '🔄 新对话',
    agentAutoPlan: '📋 今日规划',
    agentPlanTitle: 'Agent 今日规划',
    agentPlanEmpty: 'Agent 还没有规划建议',
    agentPlanApply: '采纳',
    agentPlanApplied: '已采纳',
    agentPlanApplyAll: '全部采纳',
    agentPlanThinking: 'Agent 正在分析你的任务…',
    agentMemoryOn: '记忆开启',
    agentMemoryCount: (n) => `已记住 ${n} 条对话`,
    agentToolExecuted: (tool, msg) => `${tool}: ${msg}`,
    agentWelcome: '我是你的 AI Agent，可以帮你管理待办、规划日程。试试说"帮我规划今天"或者直接让我帮你添加任务。',
    quickAgent: ['帮我规划今天', '添加一个任务：下午开会准备', '今天还剩什么没做', '分析我的任务量', '清理已完成的任务'],

    // History
    historyTitle: '历史记录',
    historyEmpty: '暂无记录，完成一些任务后这里会出现记录',
    historyTaskAdded: '添加了任务',
    historyTaskCompleted: '完成了任务',
    historyTaskDeleted: '删除了任务',
    historyClear: '清空记录',

    // History Visualization
    historyVizTitle: '完成记录',
    historyVizDone: '已完成',
    historyVizAdded: '已添加',
    historyVizNone: '无记录',
    historyArchiveTitle: '按日期浏览',
    historyArchiveSummary: (done, added) => `共完成 ${done} 项 · 添加 ${added} 项`,

    // Recent completed
    recentCompletedTitle: '最近完成',
    recentCompletedEmpty: '完成任务后会出现在这里',
    historyToday: '今天',
    historyYesterday: '昨天',

    // Dashboard
    dashboardTitle: '数据面板',
    dashboardToday: '今日',
    dashboardCompleted: '完成',
    dashboardCreated: '新增',
    dashboardRate: '完成率',
    dashboardWeek: '本周完成',
    dashboardStreak: '连续天数',
    dashboardDay: '连续',
    dashboardTrend: '近 7 天趋势',
    dashboardTimeDist: '时段分布',
    dashboardTagDist: '标签分布',
    dashboardAvgDay: '日均完成',
    dashboardTotal: '累计完成',
    dashboardMorning: '上午',
    dashboardAfternoon: '下午',
    dashboardEvening: '晚上',
    dashboardDays: ['日', '一', '二', '三', '四', '五', '六'],
  },

  en: {
    // Toolbar
    appTitle: 'Yogurt to List',
    appTitleSub: 'Agent',
    aiDecompose: 'AI Decompose',
    aiDecomposeTooltip: 'AI Decompose Task',
    aiChatTooltip: 'Ask AI',
    settingsTooltip: 'Settings',
    langSwitch: '中文',

    // Header
    weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dateFmt: (y, m, d, w) => `${w}, ${m}/${d}/${y}`,
    greetings: {
      morning: ['New day', 'Take it easy today', 'Good morning', 'Fresh start'],
      afternoon: ['Good afternoon', 'Keep going', 'Afternoon rhythm', 'No rush'],
      evening: ['Good work today', 'Time to wrap up', 'Almost there', 'Not bad']
    },
    timeHints: {
      morning: 'Morning — great for creative work',
      afternoon: 'Afternoon — time for execution',
      evening: 'Evening — wrap things up, or rest'
    },

    // Tags & Filters
    tagCreative: 'Creative',
    tagExecution: 'Execution',
    tagClosing: 'Wrap-up',
    filterAll: 'All',
    timeMatch: 'Good for now',

    // Input
    inputPlaceholder: 'Write something to do, then press Enter',
    emptyState: 'Nothing here yet<br>Go make some tea',

    // Task
    addStep: '+ Add step',
    stepPlaceholder: 'Write a step, press Enter',
    stepCancel: 'Cancel',
    taskTimeFmt: (h, m) => `${h}:${m}`,
    selectedCount: (n) => `${n} selected`,

    // Encouragement
    encourageLevels: [
      { max: 0, texts: ['New day, take it easy'] },
      { max: 3, texts: ['You\'ve started', 'Nice beginning', 'Just getting going'] },
      { max: 6, texts: ['Good momentum', 'Great rhythm', 'Keep this feeling'] },
      { max: Infinity, texts: ['All done', 'Killed it today', 'Take a break'] }
    ],
    celebrations: ['Done ✓', 'Nice', 'One less', 'Keep going~', 'Solid', 'Smooth', 'Well done'],

    // Footer
    weekCompleted: 'Completed this week',
    weekCountUnit: '',
    exportData: 'Export',
    importData: 'Import',
    dailyReviewBtn: '📊 Daily Review',

    // Daily Review Card
    dailyReviewTitle: 'Today\'s Summary',

    // AI Sidebar
    aiAssistantTitle: 'AI Assistant',
    aiWelcome: 'Hi there! Ask me about task planning, time management, or just chat.',
    quickActionsLabel: 'Try these:',
    quickActions: ['Prioritize for me', 'Break down this task', 'How\'s my day going', 'Give me some encouragement', 'Analyze my workload'],
    aiInputPlaceholder: 'Ask anything…',
    aiThinking: 'Thinking…',
    copyBtn: 'Copy',
    regenerateBtn: 'Regenerate',
    helpfulBtn: 'Helpful',
    aiNotConfigured: 'AI not configured yet. Click ⚙ in the toolbar to set it up.',
    aiErrorPrefix: 'Something went wrong: ',

    // Decompose Panel
    decomposeTitle: 'AI Decompose',
    decomposeIdle: 'Write a task in the input field,<br>then click "AI Decompose"',
    decomposeLoading: 'AI is thinking…',
    decomposeOriginal: 'Original Task',
    decomposeResultLabel: '✨ AI suggests breaking it into:',
    decomposeAccept: '✓ Accept All',
    decomposeRegenerate: '🔄 Regenerate',
    decomposeAccepted: (name, n) => `Broke "${name}" into ${n} steps. Let\'s go!`,
    decomposeFailed: 'Decompose failed: ',

    // Review Panel
    reviewTitle: '📊 Daily Review',
    reviewDone: 'Completed',
    reviewRemaining: 'Remaining',
    reviewSummary: '🌟 AI Summary',
    reviewSuggestion: '💡 Suggestions for Tomorrow',
    reviewClose: 'Close',
    reviewGenerating: 'Generating…',
    reviewFailedPrefix: 'Review failed: ',
    reviewDefaultSummary: 'A productive day',
    reviewDefaultSuggestion: 'Keep it up tomorrow',

    // Settings
    settingsTitle: '⚙ Settings',
    aiModelConfig: '🤖 AI Model Configuration',
    vendorLabel: 'AI Provider',
    vendorPlaceholder: 'Select…',
    modelLabel: 'Model',
    modelPlaceholder: 'Select a provider first',
    modelDesc: 'Available models update automatically based on the provider',
    apiKeyLabel: 'API Key',
    apiKeyPlaceholder: 'sk-…',
    apiKeyDesc: 'Your API Key is stored locally only, never uploaded',
    testConnection: '🔌 Test Connection',
    testing: 'Connecting…',
    testingStatus: 'Testing connection…',
    testSuccess: 'Connected',
    testFailed: 'Connection failed',
    latencyInfo: (name, model, ms) => `<strong>${name}</strong> · ${model}<br>Latency <strong>${ms}ms</strong>, API Key valid`,
    aiFeatureToggles: '📋 AI Feature Toggles',
    toggleDecompose: 'Smart Task Decompose',
    toggleChat: 'AI Chat Assistant',
    toggleReview: 'Daily Smart Review',
    togglePriority: 'Smart Priority Sort',
    reviewSettings: '⏰ Review Settings',
    reviewTimeLabel: 'Daily Review Time',
    resetSettings: 'Reset',
    saveSettings: 'Save',
    confirmReset: 'Are you sure you want to reset all settings?',
    settingsSaved: 'Settings saved',
    selectVendor: 'Please select an AI provider',
    selectModel: 'Please select a model',
    enterApiKey: 'Please enter an API Key',
    selectVendorFirst: 'Select a provider first',
    enterApiKeyFirst: 'Enter API Key first',

    // Import/Export
    importFailed: 'Invalid format, try another file',
    importReadFailed: 'Read failed, file may be corrupted',
    exportFilename: (y, m, d) => `YogurtToList_${y}${m}${d}.json`,

    // Misc
    me: 'Me',
    vendorRequired: 'Please configure AI provider and API Key in settings first',
    dailyReviewInlineNotConfigured: 'AI not configured. Click ⚙ in the toolbar to set up.',
    dailyReviewInlineFailed: 'Failed: ',
    dailyReviewInlineGenerating: 'Generating…',

    // Agent features
    agentNewChat: '🔄 New Chat',
    agentAutoPlan: '📋 Plan Today',
    agentPlanTitle: 'Agent Daily Plan',
    agentPlanEmpty: 'No suggestions yet',
    agentPlanApply: 'Apply',
    agentPlanApplied: 'Applied',
    agentPlanApplyAll: 'Apply All',
    agentPlanThinking: 'Agent is analyzing your tasks…',
    agentMemoryOn: 'Memory on',
    agentMemoryCount: (n) => `${n} messages remembered`,
    agentToolExecuted: (tool, msg) => `${tool}: ${msg}`,
    agentWelcome: "I'm your AI Agent. I can manage tasks, plan your day, and more. Try saying \"plan my day\" or ask me to add tasks for you.",
    quickAgent: ['Plan my day', 'Add a task: meeting prep at 3pm', 'What\'s left today', 'Analyze my workload', 'Clean up completed tasks'],

    // History
    historyTitle: 'History',
    historyEmpty: 'No records yet. Complete some tasks to see history here.',
    historyTaskAdded: 'Added task',
    historyTaskCompleted: 'Completed task',
    historyTaskDeleted: 'Deleted task',
    historyClear: 'Clear history',

    // History Visualization
    historyVizTitle: 'Completion Record',
    historyVizDone: 'Completed',
    historyVizAdded: 'Added',
    historyVizNone: 'No data',
    historyArchiveTitle: 'Browse by Date',
    historyArchiveSummary: (done, added) => `${done} completed · ${added} added`,

    // Recent completed
    recentCompletedTitle: 'Recently Done',
    recentCompletedEmpty: 'Completed tasks will appear here',
    historyToday: 'Today',
    historyYesterday: 'Yesterday',

    // Dashboard
    dashboardTitle: 'Dashboard',
    dashboardToday: 'Today',
    dashboardCompleted: 'Done',
    dashboardCreated: 'New',
    dashboardRate: 'Rate',
    dashboardWeek: 'This week',
    dashboardStreak: 'Streak',
    dashboardDay: 'days',
    dashboardTrend: '7-Day Trend',
    dashboardTimeDist: 'Time Distribution',
    dashboardTagDist: 'Tag Distribution',
    dashboardAvgDay: 'Avg/day',
    dashboardTotal: 'Total done',
    dashboardMorning: 'Morning',
    dashboardAfternoon: 'Afternoon',
    dashboardEvening: 'Evening',
    dashboardDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  }
};

// ── Current language ──
let _lang = localStorage.getItem('yogurt_lang') || 'zh';

function getLang() { return _lang; }

function setLang(lang) {
  _lang = lang;
  localStorage.setItem('yogurt_lang', lang);
}

function t(key) {
  return I18N[_lang]?.[key] ?? I18N.zh?.[key] ?? key;
}

function toggleLang() {
  setLang(_lang === 'zh' ? 'en' : 'zh');
  return _lang;
}

// ── Apply i18n to DOM ──
function applyI18N() {
  // data-i18n: text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val && val !== key) el.innerHTML = val;
  });

  // data-i18n-placeholder: placeholder attr
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val && val !== key) el.placeholder = val;
  });

  // data-tooltip-i18n: tooltip text
  document.querySelectorAll('[data-tooltip-i18n]').forEach(el => {
    const key = el.getAttribute('data-tooltip-i18n');
    const val = t(key);
    if (val && val !== key) el.setAttribute('data-tooltip', val);
  });

  // data-i18n-title: title attr
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = t(key);
    if (val && val !== key) el.title = val;
  });

  // data-i18n-option: option text
  document.querySelectorAll('[data-i18n-option]').forEach(el => {
    const key = el.getAttribute('data-i18n-option');
    const val = t(key);
    if (val && val !== key) el.textContent = val;
  });

  // Language switch label
  const langLabel = document.getElementById('langSwitchLabel');
  if (langLabel) langLabel.textContent = t('langSwitch');

  // Set html lang
  document.documentElement.lang = _lang === 'zh' ? 'zh-CN' : 'en';
}
