// ═══════════════════════════════════════
//  AI Agent Core Module
//  Multi-turn memory · Auto planning · Tool calling · Prompt management
// ═══════════════════════════════════════

// ── Provider config ──

const AI_PROVIDERS = {
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat'
  },
  zhipu: {
    name: '智谱AI',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
    models: ['glm-4-flash', 'glm-5.1'],
    defaultModel: 'glm-5.1'
  },
  kimi: {
    name: 'Kimi',
    baseUrl: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'kimi-k2.5'],
    defaultModel: 'kimi-k2.5'
  },
  qwen: {
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    defaultModel: 'qwen-plus'
  },
  doubao: {
    name: '豆包',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    models: ['doubao-pro-32k', 'doubao-pro-128k'],
    defaultModel: 'doubao-pro-32k'
  }
};

// ── Tool definitions (what the Agent can do) ──

const AGENT_TOOLS = [
  {
    name: 'add_task',
    description: 'Add a new task to the user\'s todo list. Use this when the user wants to create a task or when you plan tasks for them.',
    parameters: { type: 'object', properties: { name: { type: 'string', description: 'Task name' }, tag: { type: 'string', enum: ['creative', 'execution', 'closing'], description: 'Task category (optional)' } }, required: ['name'] }
  },
  {
    name: 'get_tasks',
    description: 'Get the user\'s current task list (pending and completed today).',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'get_history',
    description: 'Get the user\'s task history log — all added, completed, and deleted tasks with timestamps. Use this when the user asks what they did before, their completion history, or past records.',
    parameters: { type: 'object', properties: { limit: { type: 'number', description: 'Max entries to return (default 20)' } } }
  },
  {
    name: 'get_completed_tasks',
    description: 'Get all completed tasks with their completion time. Supports filtering by day count (e.g. last 7 days).',
    parameters: { type: 'object', properties: { last_days: { type: 'number', description: 'Only return tasks completed in the last N days (default: all)' } } }
  },
  {
    name: 'complete_task',
    description: 'Mark a task as completed by its name (fuzzy match).',
    parameters: { type: 'object', properties: { name: { type: 'string', description: 'Task name (fuzzy match)' } }, required: ['name'] }
  },
  {
    name: 'delete_task',
    description: 'Delete a task by its name (fuzzy match).',
    parameters: { type: 'object', properties: { name: { type: 'string', description: 'Task name (fuzzy match)' } }, required: ['name'] }
  },
  {
    name: 'get_time',
    description: 'Get the current date, time, and time period (morning/afternoon/evening).',
    parameters: { type: 'object', properties: {} }
  }
];

// ── Prompt templates ──

