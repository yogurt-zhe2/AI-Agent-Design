# AI Features / AI 功能文档

This document describes the AI features implemented in Yogurt to List Agent.
本文档描述了 Yogurt to List Agent 中实现的 AI 功能。

---

## Architecture / 架构

All AI features are built on a unified API layer that supports multiple LLM providers:
所有 AI 功能基于统一 API 层构建，支持多个大语言模型服务商：

```
User Action → app.js → agent.js → callLLM() → Provider API
                                    ↓
                              extractJSON()
                                    ↓
                              UI Update
```

### Provider Configuration / 服务商配置

Providers are defined in `src/agent.js`:
服务商在 `src/agent.js` 中定义：

| Provider | Base URL | Models |
|----------|----------|--------|
| DeepSeek | `api.deepseek.com` | deepseek-chat, deepseek-reasoner |
| 智谱AI | `open.bigmodel.cn` | glm-4-flash, glm-5.1 |
| Kimi | `api.moonshot.cn` | moonshot-v1-8k, moonshot-v1-32k, kimi-k2.5 |
| 通义千问 | `dashscope.aliyuncs.com` | qwen-turbo, qwen-plus, qwen-max |
| 豆包 | `ark.cn-beijing.volces.com` | doubao-pro-32k, doubao-pro-128k |

---

## Feature 1: Smart Task Decompose / 智能任务拆解

### How it works / 工作原理

1. User enters a task name (or selects an existing task).
   用户输入任务名称（或选择一个已有任务）。

2. The app sends a system prompt requesting JSON-formatted step breakdown.
   应用发送系统提示词，要求以 JSON 格式返回步骤拆解。

3. The response is parsed into an array of `{text, order}` objects.
   响应被解析为 `{text, order}` 对象数组。

4. User can edit, remove, or toggle steps before accepting.
   用户可以在采纳前编辑、删除或切换步骤。

### System Prompt / 系统提示词

The decompose prompt instructs the AI to:
拆解提示词指示 AI：

- Break the task into 3-6 specific, actionable steps
  将任务拆解为 3-6 个具体可执行的步骤
- Each step should take 5-15 minutes
  每个步骤应该需要 5-15 分钟
- Return strict JSON format: `{"steps": [{"text": "...", "order": 1}]}`
  返回严格的 JSON 格式

### Fallback / 降级策略

If JSON parsing fails, the entire AI response is used as a single step.
如果 JSON 解析失败，整个 AI 回复将作为单条步骤使用。

---

## Feature 2: AI Chat Assistant / AI 对话助手

### How it works / 工作原理

1. User sends a message in the sidebar.
   用户在侧边栏发送消息。

2. The app builds a context with:
   应用构建一个上下文，包含：

   - Current task list (names + tags)
     当前任务列表（名称 + 标签）
   - Today's completed tasks
     今天已完成的任务
   - Current time
     当前时间

3. AI responds with concise advice (max 150 chars).
   AI 回复简洁的建议（最多 150 字）。

### System Prompt / 系统提示词

The chat prompt positions the AI as a reliable friend helping with task management, avoiding corporate jargon.
对话提示词将 AI 定位为一个可靠的朋友，帮助管理任务，避免企业套话。

---

## Feature 3: Daily Smart Review / 每日智能复盘

### How it works / 工作原理

1. Collect today's completed and pending tasks.
   收集今天已完成和待完成的任务。

2. Calculate completion rate.
   计算完成率。

3. Send to AI with review-specific prompt.
   发送给 AI，使用专门的复盘提示词。

4. AI returns JSON: `{summary, suggestions, encouragement}`
   AI 返回 JSON：`{summary, suggestions, encouragement}`

### Review Rules / 复盘规则

- Summaries must mention specific completed tasks (not vague)
  总结必须提到具体完成的任务（不能泛泛而谈）
- Completion rate > 60%: acknowledge user's effort
  完成率 > 60%：肯定用户的努力
- Completion rate < 30%: help analyze reasons, don't criticize
  完成率 < 30%：帮助分析原因，不批评
- Suggestions must be based on pending tasks
  建议必须基于待完成的任务

### Auto-trigger / 自动触发

The review card auto-appears in the main view when the current hour >= configured review time (default: 21:00).
复盘卡片在当前小时 >= 配置的复盘时间（默认 21:00）时自动显示在主界面。

---

## Security / 安全

- API keys are stored in localStorage only (never sent to any server except the chosen AI provider).
  API Key 仅存储在 localStorage 中（只发送给所选 AI 服务商，不发送到其他服务器）。

- Content Security Policy (CSP) restricts network requests to approved domains only.
  内容安全策略 (CSP) 将网络请求限制在批准的域名内。

- `contextIsolation: true` and `sandbox: true` in Electron config.
  Electron 配置中启用了 `contextIsolation: true` 和 `sandbox: true`。

- No telemetry, no analytics, no cloud storage.
  无遥测、无分析、无云存储。
