// ==================== TEST PLAN BUILDER MODULE ====================

let tpbState = {
    queryItems: [],       // work items from WIQL query
    existingSuites: [],   // suites currently in the selected plan
    planId: null,
    planName: null,
    allTCs: {},           // cache: workItemId -> [{id, title, areaPath, tags, createdBy, testedByExists}]
    allPlans: []          // cached full plan list (with state)
};

// ==================== INITIALIZATION ====================

async function tpbInit() {
    if (!config.organization || !config.project || !config.pat) {
        tpbShowError('Please configure Organization, Project, and PAT in Settings first.');
        return;
    }
    if (config.areaPath) {
        document.getElementById('tpbAreaPath').value = config.areaPath;
    }
    await tpbLoadTestPlans();
}

// ==================== LOAD TEST PLANS ====================

async function tpbLoadTestPlans() {
    const select = document.getElementById('tpbPlanSelect');
    select.innerHTML = '<option value="">Loading...</option>';
    try {
        const url = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans?api-version=7.1-preview.1`;
        const response = await fetch(url, {
            headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) }
        });
        if (!response.ok) throw new Error(`Failed to load test plans: ${response.statusText}`);
        const data = await response.json();
        tpbState.allPlans = (data.value || []).sort((a, b) => b.id - a.id);
        tpbFilterPlans();
    } catch (err) {
        select.innerHTML = '<option value="">-- Failed to load --</option>';
        tpbShowError(err.message);
    }
}

function tpbFilterPlans() {
    const checked = document.querySelector('input[name="tpbPlanStatus"]:checked');
    const filter = checked ? checked.value : 'active';
    const select = document.getElementById('tpbPlanSelect');
    const plans = tpbState.allPlans.filter(p => {
        const state = (p.state || '').toLowerCase();
        if (filter === 'active')   return state === 'active';
        if (filter === 'inactive') return state === 'inactive';
        return true; // 'all'
    });
    select.innerHTML = '<option value="">-- Select existing plan --</option><option value="new">➕ Create new plan...</option>';
    plans.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.name} (ID: ${p.id})`;
        select.appendChild(opt);
    });
    // update count label
    const countEl = document.getElementById('tpbPlanCount');
    if (countEl) countEl.textContent = `${plans.length} plan(s) shown`;
}

function tpbOnPlanSelectChange() {
    const val = document.getElementById('tpbPlanSelect').value;
    document.getElementById('tpbNewPlanRow').style.display = val === 'new' ? 'flex' : 'none';
    tpbHideResults();
}

// ==================== ANALYZE ====================

async function tpbAnalyzeDelta() {
    tpbClearError();
    tpbHideResults();

    const plannedRelease = document.getElementById('tpbPlannedRelease').value.trim();
    const tag = document.getElementById('tpbTag').value.trim();
    const planSelectVal = document.getElementById('tpbPlanSelect').value;

    if (!plannedRelease) { tpbShowError('Please enter Planned Release.'); return; }
    if (!planSelectVal) { tpbShowError('Please select a Test Plan or choose to create a new one.'); return; }
    if (planSelectVal === 'new' && !document.getElementById('tpbNewPlanName').value.trim()) {
        tpbShowError('Please enter a name for the new Test Plan.'); return;
    }

    tpbShowLoading(true, 'Fetching work items...');
    try {
        // Step 1: WIQL -> work items with relations
        const queryItems = await tpbFetchQueryItems(plannedRelease, tag);
        if (queryItems.length === 0) {
            tpbShowError('No work items found for the given filters.');
            tpbShowLoading(false);
            return;
        }

        tpbShowLoading(true, `Found ${queryItems.length} work items. Fetching existing suites...`);

        // Step 2: Existing suites in plan (fetch first so we can merge TC sources)
        let existingSuites = [];
        if (planSelectVal !== 'new') {
            existingSuites = await tpbFetchExistingSuites(planSelectVal);
        }

        // Step 3: Get ALL TC details — from TestedBy relations + TCs already in suite
        tpbShowLoading(true, 'Loading Test Cases (TestedBy + existing suites)...');
        await tpbLoadAllTCs(queryItems, existingSuites);

        tpbState.queryItems = queryItems;
        tpbState.existingSuites = existingSuites;

        tpbShowLoading(false);
        tpbRenderResults(queryItems, existingSuites);

    } catch (err) {
        tpbShowLoading(false);
        tpbShowError(`Error: ${err.message}`);
        console.error(err);
    }
}

