(() => {
  // ── Helpers ──────────────────────────────────────────────────────────────

  function toCamel(str) {
    if (!str) return "";
    // Preserve all-caps tokens (AP304, IAM, DPAYWS, etc.)
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, c => c.toUpperCase());
  }

  function buildNL(domain, entity, scenario, action, result) {
    const parts = [domain, entity, scenario, action, result].filter(Boolean);
    return parts.join(" - ");
  }

  function buildTech(domain, entity, scenario, action, result) {
    const d = DATA.domains.find(x => x.name === domain);
    const e = (DATA.entities[domain] || []).find(x => x.name === entity);
    const dStr = d ? d.camel : toCamel(domain);
    const eStr = e ? e.camel : toCamel(entity);
    const sStr = toCamel(scenario);
    const aStr = toCamel(action);
    const rStr = toCamel(result);
    return [dStr, eStr, sStr, aStr, rStr].filter(Boolean).join("_");
  }

  function clusterColor(clusterName) {
    const c = DATA.clusters.find(x => x.name === clusterName);
    return c ? c.color : "#999";
  }
  function clusterText(clusterName) {
    const c = DATA.clusters.find(x => x.name === clusterName);
    return c ? c.textColor : "#fff";
  }

  // ── State ─────────────────────────────────────────────────────────────────
  let selectedDomain = "";

  // ── DOM refs ─────────────────────────────────────────────────────────────
  const domainGrid    = document.getElementById("domainGrid");
  const entitySel     = document.getElementById("entitySel");
  const scenarioInput = document.getElementById("scenarioInput");
  const actionInput   = document.getElementById("actionInput");
  const resultInput   = document.getElementById("resultInput");
  const previewNL     = document.getElementById("previewNL");
  const previewTech   = document.getElementById("previewTech");
  const charCounter   = document.getElementById("charCounter");
  const copyNLBtn     = document.getElementById("copyNL");
  const copyTechBtn   = document.getElementById("copyTech");
  const historyList   = document.getElementById("historyList");
  const clearHistBtn  = document.getElementById("clearHistory");
  const resetBtn      = document.getElementById("resetBtn");
  const scenarioList  = document.getElementById("scenarioSuggestions");
  const saveBtn       = document.getElementById("saveBtn");

  // ── Build domain chips ────────────────────────────────────────────────────
  function buildDomainGrid() {
    domainGrid.innerHTML = "";
    DATA.clusters.forEach(cluster => {
      const label = document.createElement("div");
      label.className = "cluster-label";
      label.textContent = cluster.name;
      domainGrid.appendChild(label);

      const row = document.createElement("div");
      row.className = "domain-grid";

      DATA.domains
        .filter(d => d.cluster === cluster.name)
        .forEach(domain => {
          const chip = document.createElement("div");
          chip.className = "domain-chip";
          chip.dataset.domain = domain.name;
          chip.style.background = cluster.color;
          chip.style.color = cluster.textColor;
          chip.innerHTML = `${domain.name} <span class="team-badge">${domain.team}</span>`;
          chip.addEventListener("click", () => selectDomain(domain.name));
          row.appendChild(chip);
        });

      domainGrid.appendChild(row);
    });
  }

  // ── Select domain ─────────────────────────────────────────────────────────
  function selectDomain(name) {
    selectedDomain = name;

    // Update chip highlight
    document.querySelectorAll(".domain-chip").forEach(c => {
      c.classList.toggle("selected", c.dataset.domain === name);
    });

    // Populate entity dropdown
    const entities = DATA.entities[name] || [];
    entitySel.innerHTML = `<option value="">— select entity —</option>`;
    entities.forEach(e => {
      const opt = document.createElement("option");
      opt.value = e.name;
      opt.textContent = e.name;
      entitySel.appendChild(opt);
    });
    entitySel.disabled = false;

    // Clear downstream fields
    scenarioInput.value = "";
    actionInput.value   = "";
    resultInput.value   = "";
    updateScenarioSuggestions("", "");
    updatePreview();
  }

  // ── Scenario suggestions ──────────────────────────────────────────────────
  function updateScenarioSuggestions(domain, entity) {
    scenarioList.innerHTML = "";
    const key = `${domain}|${entity}`;
    const suggestions = (DATA.scenarios[key] || []);
    suggestions.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      scenarioList.appendChild(opt);
    });
  }

  // ── Live preview ──────────────────────────────────────────────────────────
  function updatePreview() {
    const domain   = selectedDomain;
    const entity   = entitySel.value;
    const scenario = scenarioInput.value.trim();
    const action   = actionInput.value.trim();
    const result   = resultInput.value.trim();

    if (!domain && !entity && !scenario && !action) {
      setPlaceholder();
      return;
    }

    const nl   = buildNL(domain, entity, scenario, action, result);
    const tech = buildTech(domain, entity, scenario, action, result);

    previewNL.textContent   = nl   || "—";
    previewTech.textContent = tech || "—";
    previewNL.classList.remove("placeholder");
    previewTech.classList.remove("placeholder");

    // Char counter on NL
    const len = nl.length;
    charCounter.textContent = `${len} chars`;
    charCounter.className = "char-counter" + (len > 120 ? " over" : len > 90 ? " warn" : "");

    copyNLBtn.disabled   = !nl;
    copyTechBtn.disabled = !tech;
  }

  function setPlaceholder() {
    previewNL.textContent   = "Select domain, entity, scenario and action above…";
    previewTech.textContent = "";
    previewNL.classList.add("placeholder");
    previewTech.classList.add("placeholder");
    charCounter.textContent = "";
    charCounter.className = "char-counter";
    copyNLBtn.disabled   = true;
    copyTechBtn.disabled = true;
  }

  // ── Copy to clipboard ─────────────────────────────────────────────────────
  function copyText(btn, text) {
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = orig; btn.classList.remove("copied"); }, 1500);
    });
  }

  copyNLBtn.addEventListener("click", () => copyText(copyNLBtn, previewNL.textContent));
  copyTechBtn.addEventListener("click", () => copyText(copyTechBtn, previewTech.textContent));

  // ── Save to history ───────────────────────────────────────────────────────
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem("tc_history") || "[]"); }
    catch { return []; }
  }
  function saveHistory(h) {
    localStorage.setItem("tc_history", JSON.stringify(h.slice(0, 20)));
  }

  function addToHistory(nl, tech) {
    const h = loadHistory();
    // Avoid exact duplicates at top
    if (h.length && h[0].nl === nl) return;
    h.unshift({ nl, tech, ts: Date.now() });
    saveHistory(h);
    renderHistory();
  }

  function renderHistory() {
    const h = loadHistory();
    historyList.innerHTML = "";
    if (!h.length) {
      historyList.innerHTML = `<li class="empty-history">No saved names yet.</li>`;
      return;
    }
    h.forEach((item, i) => {
      const li = document.createElement("li");
      li.className = "history-item";
      li.innerHTML = `
        <div>
          <div class="nl">${item.nl}</div>
          <div class="tech">${item.tech}</div>
        </div>
        <button class="history-copy" data-idx="${i}" title="Copy NL to clipboard">Copy NL</button>`;
      historyList.appendChild(li);
    });

    historyList.querySelectorAll(".history-copy").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = loadHistory()[+btn.dataset.idx];
        if (item) copyText(btn, item.nl);
      });
    });
  }

  saveBtn.addEventListener("click", () => {
    const nl   = previewNL.textContent;
    const tech = previewTech.textContent;
    if (!nl || previewNL.classList.contains("placeholder")) return;
    addToHistory(nl, tech);

    saveBtn.textContent = "Saved!";
    setTimeout(() => saveBtn.textContent = "Save", 1500);
  });

  clearHistBtn.addEventListener("click", () => {
    localStorage.removeItem("tc_history");
    renderHistory();
  });

  // ── Reset ─────────────────────────────────────────────────────────────────
  resetBtn.addEventListener("click", () => {
    selectedDomain = "";
    document.querySelectorAll(".domain-chip").forEach(c => c.classList.remove("selected"));
    entitySel.innerHTML = `<option value="">— select domain first —</option>`;
    entitySel.disabled  = true;
    scenarioInput.value = "";
    actionInput.value   = "";
    resultInput.value   = "";
    updateScenarioSuggestions("", "");
    setPlaceholder();
  });

  // ── Listeners ─────────────────────────────────────────────────────────────
  entitySel.addEventListener("change", () => {
    updateScenarioSuggestions(selectedDomain, entitySel.value);
    updatePreview();
  });
  [scenarioInput, actionInput, resultInput].forEach(el =>
    el.addEventListener("input", updatePreview)
  );

  // ── Init ──────────────────────────────────────────────────────────────────
  buildDomainGrid();
  setPlaceholder();
  renderHistory();
})();