function getSystemPrompt() {
  const lang = getLang();
  const taskList = appData.tasks.map(t => ({ name: t.name, tag: t.tag, steps: t.steps }));
  const now = new Date();
  const timeStr = `${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getDate().toString().padStart(2,'0')} ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;

  if (lang === 'zh') {
    return `你是「Yogurt to List」的 AI Agent，一个聪明、温暖的个人效率助手。

## 你的能力
- 记住用户说过的话（多轮对话记忆）
- 理解用户意图并主动规划任务
- 直接帮用户增删改待办事项（调用工具）
- 分析任务量并给出时间管理建议
- 根据时间段推荐合适的任务安排

## 当前上下文
- 当前时间：${timeStr}
- 待办任务：${JSON.stringify(taskList)}
- 今天已完成：${appData.completed.filter(c => new Date(c.completedAt) >= new Date(new Date().setHours(0,0,0,0))).map(c => c.name)}

## 工具
你可以调用以下工具来操作用户的待办列表：
- add_task: 添加新任务
- get_tasks: 查看当前任务列表
- get_history: 查看操作历史记录（添加/完成/删除）
- get_completed_tasks: 查看已完成任务（支持按天数筛选）
- complete_task: 标记任务完成
- delete_task: 删除任务
- get_time: 获取当前时间

当用户要求添加、删除、完成任务时，直接调用工具，不需要确认。
当用户说"帮我规划一下"、"今天做什么"时，根据时间段和任务情况主动给出建议，并用 add_task 工具直接创建任务。
当用户问"我之前做过什么"、"最近完成了什么"、"历史记录"时，调用 get_history 或 get_completed_tasks 来查看。

## 回复风格
- 像靠谱的朋友，简洁自然，不说废话
- 不用"赋能""极致""底层逻辑"这类词
- 保持简洁，每次回复不超过 150 字
- 执行完操作后简单确认即可`;
  }

  return `You are the AI Agent of "Yogurt to List", a smart personal productivity assistant.

## Your Capabilities
- Remember what the user says (multi-turn conversation memory)
- Understand user intent and proactively plan tasks
- Directly manage the user's todo list (call tools)
- Analyze workload and give time management advice
- Recommend task arrangements based on time of day

## Current Context
- Current time: ${timeStr}
- Pending tasks: ${JSON.stringify(taskList)}
- Completed today: ${appData.completed.filter(c => new Date(c.completedAt) >= new Date(new Date().setHours(0,0,0,0))).map(c => c.name)}

## Tools
You can call these tools to manage the user's todo list:
- add_task: Add a new task
- get_tasks: View current task list
- get_history: View operation history log (add/complete/delete)
- get_completed_tasks: View completed tasks (supports filtering by days)
- complete_task: Mark a task as completed
- delete_task: Delete a task
- get_time: Get current time

When the user asks to add, delete, or complete tasks, call the tool directly — no confirmation needed.
When the user says "plan my day" or "what should I do today", proactively suggest tasks based on time period and use add_task to create them.
When the user asks about their history, past completions, or what they've done before, call get_history or get_completed_tasks.

## Style
- Like a reliable friend, concise and natural
- Keep responses under 150 words
- Briefly confirm after executing actions`;
}

function getAutoPlanPrompt() {
  const lang = getLang();
  const pending = appData.tasks.map(t => t.name);
  const now = new Date();
  const h = now.getHours();
  const period = h >= 6 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : 'evening';

  if (lang === 'zh') {
    return `根据用户的当前待办和时间段，主动规划今日任务建议。

当前待办：${JSON.stringify(pending)}
当前时段：${period === 'morning' ? '早上（适合创造力工作）' : period === 'afternoon' ? '下午（适合执行力工作）' : '晚上（适合收尾）'}
时间：${h}:00

请以 JSON 格式返回建议：
{"suggestions": [{"text": "建议内容", "reason": "原因", "action": "add_task|none", "taskName": "如果是add_task则填写任务名"}]}

只返回 2-4 条建议，保持实用。不要返回其他内容。`;
  }

  return `Based on the user's current tasks and time period, suggest a daily plan.

Current tasks: ${JSON.stringify(pending)}
Time period: ${period === 'morning' ? 'Morning (creative work)' : period === 'afternoon' ? 'Afternoon (execution work)' : 'Evening (wrap-up)'}
Time: ${h}:00

Return suggestions as JSON:
{"suggestions": [{"text": "Suggestion text", "reason": "Reason", "action": "add_task|none", "taskName": "Task name if action is add_task"}]

Return 2-4 suggestions. Be practical. Return only JSON.`;
}

// ── Unified API call ──

async function callLLM(vendor, apiKey, model, messages, options = {}) {
  const config = AI_PROVIDERS[vendor];
  if (!config) throw new Error(`Unknown AI provider: ${vendor}`);

  const url = config.baseUrl + '/chat/completions';
  const useModel = model || config.defaultModel;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: useModel,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1024,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const status = response.status;
      if (status === 401) throw new Error('API Key invalid');
      if (status === 429) throw new Error('Rate limited, try again later');
      if (status >= 500) throw new Error('Service unavailable, try again later');
      throw new Error(`Request failed (${status})`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Request timeout (30s), check network');
    throw err;
  }
}

// ── AI response parser ──

function extractJSON(text) {
  try { return JSON.parse(text); } catch {}
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) { try { return JSON.parse(codeMatch[1].trim()); } catch {} }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) { try { return JSON.parse(text.slice(first, last + 1)); } catch {} }
  const firstArr = text.indexOf('[');
  const lastArr = text.lastIndexOf(']');
  if (firstArr !== -1 && lastArr !== -1 && lastArr > firstArr) { try { return JSON.parse(text.slice(firstArr, lastArr + 1)); } catch {} }
  return null;
}

// ── Tool execution ──

function executeTool(name, params) {
  switch (name) {
    case 'add_task':
      if (params.name) {
        addTask(params.name, params.tag || null);
        return { success: true, message: `Task "${params.name}" added` };
      }
      return { success: false, message: 'Missing task name' };

    case 'get_tasks':
      return {
        success: true,
        pending: appData.tasks.map(t => ({ name: t.name, tag: t.tag })),
        completedToday: appData.completed
          .filter(c => new Date(c.completedAt) >= new Date(new Date().setHours(0,0,0,0)))
          .map(c => c.name)
      };

    case 'get_history': {
      const history = loadHistory();
      const limit = params.limit || 20;
      const recent = history.slice(0, limit);
      const typeLabel = { add: '添加', complete: '完成', delete: '删除' };
      return {
        success: true,
        total: history.length,
        entries: recent.map(e => ({
          action: typeLabel[e.type] || e.type,
          name: e.name,
          tag: e.tag,
          time: e.ts
        }))
      };
    }

    case 'get_completed_tasks': {
      const days = params.last_days || 0;
      let completed = appData.completed;
      if (days > 0) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        cutoff.setHours(0, 0, 0, 0);
        completed = completed.filter(c => new Date(c.completedAt) >= cutoff);
      }
      return {
        success: true,
        total: completed.length,
        tasks: completed.map(c => ({
          name: c.name,
          tag: c.tag,
          completedAt: c.completedAt
        }))
      };
    }

    case 'complete_task':
      if (params.name) {
        const task = appData.tasks.find(t =>
          t.name.toLowerCase().includes(params.name.toLowerCase()) ||
          params.name.toLowerCase().includes(t.name.toLowerCase())
        );
        if (task) {
          completeTask(task.id);
          return { success: true, message: `Task "${task.name}" completed` };
        }
        return { success: false, message: `Task "${params.name}" not found` };
      }
      return { success: false, message: 'Missing task name' };

    case 'delete_task':
      if (params.name) {
        const task = appData.tasks.find(t =>
          t.name.toLowerCase().includes(params.name.toLowerCase()) ||
          params.name.toLowerCase().includes(t.name.toLowerCase())
        );
        if (task) {
          deleteTask(task.id);
          return { success: true, message: `Task "${task.name}" deleted` };
        }
        return { success: false, message: `Task "${params.name}" not found` };
      }
      return { success: false, message: 'Missing task name' };

    case 'get_time':
      const now = new Date();
      const h = now.getHours();
      return {
        success: true,
        datetime: now.toISOString(),
        hour: h,
        period: h >= 6 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : 'evening'
      };

    default:
      return { success: false, message: `Unknown tool: ${name}` };
  }
}

// ── Tool call detection & execution ──

async function processAgentResponse(content) {
  // Check if the response contains a tool call in the format: [TOOL:tool_name:{"param":"value"}]
  const toolCallRegex = /\[TOOL:(\w+):(\{[^]]*?\})\]/g;
  let match;
  const toolResults = [];
  let cleanedContent = content;

  while ((match = toolCallRegex.exec(content)) !== null) {
    const toolName = match[1];
    try {
      const params = JSON.parse(match[2]);
      const result = executeTool(toolName, params);
      toolResults.push({ tool: toolName, result });
    } catch (e) {
      toolResults.push({ tool: toolName, result: { success: false, message: e.message } });
    }
  }

  // Remove tool call markers from the response text
  cleanedContent = content.replace(toolCallRegex, '').trim();

  return { text: cleanedContent, toolResults };
}

// ═══════════════════════════════════════
//  Agent API (multi-turn memory)
// ═══════════════════════════════════════

/**
 * Agent chat with full memory context
 * Builds message history from chatHistory + current message
 */
async function agentChat(userMessage) {
  const { vendor, apiKey, model } = aiSettings;
  if (!vendor || !apiKey) throw new Error(t('vendorRequired'));

  // Build message history (last 20 turns for context window)
  const maxHistory = 20;
  const recentHistory = chatHistory.slice(-maxHistory);

  const messages = [
    { role: 'system', content: getSystemPrompt() },
    ...recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  const reply = await callLLM(vendor, apiKey, model, messages, { temperature: 0.8 });

  // Process any tool calls in the response
  const { text: cleanedReply, toolResults } = await processAgentResponse(reply);

  // Save to history
  chatHistory.push({ role: 'user', content: userMessage, ts: Date.now() });
  chatHistory.push({ role: 'assistant', content: cleanedReply, ts: Date.now(), toolResults: toolResults.length > 0 ? toolResults : undefined });
  chatHistory = saveChatHistory(chatHistory);

  return { reply: cleanedReply, toolResults };
}

/**
 * Clear conversation history
 */
function agentClearHistory() {
  chatHistory = [];
  clearChatHistory();
}

/**
 * Get chat history for rendering
 */
function agentGetHistory() {
  return chatHistory;
}

// ═══════════════════════════════════════
//  Auto Planning
// ═══════════════════════════════════════

/**
 * Agent auto-plans the day based on time, tasks, and history
 * Returns suggestions that can be auto-applied
 */
async function agentAutoPlan() {
  const { vendor, apiKey, model } = aiSettings;
  if (!vendor || !apiKey) throw new Error(t('vendorRequired'));

  const today = new Date().toDateString();
  // Only plan once per day
  if (agentPlans.lastPlanDate === today) {
    return agentPlans;
  }

  const messages = [
    { role: 'system', content: getSystemPrompt() },
    { role: 'user', content: getAutoPlanPrompt() }
  ];

  const result = await callLLM(vendor, apiKey, model, messages, { temperature: 0.6, maxTokens: 512 });
  const parsed = extractJSON(result);

  if (parsed && parsed.suggestions && Array.isArray(parsed.suggestions)) {
    agentPlans = {
      plans: parsed.suggestions.map((s, i) => ({
        id: i,
        text: s.text,
        reason: s.reason,
        action: s.action || 'none',
        taskName: s.taskName || '',
        applied: false
      })),
      lastPlanDate: today
    };
    saveAgentPlans(agentPlans);
  }

  return agentPlans;
}

/**
 * Apply a plan suggestion (e.g., add a suggested task)
 */
function agentApplyPlan(planId) {
  const plan = agentPlans.plans.find(p => p.id === planId);
  if (plan && !plan.applied && plan.action === 'add_task' && plan.taskName) {
    addTask(plan.taskName);
    plan.applied = true;
    saveAgentPlans(agentPlans);
    return true;
  }
  return false;
}

/**
 * Apply all pending plan suggestions
 */
function agentApplyAllPlans() {
  let count = 0;
  agentPlans.plans.forEach(plan => {
    if (!plan.applied && plan.action === 'add_task' && plan.taskName) {
      addTask(plan.taskName);
      plan.applied = true;
      count++;
    }
  });
  saveAgentPlans(agentPlans);
  return count;
}

// ═══════════════════════════════════════
//  Legacy features (kept for backwards compat)
// ═══════════════════════════════════════

/**
 * Smart task decompose
 */
async function decomposeTask(taskName) {
  const { vendor, apiKey, model } = aiSettings;
  if (!vendor || !apiKey) throw new Error(t('vendorRequired'));

  const lang = getLang();
  const decomposePrompt = lang === 'zh'
    ? `你是一个任务拆解助手。用户会给你一个任务，你需要把它拆解成3-6个具体可执行的小步骤。每个步骤应该简洁明确，5-15分钟可完成。\n请严格以JSON格式返回，格式为：{"steps":[{"text":"步骤描述","order":1},{"text":"步骤描述","order":2}]}。\n不要返回其他任何内容。`
    : `You are a task decomposition assistant. Break the given task into 3-6 specific, actionable steps. Each step should be concise, taking 5-15 minutes.\nReturn strictly in JSON format: {"steps":[{"text":"step description","order":1},{"text":"step description","order":2}]}\nReturn nothing else.`;

  const messages = [
    { role: 'system', content: decomposePrompt },
    { role: 'user', content: taskName }
  ];
  const result = await callLLM(vendor, apiKey, model, messages, { temperature: 0.3, maxTokens: 512 });

  const parsed = extractJSON(result);
  if (parsed && parsed.steps && Array.isArray(parsed.steps)) {
    return parsed.steps
      .filter(s => s.text || typeof s === 'string')
      .map((s, i) => ({
        text: typeof s === 'string' ? s : s.text,
        order: s.order || i + 1
      }));
  }
  return [{ text: result.trim(), order: 1 }];
}

/**
 * AI chat with task context (legacy, wraps agentChat)
 */
async function chatWithContext(userMessage) {
  const { reply, toolResults } = await agentChat(userMessage);
  // If tool results exist, append a summary to the reply
  if (toolResults.length > 0) {
    const summaries = toolResults
      .filter(r => r.result && r.result.success)
      .map(r => {
        if (getLang() === 'zh') return `→ ${r.result.message}`;
        return `→ ${r.result.message}`;
      }).join('\n');
    if (summaries) return reply + (reply ? '\n' : '') + summaries;
  }
  return reply;
}

/**
 * Daily review
 */
async function dailyReview() {
  const { vendor, apiKey, model } = aiSettings;
  if (!vendor || !apiKey) throw new Error(t('vendorRequired'));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCompleted = appData.completed.filter(c => new Date(c.completedAt) >= todayStart);
  const todayPending = appData.tasks.filter(t => t.createdAt && new Date(t.createdAt) >= todayStart);
  const total = todayCompleted.length + todayPending.length;
  const rate = total > 0 ? Math.round((todayCompleted.length / total) * 100) : 0;

  const lang = getLang();
  const reviewPrompt = lang === 'zh'
    ? `你是一个温暖的复盘助手。根据用户今天的任务完成情况，生成一份简短的日终回顾。\n\n规则：\n1. 总结要具体，提到具体完成了什么\n2. 完成率超过60%要肯定努力\n3. 完成率低于30%不批评，分析原因\n4. 明日建议基于未完成任务给出具体安排\n5. 最后一句鼓励（10字以内）\n\n严格按JSON返回：{"summary":"今天总结50字","suggestions":"明天建议50字","encouragement":"鼓励10字"}`
    : `You are a warm review assistant. Generate a brief daily review.\n\nRules:\n1. Be specific about what was accomplished\n2. If completion >60%, acknowledge effort\n3. If <30%, analyze reasons without criticism\n4. Tomorrow's suggestions based on remaining tasks\n5. One encouraging sentence\n\nReturn strictly JSON: {"summary":"50 chars","suggestions":"50 chars","encouragement":"10 chars"}`;

  const messages = [
    { role: 'system', content: reviewPrompt },
    { role: 'user', content: `Completed: ${JSON.stringify(todayCompleted.map(c => c.name))}\nPending: ${JSON.stringify(todayPending.map(t => t.name))}\nRate: ${rate}%` }
  ];

  const result = await callLLM(vendor, apiKey, model, messages, { temperature: 0.8 });
  return extractJSON(result) || { summary: result, suggestions: '', encouragement: '' };
}

/**
 * Test connection
 */
async function testConnection(vendor, apiKey, model) {
  const config = AI_PROVIDERS[vendor];
  if (!config) throw new Error('Unknown AI provider');
  const start = Date.now();
  await callLLM(vendor, apiKey, model, [{ role: 'user', content: 'Hi' }], { maxTokens: 10 });
  return { success: true, latency: Date.now() - start };
}