// ==================== WIQL ====================

async function tpbFetchQueryItems(plannedRelease, tag) {
    let wiql = `SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = '${config.project}'`;
    wiql += ` AND [Custom.plannedrelease] = '${plannedRelease}'`;
    wiql += ` AND [System.WorkItemType] IN ('Bug', 'User Story', 'TestFeedback')`;
    if (tag) wiql += ` AND [System.Tags] CONTAINS '${tag}'`;
    wiql += ` ORDER BY [System.Id]`;

    const response = await fetch(
        `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/wiql?api-version=7.0`,
        {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: wiql })
        }
    );
    if (!response.ok) throw new Error(`WIQL query failed: ${response.statusText}`);
    const data = await response.json();
    const ids = (data.workItems || []).map(wi => wi.id);
    if (ids.length === 0) return [];

    let allItems = [];
    for (let i = 0; i < ids.length; i += 200) {
        const batch = ids.slice(i, i + 200);
        const batchRes = await fetch(
            `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems?ids=${batch.join(',')}&$expand=relations&api-version=7.0`,
            { headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) } }
        );
        if (!batchRes.ok) throw new Error(`Failed to fetch work items: ${batchRes.statusText}`);
        const batchData = await batchRes.json();
        allItems = allItems.concat(batchData.value || []);
    }
    return allItems;
}

// ==================== LOAD ALL TCs FOR ALL WIs ====================

async function tpbLoadAllTCs(queryItems, existingSuites = []) {
    tpbState.allTCs = {};

    // Build suite lookup: wiId -> Set of tcIds currently in suite
    const suitesTcByWiId = {};
    existingSuites.forEach(s => { if (s.workItemId) suitesTcByWiId[s.workItemId] = new Set(s.tcIds); });

    // Collect all TC IDs from TestedBy relations AND from existing suites
    const tcIdSet = new Set();
    const wiTestedByMap = {}; // wiId -> Set of tcIds that have TestedBy relation on WI

    for (const item of queryItems) {
        const testedByIds = (item.relations || [])
            .filter(r => r.rel === 'Microsoft.VSTS.Common.TestedBy-Forward')
            .map(r => parseInt(r.url.split('/').pop()))
            .filter(id => !isNaN(id));
        wiTestedByMap[item.id] = new Set(testedByIds);
        testedByIds.forEach(id => tcIdSet.add(id));
        // Also collect TCs from existing suite (may not have TestedBy relation)
        const suiteTcIds = suitesTcByWiId[item.id] || new Set();
        suiteTcIds.forEach(id => tcIdSet.add(id));
    }

    // Fetch all TC details in batches
    const allTcIds = Array.from(tcIdSet);
    const tcDetails = {}; // id -> {id, title, areaPath, tags, createdBy}
    for (let i = 0; i < allTcIds.length; i += 200) {
        const batch = allTcIds.slice(i, i + 200);
        const res = await fetch(
            `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems?ids=${batch.join(',')}&fields=System.Id,System.Title,System.AreaPath,System.Tags,System.CreatedBy&api-version=7.0`,
            { headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) } }
        );
        if (!res.ok) continue;
        const data = await res.json();
        (data.value || []).forEach(tc => {
            tcDetails[tc.id] = {
                id: tc.id,
                title: tc.fields['System.Title'] || '',
                areaPath: tc.fields['System.AreaPath'] || '',
                tags: tc.fields['System.Tags'] || '',
                createdBy: tc.fields['System.CreatedBy']?.displayName || tc.fields['System.CreatedBy'] || ''
            };
        });
    }

    // Build allTCs per WI — merge both sources, annotate each TC with flags
    for (const item of queryItems) {
        const testedByIds = wiTestedByMap[item.id] || new Set();
        const suiteTcIds = suitesTcByWiId[item.id] || new Set();
        const allIds = new Set([...testedByIds, ...suiteTcIds]);
        tpbState.allTCs[item.id] = Array.from(allIds)
            .map(id => {
                const tc = tcDetails[id];
                if (!tc) return undefined;
                return { ...tc, testedByExists: testedByIds.has(id), inSuite: suiteTcIds.has(id) };
            })
            .filter(tc => tc !== undefined);
    }
}

// ==================== FETCH EXISTING SUITES ====================

