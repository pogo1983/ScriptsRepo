// ==================== TEST PLAN BUILDER MODULE ====================

let tpbState = {
    workItems: [],        // items from query with their filtered TCs
    existingSuites: [],   // suites currently in the selected plan
    planId: null,
    planName: null,
    deltaResult: null     // computed delta ready to apply
};

// ==================== INITIALIZATION ====================

async function tpbInit() {
    if (!config.organization || !config.project || !config.pat) {
        tpbShowError('Please configure Organization, Project, and PAT in Settings first.');
        return;
    }

    // Pre-fill Area Path from saved config
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
        const plans = (data.value || []).sort((a, b) => b.id - a.id); // newest first

        select.innerHTML = '<option value="">-- Select existing plan --</option><option value="new">➕ Create new plan...</option>';
        plans.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.name} (ID: ${p.id})`;
            select.appendChild(opt);
        });
    } catch (err) {
        select.innerHTML = '<option value="">-- Failed to load --</option>';
        tpbShowError(err.message);
    }
}

function tpbOnPlanSelectChange() {
    const val = document.getElementById('tpbPlanSelect').value;
    document.getElementById('tpbNewPlanRow').style.display = val === 'new' ? 'flex' : 'none';
    // Reset delta panel
    tpbHideDelta();
}

// ==================== ANALYZE DELTA ====================

async function tpbAnalyzeDelta() {
    tpbClearError();
    tpbHideDelta();

    const plannedRelease = document.getElementById('tpbPlannedRelease').value.trim();
    const tag = document.getElementById('tpbTag').value.trim();
    const areaPath = document.getElementById('tpbAreaPath').value.trim();
    const planSelectVal = document.getElementById('tpbPlanSelect').value;

    if (!plannedRelease) { tpbShowError('Please enter Planned Release.'); return; }
    if (!planSelectVal) { tpbShowError('Please select a Test Plan or choose to create a new one.'); return; }
    if (planSelectVal === 'new' && !document.getElementById('tpbNewPlanName').value.trim()) {
        tpbShowError('Please enter a name for the new Test Plan.'); return;
    }

    tpbShowLoading(true, 'Fetching work items from query...');

    try {
        // Step 1: WIQL query -> work items
        const queryItems = await tpbFetchQueryItems(plannedRelease, tag);
        if (queryItems.length === 0) {
            tpbShowError('No work items found for the given Planned Release and Tag filters.');
            tpbShowLoading(false);
            return;
        }

        tpbShowLoading(true, `Found ${queryItems.length} work items. Fetching TC relations...`);

        // Step 2: For each work item, get TestedBy TC IDs filtered by Area Path
        const itemsWithTCs = await tpbFetchTestedByForItems(queryItems, areaPath);

        // Step 3: Fetch existing suites (if plan selected, not new)
        let existingSuites = [];
        if (planSelectVal !== 'new') {
            tpbShowLoading(true, 'Fetching existing suites from Test Plan...');
            existingSuites = await tpbFetchExistingSuites(planSelectVal);
        }

        // Step 4: Compute delta
        tpbState.workItems = itemsWithTCs;
        tpbState.existingSuites = existingSuites;
        tpbState.deltaResult = tpbComputeDelta(itemsWithTCs, existingSuites);

        tpbShowLoading(false);
        tpbRenderDelta(tpbState.deltaResult);

    } catch (err) {
        tpbShowLoading(false);
        tpbShowError(`Error during analysis: ${err.message}`);
        console.error(err);
    }
}

// ==================== WIQL FETCH ====================

async function tpbFetchQueryItems(plannedRelease, tag) {
    let wiql = `SELECT [System.Id], [System.Title], [System.WorkItemType] FROM WorkItems WHERE [System.TeamProject] = '${config.project}'`;
    wiql += ` AND [Custom.plannedrelease] = '${plannedRelease}'`;
    wiql += ` AND [System.WorkItemType] IN ('Bug', 'User Story', 'TestFeedback')`;
    if (tag) {
        wiql += ` AND [System.Tags] CONTAINS '${tag}'`;
    }
    wiql += ` ORDER BY [System.Id]`;

    const wiqlUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/wiql?api-version=7.0`;
    const response = await fetch(wiqlUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(':' + config.pat),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: wiql })
    });

    if (!response.ok) throw new Error(`WIQL query failed: ${response.statusText}`);

    const data = await response.json();
    const ids = (data.workItems || []).map(wi => wi.id);

    if (ids.length === 0) return [];

    // Fetch details with relations in batches of 200
    const batches = [];
    for (let i = 0; i < ids.length; i += 200) {
        batches.push(ids.slice(i, i + 200));
    }

    let allItems = [];
    for (const batch of batches) {
        const batchUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems?ids=${batch.join(',')}&$expand=relations&api-version=7.0`;
        const batchRes = await fetch(batchUrl, {
            headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) }
        });
        if (!batchRes.ok) throw new Error(`Failed to fetch work item details: ${batchRes.statusText}`);
        const batchData = await batchRes.json();
        allItems = allItems.concat(batchData.value || []);
    }

    return allItems;
}

// ==================== TESTED BY + AREA PATH FILTER ====================

async function tpbFetchTestedByForItems(queryItems, areaPath) {
    const result = [];

    for (const item of queryItems) {
        // Extract TC IDs from TestedBy-Forward relations (WI perspective: "Tested By")
        const testedByIds = (item.relations || [])
            .filter(r => r.rel === 'Microsoft.VSTS.Common.TestedBy-Forward')
            .map(r => {
                const parts = r.url.split('/');
                return parseInt(parts[parts.length - 1]);
            })
            .filter(id => !isNaN(id));

        let filteredTCs = [];

        if (testedByIds.length > 0) {
            // Fetch TC details to check Area Path
            const tcBatches = [];
            for (let i = 0; i < testedByIds.length; i += 200) {
                tcBatches.push(testedByIds.slice(i, i + 200));
            }

            for (const batch of tcBatches) {
                const tcUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems?ids=${batch.join(',')}&fields=System.Id,System.Title,System.AreaPath&api-version=7.0`;
                const tcRes = await fetch(tcUrl, {
                    headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) }
                });
                if (!tcRes.ok) continue;
                const tcData = await tcRes.json();

                const matching = (tcData.value || []).filter(tc => {
                    if (!areaPath) return true; // no filter — include all TCs
                    const tcAreaPath = tc.fields['System.AreaPath'] || '';
                    return tcAreaPath === areaPath || tcAreaPath.startsWith(areaPath + '\\');
                });

                filteredTCs = filteredTCs.concat(matching.map(tc => ({
                    id: tc.id,
                    title: tc.fields['System.Title'],
                    areaPath: tc.fields['System.AreaPath']
                })));
            }
        }

        result.push({
            id: item.id,
            title: item.fields['System.Title'],
            type: item.fields['System.WorkItemType'],
            tcIds: filteredTCs.map(tc => tc.id),
            tcs: filteredTCs,
            existingTestedByIds: testedByIds  // all IDs already linked, before area path filter
        });
    }

    return result;
}

