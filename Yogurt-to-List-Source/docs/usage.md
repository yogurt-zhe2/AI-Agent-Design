# Usage Guide / 使用说明

Yogurt to List Agent is an AI-powered to-do list desktop application. This guide covers all features and how to use them.

Yogurt to List Agent 是一个 AI 驱动的待办事项桌面应用。本指南涵盖所有功能及使用方法。

---

## Quick Start / 快速开始

### First Launch / 首次启动

1. Double-click the app icon to launch Yogurt to List Agent.
   双击应用图标启动 Yogurt to List Agent。

2. On first launch, you'll see the main interface with a warm paper-texture design.
   首次启动后，你会看到温暖纸纹设计的主界面。

3. Click the ⚙ (Settings) button in the toolbar to configure your AI provider.
   点击工具栏的 ⚙（设置）按钮来配置你的 AI 服务商。

---

## Settings / 设置

### Configure AI / 配置 AI

To use AI features, you need to configure an AI provider and API key:

要使用 AI 功能，你需要配置一个 AI 服务商和 API Key：

1. Click ⚙ in the toolbar to open Settings.
   点击工具栏的 ⚙ 打开设置。

2. Select an **AI Provider** (e.g., DeepSeek, Zhipu, Kimi).
   选择一个 **AI 服务商**（如 DeepSeek、智谱、Kimi）。

3. Select a **Model** from the dropdown.
   从下拉菜单中选择一个**模型**。

4. Enter your **API Key** (starts with `sk-…`).
   输入你的 **API Key**（以 `sk-…` 开头）。

5. Click **🔌 Test Connection** to verify.
   点击 **🔌 测试连接** 来验证。

6. Click **Save** to save settings.
   点击 **保存设置** 来保存。

> Your API Key is stored locally only and never uploaded.
> 你的 API Key 仅存储在本地，不会上传。

### Feature Toggles / 功能开关

In Settings, you can enable/disable individual AI features:
在设置中，你可以开启/关闭各个 AI 功能：

| Toggle | Description |
|--------|-------------|
| Smart Task Decompose / 智能任务拆解 | Break tasks into steps automatically / 自动将任务拆解为步骤 |
| AI Chat Assistant / AI 对话助手 | Chat with AI about tasks / 与 AI 聊天讨论任务 |
| Daily Smart Review / 每日智能复盘 | Auto-generate daily summary / 自动生成每日总结 |
| Smart Priority Sort / 智能优先级排序 | AI-suggested task priority / AI 建议的任务优先级 |

---

## Task Management / 任务管理

### Adding Tasks / 添加任务

1. Type your task in the input field at the top.
   在顶部输入框中输入你的任务。

2. Optionally, select a tag before pressing Enter:
   按回车前，可以选择一个标签：

   - **Creative** (创造力) — Best for morning, brainstorming and creative work
   - **Execution** (执行力) — Best for afternoon, actionable and productive work
   - **Wrap-up** (收尾) — Best for evening, finishing and organizing

3. Press **Enter** to add the task.
   按 **回车** 添加任务。

### Completing Tasks / 完成任务

- Click the **circle checkbox** on the left of a task to complete it.
  点击任务左侧的**圆形复选框**来完成它。
- A celebration animation will play when you complete tasks.
  完成任务时会播放庆祝动画。
- Completed tasks are moved to history.
  已完成的任务会被移入历史记录。

### Sub-tasks / 子任务

1. Click **+ Add step** below a task.
   点击任务下方的 **+ 加步骤**。

2. Type the step description and press Enter.
   输入步骤描述并按回车。

3. Click the small dot to mark a step as done.
   点击小圆点来标记步骤为完成。

### Deleting Tasks / 删除任务

Hover over a task and click the **×** button on the right.
将鼠标悬停在任务上，点击右侧的 **×** 按钮。

---

## AI Features / AI 功能

### AI Decompose / AI 拆解

Break complex tasks into actionable sub-steps:
将复杂任务拆解为可执行的子步骤：

1. Type your task in the input field.
   在输入框中输入你的任务。

2. Click the **✦ AI Decompose** button in the toolbar.
   点击工具栏的 **✦ AI 拆解** 按钮。

3. AI will generate 3-6 suggested steps.
   AI 会生成 3-6 个建议步骤。

4. Edit steps if needed, then click **✓ Accept All**.
   如果需要可编辑步骤，然后点击 **✓ 全部采纳**。

5. Click **🔄 Regenerate** to get new suggestions.
   点击 **🔄 重新生成** 获取新的建议。

### AI Chat / AI 对话

Chat with AI about your tasks and time management:
与 AI 聊天讨论任务和时间管理：

1. Click **💬** in the toolbar to open the AI sidebar.
   点击工具栏的 **💬** 打开 AI 侧边栏。

2. Type your question and press Enter.
   输入你的问题并按回车。

3. Try the **quick action buttons** for common queries.
   试试**快捷操作按钮**来获取常见问题的答案。

### Daily Review / 每日复盘

1. Click **📊 Daily Review** in the footer.
   点击底部的 **📊 今日复盘**。

2. The app shows today's completion stats.
   应用会显示今天的完成统计。

3. AI generates a summary and suggestions for tomorrow.
   AI 会生成总结和明日建议。

4. The review card also auto-appears in the evening (configurable time).
   复盘卡片也会在傍晚自动出现（时间可配置）。

---

## Language Switch / 语言切换

Click the **EN / 中文** button in the toolbar to switch between English and Chinese. Your preference is saved automatically.
点击工具栏的 **EN / 中文** 按钮在英文和中文之间切换。你的偏好会自动保存。

---

## Data Management / 数据管理

### Export / 导出

Click **Export** in the footer to download your tasks as a JSON file.
点击底部的 **导出数据** 将任务下载为 JSON 文件。

### Import / 导入

Click **Import** in the footer to load tasks from a previously exported JSON file. Duplicate tasks are skipped.
点击底部的 **导入数据** 从之前导出的 JSON 文件加载任务。重复任务会被跳过。

---

## Keyboard Shortcuts / 快捷键

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Shift + A` | Open AI Chat / 打开 AI 对话 |
| `Cmd/Ctrl + ,` | Open Settings / 打开设置 |
| `Escape` | Close modal / 关闭弹窗 |