async function tpbFetchExistingSuites(planId) {
    const response = await fetch(
        `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}/suites?api-version=7.1-preview.1`,
        { headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) } }
    );
    if (!response.ok) throw new Error(`Failed to fetch suites: ${response.statusText}`);
    const data = await response.json();
    const suites = (data.value || []).filter(s => s.suiteType?.toLowerCase() === 'statictestsuite');

    return await Promise.all(suites.map(async suite => {
        const tcIds = await tpbFetchSuiteTestCaseIds(planId, suite.id);
        const match = suite.name.match(/^(\d+)\s*:/);
        return {
            suiteId: suite.id,
            suiteName: suite.name,
            workItemId: match ? parseInt(match[1]) : null,
            tcIds: tcIds
        };
    }));
}

async function tpbFetchSuiteTestCaseIds(planId, suiteId) {
    const response = await fetch(
        `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}/suites/${suiteId}/testcase?api-version=7.1-preview.3`,
        { headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.value || []).map(tc => {
        const rawId = tc.testCase?.id ?? tc.workItem?.id;
        return rawId !== undefined ? parseInt(rawId) : undefined;
    }).filter(id => id !== undefined && !isNaN(id));
}

// ==================== RENDER RESULTS ====================

function tpbRenderResults(queryItems, existingSuites) {
    const panel = document.getElementById('tpbResultsPanel');
    const suitesByWiId = {};
    existingSuites.forEach(s => { if (s.workItemId) suitesByWiId[s.workItemId] = s; });

    const newItems = queryItems.filter(i => !suitesByWiId[i.id]);
    const existingItems = queryItems.filter(i => suitesByWiId[i.id]);
    const orphans = existingSuites.filter(s => s.workItemId && !queryItems.find(i => i.id === s.workItemId));

    let html = '';

    // Summary bar
    html += `<div class="tpb-summary-bar">
        <span class="tpb-badge tpb-badge-new">🆕 ${newItems.length} new suites</span>
        <span class="tpb-badge tpb-badge-update">📁 ${existingItems.length} existing suites</span>
        ${orphans.length > 0 ? `<span class="tpb-badge tpb-badge-warn">⚠️ ${orphans.length} orphan suites</span>` : ''}
    </div>`;

    // TC filter bar
    html += `<div class="tpb-filter-bar">
        <strong style="font-size:13px;"><i class="fas fa-filter"></i> Filter Test Cases:</strong>
        <select id="tpbTcFilterRelation" onchange="tpbApplyTcFilters()" style="font-size:12px; padding:4px 8px; border:1px solid #ddd; border-radius:4px;">
            <option value="all">All TCs</option>
            <option value="no-testedby">⚠️ Missing TestedBy only</option>
            <option value="testedby-only">✅ Has TestedBy only</option>
        </select>
        <input type="text" id="tpbTcFilterArea" placeholder="Area Path contains..." style="width:165px; font-size:12px; padding:4px 8px; border:1px solid #ddd; border-radius:4px;" oninput="tpbApplyTcFilters()" />
        <input type="text" id="tpbTcFilterCreatedBy" placeholder="Created By contains..." style="width:150px; font-size:12px; padding:4px 8px; border:1px solid #ddd; border-radius:4px;" oninput="tpbApplyTcFilters()" />
        <input type="text" id="tpbTcFilterTag" placeholder="Tag contains..." style="width:125px; font-size:12px; padding:4px 8px; border:1px solid #ddd; border-radius:4px;" oninput="tpbApplyTcFilters()" />
        <button class="btn-secondary" onclick="tpbClearTcFilters()" style="font-size:11px; padding:4px 8px;"><i class="fas fa-times"></i> Clear</button>
        <button class="btn-secondary" onclick="tpbSelectAllVisible()" style="font-size:11px; padding:4px 8px;"><i class="fas fa-check-square"></i> Select all visible</button>
        <button class="btn-secondary" onclick="tpbDeselectAllVisible()" style="font-size:11px; padding:4px 8px;"><i class="fas fa-square"></i> Deselect all</button>
    </div>`;

    // NEW suites
    if (newItems.length > 0) {
        html += `<div class="tpb-delta-group"><div class="tpb-delta-group-title"><span class="tpb-badge tpb-badge-new">🆕 New suites — will be created</span></div>`;
        newItems.forEach(item => {
            html += tpbRenderWorkItemRow(item, null, 'new');
        });
        html += `</div>`;
    }

    // EXISTING suites
    if (existingItems.length > 0) {
        html += `<div class="tpb-delta-group"><div class="tpb-delta-group-title"><span class="tpb-badge tpb-badge-update">📁 Existing suites — select TCs to add</span></div>`;
        existingItems.forEach(item => {
            html += tpbRenderWorkItemRow(item, suitesByWiId[item.id], 'existing');
        });
        html += `</div>`;
    }

    // ORPHANS
    if (orphans.length > 0) {
        html += `<div class="tpb-delta-group"><div class="tpb-delta-group-title"><span class="tpb-badge tpb-badge-warn">⚠️ Orphan suites — in plan but not in query</span></div>
            <div style="font-size:12px; color:#856404; padding: 6px 8px;">These suites exist in the plan but work items are not in the current query. No action will be taken.</div>`;
        orphans.forEach(s => {
            html += `<div class="tpb-delta-row tpb-row-warn">Suite ${s.suiteId}: ${escapeHtml(s.suiteName)}</div>`;
        });
        html += `</div>`;
    }

    document.getElementById('tpbResultsBody').innerHTML = html;
    panel.style.display = 'block';
    document.getElementById('tpbApplyBtn').style.display = 'inline-flex';
    document.getElementById('tpbTestedByRow').style.display = 'inline-flex';
}

function tpbRenderWorkItemRow(item, existingSuite, mode) {
    const tcs = tpbState.allTCs[item.id] || [];
    const wiType = item.fields['System.WorkItemType'];
    const wiTitle = item.fields['System.Title'];
    const countToAdd = tcs.filter(tc => tc.testedByExists && !tc.inSuite).length;
    const countMissingTby = tcs.filter(tc => tc.inSuite && !tc.testedByExists).length;

    let html = `<div class="tpb-wi-row" data-wi-id="${item.id}">
        <div class="tpb-wi-header">
            <span class="tpb-wi-type tpb-type-${wiType.replace(' ', '').toLowerCase()}">${wiType}</span>
            <strong>#${item.id}</strong> ${escapeHtml(wiTitle)}
            <span class="tpb-tc-count" id="tpb-tc-count-${item.id}">${countToAdd} to add${countMissingTby > 0 ? `, ⚠️ ${countMissingTby} missing TestedBy` : ''}</span>
        </div>`;

    if (tcs.length === 0) {
        html += `<div style="font-size:12px; color:#6c757d; padding:4px 8px 8px;">No Test Cases found (no TestedBy relation and not in any suite)</div>`;
    } else {
        html += `<div class="tpb-tc-list" id="tpb-tc-list-${item.id}">`;
        tcs.forEach(tc => {
            // Classify TC state
            const bothDone      = tc.inSuite && tc.testedByExists;   // already complete — disabled
            const addToSuite    = tc.testedByExists && !tc.inSuite;  // has TestedBy, not yet in suite
            const missingTbyTC  = tc.inSuite && !tc.testedByExists; // in suite, missing TestedBy relation

            const checkedAttr  = bothDone ? '' : 'checked';
            const disabledAttr = bothDone ? 'disabled' : '';
            const action       = missingTbyTC ? 'add-tested-by' : 'add-to-suite';
            const extraClass   = missingTbyTC ? ' tpb-tc-no-testedby' : '';

            let statusBadge = '';
            if (bothDone)     statusBadge = `<span class="tpb-tc-badge tpb-badge-done">✅ in suite + has TestedBy</span>`;
            else if (addToSuite)   statusBadge = `<span class="tpb-tc-badge tpb-badge-new">➕ add to suite</span>`;
            else if (missingTbyTC) statusBadge = `<span class="tpb-tc-badge tpb-badge-warn">⚠️ in suite, missing TestedBy</span>`;

            html += `<label class="tpb-tc-item${extraClass}" data-area="${escapeHtml(tc.areaPath)}" data-created="${escapeHtml(tc.createdBy)}" data-tags="${escapeHtml(tc.tags)}" data-has-tested-by="${tc.testedByExists ? '1' : '0'}" data-in-suite="${tc.inSuite ? '1' : '0'}">
                <input type="checkbox" class="tpb-tc-check" data-wi-id="${item.id}" data-tc-id="${tc.id}" data-action="${action}" ${checkedAttr} ${disabledAttr} onchange="tpbUpdateCount(${item.id})" />
                <span class="tpb-tc-title">${escapeHtml(tc.title)}</span>
                <span class="tpb-tc-meta">${escapeHtml(tc.areaPath)}</span>
                <span class="tpb-tc-meta">${escapeHtml(tc.createdBy)}</span>
                ${statusBadge}
            </label>`;
        });
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

function tpbUpdateCount(wiId) {
    const checked = document.querySelectorAll(`.tpb-tc-check[data-wi-id="${wiId}"]:checked:not(:disabled)`).length;
    const el = document.getElementById(`tpb-tc-count-${wiId}`);
    if (el) el.textContent = `${checked} TC selected`;
}

// ==================== TC FILTERS ====================

function tpbApplyTcFilters() {
    const areaFilter     = document.getElementById('tpbTcFilterArea').value.toLowerCase();
    const createdFilter  = document.getElementById('tpbTcFilterCreatedBy').value.toLowerCase();
    const tagFilter      = document.getElementById('tpbTcFilterTag').value.toLowerCase();
    const relationFilter = document.getElementById('tpbTcFilterRelation').value;

    document.querySelectorAll('.tpb-tc-item').forEach(item => {
        const area         = item.dataset.area.toLowerCase();
        const created      = item.dataset.created.toLowerCase();
        const tags         = item.dataset.tags.toLowerCase();
        const hasTestedBy  = item.dataset.hasTestedBy === '1';

        const relationMatch =
            relationFilter === 'all' ||
            (relationFilter === 'no-testedby'    && !hasTestedBy) ||
            (relationFilter === 'testedby-only'  &&  hasTestedBy);

        const visible =
            relationMatch &&
            (!areaFilter    || area.includes(areaFilter)) &&
            (!createdFilter || created.includes(createdFilter)) &&
            (!tagFilter     || tags.includes(tagFilter));

        item.style.display = visible ? '' : 'none';
    });
}

function tpbClearTcFilters() {
    document.getElementById('tpbTcFilterArea').value = '';
    document.getElementById('tpbTcFilterCreatedBy').value = '';
    document.getElementById('tpbTcFilterTag').value = '';
    document.getElementById('tpbTcFilterRelation').value = 'all';
    tpbApplyTcFilters();
}

function tpbSelectAllVisible() {
    document.querySelectorAll('.tpb-tc-item:not([style*="display: none"]) .tpb-tc-check:not(:disabled)').forEach(cb => {
        cb.checked = true;
        const wiId = parseInt(cb.dataset.wiId);
        tpbUpdateCount(wiId);
    });
}

function tpbDeselectAllVisible() {
    document.querySelectorAll('.tpb-tc-item:not([style*="display: none"]) .tpb-tc-check:not(:disabled)').forEach(cb => {
        cb.checked = false;
        const wiId = parseInt(cb.dataset.wiId);
        tpbUpdateCount(wiId);
    });
}

// ==================== APPLY CHANGES ====================

async function tpbApplyChanges() {
    tpbClearError();
    const applyBtn = document.getElementById('tpbApplyBtn');
    applyBtn.disabled = true;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';

    const planSelectVal = document.getElementById('tpbPlanSelect').value;
    const createTestedBy = document.getElementById('tpbCreateTestedBy').checked;

    try {
        let planId;
        let planName;

        if (planSelectVal === 'new') {
            planName = document.getElementById('tpbNewPlanName').value.trim();
            tpbShowLoading(true, `Creating Test Plan "${planName}"...`);
            planId = await tpbCreateTestPlan(planName);
        } else {
            planId = parseInt(planSelectVal);
            planName = document.getElementById('tpbPlanSelect').selectedOptions[0]?.text || String(planId);
        }

        tpbState.planId = planId;
        tpbState.planName = planName;

        tpbShowLoading(true, 'Fetching root suite ID...');
        const rootSuiteId = await tpbGetRootSuiteId(planId);

        const suitesByWiId = {};
        tpbState.existingSuites.forEach(s => { if (s.workItemId) suitesByWiId[s.workItemId] = s; });

        // Collect selected TCs per WI — VISIBLE only (respects active filter) — split by action type
        const addToSuiteByWi  = {};  // wiId -> [tcId]  — has TestedBy, not yet in suite
        const addTestedByByWi = {};  // wiId -> [tcId]  — already in suite, missing TestedBy only
        // Only process checkboxes whose parent .tpb-tc-item is not hidden by filter
        document.querySelectorAll('.tpb-tc-item:not([style*="display: none"]) .tpb-tc-check:checked:not(:disabled)').forEach(cb => {
            const wiId = parseInt(cb.dataset.wiId);
            const tcId = parseInt(cb.dataset.tcId);
            if (cb.dataset.action === 'add-tested-by') {
                if (!addTestedByByWi[wiId]) addTestedByByWi[wiId] = [];
                addTestedByByWi[wiId].push(tcId);
            } else {
                if (!addToSuiteByWi[wiId]) addToSuiteByWi[wiId] = [];
                addToSuiteByWi[wiId].push(tcId);
            }
        });

        // Confirmation: count affected WIs and TCs
        const affectedWiIds = new Set([...Object.keys(addToSuiteByWi), ...Object.keys(addTestedByByWi)]);
        const totalTcCount = Object.values(addToSuiteByWi).reduce((s, a) => s + a.length, 0)
                           + Object.values(addTestedByByWi).reduce((s, a) => s + a.length, 0);

        if (affectedWiIds.size === 0) {
            tpbShowLoading(false);
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<i class="fas fa-play"></i> Apply Changes';
            tpbShowError('No visible selected TC(s) to process. Check your filters or select at least one TC.');
            return;
        }

        // Check if filter is active — warn user if hidden TCs exist
        const hiddenChecked = document.querySelectorAll('.tpb-tc-item[style*="display: none"] .tpb-tc-check:checked:not(:disabled)').length;
        const filterWarning = hiddenChecked > 0
            ? `\n\nNote: ${hiddenChecked} checked TC(s) are hidden by filter and will NOT be processed.`
            : '';

        const confirmed = confirm(
            `Apply Changes will process:\n` +
            `  • ${totalTcCount} TC(s) across ${affectedWiIds.size} work item(s)` +
            filterWarning +
            `\n\nContinue?`
        );
        if (!confirmed) {
            tpbShowLoading(false);
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<i class="fas fa-play"></i> Apply Changes';
            return;
        }

        let successCount = 0;
        let errorCount = 0;
        const log = [];

        for (const item of tpbState.queryItems) {
            const wiId = item.id;
            const wiTitle = item.fields['System.Title'];
            const suiteName = `${wiId} : ${wiTitle}`;
            const tcIdsToAdd      = addToSuiteByWi[wiId]  || [];
            const tcIdsForTbyOnly = addTestedByByWi[wiId] || [];
            const existingSuite = suitesByWiId[wiId];
            const hasAnyAction = tcIdsToAdd.length > 0 || tcIdsForTbyOnly.length > 0;

            try {
                let suiteId;
                if (!existingSuite) {
                    if (!hasAnyAction) {
                        log.push({ status: 'skip', msg: `#${wiId} — skipped (no TCs selected, suite not created)` });
                        continue;
                    }
                    tpbShowLoading(true, `Creating suite for #${wiId}...`);
                    suiteId = await tpbCreateStaticSuite(planId, suiteName, rootSuiteId);
                    log.push({ status: 'ok', msg: `#${wiId} — suite created` });
                } else {
                    suiteId = existingSuite.suiteId;
                }

                const logParts = [];

                if (tcIdsToAdd.length > 0) {
                    tpbShowLoading(true, `Adding ${tcIdsToAdd.length} TC(s) to #${wiId}...`);
                    await tpbAddTestCasesToSuite(planId, suiteId, tcIdsToAdd);
                    logParts.push(`added ${tcIdsToAdd.length} TC(s) to suite`);

                    if (createTestedBy) {
                        const existingTestedByIds = (item.relations || [])
                            .filter(r => r.rel === 'Microsoft.VSTS.Common.TestedBy-Forward')
                            .map(r => parseInt(r.url.split('/').pop()))
                            .filter(id => !isNaN(id));
                        await tpbEnsureTestedByRelations(wiId, tcIdsToAdd, existingTestedByIds);
                        logParts.push('TestedBy relations created');
                    }
                }

                if (tcIdsForTbyOnly.length > 0) {
                    // TCs already in suite — only backfill the missing TestedBy relation
                    tpbShowLoading(true, `Adding TestedBy relations for #${wiId}...`);
                    const existingTestedByIds = (item.relations || [])
                        .filter(r => r.rel === 'Microsoft.VSTS.Common.TestedBy-Forward')
                        .map(r => parseInt(r.url.split('/').pop()))
                        .filter(id => !isNaN(id));
                    await tpbEnsureTestedByRelations(wiId, tcIdsForTbyOnly, existingTestedByIds);
                    logParts.push(`added TestedBy for ${tcIdsForTbyOnly.length} TC(s) already in suite`);
                }

                if (logParts.length === 0) {
                    log.push({ status: 'skip', msg: `#${wiId} — suite exists, no changes selected` });
                } else {
                    log.push({ status: 'ok', msg: `#${wiId} — ${logParts.join(', ')}` });
                }

                successCount++;
            } catch (err) {
                log.push({ status: 'err', msg: `#${wiId} — ${err.message}` });
                errorCount++;
            }
        }

        tpbShowLoading(false);
        tpbRenderApplyLog(log, successCount, errorCount, planId, planName);

    } catch (err) {
        tpbShowLoading(false);
        tpbShowError(`Apply failed: ${err.message}`);
        console.error(err);
    } finally {
        applyBtn.disabled = false;
        applyBtn.innerHTML = '<i class="fas fa-play"></i> Apply Changes';
    }
}

// ==================== API CALLS ====================

async function tpbEnsureTestedByRelations(workItemId, tcIds, existingTestedByIds) {
    const existingSet = new Set(existingTestedByIds);
    const toLink = tcIds.filter(id => !existingSet.has(id));
    if (toLink.length === 0) return;

    const ops = toLink.map(tcId => ({
        op: 'add',
        path: '/relations/-',
        value: {
            rel: 'Microsoft.VSTS.Common.TestedBy-Forward',
            url: `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${tcId}`
        }
    }));

    const response = await fetch(
        `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${workItemId}?api-version=7.0`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat),
                'Content-Type': 'application/json-patch+json'
            },
            body: JSON.stringify(ops)
        }
    );
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to add TestedBy to #${workItemId}: ${err}`);
    }
}

