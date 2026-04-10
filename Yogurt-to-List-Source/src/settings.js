// ═══════════════════════════════════════
//  Settings page logic
//  Vendor/model/API key + feature toggles + connection test
// ═══════════════════════════════════════

(function initSettings() {
  // ── DOM cache ──
  const $overlay = document.getElementById('settingsOverlay');
  const $close = document.getElementById('settingsClose');
  const $save = document.getElementById('btnSaveSettings');
  const $reset = document.getElementById('btnResetSettings');
  const $test = document.getElementById('btnTestConnection');
  const $vendor = document.getElementById('settingVendor');
  const $model = document.getElementById('settingModel');
  const $apiKey = document.getElementById('settingApiKey');
  const $apiKeyToggle = document.getElementById('apiKeyToggle');
  const $status = document.getElementById('settingsStatus');
  const $statusCard = document.getElementById('connectionStatusCard');
  const $reviewTime = document.getElementById('reviewTime');

  const $toggleDecompose = document.getElementById('toggleDecompose');
  const $toggleChat = document.getElementById('toggleChat');
  const $toggleReview = document.getElementById('toggleReview');
  const $togglePriority = document.getElementById('togglePriority');

  // ── Populate vendors ──
  function populateVendors() {
    $vendor.innerHTML = `<option value="">${t('vendorPlaceholder')}</option>`;
    Object.entries(AI_PROVIDERS).forEach(([key, config]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = config.name;
      $vendor.appendChild(opt);
    });
  }

  // ── Update models by vendor ──
  function updateModels() {
    const vendor = $vendor.value;
    $model.innerHTML = '';

    if (!vendor || !AI_PROVIDERS[vendor]) {
      $model.innerHTML = `<option value="">${t('modelPlaceholder')}</option>`;
      return;
    }

    const config = AI_PROVIDERS[vendor];
    config.models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      $model.appendChild(opt);
    });

    if (aiSettings.model && config.models.includes(aiSettings.model)) {
      $model.value = aiSettings.model;
    }
  }

  // ── Open settings ──
  function openSettings() {
    $vendor.value = aiSettings.vendor || '';
    updateModels();
    $model.value = aiSettings.model || '';
    $apiKey.value = aiSettings.apiKey || '';
    $apiKey.type = 'password';

    $toggleDecompose.checked = aiSettings.features.decompose;
    $toggleChat.checked = aiSettings.features.chat;
    $toggleReview.checked = aiSettings.features.review;
    $togglePriority.checked = aiSettings.features.priority;

    $reviewTime.value = aiSettings.reviewTime || '21:00';

    clearStatus();
    applyI18N(); // Re-apply i18n when opening settings
    $overlay.classList.add('open');
  }

  function closeSettings() {
    $overlay.classList.remove('open');
  }

  // ── Save settings ──
  function save() {
    const vendor = $vendor.value;
    const model = $model.value;
    const apiKey = $apiKey.value.trim();

    if (!vendor) {
      showStatus(t('selectVendor'), 'error');
      return;
    }
    if (!model) {
      showStatus(t('selectModel'), 'error');
      return;
    }
    if (!apiKey) {
      showStatus(t('enterApiKey'), 'error');
      return;
    }

    aiSettings = {
      vendor,
      model,
      apiKey,
      features: {
        decompose: $toggleDecompose.checked,
        chat: $toggleChat.checked,
        review: $toggleReview.checked,
        priority: $togglePriority.checked
      },
      reviewTime: $reviewTime.value
    };
    saveSettings(aiSettings);
    showStatus(t('settingsSaved'), 'success');
    setTimeout(closeSettings, 600);
  }

  // ── Reset ──
  function reset() {
    if (!confirm(t('confirmReset'))) return;
    aiSettings = {
      vendor: '', model: '', apiKey: '',
      features: { decompose: true, chat: true, review: true, priority: true },
      reviewTime: '21:00'
    };
    saveSettings(aiSettings);
    openSettings();
  }

  // ── Test connection ──
  async function testConn() {
    const vendor = $vendor.value;
    const model = $model.value;
    const apiKey = $apiKey.value.trim();

    if (!vendor) { showStatus(t('selectVendorFirst'), 'error'); return; }
    if (!apiKey) { showStatus(t('enterApiKeyFirst'), 'error'); return; }

    $test.disabled = true;
    $test.textContent = t('testing');
    showStatus(t('testingStatus'), 'pending');
    $statusCard.classList.remove('visible');

    try {
      const result = await testConnection(vendor, apiKey, model);
      if (result.success) {
        const providerName = AI_PROVIDERS[vendor]?.name || vendor;
        showStatus(t('testSuccess'), 'success');
        $statusCard.className = 'settings-status-card visible success';
        $statusCard.innerHTML = t('latencyInfo')(providerName, model, result.latency);
      }
    } catch (err) {
      showStatus(t('testFailed'), 'error');
      $statusCard.className = 'settings-status-card visible error';
      $statusCard.textContent = err.message;
    } finally {
      $test.disabled = false;
      $test.textContent = t('testConnection');
    }
  }

  // ── Status display ──
  function showStatus(msg, type) {
    const dotClass = type === 'success' ? 'success' : type === 'error' ? 'error' : 'pending';
    const textClass = type === 'success' ? 'success' : type === 'error' ? 'error' : '';
    $status.innerHTML = `
      <span class="settings-status-dot ${dotClass}"></span>
      <span class="settings-status-text ${textClass}">${msg}</span>
    `;
  }

  function clearStatus() {
    $status.innerHTML = '';
    $statusCard.classList.remove('visible');
    $statusCard.className = 'settings-status-card';
  }

  // ── API Key visibility toggle ──
  function toggleApiKeyVisibility() {
    $apiKey.type = $apiKey.type === 'password' ? 'text' : 'password';
    $apiKeyToggle.textContent = $apiKey.type === 'password' ? '👁' : '🙈';
  }

  // ── Event bindings ──
  document.getElementById('btnSettings').addEventListener('click', openSettings);
  $close.addEventListener('click', closeSettings);
  $save.addEventListener('click', save);
  $reset.addEventListener('click', reset);
  $test.addEventListener('click', testConn);
  $vendor.addEventListener('change', updateModels);
  $apiKeyToggle.addEventListener('click', toggleApiKeyVisibility);

  $overlay.addEventListener('click', (e) => {
    if (e.target === $overlay) closeSettings();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $overlay.classList.contains('open')) {
      closeSettings();
    }
  });

  populateVendors();
})();
