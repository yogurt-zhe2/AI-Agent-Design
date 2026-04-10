# Changelog / 更新日志

All notable changes to Yogurt to List Agent will be documented in this file.

Yogurt to List Agent 的所有重要变更都将记录在此文件中。

## [Unreleased]

### Added / 新增

- **AI Agent with Multi-Turn Memory** — The Agent remembers conversations across sessions (up to 50 messages). Close and reopen the app, and the Agent still remembers context.
  **多轮记忆 AI Agent** — Agent 跨会话记住对话（最多 50 条消息）。关闭再打开应用，Agent 仍然记得上下文。

- **Tool Calling System** — The Agent can directly manipulate your todo list via 5 tools: `add_task`, `get_tasks`, `complete_task`, `delete_task`, `get_time`. Uses a provider-agnostic `[TOOL:name:{params}]` protocol.
  **工具调用系统** — Agent 可以通过 5 个工具直接操作待办列表。使用服务商无关的 `[TOOL:name:{params}]` 协议。

- **Auto Daily Planning** — Click 📋 to let the Agent analyze your tasks and time period, generating 2-4 actionable suggestions with reasons. Apply individually or all at once.
  **自动每日规划** — 点击 📋 让 Agent 分析你的任务和时段，生成 2-4 条可执行建议及原因。可单独采纳或一键全部采纳。

- **New Chat Button** — 🔄 button clears conversation history and starts a fresh session.
  **新对话按钮** — 🔄 按钮清空对话历史，开始全新会话。

- **Memory Badge** — 🧠 badge in the Agent header shows how many messages are remembered. Hover for details.
  **记忆徽章** — Agent 标题栏的 🧠 徽章显示记住了多少条消息。悬停查看详情。

- **Architecture documentation (`docs/architecture.md`)** — Complete system architecture, Agent design philosophy, data flow diagrams, and design decision rationale.
  **架构文档 (`docs/architecture.md`)** — 完整的系统架构、Agent 设计理念、数据流图和设计决策思路。

- **Innovation analysis (`docs/innovation.md`)** — Competitive comparison with GitHub projects, innovation analysis, and future roadmap.
  **创新分析 (`docs/innovation.md`)** — 与 GitHub 项目的竞品对比、创新点分析和未来路线图。

---

## [2.1.0] - 2026-04-08

### Added / 新增

- **Bilingual UI (English/Chinese)** — Click the language button in the toolbar to switch between English and Chinese. Language preference is saved to localStorage.
  **双语界面（英文/中文）** — 点击工具栏的语言按钮即可在英文和中文之间切换。语言偏好保存在 localStorage 中。

- **i18n module (`src/i18n.js`)** — Full internationalization support with `data-i18n` attributes on HTML elements.
  **国际化模块 (`src/i18n.js`)** — 完整的国际化支持，HTML 元素使用 `data-i18n` 属性。

### Changed / 变更

- **Project renamed** — From "手账 V2" to "Yogurt to List Agent".
  **项目更名** — 从「手账 V2」改为「Yogurt to List Agent」。

- **Documentation bilingual** — README, CHANGELOG, and all docs now include both English and Chinese.
  **文档双语** — README、CHANGELOG 及所有文档现在都包含英文和中文。

### Security / 安全

- **Privacy audit passed** — No personal information, credentials, or local paths found in codebase.
  **隐私审查通过** — 代码库中未发现个人信息、凭证或本地路径。

---

## [2.0.0] - 2026-04-01

### Added / 新增

- **Electron desktop app** — Paper-texture UI with warm color scheme.
  **Electron 桌面应用** — 纸纹界面，温暖配色。

- **AI Task Decompose** — Break tasks into 3-6 steps using AI.
  **AI 任务拆解** — 使用 AI 将任务拆解为 3-6 个步骤。

- **AI Chat Assistant** — Sidebar chat with task context awareness.
  **AI 对话助手** — 带任务上下文感知的侧边栏对话。

- **Daily Smart Review** — Auto-generated daily summary and suggestions.
  **每日智能复盘** — 自动生成每日总结和建议。

- **Time-aware tags** — Creative (morning), Execution (afternoon), Wrap-up (evening).
  **时间感知标签** — 创造力（上午）、执行力（下午）、收尾（晚间）。

- **Encouragement system** — Dynamic motivational messages based on completion count.
  **鼓励系统** — 根据完成数量动态显示鼓励消息。

- **Multi-provider AI support** — DeepSeek, Zhipu, Kimi, Qwen, Doubao.
  **多服务商 AI 支持** — DeepSeek、智谱、Kimi、通义千问、豆包。

- **Data export/import** — JSON format backup and restore.
  **数据导出/导入** — JSON 格式备份和恢复。