async function tpbCreateTestPlan(name) {
    const response = await fetch(
        `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans?api-version=7.1-preview.1`,
        {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        }
    );
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to create test plan: ${err}`);
    }
    return (await response.json()).id;
}

async function tpbGetRootSuiteId(planId) {
    const response = await fetch(
        `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}?api-version=7.1-preview.1`,
        { headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) } }
    );
    if (!response.ok) throw new Error(`Failed to fetch plan: ${response.statusText}`);
    return (await response.json()).rootSuite?.id;
}

async function tpbCreateStaticSuite(planId, suiteName, parentSuiteId) {
    const response = await fetch(
        `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}/suites?api-version=7.1-preview.1`,
        {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ suiteType: 'staticTestSuite', name: suiteName, parentSuite: { id: parentSuiteId } })
        }
    );
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to create suite: ${err}`);
    }
    return (await response.json()).id;
}

async function tpbAddTestCasesToSuite(planId, suiteId, tcIds) {
    if (tcIds.length === 0) return;
    const response = await fetch(
        `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}/suites/${suiteId}/testcase?api-version=7.1-preview.3`,
        {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tcIds.map(id => ({ testCase: { id: String(id) } })))
        }
    );
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to add TCs: ${err}`);
    }
}

// ==================== CREATE TESTED BY FROM EXISTING SUITES ====================

async function tpbCreateTestedByFromSuites() {
    const planSelectVal = document.getElementById('tpbPlanSelect').value;
    const logEl = document.getElementById('tpbTestedByLog');

    if (!planSelectVal || planSelectVal === 'new') {
        logEl.innerHTML = `<div class="error">❌ Please select an existing Test Plan first.</div>`;
        return;
    }

    logEl.innerHTML = `<div style="color:#495057; font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Loading suites...</div>`;

    try {
        const planId = parseInt(planSelectVal);
        const suites = await tpbFetchExistingSuites(planId);
        const relevant = suites.filter(s => s.workItemId && s.tcIds.length > 0);

        if (relevant.length === 0) {
            logEl.innerHTML = `<div style="color:#856404;">⚠️ No static suites with TCs and parseable Work Item IDs found.</div>`;
            return;
        }

        logEl.innerHTML = `<div style="color:#495057; font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Processing ${relevant.length} suites...</div>`;

        const log = [];
        let linked = 0, skipped = 0, errors = 0;

        for (const suite of relevant) {
            try {
                const wiRes = await fetch(
                    `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${suite.workItemId}?$expand=relations&api-version=7.0`,
                    { headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) } }
                );
                if (!wiRes.ok) throw new Error(`Failed to fetch WI #${suite.workItemId}`);
                const wiData = await wiRes.json();

                const existingTestedByIds = (wiData.relations || [])
                    .filter(r => r.rel === 'Microsoft.VSTS.Common.TestedBy-Forward')
                    .map(r => parseInt(r.url.split('/').pop()));

                const toLink = suite.tcIds.filter(id => !existingTestedByIds.includes(id));

                if (toLink.length === 0) {
                    skipped++;
                    log.push({ status: 'skip', msg: `#${suite.workItemId} — all ${suite.tcIds.length} TC(s) already linked` });
                } else {
                    await tpbEnsureTestedByRelations(suite.workItemId, toLink, existingTestedByIds);
                    linked += toLink.length;
                    log.push({ status: 'ok', msg: `#${suite.workItemId} — linked ${toLink.length} TC(s)` });
                }
            } catch (err) {
                errors++;
                log.push({ status: 'err', msg: `#${suite.workItemId} — ${err.message}` });
            }
        }

        let html = `<div style="margin-bottom:8px; font-weight:600; font-size:13px;">
            ${errors === 0 ? '✅' : '⚠️'} Done: ${linked} relation(s) created, ${skipped} already up to date${errors > 0 ? `, ${errors} error(s)` : ''}
        </div><div style="font-size:12px; font-family:monospace; max-height:200px; overflow-y:auto;">`;
        log.forEach(e => {
            const color = e.status === 'ok' ? '#28a745' : e.status === 'skip' ? '#6c757d' : '#dc3545';
            const icon = e.status === 'ok' ? '✅' : e.status === 'skip' ? '⏭' : '❌';
            html += `<div style="color:${color}; margin-bottom:3px;">${icon} ${escapeHtml(e.msg)}</div>`;
        });
        html += `</div>`;
        logEl.innerHTML = html;

    } catch (err) {
        logEl.innerHTML = `<div class="error">❌ ${escapeHtml(err.message)}</div>`;
    }
}

