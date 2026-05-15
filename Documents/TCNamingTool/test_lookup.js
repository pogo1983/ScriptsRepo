#!/usr/bin/env node
'use strict';
const fs = require('fs');

// ── Load DATA ────────────────────────────────────────────────────────────────
const dataSrc = fs.readFileSync(__dirname + '/data.js', 'utf8')
  .replace(/^const DATA/, 'global.DATA');
eval(dataSrc);
const DATA = global.DATA;

// ── Core logic (copied from app.js lines 286-445, unwrapped from IIFE) ──────
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

const STOPWORDS = new Set([
  "then", "and", "the", "a", "an", "to", "via", "with", "for", "of",
  "is", "are", "was", "has", "in", "on", "by", "at", "from", "after",
  "before", "next", "also", "that", "it", "its",
]);

const COMP_NOISE = new Set([
  'documents','document','details','list','overview','search','add','edit',
  'modal','modals','notes','messages','message','home','maintenance','todo',
  'history','popup','latest','other','overig','approvals','registration',
  'settings','items','management',
]);

function splitCompound(token) {
  const map = {
    claimfile:           ["claim", "file"],
    claimfiles:          ["claim", "file"],
    dpayws:              ["dpayws"],
    paymentfile:         ["payment", "file"],
    bankaccount:         ["bank", "account"],
    baaccount:           ["ba", "account"],
    matchableitem:       ["matchable", "item"],
    bankstatement:       ["bank", "statement"],
    paymentprovider:     ["payment", "provider"],
    controldataprovider: ["controldata", "provider"],
    controldataproviders:["controldata", "provider"],
    ledgerconnector:     ["ledger", "connector"],
  };
  return map[token] || [token];
}

function extractComponents(rawTokens, domain) {
  const tokens = rawTokens.flatMap(t => splitCompound(t)).flatMap(t => {
    const exp = [...(ABBREVS[t] || []), ...(SYNONYMS[t] || [])];
    return exp.length ? [...new Set([t, ...exp])] : [t];
  });

  const entities = DATA.entities[domain] || [];
  const used     = new Set();

  tokens.forEach((t, i) => {
    if (domain.toLowerCase().split(/\s+/).some(w => w === t)) used.add(i);
  });

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

  // 2. Action
  let action = null;
  for (const act of [...DATA.actions].sort((a, b) => b.length - a.length)) {
    const idxs = matchTerm(act);
    if (idxs) { action = act; idxs.forEach(i => used.add(i)); break; }
  }

  // 3. Result
  let result = null;
  for (const res of [...new Set(DATA.results)].sort((a, b) => b.length - a.length)) {
    const idxs = matchTerm(res);
    if (idxs) { result = res; idxs.forEach(i => used.add(i)); break; }
  }

  // 4. Scenario — domain-specific first
  let scenario = null;
  const domainScenarios = Object.entries(DATA.scenarios)
    .filter(([k]) => k.startsWith(domain + "|"))
    .flatMap(([, v]) => v);
  for (const sc of [...new Set(domainScenarios)].sort((a, b) => b.length - a.length)) {
    const idxs = matchTerm(sc);
    if (idxs) { scenario = sc; idxs.forEach(i => used.add(i)); break; }
  }

  // 5. Remaining tokens always appended to scenario
  {
    const isConsumed = rawTokens.map(rt => {
      const subs = splitCompound(rt);
      return subs.some(st => {
        const forms = new Set([st, ...(ABBREVS[st] || []), ...(SYNONYMS[st] || [])]);
        return [...forms].some(f => tokens.some((et, i) => et === f && used.has(i)));
      });
    });
    const remaining = rawTokens
      .filter((t, i) => !isConsumed[i])
      .filter(t => t.length > 2 && !domain.toLowerCase().split(/\s+/).includes(t))
      .map(t => t.charAt(0).toUpperCase() + t.slice(1));
    if (remaining.length) {
      scenario = scenario
        ? `${scenario} ${remaining.join(" ")}`
        : remaining.join(" ");
    }
  }

  return { entity, scenario, action, result };
}