// ==================== FETCH EXISTING SUITES ====================

async function tpbFetchExistingSuites(planId) {
    const url = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}/suites?api-version=7.1-preview.1`;
    const response = await fetch(url, {
        headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) }
    });

    if (!response.ok) throw new Error(`Failed to fetch suites: ${response.statusText}`);

    const data = await response.json();
    console.log('[TPB] suites from API:', (data.value || []).map(s => ({ id: s.id, name: s.name, suiteType: s.suiteType })));
    // API may return 'StaticTestSuite' or 'staticTestSuite' — compare case-insensitively, exclude root suite (same name as plan)
    const suites = (data.value || []).filter(s => s.suiteType?.toLowerCase() === 'statictestsuite');

    // For each suite, fetch its test cases
    const suitesWithTCs = await Promise.all(suites.map(async suite => {
        const tcIds = await tpbFetchSuiteTestCaseIds(planId, suite.id);
        // Try to parse work item ID from suite name: "12345 : Title..."
        const match = suite.name.match(/^(\d+)\s*:/);
        const workItemId = match ? parseInt(match[1]) : null;
        return {
            suiteId: suite.id,
            suiteName: suite.name,
            workItemId: workItemId,
            tcIds: tcIds
        };
    }));

    return suitesWithTCs;
}

async function tpbFetchSuiteTestCaseIds(planId, suiteId) {
    const url = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}/suites/${suiteId}/testcase?api-version=7.1-preview.3`;
    const response = await fetch(url, {
        headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) }
    });

    if (!response.ok) return [];

    const data = await response.json();
    if (data.value?.length) {
        console.log('[TPB] TC response sample for suite', suiteId, data.value[0]);
    }
    return (data.value || []).map(tc => {
        const rawId = tc.testCase?.id ?? tc.workItem?.id;
        return rawId !== undefined ? parseInt(rawId) : undefined;
    }).filter(id => id !== undefined && !isNaN(id));
}

