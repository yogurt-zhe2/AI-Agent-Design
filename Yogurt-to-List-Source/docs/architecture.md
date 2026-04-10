# Architecture & Agent Design / 架构与 Agent 设计

This document describes the complete technical architecture of Yogurt to List Agent, including the system design, Agent design philosophy, data flow, and decision rationale.

本文档描述了 Yogurt to List Agent 的完整技术架构，包括系统设计、Agent 设计理念、数据流和决策思路。

---

## 1. System Architecture / 系统架构

### 1.1 Layered Design / 分层设计

```
┌─────────────────────────────────────────────────────────────────┐
│                    Electron Shell (main.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ BrowserWindow│  │ CSP Policy   │  │ Mac Native Behavior   │  │
│  │ hiddenInset  │  │ (whitelist)  │  │ hide-on-close         │  │
│  └──────┬───────┘  └──────────────┘  └───────────────────────┘  │
├─────────┼───────────────────────────────────────────────────────┤
│         │  Preload Bridge (preload.js)                           │
│         │  contextBridge → electronAPI                          │
├─────────┼───────────────────────────────────────────────────────┤
│         ▼  Renderer Process (src/)                               │
│  Load Order: i18n → store → agent → settings → app              │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐     │
│  │   i18n.js   │  │  store.js   │  │     agent.js         │     │
│  │ 中/英双语    │  │ 数据持久化   │  │ AI Agent 核心        │     │
│  │ data-i18n   │  │ localStorage│  │ 多轮记忆/工具调用/规划│     │
│  └─────────────┘  └──────┬──────┘  └──────────┬──────────┘     │
│                           │                     │                │
│  ┌────────────────────────┘          ┌──────────┘                │
│  │                                  │                           │
│  ▼                                  ▼                           │
│  ┌──────────────┐         ┌───────────────────┐                │
│  │  settings.js │         │     app.js        │                │
│  │ 设置面板      │◄────────│ 应用主逻辑         │                │
│  └──────────────┘         │ UI + 事件 + 渲染    │                │
│                            └───────────────────┘                │
├────────────────────────────────────────────────────────────────┤
│              External AI Providers (HTTPS API)                   │
│  DeepSeek · 智谱AI · Kimi · 通义千问 · 豆包                     │
└────────────────────────────────────────────────────────────────┘
```

### 1.2 Module Responsibilities / 模块职责

| Module | Responsibility | Key Exports |
|--------|---------------|-------------|
| `i18n.js` | Bilingual string management, DOM i18n binding | `t()`, `getLang()`, `applyI18N()`, `toggleLang()` |
| `store.js` | Data persistence via localStorage | `appData`, `aiSettings`, `chatHistory`, `agentPlans` |
| `agent.js` | AI Agent core: API calls, tool execution, planning | `agentChat()`, `agentAutoPlan()`, `decomposeTask()`, `dailyReview()` |
| `settings.js` | Settings UI logic | Vendor/model selection, save/reset, connection test |
| `app.js` | Application logic: UI rendering, events, AI integration | Task CRUD, sidebar, plan panel, celebration effects |
| `main.js` | Electron main process: window creation, CSP, native behavior | — |
| `preload.js` | Secure bridge: expose platform info & window controls | `electronAPI` |

### 1.3 Data Layer / 数据层

All data is stored in **localStorage** (4 independent keys):

```
┌─────────────────────────┬──────────────────────────────────────────┐
│ Storage Key             │ Content                                  │
├─────────────────────────┼──────────────────────────────────────────┤
│ yogurt_todo_v2          │ { tasks[], completed[] }                 │
│                         │ Task data with ID, name, tag, steps     │
│                         │ Supports V1 data migration               │
├─────────────────────────┼──────────────────────────────────────────┤
│ yogurt_settings_v2      │ { vendor, model, apiKey, features,       │
│                         │   reviewTime, agentName }               │
│                         │ AI config + feature toggles              │
├─────────────────────────┼──────────────────────────────────────────┤
│ yogurt_chat_history     │ [{ role, content, ts, toolResults? }]    │
│                         │ Conversation history (max 50 messages)   │
├─────────────────────────┼──────────────────────────────────────────┤
│ yogurt_agent_plans      │ { plans[], lastPlanDate }               │
│                         │ Auto-planned task suggestions            │
│                         │ Cached per day                          │
└─────────────────────────┴──────────────────────────────────────────┘
```

---

## 2. Agent Architecture / Agent 架构

### 2.1 Design Philosophy / 设计理念

Yogurt to List Agent adopts a **"Context-Aware Single-Agent"** architecture. Instead of building a complex multi-agent system, we use a single intelligent agent with rich context and tools, focused on the specific domain of personal productivity.