// ==================== APPLY LOG ====================

function tpbRenderApplyLog(log, successCount, errorCount, planId, planName) {
    const body = document.getElementById('tpbResultsBody');
    const planUrl = `https://dev.azure.com/${config.organization}/${config.project}/_testManagement/run?planId=${planId}`;

    let html = `<div style="margin-bottom:12px;">
        <strong style="color:${errorCount === 0 ? '#28a745' : '#ffc107'};">
            ${errorCount === 0 ? '✅' : '⚠️'} Done: ${successCount} succeeded, ${errorCount} failed
        </strong>
        <br><a href="${planUrl}" target="_blank" style="color:#667eea; font-size:13px;">
            <i class="fas fa-external-link-alt"></i> Open "${escapeHtml(planName)}" in Azure DevOps
        </a>
    </div><div style="font-size:12px; font-family:monospace; max-height:300px; overflow-y:auto;">`;

    log.forEach(e => {
        const color = e.status === 'ok' ? '#28a745' : e.status === 'skip' ? '#6c757d' : '#dc3545';
        const icon = e.status === 'ok' ? '✅' : e.status === 'skip' ? '⏭' : '❌';
        html += `<div style="color:${color}; margin-bottom:4px;">${icon} ${escapeHtml(e.msg)}</div>`;
    });
    html += `</div>`;
    body.innerHTML = html;
    document.getElementById('tpbApplyBtn').style.display = 'none';
    document.getElementById('tpbTestedByRow').style.display = 'none';
}

// ==================== UI HELPERS ====================

function tpbShowLoading(show, message) {
    const el = document.getElementById('tpbLoading');
    if (show) {
        el.style.display = 'flex';
        el.querySelector('.tpb-loading-text').textContent = message || 'Loading...';
    } else {
        el.style.display = 'none';
    }
}

function tpbShowError(msg) {
    document.getElementById('tpbError').innerHTML = `<div class="error">❌ ${escapeHtml(msg)}</div>`;
}

function tpbClearError() {
    document.getElementById('tpbError').innerHTML = '';
}

function tpbHideResults() {
    document.getElementById('tpbResultsPanel').style.display = 'none';
    document.getElementById('tpbApplyBtn').style.display = 'none';
    document.getElementById('tpbTestedByRow').style.display = 'none';
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