// ==================== COMPUTE DELTA ====================

function tpbComputeDelta(queryItems, existingSuites) {
    const delta = {
        toCreate: [],    // { id, title, type, tcs: [] }
        toUpdate: [],    // { suiteId, suiteName, workItemId, toAdd: [], toRemove: [] }
        toWarn: []       // { suiteId, suiteName } — suites in plan not in query
    };

    const queryIds = new Set(queryItems.map(i => i.id));
    const suitesByWiId = {};
    existingSuites.forEach(s => {
        if (s.workItemId) suitesByWiId[s.workItemId] = s;
    });

    // Index suite names for fuzzy duplicate detection (suite may exist but ID parse failed)
    const suiteNameContainsId = (id) =>
        existingSuites.some(s => s.suiteName.match(new RegExp(`^${id}\\s*:`)));

    // Check query items vs existing suites
    for (const item of queryItems) {
        const existingSuite = suitesByWiId[item.id];
        if (!existingSuite) {
            // Check if a suite with this ID exists but wasn't parsed (name format mismatch)
            const possibleDuplicate = suiteNameContainsId(item.id);
            delta.toCreate.push({ id: item.id, title: item.title, type: item.type, tcs: item.tcs, possibleDuplicate, existingTestedByIds: item.existingTestedByIds || [] });
        } else {
            // Suite exists — check TC delta
            const existingTcSet = new Set(existingSuite.tcIds);
            const queryTcSet = new Set(item.tcIds);

            const toAdd = item.tcs.filter(tc => !existingTcSet.has(tc.id));
            const toRemove = existingSuite.tcIds.filter(id => !queryTcSet.has(id));

            if (toAdd.length > 0 || toRemove.length > 0) {
                delta.toUpdate.push({
                    suiteId: existingSuite.suiteId,
                    suiteName: existingSuite.suiteName,
                    workItemId: item.id,
                    toAdd: toAdd,
                    toRemove: toRemove,
                    existingTestedByIds: item.existingTestedByIds || []
                });
            }
        }
    }

    // Suites in plan not in query (orphans)
    for (const suite of existingSuites) {
        if (suite.workItemId && !queryIds.has(suite.workItemId)) {
            delta.toWarn.push({ suiteId: suite.suiteId, suiteName: suite.suiteName, workItemId: suite.workItemId });
        }
    }

    return delta;
}

// ==================== RENDER DELTA ====================