Yogurt to List Agent 采用 **"上下文感知的单 Agent"** 架构。我们没有构建复杂的多 Agent 系统，而是使用一个拥有丰富上下文和工具的智能 Agent，专注于个人生产力领域。

**Core Principles:**

1. **Context is King** — The agent always knows the user's current tasks, time, and history.
   **上下文为王** — Agent 始终知道用户当前的任务、时间和历史。

2. **Action over Conversation** — The agent can directly manipulate the todo list via tool calls.
   **行动优于对话** — Agent 可以通过工具调用直接操作待办列表。

3. **Memory as State** — Conversation history is persisted and restored across sessions.
   **记忆即状态** — 对话历史被持久化并在会话之间恢复。

4. **Proactive, not Reactive** — The agent can plan ahead and suggest actions.
   **主动而非被动** — Agent 可以提前规划并建议行动。

### 2.2 Agent Architecture Diagram / Agent 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     User Input                              │
│  "帮我规划今天" / "加个任务" / "今天还剩什么"                    │
└──────────────────────┬──────────────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Context Builder (agent.js)                     │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ System      │  │ Chat History │  │ Real-time Data   │  │
│  │ Prompt      │  │ (last 20     │  │ · current tasks  │  │
│  │ · identity  │  │  turns)      │  │ · completed today│  │
│  │ · tools     │  │              │  │ · current time   │  │
│  │ · style     │  │              │  │ · time period    │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│                       │                                     │
│                    Messages[]                                │
└───────────────────────┼─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    LLM Provider                             │
│  DeepSeek / 智谱AI / Kimi / 通义千问 / 豆包                   │
│                                                             │
│  Input: messages[] with system prompt + history + user msg   │
│  Output: text response (may contain tool calls)              │
└───────────────────────┼─────────────────────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Response Processor                              │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────────────┐  │
│  │ Tool Call Parser  │         │ Text Cleaner             │  │
│  │ [TOOL:name:{...}] │         │ Remove tool markers      │  │
│  └────────┬─────────┘         └────────────┬─────────────┘  │
│           │                                │                │
│           ▼                                │                │
│  ┌──────────────────┐                       │                │
│  │ Tool Executor    │                       │                │
│  │ add_task         │                       │                │
│  │ get_tasks        │                       │                │
│  │ complete_task    │                       │                │
│  │ delete_task      │                       │                │
│  │ get_time         │                       │                │
│  └──────────────────┘                       │                │
│                                             │                │
└─────────────────────────────────────────────┼────────────────┘
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│              UI Update + State Persistence                   │
│                                                             │
│  · Display AI response in chat bubble                       │
│  · Show tool execution results                              │
│  · Update task list if tasks changed                        │
│  · Save conversation to chatHistory                         │
│  · Update memory badge                                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Tool Calling System / 工具调用系统

The Agent can invoke 5 tools to interact with the user's todo list:

Agent 可以调用 5 个工具来操作用户的待办列表：

```
┌────────────────┬────────────────────────────────────────────┐
│ Tool           │ Description                                │
├────────────────┼────────────────────────────────────────────┤
│ add_task       │ Add a new task (name + optional tag)        │
│ get_tasks      │ Get current pending + today's completed     │
│ complete_task  │ Mark a task as done (fuzzy name match)      │
│ delete_task    │ Remove a task (fuzzy name match)            │
│ get_time       │ Get current datetime + time period          │
└────────────────┴────────────────────────────────────────────┘
```

**Tool Call Format:**
```
[TOOL:add_task:{"name":"开会准备","tag":"execution"}]
[TOOL:complete_task:{"name":"买菜"}]
```

**Design Decision:** We use a regex-based tool call parser (`[TOOL:name:{params}]`) instead of the standard OpenAI function calling format. This is because:

**设计决策：** 我们使用基于正则表达式的工具调用解析器（`[TOOL:name:{params}]`），而不是标准的 OpenAI function calling 格式。原因是：

1. **Provider Agnostic** — Works with any LLM that can follow instructions (not just OpenAI-compatible ones).
   **服务商无关** — 适用于任何能遵循指令的 LLM（不只是 OpenAI 兼容的）。

2. **Simplicity** — No need for complex JSON Schema negotiation or multi-turn tool confirmation.
   **简单** — 不需要复杂的 JSON Schema 协商或多轮工具确认。

3. **Reliability** — Chinese LLM providers have varying support for function calling; text-based tool calls are universally understood.
   **可靠性** — 中国的 LLM 服务商对 function calling 的支持参差不齐；基于文本的工具调用被普遍理解。

### 2.4 Multi-Turn Memory / 多轮记忆

