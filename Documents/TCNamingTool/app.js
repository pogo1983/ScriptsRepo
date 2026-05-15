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
  const charCounter   = document.getElementById("charCounter");
  const copyNLBtn     = document.getElementById("copyNL");
  const historyList   = document.getElementById("historyList");
  const clearHistBtn  = document.getElementById("clearHistory");
  const exportMDBtn   = document.getElementById("exportMD");
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

    const nl = buildNL(domain, entity, scenario, action, result);

    previewNL.textContent = nl || "—";
    previewNL.classList.remove("placeholder");

    // Char counter on NL
    const len = nl.length;
    charCounter.textContent = `${len} chars`;
    charCounter.className = "char-counter" + (len > 120 ? " over" : len > 90 ? " warn" : "");

    copyNLBtn.disabled = !nl;
    saveBtn.disabled = !nl;
  }

  function setPlaceholder() {
    previewNL.textContent = "Select domain, entity, scenario and action above…";
    previewNL.classList.add("placeholder");
    charCounter.textContent = "";
    charCounter.className = "char-counter";
    copyNLBtn.disabled = true;
    saveBtn.disabled = true;
  }

  // ── Copy to clipboard ─────────────────────────────────────────────────────
  function copyText(btn, text) {
    const flash = () => {
      const orig = btn.textContent;
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = orig; btn.classList.remove("copied"); }, 1500);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(flash).catch(() => fallbackCopy(text, flash));
    } else {
      fallbackCopy(text, flash);
    }
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    if (cb) cb();
  }

  copyNLBtn.addEventListener("click", () => copyText(copyNLBtn, previewNL.textContent));

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
    const nl = previewNL.textContent;
    if (!nl || previewNL.classList.contains("placeholder")) return;
    addToHistory(nl, "");

    saveBtn.textContent = "Saved!";
    setTimeout(() => saveBtn.textContent = "Save to History", 1500);
  });

  clearHistBtn.addEventListener("click", () => {
    localStorage.removeItem("tc_history");
    renderHistory();
  });

  exportMDBtn.addEventListener("click", () => {
    const h = loadHistory();
    if (!h.length) { alert("History is empty — save some TC names first."); return; }
    const md = h.map((item, i) => `${i + 1}. \`${item.nl}\``).join("\n");
    navigator.clipboard.writeText(md).then(() => {
      const orig = exportMDBtn.textContent;
      exportMDBtn.textContent = "Copied!";
      setTimeout(() => exportMDBtn.textContent = orig, 1800);
    });
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

  // ── Smart Lookup ──────────────────────────────────────────────────────────
  const lookupInput   = document.getElementById("lookupInput");
  const lookupResults = document.getElementById("lookupResults");

  // Common abbreviation expansions: typed token → words to add alongside
  const ABBREVS = {
    lgc:  ["ledger", "connector"],
    cha:  ["cha"],
    dd:   ["direct", "debit"],
    vr:   ["vr"],
    ir:   ["insurance", "request"],
    clr:  ["clearing"],
    irb:  ["irbroker"],
    ind:  ["invoicing", "dunning"],
    rnn:  ["rendering", "notification"],
    med:  ["mediation"],
    val:  ["validation"],
    acq:  ["acquisition"],
    bnm:  ["banking", "matching"],
    iip:  ["iip"],
    iam:  ["iam"],
    arp:  ["arp"],
    pa:   ["payment", "agreement"],
    pdp:  ["payment", "page"],
  };

  // Informal verb → formal action synonym expansions
  const SYNONYMS = {
    put:     ["process", "deliver", "store"],
    store:   ["process"],
    check:   ["validate"],
    make:    ["create"],
    build:   ["create"],
    run:     ["process"],
    do:      ["process"],
    execute: ["process"],
    show:    ["get"],
    view:    ["get"],
    handle:  ["process"],
    save:    ["create"],
    add:     ["create"],
    submit:  ["send"],
  };

  // Noise words to strip before scoring / matching
  const STOPWORDS = new Set([
    "then", "and", "the", "a", "an", "to", "via", "with", "for", "of",
    "is", "are", "was", "has", "in", "on", "by", "at", "from", "after",
    "before", "next", "also", "that", "it", "its",
  ]);

  // Split known compound tokens into their component words
  // e.g. "claimfile" → ["claim", "file"],  "paymentfile" → ["payment", "file"]
  function splitCompound(token) {
    const map = {
      claimfile:       ["claim", "file"],
      claimfiles:      ["claim", "file"],
      dpayws:          ["dpayws"],
      paymentfile:     ["payment", "file"],
      bankaccount:     ["bank", "account"],
      baaccount:       ["ba", "account"],
      matchableitem:   ["matchable", "item"],
      bankstatement:   ["bank", "statement"],
      paymentprovider: ["payment", "provider"],
      controldataprovider: ["controldata", "provider"],
      controldataproviders: ["controldata", "provider"],
      ledgerconnector: ["ledger", "connector"],
    };
    return map[token] || [token];
  }

  // Try to extract TC components from tokens for a given domain
  function extractComponents(rawTokens, domain) {
    // 1. Split compound words ("claimfile" → ["claim","file"]),
    //    expand abbreviations,
    //    expand informal synonyms
    const tokens = rawTokens.flatMap(t => splitCompound(t)).flatMap(t => {
      const exp = [...(ABBREVS[t] || []), ...(SYNONYMS[t] || [])];
      return exp.length ? [...new Set([t, ...exp])] : [t];
    });

    const entities = DATA.entities[domain] || [];
    const used     = new Set();

    // Mark tokens that just repeat the domain name so they don't leak into scenario
    tokens.forEach((t, i) => {
      if (domain.toLowerCase().split(/\s+/).some(w => w === t)) used.add(i);
    });

    // Matching: token t matches term part p if:
    //   exact, OR t is a meaningful prefix of p (>=3 chars), OR p starts with t (>=3 chars)
    function fits(t, p) {
      if (t === p) return true;
      if (t.length >= 3 && p.startsWith(t)) return true;
      if (t.length >= 3 && t.startsWith(p) && p.length >= 3) return true;
      return false;
    }

    function matchTerm(term) {
      const parts = term.toLowerCase().split(/\s+/);
      const idxs  = [];
      for (const part of parts) {
        const idx = tokens.findIndex((t, i) => !used.has(i) && fits(t, part));
        if (idx === -1) return null;
        idxs.push(idx);
      }
      return idxs;
    }

    // 1. Entity — longest match first
    let entity = null;
    for (const ent of [...entities].sort((a, b) => b.name.length - a.name.length)) {
      const idxs = matchTerm(ent.name);
      if (idxs) { entity = ent.name; idxs.forEach(i => used.add(i)); break; }
    }

    // 2. Action — longest (multi-word) first
    let action = null;
    for (const act of [...DATA.actions].sort((a, b) => b.length - a.length)) {
      const idxs = matchTerm(act);
      if (idxs) { action = act; idxs.forEach(i => used.add(i)); break; }
    }

    // 3. Result — longest first
    let result = null;
    for (const res of [...new Set(DATA.results)].sort((a, b) => b.length - a.length)) {
      const idxs = matchTerm(res);
      if (idxs) { result = res; idxs.forEach(i => used.add(i)); break; }
    }

    // 4. Scenario — domain-specific suggestions first, then global scenario terms
    let scenario = null;
    const domainScenarios = Object.entries(DATA.scenarios)
      .filter(([k]) => k.startsWith(domain + "|"))
      .flatMap(([, v]) => v);
    for (const sc of [...new Set(domainScenarios)].sort((a, b) => b.length - a.length)) {
      const idxs = matchTerm(sc);
      if (idxs) { scenario = sc; idxs.forEach(i => used.add(i)); break; }
    }

    // 5. Remaining meaningful tokens → scenario fallback (Title Case, skip abbreviation expansions)
    if (!scenario) {
      const remaining = rawTokens
        .filter(t => {
          // find where this raw token ended up in expanded tokens and check if used
          const expIdx = tokens.findIndex((et, i) => !used.has(i) && et === t);
          return expIdx !== -1;
        })
        .filter(t => t.length > 2 && !domain.toLowerCase().split(/\s+/).includes(t))
        .map(t => t.charAt(0).toUpperCase() + t.slice(1));
      if (remaining.length) scenario = remaining.join(" ");
    }

    return { entity, scenario, action, result };
  }

  lookupInput.addEventListener("input", () => {
    const raw = lookupInput.value.trim().toLowerCase();
    lookupResults.innerHTML = "";
    if (!raw || raw.length < 2) return;

    // Split, remove stopwords, split compound words
    const tokens = raw.split(/[\s,;→]+/)
      .filter(t => t.length > 1 && !STOPWORDS.has(t))
      .flatMap(t => splitCompound(t));

    const scored = DATA.lookup.map(entry => {
      let score = 0;
      const matched = [];
      tokens.forEach(token => {
        entry.aliases.forEach(a => {
          if (a.toLowerCase() === token)              { score += 5; matched.push(a); }
          else if (a.toLowerCase().startsWith(token)) { score += 3; matched.push(a); }
        });
        if (entry.domain.toLowerCase().includes(token)) { score += 3; matched.push(entry.domain); }
        entry.keywords.forEach(kw => {
          if (kw === token)                                         { score += 2; matched.push(kw); }
          else if (kw.includes(token))                             { score += 1; matched.push(kw); }
          // Short keyword prefix: "mz301" matches keyword "mz", "ap304" matches "ap"
          else if (kw.length <= 5 && token.startsWith(kw))        { score += 1; matched.push(kw); }
        });
      });
      // Component / service name scoring:
      // Each word from a component that appears in the query scores +2.
      // Multi-word components require ≥2 matching words; single-word require ≥1.
      (DATA.components || []).forEach(comp => {
        if (comp.domain !== entry.domain) return;
        const words = comp.name.toLowerCase().split(/[\s.\\/()\[\]]+/).filter(w => w.length > 1);
        const hits  = words.filter(w => tokens.some(t => t === w || (t.length >= 3 && w.startsWith(t))));
        const need  = words.length === 1 ? 1 : 2;
        if (hits.length >= need) {
          score += hits.length * 2;
          matched.push(comp.name);
        }
      });
      return { ...entry, score, matched: [...new Set(matched)].slice(0, 4) };
    })
      .filter(e => e.score >= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    if (!scored.length) {
      lookupResults.innerHTML =
        `<p class="lookup-empty">No matching domain found. Try: service name, abbreviation (bnm, lgc, clr…) or concept.</p>`;
      return;
    }

    scored.forEach(entry => {
      const dom     = DATA.domains.find(d => d.name === entry.domain);
      const cluster = DATA.clusters.find(c => c.name === (dom && dom.cluster));
      const bg      = cluster ? cluster.color : "#888";
      const fg      = cluster ? cluster.textColor : "#fff";

      // Build proposed TC name from input tokens
      const comp     = extractComponents(tokens, entry.domain);
      const proposed = [entry.domain, comp.entity, comp.scenario, comp.action, comp.result]
        .filter(Boolean).join(" - ");

      const el = document.createElement("div");
      el.className = "lookup-result";
      el.innerHTML = `
        <div class="lookup-top">
          <div class="lookup-chip" style="background:${bg};color:${fg}">
            ${entry.domain}
            ${dom ? `<span class="lookup-team-badge">${dom.team}</span>` : ""}
          </div>
          <div class="lookup-meta">
            <span class="lookup-note">${entry.note}</span>
            <span class="lookup-why">matched: ${entry.matched.join(" · ")}</span>
          </div>
        </div>
        <div class="lookup-proposal">
          <div class="lookup-proposed-name">${proposed}</div>
          <button class="lookup-copy-btn">Copy</button>
          <button class="lookup-use-btn">Use ↗</button>
        </div>`;

      // Domain chip → select domain only
      el.querySelector(".lookup-chip").addEventListener("click", () => {
        selectDomain(entry.domain);
        lookupInput.value = "";
        lookupResults.innerHTML = "";
        document.querySelector(".domain-chip.selected")
          ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });

      // Copy button → copy proposed name directly
      el.querySelector(".lookup-copy-btn").addEventListener("click", () => {
        copyText(el.querySelector(".lookup-copy-btn"), proposed);
      });

      // "Use" button → select domain + fill all fields
      el.querySelector(".lookup-use-btn").addEventListener("click", () => {
        selectDomain(entry.domain);
        // entitySel is rebuilt by selectDomain — wait one tick
        setTimeout(() => {
          if (comp.entity) {
            const opt = [...entitySel.options].find(o => o.value === comp.entity);
            if (opt) {
              entitySel.value = comp.entity;
              entitySel.dispatchEvent(new Event("change"));
            }
          }
          if (comp.scenario) scenarioInput.value = comp.scenario;
          if (comp.action)   actionInput.value   = comp.action;
          if (comp.result)   resultInput.value   = comp.result;
          updatePreview();
          lookupInput.value = "";
          lookupResults.innerHTML = "";
          document.querySelector(".domain-chip.selected")
            ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 30);
      });

      lookupResults.appendChild(el);
    });
  });

  // ── Init ──────────────────────────────────────────────────────────────────
  buildDomainGrid();
  setPlaceholder();
  renderHistory();
})();