// ── Scoring (mirrors app.js) ─────────────────────────────────────────────────
function lookup(rawInput) {
  const raw    = rawInput.trim().toLowerCase();
  const tokens = raw.split(/[\s,;→]+/)
    .filter(t => t.length > 1 && !STOPWORDS.has(t))
    .flatMap(t => splitCompound(t));

  return DATA.lookup.map(entry => {
    let score = 0;
    const matched = [];

    // Per-token alias / domain / keyword scoring
    tokens.forEach(token => {
      entry.aliases.forEach(a => {
        if (a.toLowerCase() === token)               { score += 5; matched.push(a); }
        else if (a.toLowerCase().startsWith(token))  { score += 3; matched.push(a); }
      });
      if (entry.domain.toLowerCase().includes(token)) { score += 3; matched.push(entry.domain); }
      let kwIncludes = 0;
      entry.keywords.forEach(kw => {
        if (kw === token)                              { score += 2; matched.push(kw); }
        else if (kw.includes(token) && kwIncludes < 4) { kwIncludes++; score += 1; matched.push(kw); }
        else if (kw.length <= 5 && token.startsWith(kw)) { score += 1; matched.push(kw); }
      });
    });

    // Multi-word alias bonus (+8 when ALL words match)
    entry.aliases.forEach(a => {
      const aWords = a.toLowerCase().split(/\s+/);
      if (aWords.length < 2) return;
      if (aWords.every(w => tokens.some(t =>
            t === w ||
            (t.length >= 3 && w.startsWith(t)) ||
            (w.length >= 3 && t.startsWith(w))))) {
        score += 8;
        matched.push(a);
      }
    });

    // Multi-word phrase bonus (+3 when ALL words match)
    entry.keywords.forEach(kw => {
      const kws = kw.split(/\s+/);
      if (kws.length < 2) return;
      if (kws.every(w => tokens.some(t =>
            t === w ||
            (t.length >= 3 && w.startsWith(t)) ||
            (w.length >= 3 && t.startsWith(w))))) {
        score += 3;
        matched.push(kw);
      }
    });

    // Component scoring (capped at +8, COMP_NOISE filtered, PascalCase split)
    let compScore = 0;
    let timScore  = 0; // timService boost cap (+4 per domain)
    (DATA.components || []).forEach(comp => {
      if (comp.domain !== entry.domain) return;
      if (compScore >= 8 && timScore >= 4) return;
      if (compScore < 8) {
        const words = comp.name
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
          .toLowerCase()
          .split(/[\s._\-\\/()[\]|]+/)
          .filter(w => w.length > 1 && !COMP_NOISE.has(w));
        const hits = words.filter(w => tokens.some(t =>
          t === w || (t.length >= 3 && w.startsWith(t))));
        const need = words.length === 1 ? 1 : 2;
        if (hits.length >= need) {
          const pts = Math.min(hits.length * 2, 8 - compScore);
          compScore += pts;
          score     += pts;
          matched.push(comp.name);
        }
      }
      // timService boost (capped at +4)
      if (comp.timService && timScore < 4) {
        const sw = comp.timService.toLowerCase()
          .split(/[\s._\-\\/()[\]|]+/)
          .filter(w => w.length > 2 && !/^\d+$/.test(w));
        const sh = sw.filter(w => tokens.some(t =>
          t === w || (t.length >= 4 && w.startsWith(t))));
        if (sh.length > 0) {
          const pts = Math.min(sh.length, 4 - timScore);
          timScore += pts;
          score    += pts;
          matched.push(...sh.slice(0, pts));
        }
      }
    });

    const comp     = extractComponents(tokens, entry.domain);
    const proposed = [entry.domain, comp.entity, comp.scenario, comp.action, comp.result]
      .filter(Boolean).join(' - ');

    return { domain: entry.domain, score, matched: [...new Set(matched)].slice(0, 5), proposed };
  })
  .filter(e => e.score >= 2)
  .sort((a, b) => b.score - a.score)
  .slice(0, 4);
}

// ── Test cases ───────────────────────────────────────────────────────────────
const tests = [
  ['claim receipt',                           'Vendor API'],
  ['retrocession',                            'Vendor API'],
  ['mediation channel monitor',               'Reception'],
  ['claimfile validator',                     'Reception'],
  ['ledger connector twinfield send documents','Accounting'],
  ['ledger connector afas upload',            'Accounting'],
  ['lgc twinfield',                           'Accounting'],
  ['irbroker insurance request',              'Insurers'],
  ['bad debtor inzicht check blockage',       'Invoicing and Dunning'],
  ['invoice debtor dunning create',           'Invoicing and Dunning'],
  ['payment agreement direct debit create',   'Banking'],
  ['clearing insurance request vr validate',  'Insurers'],
  ['vendor api claim receipt create',         'Vendor API'],
  ['third party connector',                   'Customer Configuration'],
  ['claim orchestration',                     'Claim Orchestration'],
  ['ind invoice create',                      'Invoicing and Dunning'],
  ['bnm dd match',                            'Banking'],
  ['clr vr validate',                         'Insurers'],
  ['feed online ledger',                      'Accounting'],
  ['transfer debt bailiff',                   'Bailiff'],
  ['send ba report',                          'Templating and Messaging'],
  ['order payment direct debit',              'Banking'],
  ['register ba contract business account',   'Customer Configuration'],
  ['payment matching camt batch',             'Payment Matching'],
];

// ── Run ───────────────────────────────────────────────────────────────────────
let pass = 0, fail = 0;
const SEP = '='.repeat(100);
console.log(SEP);
console.log('SMART LOOKUP TEST   ★=top result   ✓=correct domain   ❌=wrong top');
console.log(SEP);

tests.forEach(([input, exp]) => {
  const res = lookup(input);
  const top = res[0];
  const ok  = top && top.domain === exp;
  if (ok) pass++; else fail++;

  console.log(`\n${ok ? '✓' : '❌'} "${input}"   → expected: ${exp}`);
  if (!res.length) { console.log('     no results'); return; }
  res.forEach((r, i) => {
    const slots = r.proposed.split(' - ').length;
    const flag  = slots < 3 ? ' ⚠' : '';
    console.log(`  ${i === 0 ? '★' : ' '}[${String(r.score).padStart(2)}] ${r.proposed}${flag}`);
    if (i === 0) console.log(`         matched: ${r.matched.join(', ')}`);
  });
});

console.log('\n' + SEP);
console.log(`RESULT: ${pass}/${tests.length} PASS,  ${fail}/${tests.length} FAIL`);