function tpbRenderDelta(delta) {
    const panel = document.getElementById('tpbDeltaPanel');
    const body = document.getElementById('tpbDeltaBody');

    const total = delta.toCreate.length + delta.toUpdate.length + delta.toWarn.length;

    if (total === 0) {
        body.innerHTML = `<div style="padding: 20px; text-align: center; color: #28a745;">
            <i class="fas fa-check-circle" style="font-size: 24px;"></i>
            <p style="margin-top: 8px;">Everything is up to date. No changes needed.</p>
        </div>`;
        panel.style.display = 'block';
        document.getElementById('tpbApplyBtn').style.display = 'none';
        return;
    }

    let html = '';

    // New suites
    if (delta.toCreate.length > 0) {
        html += `<div class="tpb-delta-group">
            <div class="tpb-delta-group-title"><span class="tpb-badge tpb-badge-new">🆕 New suites — ${delta.toCreate.length}</span></div>`;
        delta.toCreate.forEach(item => {
            const dupWarning = item.possibleDuplicate
                ? ` <span title="A suite with this ID already exists in the plan but could not be matched automatically. Check for duplicates before applying." style="color:#856404; cursor:help;">⚠️ possible duplicate</span>`
                : '';
            html += `<div class="tpb-delta-row tpb-row-new">
                <span class="tpb-wi-type tpb-type-${item.type.replace(' ', '').toLowerCase()}">${item.type}</span>
                <strong>#${item.id}</strong> ${escapeHtml(item.title)}
                <span class="tpb-tc-count">${item.tcs.length} TC${dupWarning}</span>
            </div>`;
        });
        html += `</div>`;
    }

    // Updated suites
    if (delta.toUpdate.length > 0) {
        html += `<div class="tpb-delta-group">
            <div class="tpb-delta-group-title"><span class="tpb-badge tpb-badge-update">🔄 Updated suites — ${delta.toUpdate.length}</span></div>`;
        delta.toUpdate.forEach(upd => {
            const addPart = upd.toAdd.length > 0 ? `<span style="color: #28a745;">+${upd.toAdd.length} TC</span>` : '';
            const remPart = upd.toRemove.length > 0 ? `<span style="color: #dc3545;">−${upd.toRemove.length} TC</span>` : '';
            html += `<div class="tpb-delta-row tpb-row-update">
                <strong>#${upd.workItemId}</strong> ${escapeHtml(upd.suiteName.replace(/^\d+\s*:\s*/, ''))}
                <span class="tpb-tc-count">${addPart} ${remPart}</span>
            </div>`;
        });
        html += `</div>`;
    }

    // Orphaned suites
    if (delta.toWarn.length > 0) {
        html += `<div class="tpb-delta-group">
            <div class="tpb-delta-group-title"><span class="tpb-badge tpb-badge-warn">⚠️ Not in query — ${delta.toWarn.length}</span></div>
            <div style="font-size: 12px; color: #856404; margin-bottom: 8px; padding-left: 8px;">These suites exist in the plan but the work item is not returned by the current query. They will NOT be automatically deleted.</div>`;
        delta.toWarn.forEach(s => {
            html += `<div class="tpb-delta-row tpb-row-warn">
                Suite ID: ${s.suiteId} — ${escapeHtml(s.suiteName)}
            </div>`;
        });
        html += `</div>`;
    }

    body.innerHTML = html;
    panel.style.display = 'block';

    const hasChanges = delta.toCreate.length > 0 || delta.toUpdate.length > 0;
    document.getElementById('tpbApplyBtn').style.display = hasChanges ? 'inline-flex' : 'none';
    document.getElementById('tpbTestedByRow').style.display = hasChanges ? 'inline-flex' : 'none';
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ==================== APPLY CHANGES ====================

async function tpbApplyChanges() {
    const delta = tpbState.deltaResult;
    if (!delta) return;

    tpbClearError();
    const applyBtn = document.getElementById('tpbApplyBtn');
    applyBtn.disabled = true;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';

    const planSelectVal = document.getElementById('tpbPlanSelect').value;
    const createTestedBy = document.getElementById('tpbCreateTestedBy').checked;

    try {
        let planId;
        let planName;

        // Step 1: Create plan if needed
        if (planSelectVal === 'new') {
            planName = document.getElementById('tpbNewPlanName').value.trim();
            tpbShowLoading(true, `Creating Test Plan "${planName}"...`);
            planId = await tpbCreateTestPlan(planName);
        } else {
            planId = parseInt(planSelectVal);
            planName = document.getElementById('tpbPlanSelect').selectedOptions[0]?.text || planId;
        }

        tpbState.planId = planId;
        tpbState.planName = planName;

        // Fetch root suite ID required by the API as parentSuite
        tpbShowLoading(true, 'Fetching root suite ID...');
        const rootSuiteId = await tpbGetRootSuiteId(planId);

        let successCount = 0;
        let errorCount = 0;
        const log = [];

        // Step 2: Create new suites
        for (const item of delta.toCreate) {
            try {
                tpbShowLoading(true, `Creating suite for #${item.id}...`);
                const suiteName = `${item.id} : ${item.title}`;
                const suiteId = await tpbCreateStaticSuite(planId, suiteName, rootSuiteId);
                if (item.tcs.length > 0) {
                    await tpbAddTestCasesToSuite(planId, suiteId, item.tcs.map(tc => tc.id));
                    if (createTestedBy) {
                        await tpbEnsureTestedByRelations(item.id, item.tcs.map(tc => tc.id), item.existingTestedByIds);
                    }
                }
                log.push({ status: 'ok', msg: `Created suite "${suiteName}" with ${item.tcs.length} TCs` });
                successCount++;
            } catch (err) {
                log.push({ status: 'err', msg: `Failed to create suite for #${item.id}: ${err.message}` });
                errorCount++;
            }
        }

        // Step 3: Update existing suites
        for (const upd of delta.toUpdate) {
            try {
                tpbShowLoading(true, `Updating suite "${upd.suiteName}"...`);
                if (upd.toAdd.length > 0) {
                    await tpbAddTestCasesToSuite(planId, upd.suiteId, upd.toAdd.map(tc => tc.id));
                    if (createTestedBy) {
                        await tpbEnsureTestedByRelations(upd.workItemId, upd.toAdd.map(tc => tc.id), upd.existingTestedByIds);
                    }
                }
                if (upd.toRemove.length > 0) {
                    await tpbRemoveTestCasesFromSuite(planId, upd.suiteId, upd.toRemove);
                }
                log.push({ status: 'ok', msg: `Updated suite "${upd.suiteName}": +${upd.toAdd.length} / −${upd.toRemove.length} TCs` });
                successCount++;
            } catch (err) {
                log.push({ status: 'err', msg: `Failed to update suite "${upd.suiteName}": ${err.message}` });
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

    const url = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${workItemId}?api-version=7.0`;
    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Basic ' + btoa(':' + config.pat),
            'Content-Type': 'application/json-patch+json'
        },
        body: JSON.stringify(ops)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to add TestedBy relations to #${workItemId}: ${err}`);
    }
}

async function tpbCreateTestPlan(name) {
    const url = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans?api-version=7.1-preview.1`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(':' + config.pat),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to create test plan: ${err}`);
    }

    const data = await response.json();
    return data.id;
}

