# Yogurt to List Agent

An AI-powered to-do list desktop app with a warm paper-texture UI.

一个拥有温暖纸纹界面的 AI 驱动待办事项桌面应用。

![Electron](https://img.shields.io/badge/Electron-33.0-green)
![macOS](https://img.shields.io/badge/macOS-ARM64-blue)

## Features / 功能

### AI Agent Capabilities / AI Agent 能力

- **Multi-Turn Memory** — The Agent remembers your conversations across sessions (up to 50 messages).
  **多轮记忆** — Agent 跨会话记住你的对话（最多 50 条消息）。

- **Tool Calling** — The Agent can directly manipulate your todo list: add, complete, delete tasks.
  **工具调用** — Agent 可以直接操作你的待办列表：添加、完成、删除任务。

- **Auto Daily Planning** — One-click proactive planning. The Agent analyzes your tasks and time to suggest daily actions.
  **自动每日规划** — 一键主动规划。Agent 分析你的任务和时间来建议每日行动。

- **AI Task Decompose** — Break complex tasks into actionable steps automatically.
  **AI 智能拆解** — 自动将复杂任务拆解为可执行的小步骤。

- **AI Chat Assistant** — Ask AI about your tasks, time management, or anything.
  **AI 对话助手** — 向 AI 询问任务安排、时间管理或任何问题。

- **Daily Smart Review** — AI-generated daily summary with suggestions for tomorrow.
  **每日智能复盘** — AI 生成每日总结并给出明日建议。

### Productivity Features / 生产力功能

- **Time-Aware Tags** — Creative / Execution / Wrap-up tags matched to time of day.
  **时间感知标签** — 创造力 / 执行力 / 收尾标签，匹配一天中的不同时段。

- **Encouragement System** — Motivational messages that adapt to your progress.
  **鼓励系统** — 根据你的完成进度动态调整的鼓励消息。

- **Bilingual UI** — Switch between English and Chinese with one click.
  **双语界面** — 一键切换英文和中文。

- **Data Privacy** — All data stored locally. No cloud, no tracking.
  **数据隐私** — 所有数据存储在本地，无云端、无追踪。

### Design Highlights / 设计亮点

- **Provider-Agnostic Tool Calling** — Works with any LLM, not just OpenAI.
  **服务商无关的工具调用** — 适用于任何 LLM，不只是 OpenAI。
- **Zero Runtime Dependencies** — Pure vanilla HTML/CSS/JS, no framework overhead.
  **零运行时依赖** — 纯原生 HTML/CSS/JS，无框架开销。
- **Paper-Texture UI** — Warm, handwritten aesthetic with LXGW WenKai font.
  **纸纹 UI** — 温暖的手写美学，搭配霞鹜文楷字体。

## Supported AI Providers / 支持的 AI 服务商

| Provider | Models |
|----------|--------|
| DeepSeek | deepseek-chat, deepseek-reasoner |
| 智谱AI (Zhipu) | glm-4-flash, glm-5.1 |
| Kimi (Moonshot) | moonshot-v1-8k, moonshot-v1-32k, kimi-k2.5 |
| 通义千问 (Qwen) | qwen-turbo, qwen-plus, qwen-max |
| 豆包 (Doubao) | doubao-pro-32k, doubao-pro-128k |

## Getting Started / 快速开始

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- npm

### Install / 安装

```bash
git clone https://github.com/your-username/yogurt-to-list-agent.git
cd yogurt-to-list-agent
npm install
```

### Run / 启动

```bash
npm start
```

### Build / 打包

```bash
npm run build
```

The `.app` file will be generated in the `dist/` directory.
`.app` 文件将生成在 `dist/` 目录下。

## Usage / 使用说明

1. **Add tasks** — Type in the input field and press Enter.
   **添加任务** — 在输入框中输入内容，按回车。

2. **Add tags** — Select Creative / Execution / Wrap-up before adding.
   **添加标签** — 添加任务前选择 创造力 / 执行力 / 收尾。

3. **Complete tasks** — Click the circle checkbox.
   **完成任务** — 点击圆形复选框。

4. **AI Decompose** — Click the ✦ AI Decompose button in the toolbar.
   **AI 拆解** — 点击工具栏的 ✦ AI 拆解按钮。

5. **AI Chat** — Click 💬 to open the AI sidebar.
   **AI 对话** — 点击 💬 打开 AI 侧边栏。

6. **Daily Review** — Click 📊 in the footer, or it auto-appears in the evening.
   **每日复盘** — 点击底部的 📊，或傍晚自动出现。

7. **Settings** — Click ⚙ to configure AI provider and API key.
   **设置** — 点击 ⚙ 配置 AI 服务商和 API Key。

8. **Language** — Click the language button (EN/中文) in the toolbar.
   **语言切换** — 点击工具栏的语言按钮（EN/中文）。

9. **Data** — Export/Import your tasks via footer buttons.
   **数据** — 通过底部按钮导出/导入任务。

## Project Structure / 项目结构

```
├── main.js          # Electron main process / Electron 主进程
├── preload.js       # Secure bridge / 安全桥接
├── package.json     # Project config / 项目配置
├── src/
│   ├── index.html   # Main UI / 主界面
│   ├── styles.css   # Stylesheet / 样式表
│   ├── i18n.js      # Internationalization / 国际化模块
│   ├── store.js     # Data layer (localStorage) / 数据层
│   ├── agent.js     # AI Agent core (memory, tools, planning) / AI Agent 核心
│   ├── settings.js  # Settings logic / 设置逻辑
│   └── app.js       # App logic / 应用逻辑
├── docs/
│   ├── usage.md       # Usage guide / 使用说明
│   ├── ai-features.md  # AI features doc / AI 功能文档
│   ├── architecture.md # Architecture & Agent design / 架构与 Agent 设计
│   ├── innovation.md   # Innovation analysis & competitive comparison / 创新分析与竞品对比
│   └── development.md  # Development guide / 开发文档
└── CHANGELOG.md     # Changelog / 更新日志
```

## License

MIT
