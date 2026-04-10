// ═══════════════════════════════════════
//  App main logic
//  Task management + UI + AI Agent features
// ═══════════════════════════════════════

(function initApp() {

  // ── DOM cache ──
  const $dateDisplay       = document.getElementById('dateDisplay');
  const $greeting          = document.getElementById('greetingText');
  const $timeHint          = document.getElementById('timeHint');
  const $taskList          = document.getElementById('taskList');
  const $taskInput         = document.getElementById('taskInput');
  const $weekCount         = document.getElementById('weekCount');
  const $progressBar       = document.getElementById('progressBar');
  const $appMain           = document.getElementById('appMain');
  const $encourageBanner   = document.getElementById('encourageBanner');
  const $quickActionsList  = document.getElementById('quickActionsList');

  // AI sidebar
  const $aiSidebar         = document.getElementById('aiSidebar');
  const $aiMessages        = document.getElementById('aiMessages');
  const $aiInput           = document.getElementById('aiInput');
  const $aiSendBtn         = document.getElementById('aiSendBtn');

  // Agent new elements
  const $btnNewChat        = document.getElementById('btnNewChat');
  const $btnAutoPlan       = document.getElementById('btnAutoPlan');
  const $agentMemoryBadge  = document.getElementById('agentMemoryBadge');
  const $agentPlanPanel    = document.getElementById('agentPlanPanel');
  const $agentPlanContent  = document.getElementById('agentPlanContent');

  // Decompose modal
  const $decomposeOverlay  = document.getElementById('decomposeOverlay');
  const $decomposeBody     = document.getElementById('decomposeBody');
  const $decomposeIdle     = document.getElementById('decomposeIdle');
  const $decomposeLoading  = document.getElementById('decomposeLoading');
  const $decomposeResults  = document.getElementById('decomposeResults');
  const $decomposeFooter   = document.getElementById('decomposeFooter');
  const $decomposeOriginalText = document.getElementById('decomposeOriginalText');
  const $decomposeResultsList  = document.getElementById('decomposeResultsList');
  const $decomposeSelectedCount = document.getElementById('decomposeSelectedCount');

  // Review modal
  const $reviewOverlay     = document.getElementById('reviewOverlay');

  // Dashboard & History
  const $dashboardOverlay  = document.getElementById('dashboardOverlay');
  const $dashboardTab      = document.getElementById('dashboardTab');
  const $historyTab        = document.getElementById('historyTab');

  // Recent completed
  const $recentCompleted   = document.getElementById('recentCompleted');
  const $recentList        = document.getElementById('recentCompletedList');
  const $recentCount       = document.getElementById('recentCompletedCount');

  // Daily inline review
  const $dailyReview       = document.getElementById('dailyReview');
  const $dailyReviewHeader = document.getElementById('dailyReviewHeader');
  const $dailyReviewContent = document.getElementById('dailyReviewContent');

  // ── State ──
  let currentFilter = 'all';
  let selectedTag = null;
  let addingStepFor = null;
  let aiPanelOpen = false;
  let decomposeTaskName = '';
  let decomposeSteps = [];
  let decomposeSelectedSet = new Set();

  // ═══════════════════════════════════════
  //  Time awareness engine
  // ═══════════════════════════════════════

  function getTimePeriod() {
    const h = new Date().getHours();
    if (h >= 6 && h < 12) return 'morning';
    if (h >= 12 && h < 18) return 'afternoon';
    return 'evening';
  }

  function getTimePhaseText(period) {
    return t('timeHints')[period] || '';
  }

  function getGreeting(period) {
    const pool = t('greetings')[period] || t('greetings').morning;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function getTimeBadge(tag, period) {
    const matchMap = { morning: 'creative', afternoon: 'execution', evening: 'closing' };
    if (tag === matchMap[period]) return t('timeMatch');
    return '';
  }

  // ═══════════════════════════════════════
  //  Encouragement system
  // ═══════════════════════════════════════

  function getTodayCompletedCount() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return appData.completed.filter(c => new Date(c.completedAt) >= todayStart).length;
  }

  function getEncourageText(count) {
    const levels = t('encourageLevels');
    for (const level of levels) {
      if (count <= level.max) {
        return level.texts[Math.floor(Math.random() * level.texts.length)];
      }
    }
    return '';
  }

  function renderEncouragement() {
    const count = getTodayCompletedCount();
    const text = getEncourageText(count);
    $encourageBanner.textContent = text;
    setTimeout(() => $encourageBanner.classList.add('visible'), 100);
  }

  // ═════════════════════════════════════
  //  UI Rendering
  // ═══════════════════════════════════════

  function renderDate() {
    const now = new Date();
    $dateDisplay.textContent = t('dateFmt')(
      now.getFullYear(), now.getMonth() + 1, now.getDate(),
      t('weekDays')[now.getDay()]
    );
  }

  function renderGreeting() {
    const period = getTimePeriod();
    $greeting.textContent = getGreeting(period);
    $timeHint.textContent = getTimePhaseText(period);
    setTimeout(() => $timeHint.classList.add('visible'), 300);
  }

  // ── Task list ──
  function renderTasks() {
    const period = getTimePeriod();
    let tasks = appData.tasks;

    if (currentFilter !== 'all') {
      tasks = tasks.filter(tk => tk.tag === currentFilter);
    }

    if (tasks.length === 0) {
      $taskList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📭</div>
          <div>${t('emptyState')}</div>
        </div>`;
      return;
    }

    $taskList.innerHTML = tasks.map(task => {
      const tilt = (Math.random() * 0.6 - 0.3).toFixed(2);
      const tagClass = task.tag ? `tag-${task.tag}` : '';
      const tagLabel = { creative: t('tagCreative'), execution: t('tagExecution'), closing: t('tagClosing') }[task.tag] || '';
      const badge = getTimeBadge(task.tag, period);
      const tagHtml = task.tag ? `<span class="task-tag ${tagClass}">${tagLabel}</span>` : '';
      const badgeHtml = badge ? `<span class="time-badge">${badge}</span>` : '';
      const timeStr = task.createdAt ? formatTime(task.createdAt) : '';

      let stepsHtml = '';
      if (task.steps && task.steps.length > 0) {
        stepsHtml = `<div class="task-steps">${
          task.steps.map((s, i) => `
            <div class="step-item">
              <span class="step-dot${s.done ? ' done' : ''}" data-task-id="${task.id}" data-step-idx="${i}"></span>
              <span class="step-text${s.done ? ' done' : ''}">${escapeHtml(s.text)}</span>
            </div>`).join('')
        }</div>`;
      }

      const isAddingStep = addingStepFor === task.id;
      const addStepHtml = isAddingStep
        ? `<div class="step-input-wrap">
             <input type="text" class="step-input" data-i18n-placeholder="stepPlaceholder" placeholder="${t('stepPlaceholder')}" data-task-id="${task.id}" />
             <button class="step-cancel-btn" data-task-id="${task.id}">${t('stepCancel')}</button>
           </div>`
        : `<button class="add-step-btn" data-task-id="${task.id}">${t('addStep')}</button>`;

      return `
        <div class="task-card entering" style="--tilt: ${tilt}deg" data-id="${task.id}">
          <div class="task-checkbox" data-task-id="${task.id}"></div>
          <div class="task-content">
            <span class="task-name">${escapeHtml(task.name)}</span>
            ${tagHtml}${badgeHtml}
            ${timeStr ? `<div class="task-time">${timeStr}</div>` : ''}
            ${stepsHtml}
            ${addStepHtml}
          </div>
          <button class="task-delete" data-task-id="${task.id}" title="Delete">×</button>
        </div>`;
    }).join('');

    bindTaskEvents();
    renderRecentCompleted();
  }

  function bindTaskEvents() {
    $taskList.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('click', () => completeTask(cb.dataset.taskId));
    });
    $taskList.querySelectorAll('.task-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteTask(btn.dataset.taskId));
    });
    $taskList.querySelectorAll('.step-dot').forEach(dot => {
      dot.addEventListener('click', () => toggleStep(dot.dataset.taskId, parseInt(dot.dataset.stepIdx)));
    });
    $taskList.querySelectorAll('.add-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addingStepFor = btn.dataset.taskId;
        renderTasks();
        const input = $taskList.querySelector('.step-input');
        if (input) input.focus();
      });
    });
    $taskList.querySelectorAll('.step-cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        addingStepFor = null;
        renderTasks();
      });
    });
    $taskList.querySelectorAll('.step-input').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          addStep(input.dataset.taskId, input.value.trim());
        }
        if (e.key === 'Escape') {
          addingStepFor = null;
          renderTasks();
        }
      });
    });
  }

  // ── Recently completed (shown below task list) ──
  function renderRecentCompleted() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayDone = appData.completed
      .filter(c => new Date(c.completedAt) >= todayStart)
      .slice(0, 10);

    if (todayDone.length === 0) {
      $recentCompleted.style.display = 'none';
      return;
    }

    $recentCompleted.style.display = 'block';
    $recentCount.textContent = `${todayDone.length}`;

    $recentList.innerHTML = todayDone.map(c => {
      const d = new Date(c.completedAt);
      const h = d.getHours().toString().padStart(2, '0');
      const m = d.getMinutes().toString().padStart(2, '0');
      return `
        <div class="recent-completed-item">
          <span class="rc-check">✓</span>
          <span class="rc-name">${escapeHtml(c.name)}</span>
          <span class="rc-time">${h}:${m}</span>
        </div>`;
    }).join('');
  }

  // ── Footer stats ──
  function renderStats() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekCompleted = appData.completed.filter(c => new Date(c.completedAt) >= weekStart);
    $weekCount.textContent = weekCompleted.length;

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayTasks = appData.tasks.filter(tk => tk.createdAt && new Date(tk.createdAt) >= todayStart);
    const todayCompleted = appData.completed.filter(c => c.completedAt && new Date(c.completedAt) >= todayStart);
    const total = todayTasks.length + todayCompleted.length;
    const pct = total > 0 ? Math.round((todayCompleted.length / total) * 100) : 0;
    $progressBar.style.width = pct + '%';
  }

  // ═══════════════════════════════════════
  //  Task operations
  // ═══════════════════════════════════════

  function addTask(name, tag) {
    if (!name.trim()) return;
    const task = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: name.trim(),
      tag: tag || null,
      createdAt: new Date().toISOString(),
      steps: []
    };
    appData.tasks.unshift(task);
    saveData(appData);
    addHistoryEntry({ type: 'add', name: task.name, tag: task.tag, ts: task.createdAt });
    renderTasks();
    renderStats();
    renderEncouragement();
  }

  function completeTask(id) {
    const card = $taskList.querySelector(`[data-id="${id}"]`);
    if (!card) return;

    const checkbox = card.querySelector('.task-checkbox');
    checkbox.classList.add('checked');

    setTimeout(() => card.classList.add('completing'), 200);
    setTimeout(() => {
      const idx = appData.tasks.findIndex(tk => tk.id === id);
      if (idx > -1) {
        const [task] = appData.tasks.splice(idx, 1);
        appData.completed.push({ ...task, completedAt: new Date().toISOString() });
        saveData(appData);
        addHistoryEntry({ type: 'complete', name: task.name, tag: task.tag, ts: new Date().toISOString() });
        renderTasks();
        renderStats();
        renderEncouragement();

        const count = getTodayCompletedCount();
        showCelebration(count);
      }
    }, 900);
  }

  function deleteTask(id) {
    const card = $taskList.querySelector(`[data-id="${id}"]`);
    if (card) {
      const task = appData.tasks.find(tk => tk.id === id);
      card.style.opacity = '0';
      card.style.transform = 'translateX(30px)';
      setTimeout(() => {
        appData.tasks = appData.tasks.filter(tk => tk.id !== id);
        saveData(appData);
        if (task) addHistoryEntry({ type: 'delete', name: task.name, tag: task.tag, ts: new Date().toISOString() });
        renderTasks();
        renderStats();
      }, 300);
    }
  }

  function toggleStep(taskId, stepIdx) {
    const task = appData.tasks.find(tk => tk.id === taskId);
    if (task && task.steps[stepIdx] !== undefined) {
      task.steps[stepIdx].done = !task.steps[stepIdx].done;
      saveData(appData);
      renderTasks();
    }
  }

  function addStep(taskId, text) {
    const task = appData.tasks.find(tk => tk.id === taskId);
    if (!task) return;
    if (!task.steps) task.steps = [];
    task.steps.push({ text, done: false });
    saveData(appData);
    renderTasks();
    const input = $taskList.querySelector('.step-input');
    if (input) input.focus();
  }

  // ═══════════════════════════════════════
  //  Celebration effects
  // ═══════════════════════════════════════

  function showCelebration(completedCount) {
    const celebrations = t('celebrations');
    const el = document.createElement('div');
    el.className = 'mini-celebration';
    el.textContent = celebrations[Math.floor(Math.random() * celebrations.length)];
    el.style.left = (40 + Math.random() * 20) + '%';
    el.style.top = '40%';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);

    if (completedCount >= 4) {
      const particleCount = completedCount >= 7 ? 24 : 12;
      const colors = ['#7A8B6F', '#C4956A', '#8C7B6B', '#A8B89E', '#D4A574'];
      for (let i = 0; i < particleCount; i++) {
        setTimeout(() => spawnConfetti(colors), i * 50);
      }
    }
  }

  function spawnConfetti(colors) {
    const el = document.createElement('div');
    el.className = 'confetti';
    el.style.left = (30 + Math.random() * 40) + '%';
    el.style.top = (20 + Math.random() * 20) + '%';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = (4 + Math.random() * 4) + 'px';
    el.style.height = (4 + Math.random() * 4) + 'px';
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '1px';
    const xOffset = (Math.random() - 0.5) * 120;
    document.body.appendChild(el);
    el.animate([
      { opacity: 1, transform: `translateY(0) translateX(0) rotate(0deg) scale(1)` },
      { opacity: 0, transform: `translateY(${150 + Math.random() * 100}px) translateX(${xOffset}px) rotate(${360 + Math.random() * 360}deg) scale(0.3)` }
    ], { duration: 1500 + Math.random() * 500, easing: 'ease-out', fill: 'forwards' });
    setTimeout(() => el.remove(), 2200);
  }

  // ═══════════════════════════════════════
  //  AI Agent Sidebar (with memory)
  // ═══════════════════════════════════════

  function toggleAiSidebar() {
    aiPanelOpen = !aiPanelOpen;
    if (aiPanelOpen) {
      $aiSidebar.classList.add('open');
      $appMain.classList.add('sidebar-open');
      document.getElementById('btnAISidebar').classList.add('active');
      $aiInput.focus();
      renderChatHistory();
      updateMemoryBadge();
    } else {
      $aiSidebar.classList.remove('open');
      $appMain.classList.remove('sidebar-open');
      document.getElementById('btnAISidebar').classList.remove('active');
    }
  }

  function closeAiSidebar() {
    aiPanelOpen = false;
    $aiSidebar.classList.remove('open');
    $appMain.classList.remove('sidebar-open');
    document.getElementById('btnAISidebar').classList.remove('active');
  }

  // ── Render chat history from memory ──
  function renderChatHistory() {
    const history = agentGetHistory();
    if (history.length === 0) {
      $aiMessages.innerHTML = `
        <div class="ai-msg assistant">
          <div class="ai-msg-avatar">✦</div>
          <div class="ai-msg-body">
            <div class="ai-msg-bubble">${t('agentWelcome')}</div>
          </div>
        </div>`;
      return;
    }

    $aiMessages.innerHTML = history.map(msg => {
      const isUser = msg.role === 'user';
      const cls = isUser ? 'user' : 'assistant';
      const avatar = isUser ? t('me') : '✦';
      const toolResultsHtml = (!isUser && msg.toolResults && msg.toolResults.length > 0)
        ? msg.toolResults.map(r => `<div class="ai-tool-result">→ ${escapeHtml(r.tool)}: ${escapeHtml(r.result?.message || 'done')}</div>`).join('')
        : '';

      return `
        <div class="ai-msg ${cls}">
          <div class="ai-msg-avatar">${avatar}</div>
          <div class="ai-msg-body">
            <div class="ai-msg-bubble">${escapeHtml(msg.content)}</div>
            ${toolResultsHtml}
          </div>
        </div>`;
    }).join('');

    $aiMessages.scrollTop = $aiMessages.scrollHeight;
  }

  // ── Memory badge ──
  function updateMemoryBadge() {
    const count = chatHistory.length;
    if (count > 0) {
      $agentMemoryBadge.textContent = '🧠';
      $agentMemoryBadge.title = t('agentMemoryCount')(count);
      $agentMemoryBadge.style.opacity = '1';
    } else {
      $agentMemoryBadge.textContent = '🧠';
      $agentMemoryBadge.title = '';
      $agentMemoryBadge.style.opacity = '0.3';
    }
  }

  // ── Add message to UI (for new messages) ──
  function addUserMsg(content) {
    const div = document.createElement('div');
    div.className = 'ai-msg user';
    div.innerHTML = `
      <div class="ai-msg-avatar">${t('me')}</div>
      <div class="ai-msg-body">
        <div class="ai-msg-bubble">${escapeHtml(content)}</div>
      </div>`;
    $aiMessages.appendChild(div);
    $aiMessages.scrollTop = $aiMessages.scrollHeight;
  }

  function addAssistantMsg(content, toolResults) {
    const providerName = AI_PROVIDERS[aiSettings.vendor]?.name || 'AI';
    const toolResultsHtml = toolResults && toolResults.length > 0
      ? toolResults.map(r => `<div class="ai-tool-result">→ ${escapeHtml(r.tool)}: ${escapeHtml(r.result?.message || 'done')}</div>`).join('')
      : '';

    const div = document.createElement('div');
    div.className = 'ai-msg assistant';
    div.innerHTML = `
      <div class="ai-msg-avatar">✦</div>
      <div class="ai-msg-body">
        <div class="ai-msg-bubble">${escapeHtml(content)}</div>
        ${toolResultsHtml}
        <div class="ai-msg-footer">
          <span class="ai-msg-source">${providerName} · ${aiSettings.model || ''}</span>
          <div class="ai-msg-actions">
            <button class="ai-msg-action-btn" title="${t('copyBtn')}" onclick="navigator.clipboard.writeText(this.closest('.ai-msg').querySelector('.ai-msg-bubble').textContent)">📋</button>
          </div>
        </div>
      </div>`;
    $aiMessages.appendChild(div);
    $aiMessages.scrollTop = $aiMessages.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'ai-typing';
    div.id = 'aiTypingIndicator';
    div.innerHTML = `
      <div class="ai-msg-avatar" style="background:rgba(196,149,106,0.15);color:var(--caramel);">✦</div>
      <div class="ai-typing-dots"><span></span><span></span><span></span></div>
      <span class="ai-typing-text">${t('aiThinking')}</span>`;
    $aiMessages.appendChild(div);
    $aiMessages.scrollTop = $aiMessages.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('aiTypingIndicator');
    if (el) el.remove();
  }

  // ── New chat (clear history) ──
  function newChat() {
    agentClearHistory();
    renderChatHistory();
    updateMemoryBadge();
  }

  // ── Send message (Agent with memory) ──
  async function sendAiMessage(msg) {
    if (!msg) msg = $aiInput.value.trim();
    if (!msg) return;
    $aiInput.value = '';
    $aiInput.style.height = 'auto';

    addUserMsg(msg);

    if (!aiSettings.vendor || !aiSettings.apiKey) {
      addAssistantMsg(t('aiNotConfigured'));
      return;
    }

    showTyping();
    try {
      const { reply, toolResults } = await agentChat(msg);
      hideTyping();
      addAssistantMsg(reply, toolResults);
      updateMemoryBadge();

      // If tools were executed, refresh task list
      if (toolResults && toolResults.length > 0) {
        const hadTaskChange = toolResults.some(r =>
          r.result && r.result.success &&
          ['add_task', 'complete_task', 'delete_task'].includes(r.tool)
        );
        if (hadTaskChange) {
          renderTasks();
          renderStats();
          renderEncouragement();
        }
      }
    } catch (err) {
      hideTyping();
      addAssistantMsg(t('aiErrorPrefix') + err.message);
    }
  }

  // ═══════════════════════════════════════
  //  Agent Auto Plan
  // ═══════════════════════════════════════

  async function openAutoPlan() {
    if (!aiSettings.vendor || !aiSettings.apiKey) {
      document.getElementById('settingsOverlay').classList.add('open');
      return;
    }

    $agentPlanPanel.style.display = 'block';
    $agentPlanContent.innerHTML = `<div class="agent-plan-thinking">${t('agentPlanThinking')}</div>`;

    try {
      const plans = await agentAutoPlan();
      renderAgentPlans(plans);
    } catch (err) {
      $agentPlanContent.innerHTML = `<div class="agent-plan-thinking">${t('aiErrorPrefix')}${err.message}</div>`;
    }
  }

  function renderAgentPlans(plans) {
    if (!plans.plans || plans.plans.length === 0) {
      $agentPlanContent.innerHTML = `<div class="agent-plan-thinking">${t('agentPlanEmpty')}</div>`;
      return;
    }

    const actionablePlans = plans.plans.filter(p => p.action === 'add_task' && !p.applied);
    const hasApplyAll = actionablePlans.length > 1;

    $agentPlanContent.innerHTML = plans.plans.map(plan => {
      const isActionable = plan.action === 'add_task';
      const btnHtml = isActionable
        ? `<button class="agent-plan-item-btn${plan.applied ? ' applied' : ''}" data-plan-id="${plan.id}">${plan.applied ? t('agentPlanApplied') : t('agentPlanApply')}</button>`
        : '';

      return `
        <div class="agent-plan-item">
          <div class="agent-plan-item-text">
            <div>${escapeHtml(plan.text)}</div>
            <div class="agent-plan-item-reason">${escapeHtml(plan.reason)}</div>
          </div>
          ${btnHtml}
        </div>`;
    }).join('') + (hasApplyAll ? `
      <div class="agent-plan-actions">
        <button class="agent-plan-apply-all-btn" id="btnApplyAllPlans">${t('agentPlanApplyAll')}</button>
      </div>` : '');

    // Bind apply buttons
    $agentPlanContent.querySelectorAll('.agent-plan-item-btn:not(.applied)').forEach(btn => {
      btn.addEventListener('click', () => {
        const planId = parseInt(btn.dataset.planId);
        if (agentApplyPlan(planId)) {
          btn.textContent = t('agentPlanApplied');
          btn.classList.add('applied');
          renderTasks();
          renderStats();
        }
      });
    });

    const applyAllBtn = document.getElementById('btnApplyAllPlans');
    if (applyAllBtn) {
      applyAllBtn.addEventListener('click', () => {
        const count = agentApplyAllPlans();
        renderAgentPlans(agentPlans);
        renderTasks();
        renderStats();
        if (!aiPanelOpen) toggleAiSidebar();
        addAssistantMsg(getLang() === 'zh' ? `已为你添加 ${count} 个建议任务` : `Added ${count} suggested tasks`);
      });
    }
  }

  function closeAutoPlan() {
    $agentPlanPanel.style.display = 'none';
  }

  // ═══════════════════════════════════════
  //  AI Decompose
  // ═══════════════════════════════════════

  function openDecompose(taskName) {
    decomposeTaskName = taskName || $taskInput.value.trim();

    if (!decomposeTaskName) {
      if (appData.tasks.length > 0) {
        decomposeTaskName = appData.tasks[0].name;
      } else {
        $taskInput.focus();
        return;
      }
    }

    if (!aiSettings.vendor || !aiSettings.apiKey) {
      document.getElementById('settingsOverlay').classList.add('open');
      return;
    }

    decomposeSteps = [];
    decomposeSelectedSet = new Set();
    $decomposeOriginalText.textContent = decomposeTaskName;

    setDecomposeState('idle');
    $decomposeOverlay.classList.add('open');

    startDecompose();
  }

  function closeDecompose() {
    $decomposeOverlay.classList.remove('open');
  }

  function setDecomposeState(state) {
    $decomposeIdle.classList.toggle('hidden', state !== 'idle');
    $decomposeLoading.classList.toggle('hidden', state !== 'loading');
    $decomposeResults.classList.toggle('hidden', state !== 'results');
    $decomposeFooter.classList.toggle('hidden', state !== 'results');
  }

  async function startDecompose() {
    setDecomposeState('loading');

    try {
      const steps = await decomposeTask(decomposeTaskName);
      decomposeSteps = steps.map((s, i) => ({
        text: s.text,
        order: s.order || (i + 1),
        selected: true
      }));
      decomposeSelectedSet = new Set(decomposeSteps.map((_, i) => i));
      renderDecomposeResults();
      setDecomposeState('results');
    } catch (err) {
      setDecomposeState('idle');
      if (!aiPanelOpen) toggleAiSidebar();
      addAssistantMsg(t('decomposeFailed') + err.message);
    }
  }

  function renderDecomposeResults() {
    $decomposeResultsList.innerHTML = decomposeSteps.map((step, i) => `
      <div class="decompose-item" data-idx="${i}">
        <div class="decompose-item-check${step.selected ? ' checked' : ''}" data-idx="${i}"></div>
        <span class="decompose-item-idx">${i + 1}</span>
        <span class="decompose-item-text" contenteditable="true" data-idx="${i}">${escapeHtml(step.text)}</span>
        <button class="decompose-item-delete" data-idx="${i}" title="Remove">×</button>
      </div>
    `).join('');

    updateSelectedCount();

    $decomposeResultsList.querySelectorAll('.decompose-item-check').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        decomposeSteps[idx].selected = !decomposeSteps[idx].selected;
        el.classList.toggle('checked', decomposeSteps[idx].selected);
        if (decomposeSteps[idx].selected) decomposeSelectedSet.add(idx);
        else decomposeSelectedSet.delete(idx);
        updateSelectedCount();
      });
    });

    $decomposeResultsList.querySelectorAll('.decompose-item-delete').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.idx);
        decomposeSteps.splice(idx, 1);
        decomposeSelectedSet.clear();
        decomposeSteps.forEach((_, i) => { if (decomposeSteps[i].selected) decomposeSelectedSet.add(i); });
        renderDecomposeResults();
      });
    });
  }

  function updateSelectedCount() {
    const count = decomposeSteps.filter(s => s.selected).length;
    $decomposeSelectedCount.textContent = t('selectedCount')(count);
  }

  function acceptDecompose() {
    const selectedSteps = decomposeSteps
      .filter(s => s.selected)
      .map(s => ({ text: s.text, done: false }));

    if (selectedSteps.length === 0) return;

    const existingTask = appData.tasks.find(tk => tk.name === decomposeTaskName);

    if (existingTask) {
      if (!existingTask.steps) existingTask.steps = [];
      existingTask.steps.push(...selectedSteps);
      saveData(appData);
      renderTasks();
    } else {
      const task = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: decomposeTaskName,
        tag: selectedTag || null,
        createdAt: new Date().toISOString(),
        steps: selectedSteps
      };
      appData.tasks.unshift(task);
      saveData(appData);
      $taskInput.value = '';
      selectedTag = null;
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      renderTasks();
      renderStats();
    }

    closeDecompose();

    if (!aiPanelOpen) toggleAiSidebar();
    addAssistantMsg(t('decomposeAccepted')(decomposeTaskName, selectedSteps.length));
  }

  // ═══════════════════════════════════════
  //  Daily Review
  // ═══════════════════════════════════════

  async function openDailyReview() {
    if (!aiSettings.vendor || !aiSettings.apiKey) {
      document.getElementById('settingsOverlay').classList.add('open');
      return;
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayCompleted = appData.completed.filter(c => new Date(c.completedAt) >= todayStart);
    const todayPending = appData.tasks.filter(tk => tk.createdAt && new Date(tk.createdAt) >= todayStart);
    const total = todayCompleted.length + todayPending.length;
    const rate = total > 0 ? Math.round((todayCompleted.length / total) * 100) : 0;

    document.getElementById('reviewDate').textContent = `${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getDate().toString().padStart(2,'0')}`;
    document.getElementById('reviewDoneCount').textContent = todayCompleted.length;
    document.getElementById('reviewRemainingCount').textContent = todayPending.length;
    document.getElementById('reviewProgressBar').style.width = rate + '%';
    document.getElementById('reviewProgressText').textContent = rate + '%';

    document.getElementById('reviewSummary').textContent = t('reviewGenerating');
    document.getElementById('reviewSuggestion').textContent = t('reviewGenerating');
    document.getElementById('reviewEncourage').textContent = '';

    $reviewOverlay.classList.add('open');

    try {
      const result = await dailyReview();
      document.getElementById('reviewSummary').textContent = result.summary || t('reviewDefaultSummary');
      document.getElementById('reviewSuggestion').textContent = result.suggestions || t('reviewDefaultSuggestion');
      document.getElementById('reviewEncourage').textContent = result.encouragement || '';
    } catch (err) {
      document.getElementById('reviewSummary').textContent = t('reviewFailedPrefix') + err.message;
      document.getElementById('reviewSuggestion').textContent = '';
      document.getElementById('reviewEncourage').textContent = '';
    }
  }

  function closeDailyReview() {
    $reviewOverlay.classList.remove('open');
  }

  function checkDailyReviewCard() {
    const h = new Date().getHours();
    const reviewHour = parseInt((aiSettings.reviewTime || '21:00').split(':')[0]);
    if (h >= reviewHour && aiSettings.features.review) {
      $dailyReview.style.display = 'block';
    }
  }

  function toggleDailyReviewCard() {
    $dailyReview.classList.toggle('open');
  }

  async function generateInlineReview() {
    $dailyReviewContent.textContent = t('dailyReviewInlineGenerating');
    $dailyReview.classList.add('open');

    if (!aiSettings.vendor || !aiSettings.apiKey) {
      $dailyReviewContent.textContent = t('dailyReviewInlineNotConfigured');
      return;
    }

    try {
      const result = await dailyReview();
      $dailyReviewContent.textContent = (result.summary || '') + ' ' + (result.encouragement || '');
    } catch (err) {
      $dailyReviewContent.textContent = t('dailyReviewInlineFailed') + err.message;
    }
  }

  // ═══════════════════════════════════════
  //  Data Export / Import
  // ═══════════════════════════════════════

  document.getElementById('btnExport').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const d = new Date();
    a.download = t('exportFilename')(
      d.getFullYear(),
      (d.getMonth()+1).toString().padStart(2,'0'),
      d.getDate().toString().padStart(2,'0')
    );
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('btnImport').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!Array.isArray(imported.tasks) || !Array.isArray(imported.completed)) {
          alert(t('importFailed'));
          return;
        }
        const existingIds = new Set([
          ...appData.tasks.map(tk => tk.id),
          ...appData.completed.map(tk => tk.id)
        ]);
        imported.tasks.forEach(tk => {
          if (!existingIds.has(tk.id)) appData.tasks.push(tk);
        });
        imported.completed.forEach(tk => {
          if (!existingIds.has(tk.id)) appData.completed.push(tk);
        });
        saveData(appData);
        renderTasks();
        renderStats();
        renderEncouragement();
      } catch {
        alert(t('importReadFailed'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  // ═══════════════════════════════════════
  //  Utility functions
  // ═══════════════════════════════════════

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return t('taskTimeFmt')(h, m);
  }

  // ── Render quick actions (Agent style) ──
  function renderQuickActions() {
    const actions = t('quickAgent');
    const labelsZh = I18N.zh.quickAgent;
    const labelsEn = I18N.en.quickAgent;
    $quickActionsList.innerHTML = actions.map((label, i) => {
      const zhPrompt = labelsZh[i] || label;
      const enPrompt = labelsEn[i] || label;
      return `<button class="ai-quick-btn" data-prompt-zh="${escapeHtml(zhPrompt)}" data-prompt-en="${escapeHtml(enPrompt)}" data-prompt="${escapeHtml(label)}">${escapeHtml(label)}</button>`;
    }).join('');

    $quickActionsList.querySelectorAll('.ai-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = getLang();
        const prompt = lang === 'zh' ? btn.dataset.promptZh : btn.dataset.promptEn;
        sendAiMessage(prompt);
      });
    });
  }

  // ═══════════════════════════════════════
  //  Event bindings
  // ═══════════════════════════════════════

  $taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTask($taskInput.value, selectedTag);
      $taskInput.value = '';
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      selectedTag = null;
    }
  });

  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
      if (selectedTag === btn.dataset.tag) {
        selectedTag = null;
      } else {
        btn.classList.add('active');
        selectedTag = btn.dataset.tag;
      }
      $taskInput.focus();
    });
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // ── Toolbar buttons ──
  document.getElementById('btnAIDecompose').addEventListener('click', () => openDecompose());
  document.getElementById('btnAISidebar').addEventListener('click', () => toggleAiSidebar());
  document.getElementById('aiSidebarClose').addEventListener('click', closeAiSidebar);
  document.getElementById('btnDailyReview').addEventListener('click', openDailyReview);

  // ── Agent sidebar buttons ──
  $btnNewChat.addEventListener('click', newChat);
  $btnAutoPlan.addEventListener('click', () => {
    if ($agentPlanPanel.style.display === 'none' || !$agentPlanPanel.style.display) {
      openAutoPlan();
    } else {
      closeAutoPlan();
    }
  });

  // ── Language switch ──
  document.getElementById('btnLangSwitch').addEventListener('click', () => {
    toggleLang();
    applyI18N();
    renderDate();
    renderGreeting();
    renderTasks();
    renderEncouragement();
    renderQuickActions();
    if (aiPanelOpen) {
      renderChatHistory();
    }
  });

  // ── AI sidebar send ──
  $aiSendBtn.addEventListener('click', () => sendAiMessage());
  $aiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAiMessage();
    }
  });

  $aiInput.addEventListener('input', () => {
    $aiInput.style.height = 'auto';
    $aiInput.style.height = Math.min($aiInput.scrollHeight, 100) + 'px';
  });

  // ── Decompose modal events ──
  document.getElementById('decomposeClose').addEventListener('click', closeDecompose);
  $decomposeOverlay.addEventListener('click', (e) => {
    if (e.target === $decomposeOverlay) closeDecompose();
  });
  document.getElementById('btnDecomposeAccept').addEventListener('click', acceptDecompose);
  document.getElementById('btnDecomposeRegenerate').addEventListener('click', () => startDecompose());

  // ── Review modal events ──
  document.getElementById('btnReviewClose').addEventListener('click', closeDailyReview);
  $reviewOverlay.addEventListener('click', (e) => {
    if (e.target === $reviewOverlay) closeDailyReview();
  });

  // ── Daily inline review card ──
  $dailyReviewHeader.addEventListener('click', toggleDailyReviewCard);
  document.getElementById('dailyReviewClose').addEventListener('click', () => {
    $dailyReview.style.display = 'none';
  });

  // ── Keyboard shortcuts ──
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'a') {
      e.preventDefault();
      toggleAiSidebar();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === ',') {
      e.preventDefault();
      document.getElementById('settingsOverlay').classList.add('open');
    }
    if (e.key === 'Escape') {
      if ($decomposeOverlay.classList.contains('open')) closeDecompose();
      else if ($reviewOverlay.classList.contains('open')) closeDailyReview();
      else if ($dashboardOverlay.classList.contains('open')) closeDashboard();
    }
  });

  // ═══════════════════════════════════════
  //  Dashboard & History Modal
  // ═══════════════════════════════════════

  function openDashboard() {
    renderDashboard();
    renderHistoryList();
    $dashboardOverlay.classList.add('open');
  }

  function closeDashboard() {
    $dashboardOverlay.classList.remove('open');
  }

  // Tab switching
  document.querySelectorAll('.dashboard-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      $dashboardTab.classList.toggle('hidden', target !== 'dashboard');
      $historyTab.classList.toggle('hidden', target !== 'history');
      if (target === 'dashboard') renderDashboard();
      else {
        renderHistoryViz();
        renderHistoryList();
      }
    });
  });

  document.getElementById('dashboardClose').addEventListener('click', closeDashboard);
  $dashboardOverlay.addEventListener('click', (e) => {
    if (e.target === $dashboardOverlay) closeDashboard();
  });
  document.getElementById('btnDashboard').addEventListener('click', openDashboard);
  document.getElementById('btnClearHistory').addEventListener('click', () => {
    if (confirm(t('historyClear') + '?')) {
      clearHistory();
      renderHistoryList();
    }
  });

  // ── Render Dashboard ──
  function renderDashboard() {
    const stats = getDashboardStats();

    // Stats cards
    document.getElementById('dashTodayDone').textContent = stats.today.completed;
    document.getElementById('dashTodayTotal').textContent = stats.today.total;
    document.getElementById('dashTodayRate').textContent = stats.today.rate + '%';
    document.getElementById('dashTodayCreated').textContent = stats.today.created;
    document.getElementById('dashWeekDone').textContent = stats.week.completed;
    document.getElementById('dashStreak').textContent = stats.streak;

    // 7-day trend chart
    const trendChart = document.getElementById('dashTrendChart');
    const maxTrend = Math.max(...stats.trend, 1);
    const days = t('dashboardDays');
    const today = new Date();
    trendChart.innerHTML = stats.trend.map((count, i) => {
      const dayDate = new Date(today);
      dayDate.setDate(dayDate.getDate() - (6 - i));
      const dayLabel = days[dayDate.getDay()];
      const heightPct = Math.round((count / maxTrend) * 100);
      const isToday = i === 6;
      return `
        <div class="dash-chart-bar-wrap">
          <div class="dash-chart-value">${count || ''}</div>
          <div class="dash-chart-bar${isToday ? ' today' : ''}" style="height:${Math.max(heightPct, 3)}%"></div>
          <div class="dash-chart-label">${dayLabel}</div>
        </div>`;
    }).join('');

    // Time distribution
    const maxPeriod = Math.max(stats.periods.morning, stats.periods.afternoon, stats.periods.evening, 1);
    document.getElementById('dashTimeBars').innerHTML = [
      { key: 'morning', label: t('dashboardMorning'), value: stats.periods.morning, cls: 'morning' },
      { key: 'afternoon', label: t('dashboardAfternoon'), value: stats.periods.afternoon, cls: 'afternoon' },
      { key: 'evening', label: t('dashboardEvening'), value: stats.periods.evening, cls: 'evening' },
    ].map(p => `
      <div class="dash-bar-item">
        <span class="dash-bar-label">${p.label}</span>
        <div class="dash-bar-track">
          <div class="dash-bar-fill ${p.cls}" style="width:${Math.max((p.value / maxPeriod) * 100, 2)}%"></div>
        </div>
        <span class="dash-bar-count">${p.value}</span>
      </div>`).join('');

    // Tag distribution
    const tagEntries = Object.entries(stats.tags).sort((a, b) => b[1] - a[1]);
    const maxTag = tagEntries.length > 0 ? tagEntries[0][1] : 1;
    const tagLabels = { creative: t('tagCreative'), execution: t('tagExecution'), closing: t('tagClosing') };
    const tagClasses = { creative: 'creative', execution: 'execution', closing: 'closing' };
    document.getElementById('dashTagBars').innerHTML = tagEntries.length === 0
      ? `<div style="color:#B8AD9E;font-size:12px;text-align:center;padding:8px 0;">-</div>`
      : tagEntries.map(([tag, count]) => `
        <div class="dash-bar-item">
          <span class="dash-bar-label">${tagLabels[tag] || tag}</span>
          <div class="dash-bar-track">
            <div class="dash-bar-fill ${tagClasses[tag] || ''}" style="width:${Math.max((count / maxTag) * 100, 2)}%"></div>
          </div>
          <span class="dash-bar-count">${count}</span>
        </div>`).join('');

    // Bottom stats
    document.getElementById('dashTotalDone').textContent = stats.totalCompleted;
    document.getElementById('dashAvgDay').textContent = stats.avgPerDay;
  }

  // ── Render History Visualization (Apple Sleep style) ──
  function renderHistoryViz() {
    const vizData = getHistoryVizData(28);
    const { dailyStats, weeklyData } = vizData;
    const lang = getLang();

    // Date range label
    const startDate = dailyStats[0]?.date;
    const endDate = dailyStats[dailyStats.length - 1]?.date;
    if (startDate && endDate) {
      const fmt = (d) => lang === 'zh'
        ? `${d.getMonth()+1}月${d.getDate()}日`
        : `${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}`;
      document.getElementById('historyVizRange').textContent = `${fmt(startDate)} — ${fmt(endDate)}`;
    }

    // Weekly grid: 4 rows × 7 columns
    const $chart = document.getElementById('historyVizChart');
    const daysZh = ['一', '二', '三', '四', '五', '六', '日'];
    const daysEn = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    // Find max value for intensity scaling
    const maxDaily = Math.max(...dailyStats.map(d => d.completed), 1);

    let html = '<div class="viz-grid">';

    // Day-of-week labels (left column)
    for (let row = 0; row < 7; row++) {
      const dayLabel = lang === 'zh' ? daysZh[row] : daysEn[row];
      html += `<div class="viz-day-label">${dayLabel}</div>`;
    }

    // Weekly columns
    weeklyData.forEach((week, weekIdx) => {
      // Pad first week if needed
      for (let row = 0; row < 7; row++) {
        // Map row to day of week: row 0 = Monday, ..., row 6 = Sunday
        const dayOfWeek = row; // 0=Mon, 6=Sun
        const dayData = week.days.find(d => {
          const dow = d.date.getDay();
          return (dow === 0 ? 6 : dow - 1) === dayOfWeek;
        });

        if (dayData) {
          const hasData = dayData.total > 0;
          const intensity = hasData ? Math.max(Math.ceil((dayData.completed / maxDaily) * 4), 1) : 0;
          const level = hasData ? (dayData.completed > 0 ? Math.min(intensity, 4) : 1) : 0;
          const isToday = dayData.date.toDateString() === new Date().toDateString();

          let dotCls = 'viz-dot';
          if (isToday) dotCls += ' today';
          if (level === 0) dotCls += ' empty';
          else if (dayData.completed > 0) dotCls += ` done level-${level}`;
          else dotCls += ' added';

          const tooltip = hasData
            ? `${lang === 'zh' ? '完成' : 'Done'}: ${dayData.completed}  ${lang === 'zh' ? '添加' : 'Added'}: ${dayData.added}`
            : (lang === 'zh' ? '无记录' : 'No data');

          html += `<div class="viz-cell" title="${tooltip}">
            <div class="${dotCls}"></div>
            ${isToday ? '<div class="viz-today-marker"></div>' : ''}
          </div>`;
        } else {
          html += `<div class="viz-cell"><div class="viz-dot empty"></div></div>`;
        }
      }
    });

    html += '</div>';

    // Weekly summary bars below the grid
    html += '<div class="viz-weekly-bars">';
    weeklyData.forEach((week, idx) => {
      const weekStart = week.days[0]?.date;
      const weekEnd = week.days[week.days.length - 1]?.date;
      const fmtW = (d) => lang === 'zh'
        ? `${d.getMonth()+1}/${d.getDate()}`
        : `${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}`;

      const maxWeek = Math.max(...weeklyData.map(w => w.completed), 1);
      const heightPct = Math.max((week.completed / maxWeek) * 100, 2);
      const isCurrentWeek = idx === weeklyData.length - 1;

      html += `
        <div class="viz-week-col${isCurrentWeek ? ' current' : ''}">
          <div class="viz-week-value">${week.completed || ''}</div>
          <div class="viz-week-bar-track">
            <div class="viz-week-bar-fill" style="height:${heightPct}%"></div>
          </div>
          <div class="viz-week-label">${fmtW(weekStart)}</div>
        </div>`;
    });
    html += '</div>';

    $chart.innerHTML = html;

    // Click handler on viz dots to scroll to that day's history
    $chart.querySelectorAll('.viz-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        const tooltip = cell.getAttribute('title') || '';
        if (tooltip && !tooltip.includes('No data') && !tooltip.includes('无记录')) {
          // Find the closest date and scroll to it in the history list
          const dateText = cell.querySelector('.viz-today-marker')
            ? new Date().toISOString().split('T')[0]
            : null;
          // For now just close the chart and show the list
          const targetGroup = document.querySelector('.history-group');
          if (targetGroup) targetGroup.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // ── Render History List (grouped by date) ──
  function renderHistoryList() {
    const history = loadHistory();
    const $list = document.getElementById('historyList');

    // Summary
    const $summary = document.getElementById('historyArchiveSummary');
    const totalComplete = history.filter(e => e.type === 'complete').length;
    const totalAdd = history.filter(e => e.type === 'add').length;
    $summary.textContent = t('historyArchiveSummary')(`${totalComplete}`, `${totalAdd}`);

    if (history.length === 0) {
      $list.innerHTML = `<div class="history-empty">${t('historyEmpty')}</div>`;
      return;
    }

    const iconMap = {
      add: { icon: '➕', cls: 'add', action: t('historyTaskAdded') },
      complete: { icon: '✅', cls: 'done', action: t('historyTaskCompleted') },
      delete: { icon: '🗑️', cls: 'del', action: t('historyTaskDeleted') },
    };

    const lang = getLang();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Group by date
    const groups = {};
    history.slice(0, 200).forEach(entry => {
      const d = new Date(entry.ts);
      d.setHours(0, 0, 0, 0);
      const key = d.getTime();
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });

    // Sort dates descending
    const sortedDates = Object.keys(groups).sort((a, b) => b - a);

    function formatDateLabel(timestamp) {
      const d = new Date(parseInt(timestamp));
      if (d.getTime() === today.getTime()) return t('historyToday') || '今天';
      if (d.getTime() === yesterday.getTime()) return t('historyYesterday') || '昨天';
      if (lang === 'zh') {
        return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
      }
      return `${d.getFullYear()}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}`;
    }

    function formatDateWeekday(timestamp) {
      const daysZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const d = new Date(parseInt(timestamp));
      // Skip weekday for today/yesterday
      if (d.getTime() === today.getTime() || d.getTime() === yesterday.getTime()) return '';
      const days = lang === 'zh' ? daysZh : daysEn;
      return days[d.getDay()];
    }

    $list.innerHTML = sortedDates.map(dateKey => {
      const entries = groups[dateKey];
      const dateLabel = formatDateLabel(dateKey);
      const weekday = formatDateWeekday(dateKey);
      const headerText = weekday ? `${dateLabel}  ${weekday}` : dateLabel;

      const items = entries.map(entry => {
        const info = iconMap[entry.type] || iconMap.add;
        const d = new Date(entry.ts);
        const timeStr = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
        return `
          <div class="history-item">
            <span class="history-icon ${info.cls}">${info.icon}</span>
            <div class="history-content">
              <div class="history-action">${info.action} <span class="history-name">${escapeHtml(entry.name)}</span></div>
              <div class="history-time">${timeStr}</div>
            </div>
          </div>`;
      }).join('');

      return `
        <div class="history-group">
          <div class="history-date-header">
            <span class="history-date-label">${headerText}</span>
            <span class="history-date-count">${entries.length} 条</span>
          </div>
          <div class="history-date-items">${items}</div>
        </div>`;
    }).join('');
  }

  // ═══════════════════════════════════════
  //  Init
  // ═══════════════════════════════════════

  applyI18N();
  renderDate();
  renderGreeting();
  renderTasks();
  renderStats();
  renderEncouragement();
  renderQuickActions();
  checkDailyReviewCard();

  setInterval(() => {
    renderGreeting();
    renderTasks();
    checkDailyReviewCard();
  }, 60000);

})();