async function tpbGetRootSuiteId(planId) {
    const url = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}?api-version=7.1-preview.1`;
    const response = await fetch(url, {
        headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) }
    });
    if (!response.ok) throw new Error(`Failed to fetch plan details: ${response.statusText}`);
    const data = await response.json();
    return data.rootSuite?.id;
}

async function tpbCreateStaticSuite(planId, suiteName, parentSuiteId) {
    const url = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}/suites?api-version=7.1-preview.1`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(':' + config.pat),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            suiteType: 'staticTestSuite',
            name: suiteName,
            parentSuite: { id: parentSuiteId }
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to create suite: ${err}`);
    }

    const data = await response.json();
    return data.id;
}

async function tpbAddTestCasesToSuite(planId, suiteId, tcIds) {
    if (tcIds.length === 0) return;
    const url = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}/suites/${suiteId}/testcase?api-version=7.1-preview.3`;
    const body = tcIds.map(id => ({ testCase: { id: String(id) } }));

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(':' + config.pat),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to add TCs to suite: ${err}`);
    }
}

async function tpbRemoveTestCasesFromSuite(planId, suiteId, tcIds) {
    if (tcIds.length === 0) return;
    // API requires removing one TC at a time
    for (const tcId of tcIds) {
        const url = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${planId}/suites/${suiteId}/testcase/${tcId}?api-version=7.1-preview.3`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) }
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Failed to remove TC ${tcId} from suite: ${err}`);
        }
    }
}

// ==================== APPLY LOG ====================

function tpbRenderApplyLog(log, successCount, errorCount, planId, planName) {
    const body = document.getElementById('tpbDeltaBody');
    const planUrl = `https://dev.azure.com/${config.organization}/${config.project}/_testManagement/run?planId=${planId}`;

    let html = `<div style="margin-bottom: 12px;">
        <strong style="color: ${errorCount === 0 ? '#28a745' : '#ffc107'};">
            ${errorCount === 0 ? '✅' : '⚠️'} Done: ${successCount} succeeded, ${errorCount} failed
        </strong>`;

    if (errorCount === 0) {
        html += `<br><a href="${planUrl}" target="_blank" style="color: #667eea; font-size: 13px;">
            <i class="fas fa-external-link-alt"></i> Open "${planName}" in Azure DevOps
        </a>`;
    }
    html += `</div><div style="font-size: 12px; font-family: monospace; max-height: 300px; overflow-y: auto;">`;

    log.forEach(entry => {
        const icon = entry.status === 'ok' ? '✅' : '❌';
        const color = entry.status === 'ok' ? '#28a745' : '#dc3545';
        html += `<div style="color: ${color}; margin-bottom: 4px;">${icon} ${escapeHtml(entry.msg)}</div>`;
    });

    html += `</div>`;
    body.innerHTML = html;
    document.getElementById('tpbApplyBtn').style.display = 'none';
}

