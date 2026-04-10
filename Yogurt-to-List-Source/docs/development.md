# Development Guide / 开发文档

This document explains how to develop and extend Yogurt to List Agent.
本文档说明如何开发和扩展 Yogurt to List Agent。

---

## Prerequisites / 前置要求

- Node.js >= 18
- npm

## Setup / 环境搭建

```bash
git clone <repo-url>
cd yogurt-to-list-agent
npm install
npm start
```

---

## Project Structure / 项目结构

```
├── main.js              # Electron main process / Electron 主进程
│                          - Window creation / 窗口创建
│                          - CSP policy / CSP 策略
│                          - Menu configuration / 菜单配置
│
├── preload.js           # Secure bridge / 安全桥接
│                          - Exposes platform info / 暴露平台信息
│                          - Window control APIs / 窗口控制 API
│
├── src/
│   ├── index.html       # Main UI markup / 主界面 HTML
│   ├── styles.css       # All styles / 所有样式
│   ├── i18n.js          # Internationalization / 国际化
│   │                      - t(key) to get translated string
│   │                      - applyI18N() to update all DOM elements
│   │                      - toggleLang() to switch language
│   │
│   ├── store.js         # Data layer / 数据层
│   │                      - loadData() / saveData() for tasks
│   │                      - loadSettings() / saveSettings() for AI config
│   │                      - localStorage keys: yogurt_todo_v2, yogurt_settings_v2
│   │
│   ├── agent.js         # AI agent core / AI 核心模块
│   │                      - AI_PROVIDERS: vendor config table
│   │                      - PROMPTS: system prompt templates
│   │                      - callLLM(): unified API call
│   │                      - extractJSON(): response parser
│   │                      - decomposeTask(), chatWithContext(), dailyReview()
│   │
│   ├── settings.js      # Settings modal logic / 设置弹窗逻辑
│   │                      - Populate vendors/models dropdowns
│   │                      - Save/reset/test connection
│   │
│   └── app.js           # Main app logic / 应用主逻辑
│                          - Task CRUD operations
│                          - Time awareness engine
│                          - Encouragement system
│                          - AI sidebar / decompose / review UI
│                          - Event bindings
│
├── docs/                # Documentation / 文档
├── package.json         # Project config / 项目配置
└── CHANGELOG.md         # Version history / 版本历史
```

---

## Internationalization / 国际化 (i18n)

### How it works / 工作原理

1. All user-facing strings are defined in `src/i18n.js` under `I18N.zh` and `I18N.en`.
   所有面向用户的字符串在 `src/i18n.js` 的 `I18N.zh` 和 `I18N.en` 中定义。

2. HTML elements use `data-i18n`, `data-i18n-placeholder`, `data-tooltip-i18n`, or `data-i18n-title` attributes.
   HTML 元素使用 `data-i18n`、`data-i18n-placeholder`、`data-tooltip-i18n` 或 `data-i18n-title` 属性。

3. `applyI18N()` scans all elements with these attributes and updates their content.
   `applyI18N()` 扫描所有带有这些属性的元素并更新其内容。

4. `t(key)` returns the translated string for the current language.
   `t(key)` 返回当前语言的翻译字符串。

### Adding a new string / 添加新字符串

1. Add the key-value pair to both `I18N.zh` and `I18N.en` in `src/i18n.js`.
   在 `src/i18n.js` 的 `I18N.zh` 和 `I18N.en` 中都添加键值对。

2. Add `data-i18n="yourKey"` to the HTML element.
   在 HTML 元素上添加 `data-i18n="yourKey"`。

3. Call `applyI18N()` after language switch (already handled in app.js).
   语言切换后调用 `applyI18N()`（已在 app.js 中处理）。

### Function strings / 函数字符串

Some strings are functions (e.g., `dateFmt(y, m, d, w)`). Use `t('dateFmt')(y, m, d, w)` to call them.
部分字符串是函数（如 `dateFmt(y, m, d, w)`）。使用 `t('dateFmt')(y, m, d, w)` 来调用它们。

---

## Adding a New AI Provider / 添加新的 AI 服务商

1. Open `src/agent.js`.
   打开 `src/agent.js`。

2. Add a new entry to `AI_PROVIDERS`:
   在 `AI_PROVIDERS` 中添加新条目：

```javascript
newProvider: {
  name: 'Display Name',
  baseUrl: 'https://api.example.com/v1',
  models: ['model-1', 'model-2'],
  defaultModel: 'model-1'
}
```

3. Add the API domain to the CSP policy in `main.js` (connect-src).
   在 `main.js` 的 CSP 策略中添加 API 域名（connect-src）。

4. The dropdown will auto-populate on next launch.
   下次启动时下拉菜单会自动填充。

---

## Build & Package / 构建与打包

```bash
npm run build
```

Output will be in `dist/` directory.
输出将在 `dist/` 目录下。

### macOS Notes / macOS 说明

- `titleBarStyle: 'hiddenInset'` preserves the traffic light buttons while integrating the toolbar into the content area.
  `titleBarStyle: 'hiddenInset'` 保留红绿灯按钮，同时将工具栏融入内容区域。

- Closing the window hides the app (not quits). Use Cmd+Q to fully quit.
  关闭窗口会隐藏应用（不是退出）。使用 Cmd+Q 完全退出。

- On first launch, macOS may block the app. Go to **System Settings → Privacy & Security** and click **Open Anyway**.
  首次启动时 macOS 可能阻止应用。前往 **系统设置 → 隐私与安全性** 并点击 **仍要打开**。

---

## Security Considerations / 安全注意事项

- All data is stored in `localStorage` (electron's renderer process).
  所有数据存储在 `localStorage` 中（Electron 渲染进程）。

- `contextIsolation: true` — Renderer cannot access Node.js APIs directly.
  `contextIsolation: true` — 渲染进程无法直接访问 Node.js API。

- `sandbox: true` — Renderer runs in a sandboxed environment.
  `sandbox: true` — 渲染进程在沙箱环境中运行。

- CSP restricts all network requests to approved AI provider domains.
  CSP 将所有网络请求限制在批准的 AI 服务商域名内。

- No hardcoded API keys, passwords, or personal information.
  没有硬编码的 API Key、密码或个人信息。