```
┌─────────────────────────────────────────────────────────┐
│                 Memory Lifecycle                         │
│                                                         │
│  User sends message                                      │
│       │                                                 │
│       ▼                                                 │
│  Load last 20 turns from chatHistory                    │
│       │                                                 │
│       ▼                                                 │
│  Build: [system_prompt, ...history, user_message]       │
│       │                                                 │
│       ▼                                                 │
│  Send to LLM → Get response                             │
│       │                                                 │
│       ▼                                                 │
│  Append user_msg + assistant_msg to chatHistory         │
│       │                                                 │
│       ▼                                                 │
│  Trim to last 50 messages (prevent storage bloat)       │
│       │                                                 │
│       ▼                                                 │
│  Persist to localStorage (yogurt_chat_history)          │
│       │                                                 │
│       ▼                                                 │
│  Update UI memory badge (🧠 N messages remembered)      │
└─────────────────────────────────────────────────────────┘
```

**Key Design Choices:**

- **Window Size:** We send the last 20 turns to the LLM (context window management), but store up to 50 messages locally.
  **窗口大小：** 我们向 LLM 发送最近 20 轮对话（上下文窗口管理），但本地存储最多 50 条消息。

- **No Vector DB:** For a personal productivity app with focused conversations, simple array-based history is sufficient and avoids unnecessary complexity.
  **无向量数据库：** 对于一个聚焦的个人生产力应用，简单的数组历史记录就足够了，避免了不必要的复杂性。

- **Cross-Session:** Memory survives app restarts because it's persisted in localStorage.
  **跨会话：** 记忆在应用重启后仍然存在，因为它被持久化在 localStorage 中。

### 2.5 Auto Planning System / 自动规划系统

```
┌─────────────────────────────────────────────────────────┐
│              Auto Planning Flow                         │
│                                                         │
│  User clicks 📋 "Plan Today"                            │
│       │                                                 │
│       ▼                                                 │
│  Check: Has it already planned today?                   │
│       │                                                 │
│     Yes ──→ Return cached plans                         │
│       │                                                 │
│      No                                                 │
│       │                                                 │
│       ▼                                                 │
│  Build planning prompt with:                            │
│  · Current pending tasks                                │
│  · Time period (morning/afternoon/evening)              │
│  · Current hour                                         │
│       │                                                 │
│       ▼                                                 │
│  Send to LLM (lower temperature: 0.6)                   │
│       │                                                 │
│       ▼                                                 │
│  Parse JSON response:                                   │
│  {                                                      │
│    "suggestions": [                                     │
│      { "text": "...", "reason": "...",                  │
│        "action": "add_task|none", "taskName": "..." }   │
│    ]                                                    │
│  }                                                      │
│       │                                                 │
│       ▼                                                 │
│  Display in Plan Panel with "Apply" buttons             │
│       │                                                 │
│       ▼                                                 │
│  User can: apply individual / apply all / ignore         │
│       │                                                 │
│       ▼                                                 │
│  Applied tasks are added to todo list                   │
│  Cache plan for today (yogurt_agent_plans)              │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Security Architecture / 安全架构

```
┌─────────────────────────────────────────────────────────┐
│                   Security Layers                        │
│                                                         │
│  Layer 1: Electron Sandboxing                           │
│  ┌─────────────────────────────────────────────────────┐│
│  │ contextIsolation: true  → Renderer can't access Node││
│  │ sandbox: true          → Renderer runs in sandbox  ││
│  │ nodeIntegration: false → No direct Node.js API      ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  Layer 2: Content Security Policy                        │
│  ┌─────────────────────────────────────────────────────┐│
│  │ default-src 'self'                                 ││
│  │ connect-src → only approved AI provider domains     ││
│  │ font-src → Google Fonts only                       ││
│  │ script-src 'self' (no inline scripts from external) ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  Layer 3: Data Privacy                                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │ API keys stored in localStorage only                 ││
│  │ No telemetry, no analytics, no cloud sync           ││
│  │ No hardcoded credentials in source code             ││
│  │ All AI requests go directly to chosen provider      ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 4. Technology Stack / 技术栈

| Component | Technology | Reason |
|-----------|-----------|--------|
| Desktop Framework | Electron 33 | Cross-platform, web tech, native feel |
| Frontend | Vanilla HTML/CSS/JS | Zero dependencies, fast load, simple maintenance |
| Styling | CSS Variables + Custom Properties | Theme consistency, easy customization |
| Fonts | LXGW WenKai + Caveat | Warm, paper-texture aesthetic |
| Data Storage | localStorage | Zero-setup, sufficient for personal use |
| AI Integration | OpenAI-compatible API | Universal interface, 5 providers supported |
| Build Tool | electron-builder | Standard Electron packaging |
| Internationalization | Custom i18n module | Lightweight, data-attribute driven |