// ==================== CREATE TESTED BY FROM EXISTING SUITES ====================

async function tpbCreateTestedByFromSuites() {
    const planSelectVal = document.getElementById('tpbPlanSelect').value;
    const logEl = document.getElementById('tpbTestedByLog');

    if (!planSelectVal || planSelectVal === 'new') {
        logEl.innerHTML = `<div class="error">❌ Please select an existing Test Plan first.</div>`;
        return;
    }
    if (!config.organization || !config.project || !config.pat) {
        logEl.innerHTML = `<div class="error">❌ Please configure PAT in Settings first.</div>`;
        return;
    }

    logEl.innerHTML = `<div style="color:#495057; font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Loading suites...</div>`;

    try {
        const planId = parseInt(planSelectVal);

        // Fetch all static suites with their TCs
        const suites = await tpbFetchExistingSuites(planId);
        const relevantSuites = suites.filter(s => s.workItemId && s.tcIds.length > 0);

        if (relevantSuites.length === 0) {
            logEl.innerHTML = `<div style="color:#856404;">⚠️ No static suites with Test Cases and parseable Work Item IDs found.</div>`;
            return;
        }

        logEl.innerHTML = `<div style="color:#495057; font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Processing ${relevantSuites.length} suites...</div>`;

        const log = [];
        let linked = 0;
        let skipped = 0;
        let errors = 0;

        for (const suite of relevantSuites) {
            try {
                // Fetch current relations on the work item
                const wiUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${suite.workItemId}?$expand=relations&api-version=7.0`;
                const wiRes = await fetch(wiUrl, {
                    headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) }
                });
                if (!wiRes.ok) throw new Error(`Failed to fetch WI #${suite.workItemId}`);
                const wiData = await wiRes.json();

                const existingTestedByIds = (wiData.relations || [])
                    .filter(r => r.rel === 'Microsoft.VSTS.Common.TestedBy-Forward')
                    .map(r => {
                        const parts = r.url.split('/');
                        return parseInt(parts[parts.length - 1]);
                    });

                const toLink = suite.tcIds.filter(id => !existingTestedByIds.includes(id));

                if (toLink.length === 0) {
                    skipped++;
                    log.push({ status: 'skip', msg: `#${suite.workItemId} — all ${suite.tcIds.length} TC(s) already linked` });
                    continue;
                }

                await tpbEnsureTestedByRelations(suite.workItemId, toLink, existingTestedByIds);
                linked += toLink.length;
                log.push({ status: 'ok', msg: `#${suite.workItemId} — linked ${toLink.length} TC(s) (${suite.tcIds.length - toLink.length} already existed)` });

            } catch (err) {
                errors++;
                log.push({ status: 'err', msg: `#${suite.workItemId} — ${err.message}` });
            }
        }

        // Render log
        let html = `<div style="margin-bottom:8px; font-weight:600; font-size:13px;">
            ${errors === 0 ? '✅' : '⚠️'} Done: ${linked} relation(s) created, ${skipped} suite(s) already up to date${errors > 0 ? `, ${errors} error(s)` : ''}
        </div>`;
        html += `<div style="font-size:12px; font-family:monospace; max-height:200px; overflow-y:auto;">`;
        log.forEach(e => {
            const color = e.status === 'ok' ? '#28a745' : e.status === 'skip' ? '#6c757d' : '#dc3545';
            const icon = e.status === 'ok' ? '✅' : e.status === 'skip' ? '⏭' : '❌';
            html += `<div style="color:${color}; margin-bottom:3px;">${icon} ${escapeHtml(e.msg)}</div>`;
        });
        html += `</div>`;
        logEl.innerHTML = html;

    } catch (err) {
        logEl.innerHTML = `<div class="error">❌ ${escapeHtml(err.message)}</div>`;
        console.error(err);
    }
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
    const el = document.getElementById('tpbError');
    el.innerHTML = `<div class="error">❌ ${escapeHtml(msg)}</div>`;
}

function tpbClearError() {
    document.getElementById('tpbError').innerHTML = '';
}

function tpbHideDelta() {
    document.getElementById('tpbDeltaPanel').style.display = 'none';
    document.getElementById('tpbApplyBtn').style.display = 'none';
}