**Why No Framework? / 为什么不用框架？**

We deliberately chose vanilla JavaScript over React/Vue/Svelte:

我们刻意选择了原生 JavaScript 而非 React/Vue/Svelte：

- **Bundle Size:** Zero runtime dependencies = smaller app, faster startup.
  **打包体积：** 零运行时依赖 = 更小的应用，更快的启动。

- **Complexity:** The app has a single page with focused features; a framework adds unnecessary overhead.
  **复杂度：** 应用只有一个页面和聚焦的功能；框架会增加不必要的开销。

- **Maintainability:** Anyone can read and modify the code without learning a specific framework.
  **可维护性：** 任何人都可以阅读和修改代码，无需学习特定框架。

---

## 5. Data Flow Diagrams / 数据流图

### 5.1 Task CRUD Flow

```
User Input → addTask(name, tag)
    │
    ├→ Create task object with unique ID
    ├→ Push to appData.tasks
    ├→ saveData(appData) → localStorage
    └→ renderTasks() + renderStats() + renderEncouragement()
```

### 5.2 Agent Chat Flow

```
User Message → sendAiMessage(msg)
    │
    ├→ addUserMsg(msg) → Update UI
    ├→ showTyping() → Loading indicator
    ├→ agentChat(msg)
    │      ├→ Build messages[] with history (last 20 turns)
    │      ├→ callLLM(vendor, apiKey, model, messages)
    │      ├→ processAgentResponse(reply) → Parse tool calls
    │      │      ├→ executeTool(name, params) → Manipulate todo list
    │      │      └→ Return { text, toolResults }
    │      ├→ Save to chatHistory → localStorage (max 50)
    │      └→ Return { reply, toolResults }
    ├→ hideTyping()
    ├→ addAssistantMsg(reply, toolResults) → Update UI
    ├→ If tools changed tasks → renderTasks() + renderStats()
    └→ updateMemoryBadge() → Show 🧠 count
```

### 5.3 Auto Plan Flow

```
User clicks 📋 → openAutoPlan()
    │
    ├→ Check agentPlans.lastPlanDate === today?
    │      ├→ Yes → Return cached plans
    │      └→ No → Continue
    ├→ Show "Agent is analyzing..." loading
    ├→ agentAutoPlan()
    │      ├→ Build plan prompt with tasks + time context
    │      ├→ callLLM(temperature: 0.6, maxTokens: 512)
    │      ├→ extractJSON(result) → Parse suggestions
    │      ├→ Save to agentPlans → localStorage
    │      └→ Return plans
    └→ renderAgentPlans(plans)
           ├→ Show plan items with Apply buttons
           └→ Bind click events for apply/apply-all
```

---

## 6. Design Decisions & Rationale / 设计决策与思路

### 6.1 Why localStorage instead of IndexedDB or SQLite?

The app deals with a limited dataset (personal tasks, chat history). localStorage provides:
- 5MB storage limit (sufficient for our use case)
- Synchronous API (simpler code)
- No setup required

### 6.2 Why regex-based tool calling instead of function calling API?

Chinese AI providers (DeepSeek, 智谱, Kimi, 通义, 豆包) have inconsistent support for the OpenAI function calling format. A text-based `[TOOL:name:{params}]` protocol is:
- Universally understood by all LLMs
- Provider-agnostic
- Easy to debug (visible in chat)

### 6.3 Why a single Agent instead of multi-Agent?

For personal productivity, the task domain is narrow and well-defined. A single Agent with tools is:
- More predictable
- Easier to debug
- Lower latency (no inter-agent communication)
- Sufficient for the task scope

### 6.4 Why temperature 0.6 for planning, 0.8 for chat?

- **Planning (0.6):** Lower temperature for more structured, deterministic output (JSON parsing).
  **规划（0.6）：** 较低的温度产生更结构化、确定性的输出（JSON 解析）。

- **Chat (0.8):** Higher temperature for more natural, varied conversational responses.
  **对话（0.8）：** 较高的温度产生更自然、多样的对话回复。

- **Decompose (0.3):** Lowest temperature for precise, focused step breakdowns.
  **拆解（0.3）：** 最低温度用于精确、聚焦的步骤拆解。

### 6.5 Why 20-turn context window but 50-message storage?

The LLM context window is the bottleneck. 20 turns (40 messages) provides enough context for coherent conversation without exceeding token limits. The extra storage (up to 50) allows users to scroll back through history in the UI, even if older messages aren't sent to the LLM.
