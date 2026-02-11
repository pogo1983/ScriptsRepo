// Available organizations and projects
const availableConfigs = [
    { organization: 'infomedics', project: 'TIM' }
    // Add more configs here if needed
    // { organization: 'another-org', project: 'Another Project' }
];

// Comment templates
const commentTemplates = {
    readyForTest: `This item will be delivered in version specified in "planned release": {PLANNED_RELEASE}.
Before picking up for QA, <strong>please make sure this version or higher is deployed on the test environment</strong>.

Description and Context/Acceptance Criteria contain description of the fix. Testing scenarios are in the <strong>Attention for testing</strong> section.

With questions please contact:
Tester: {TESTER}
Developer: {DEVELOPER}`,
    
    closed: `Integration Test Feedback was fixed and integrated with the original item, therefore closed. No further System Testing is required.`,
    
    custom: ``
};

// Global state
let workItems = [];
let config = {
    organization: 'infomedics',
    project: 'TIM',
    pat: ''
};

// Load config from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
    populateConfigDropdowns();
    
    // Auto-load testing PAT token if defined
    if (typeof TESTING_PAT_TOKEN !== 'undefined' && TESTING_PAT_TOKEN) {
        config.pat = TESTING_PAT_TOKEN;
        document.getElementById('pat').value = TESTING_PAT_TOKEN;
        console.log('⚠️ Testing PAT token auto-loaded - REMEMBER TO REMOVE BEFORE COMMIT!');
    }
    
    loadConfig();
    // Load default comment template
    loadCommentTemplate();
});

function populateConfigDropdowns() {
    const orgSelect = document.getElementById('organization');
    const projSelect = document.getElementById('project');
    
    // Clear existing options
    orgSelect.innerHTML = '';
    projSelect.innerHTML = '';
    
    // Get unique organizations
    const organizations = [...new Set(availableConfigs.map(c => c.organization))];
    
    // Populate organization dropdown
    organizations.forEach(org => {
        const option = document.createElement('option');
        option.value = org;
        option.textContent = org;
        orgSelect.appendChild(option);
    });
    
    // Set default organization
    orgSelect.value = 'infomedics';
    
    // Populate projects for selected organization
    updateProjectList();
}

function updateProjectList() {
    const orgSelect = document.getElementById('organization');
    const projSelect = document.getElementById('project');
    const selectedOrg = orgSelect.value;
    
    // Clear existing options
    projSelect.innerHTML = '';
    
    // Get projects for selected organization
    const projects = availableConfigs
        .filter(c => c.organization === selectedOrg)
        .map(c => c.project);
    
    // Populate project dropdown
    projects.forEach(proj => {
        const option = document.createElement('option');
        option.value = proj;
        option.textContent = proj;
        projSelect.appendChild(option);
    });
    
    // Set default project
    if (projects.includes('TIM')) {
        projSelect.value = 'TIM';
    }
}

function saveConfig() {
    config.organization = document.getElementById('organization').value.trim();
    config.project = document.getElementById('project').value.trim();
    config.pat = document.getElementById('pat').value.trim();
    
    if (!config.organization || !config.project || !config.pat) {
        showError('Please fill in all configuration fields');
        return;
    }
    
    localStorage.setItem('azureDevOpsConfig', JSON.stringify(config));
    showSuccess('Configuration saved successfully!');
}

function loadConfig() {
    const saved = localStorage.getItem('azureDevOpsConfig');
    if (saved) {
        config = JSON.parse(saved);
        document.getElementById('organization').value = config.organization;
        document.getElementById('project').value = config.project;
        document.getElementById('pat').value = config.pat;
        showSuccess('Configuration loaded from storage');
    }
}

function clearPAT() {
    if (confirm('Are you sure you want to clear the PAT token?')) {
        config.pat = '';
        document.getElementById('pat').value = '';
        
        // Save config without PAT
        localStorage.setItem('azureDevOpsConfig', JSON.stringify(config));
        showSuccess('PAT token cleared. Organization and Project remain unchanged.');
    }
}

function checkMultipleVersions() {
    const plannedRelease = document.getElementById('plannedRelease').value.trim();
    const infoDiv = document.getElementById('versionDetectionInfo');
    
    // Check if input contains multiple versions (separated by ; or ,)
    const hasMultipleVersions = plannedRelease.includes(';') || plannedRelease.includes(',');
    
    if (hasMultipleVersions) {
        infoDiv.style.display = 'block';
        // Auto-suggest Contains match
        document.getElementById('containsMatch').checked = true;
    } else {
        infoDiv.style.display = 'none';
    }
}

function getSelectedWorkItemTypes() {
    const checkboxes = document.querySelectorAll('[id^="type"]:checked');
    const selected = Array.from(checkboxes).map(cb => cb.value);
    return selected;
}

function toggleWorkItemType(checkbox) {
    // If 'All' is checked, uncheck all specific types
    if (checkbox.id === 'typeAll' && checkbox.checked) {
        document.querySelectorAll('[id^="type"]').forEach(cb => {
            if (cb.id !== 'typeAll') cb.checked = false;
        });
    } else if (checkbox.id !== 'typeAll' && checkbox.checked) {
        // If any specific type is checked, uncheck 'All'
        document.getElementById('typeAll').checked = false;
    }
}

function selectAllTypes() {
    document.querySelectorAll('[id^="type"]').forEach(cb => cb.checked = true);
}

function deselectAllTypes() {
    document.querySelectorAll('[id^="type"]').forEach(cb => cb.checked = false);
}

function loadCommentTemplate() {
    const templateSelect = document.getElementById('commentTemplate');
    const textArea = document.getElementById('customCommentText');
    
    const selectedTemplate = templateSelect.value;
    textArea.value = commentTemplates[selectedTemplate];
    
    // Load saved custom template if exists
    const savedCustom = localStorage.getItem('customCommentTemplate');
    if (selectedTemplate === 'custom' && savedCustom) {
        textArea.value = savedCustom;
    }
    
    updatePreview();
}

function saveCustomTemplate() {
    const textArea = document.getElementById('customCommentText');
    localStorage.setItem('customCommentTemplate', textArea.value);
}

// Update comment template when dropdown changes
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('commentTemplate').addEventListener('change', function() {
        loadCommentTemplate();
    });
    
    document.getElementById('customCommentText').addEventListener('change', function() {
        if (document.getElementById('commentTemplate').value === 'custom') {
            saveCustomTemplate();
        }
    });
});

async function fetchWorkItems() {
    if (!config.organization || !config.project || !config.pat) {
        showError('Please configure Organization, Project, and PAT first');
        return;
    }
    
    const plannedRelease = document.getElementById('plannedRelease').value.trim();
    const status = document.getElementById('status').value;
    const selectedTypes = getSelectedWorkItemTypes();
    const matchType = document.querySelector('input[name="matchType"]:checked').value;
    
    if (!plannedRelease) {
        showError('Please specify Planned Release');
        return;
    }
    
    if (selectedTypes.length === 0) {
        showError('Please select at least one Work Item Type');
        return;
    }
    
    showLoading(true);
    clearError();
    
    try {
        // Build WIQL query with Exact or Contains matching
        let wiql = `SELECT [System.Id], [System.Title], [System.State], [System.WorkItemType], [System.AssignedTo], [Custom.plannedrelease] FROM WorkItems WHERE [System.TeamProject] = '${config.project}'`;
        
        if (matchType === 'exact') {
            wiql += ` AND [Custom.plannedrelease] = '${plannedRelease}'`;
        } else {
            wiql += ` AND [Custom.plannedrelease] CONTAINS '${plannedRelease}'`;
        }
        
        if (status) {
            wiql += ` AND [System.State] = '${status}'`;
        }
        
        if (!selectedTypes.includes('All')) {
            wiql += ` AND [System.WorkItemType] IN ('${selectedTypes.join("', '")}')`;
        }
        
        // Fetch work items using WIQL
        const wiqlUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/wiql?api-version=7.0`;
        const wiqlResponse = await fetch(wiqlUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: wiql })
        });
        
        if (!wiqlResponse.ok) {
            throw new Error(`WIQL query failed: ${wiqlResponse.statusText}`);
        }
        
        const wiqlData = await wiqlResponse.json();
        const workItemIds = wiqlData.workItems.map(wi => wi.id);
        
        if (workItemIds.length === 0) {
            showError('No work items found matching the filters');
            showLoading(false);
            return;
        }
        
        // Fetch detailed work item data with relations
        const batchUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems?ids=${workItemIds.join(',')}&$expand=relations&api-version=7.0`;
        const batchResponse = await fetch(batchUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat)
            }
        });
        
        if (!batchResponse.ok) {
            throw new Error(`Failed to fetch work item details: ${batchResponse.statusText}`);
        }
        
        const batchData = await batchResponse.json();
        workItems = await Promise.all(batchData.value.map(async (item) => {
            const childTasks = await fetchChildTasks(item);
            const hasComment = await checkExistingComment(item.id);
            return {
                id: item.id,
                type: item.fields['System.WorkItemType'],
                title: item.fields['System.Title'],
                state: item.fields['System.State'],
                plannedRelease: item.fields['Custom.plannedrelease'] || 'N/A',
                assignedTo: item.fields['System.AssignedTo']?.displayName || 'Unassigned',
                devTask: childTasks.dev,
                intTask: childTasks.int,
                hasExistingComment: hasComment,
                selected: false
            };
        }));
        
        // Store search context for displayWorkItems
        window.searchContext = {
            searchTerm: plannedRelease,
            matchType: matchType
        };
        
        displayWorkItems();
        showLoading(false);
        
    } catch (error) {
        showError(`Error: ${error.message}`);
        showLoading(false);
    }
}

async function checkExistingComment(workItemId) {
    try {
        const commentsUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${workItemId}/comments?api-version=7.0-preview`;
        const response = await fetch(commentsUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat)
            }
        });
        
        if (!response.ok) {
            return false;
        }
        
        const data = await response.json();
        
        // Check if any comment contains the signature text
        const signatureText = 'This item will be delivered in version specified in';
        return data.comments && data.comments.some(comment => 
            comment.text && comment.text.includes(signatureText)
        );
    } catch (error) {
        console.error(`Error checking comments for ${workItemId}:`, error);
        return false;
    }
}

async function fetchChildTasks(workItem) {
    const result = { dev: null, int: null, mdev: null, mint: null };
    
    if (!workItem.relations) {
        return result;
    }
    
    const childRelations = workItem.relations.filter(rel => 
        rel.rel === 'System.LinkTypes.Hierarchy-Forward'
    );
    
    if (childRelations.length === 0) {
        return result;
    }
    
    // First pass - collect all child tasks
    for (const relation of childRelations) {
        const childId = relation.url.split('/').pop();
        
        try {
            const childUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${childId}?api-version=7.0`;
            const childResponse = await fetch(childUrl, {
                headers: {
                    'Authorization': 'Basic ' + btoa(':' + config.pat)
                }
            });
            
            if (childResponse.ok) {
                const childData = await childResponse.json();
                const title = childData.fields['System.Title'] || '';
                const assignedTo = childData.fields['System.AssignedTo']?.displayName || 'Unassigned';
                
                const taskInfo = {
                    id: childId,
                    title: title,
                    assignedTo: assignedTo
                };
                
                // Check for DEV task (exact match, higher priority)
                if (title.includes(' DEV') || title.startsWith('DEV')) {
                    if (!result.dev) result.dev = taskInfo;
                }
                // Check for MDEV task (fallback)
                else if (title.includes('MDEV')) {
                    if (!result.mdev) result.mdev = taskInfo;
                }
                
                // Check for INT task (exact match, higher priority)
                if (title.includes(' INT') || title.startsWith('INT')) {
                    if (!result.int) result.int = taskInfo;
                }
                // Check for MINT task (fallback)
                else if (title.includes('MINT')) {
                    if (!result.mint) result.mint = taskInfo;
                }
            }
        } catch (error) {
            console.error(`Error fetching child task ${childId}:`, error);
        }
    }
    
    // Apply fallback logic: if DEV not found, use MDEV; if INT not found, use MINT
    return {
        dev: result.dev || result.mdev,
        int: result.int || result.mint
    };
}

function displayWorkItems() {
    const tbody = document.getElementById('workItemsBody');
    tbody.innerHTML = '';
    const filterMultipleVersions = document.getElementById('filterMultipleVersions')?.checked || false;
    const filterWithoutComment = document.getElementById('filterWithoutComment')?.checked || false;
    
    let displayedCount = 0;
    const searchContext = window.searchContext || { matchType: 'exact', searchTerm: '' };
    
    workItems.forEach((item, index) => {
        // Check if item has multiple versions (semicolon or comma separated)
        const hasMultipleVersions = item.plannedRelease && (item.plannedRelease.includes(';') || item.plannedRelease.includes(','));
        
        // Check if item is a partial match (in Contains mode, when planned release doesn't exactly match search term)
        const isPartialMatch = searchContext.matchType === 'contains' && 
            item.plannedRelease !== searchContext.searchTerm && 
            item.plannedRelease !== 'N/A';
        
        // Mark as suspicious if has multiple versions OR is a partial match
        const isSuspicious = hasMultipleVersions || isPartialMatch;
        
        // Apply filters
        if (filterMultipleVersions && !isSuspicious) {
            return; // Skip this item
        }
        if (filterWithoutComment && item.hasExistingComment) {
            return; // Skip items that already have comment
        }
        
        displayedCount++;
        
        // Build Azure DevOps URL
        const workItemUrl = `https://${config.organization}.visualstudio.com/${config.project}/_workitems/edit/${item.id}/`;
        
        const row = document.createElement('tr');
        const commentWarning = item.hasExistingComment ? 
            '<span style="color: #ff6b6b; font-size: 18px; cursor: help;" title="Similar comment already exists on this work item">⚠️</span>' : 
            '';
        
        // Add exclamation icon for suspicious items
        let multipleVersionsIcon = '';
        if (hasMultipleVersions) {
            multipleVersionsIcon = '<span style="color: #ffc107; margin-left: 5px; cursor: help;" title="This work item has multiple versions (separated by ; or ,) in Planned Release field">⚠️</span>';
        } else if (isPartialMatch) {
            multipleVersionsIcon = '<span style="color: #17a2b8; margin-left: 5px; cursor: help;" title="Partial match: searched for \"' + searchContext.searchTerm + '\" but found \"' + item.plannedRelease + '\"">ℹ️</span>';
        }
        
        row.innerHTML = `
            <td class="checkbox-cell">
                <input type="checkbox" onchange="toggleItemSelection(${index})" ${item.selected ? 'checked' : ''} />
            </td>
            <td><a href="${workItemUrl}" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">${item.id}</a></td>
            <td>${item.type}</td>
            <td>${item.title}</td>
            <td><span class="status-badge status-${item.state.toLowerCase().replace(' ', '-')}">${item.state}</span></td>
            <td>${item.plannedRelease}${multipleVersionsIcon}</td>
            <td>${item.assignedTo}</td>
            <td>${item.devTask ? `${item.devTask.assignedTo}` : '❌ Not found'}</td>
            <td>${item.intTask ? `${item.intTask.assignedTo}` : '❌ Not found'}</td>
            <td style="text-align: center;">${commentWarning}</td>
        `;
        
        row.style.cursor = 'pointer';
        row.onclick = (e) => {
            // Don't trigger when clicking checkbox or link
            if (e.target.type === 'checkbox' || e.target.tagName === 'A') return;
            showItemPreview(index);
        };
        
        if (item.selected) {
            row.classList.add('selected');
        }
        
        tbody.appendChild(row);
    });
    
    document.getElementById('workItemsSection').style.display = 'block';
    const totalElement = document.getElementById('totalCount');
    if (filterMultipleVersions && displayedCount < workItems.length) {
        totalElement.textContent = `${displayedCount} (of ${workItems.length})`;
    } else {
        totalElement.textContent = workItems.length;
    }
    updateSelectedCount();
}

function toggleItemSelection(index) {
    workItems[index].selected = !workItems[index].selected;
    displayWorkItems();
    updatePreview();
}

function toggleSelectAll() {
    const checked = document.getElementById('selectAllCheckbox').checked;
    workItems.forEach(item => item.selected = checked);
    displayWorkItems();
    updatePreview();
}

function selectAll() {
    workItems.forEach(item => item.selected = true);
    document.getElementById('selectAllCheckbox').checked = true;
    displayWorkItems();
    updatePreview();
}

function selectWithoutComment() {
    let selectedCount = 0;
    workItems.forEach(item => {
        if (!item.hasExistingComment) {
            item.selected = true;
            selectedCount++;
        } else {
            item.selected = false;
        }
    });
    document.getElementById('selectAllCheckbox').checked = false;
    displayWorkItems();
    updatePreview();
    showSuccess(`Selected ${selectedCount} item(s) without existing comment`);
}

function deselectAll() {
    workItems.forEach(item => item.selected = false);
    document.getElementById('selectAllCheckbox').checked = false;
    displayWorkItems();
    updatePreview();
}

function updateSelectedCount() {
    const count = workItems.filter(item => item.selected).length;
    document.getElementById('selectedCount').textContent = count;
    updatePreview();
}

function showItemPreview(index) {
    const item = workItems[index];
    const comment = generateComment(item);
    
    document.getElementById('previewComment').innerHTML = comment;
    document.getElementById('previewSection').style.display = 'block';
}

function updatePreview() {
    const selectedItems = workItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
        document.getElementById('previewSection').style.display = 'none';
        return;
    }
    
    const firstItem = selectedItems[0];
    const comment = generateComment(firstItem);
    
    document.getElementById('previewComment').innerHTML = comment;
    document.getElementById('previewSection').style.display = 'block';
}

function generateComment(item) {
    const developer = item.devTask ? item.devTask.assignedTo : 'Not assigned';
    const tester = item.intTask ? item.intTask.assignedTo : 'Not assigned';
    
    // Add @ mention for Azure DevOps notifications (only if assigned)
    const developerMention = developer !== 'Not assigned' ? `<strong>@${developer}</strong>` : developer;
    const testerMention = tester !== 'Not assigned' ? `<strong>@${tester}</strong>` : tester;
    
    // Get selected template
    const textArea = document.getElementById('customCommentText');
    let template = textArea ? textArea.value : commentTemplates.readyForTest;
    
    // Replace placeholders and convert newlines to HTML
    let comment = template
        .replace(/{PLANNED_RELEASE}/g, `<strong>${item.plannedRelease}</strong>`)
        .replace(/{DEVELOPER}/g, developerMention)
        .replace(/{TESTER}/g, testerMention);
    
    // Convert plain text newlines to HTML line breaks for Azure DevOps
    comment = comment.replace(/\n/g, '<br>');
    
    return comment;
}

async function addCommentsToSelected() {
    const selectedItems = workItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
        showError('Please select at least one work item');
        return;
    }
    
    if (!confirm(`Add comments to ${selectedItems.length} work item(s)?`)) {
        return;
    }
    
    showLoading(true);
    clearError();
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const item of selectedItems) {
        try {
            await addCommentToWorkItem(item.id, item);
            successCount++;
        } catch (error) {
            console.error(`Failed to add comment to ${item.id}:`, error);
            errorCount++;
        }
    }
    
    showLoading(false);
    
    if (errorCount === 0) {
        showSuccess(`Successfully added comments to ${successCount} work item(s)!`);
    } else {
        showError(`Added comments to ${successCount} work item(s), but ${errorCount} failed. Check console for details.`);
    }
}

async function fetchSingleItem() {
    const itemId = document.getElementById('singleItemId').value.trim();
    
    if (!itemId) {
        showError('Please enter a Work Item ID');
        return;
    }
    
    if (!config.organization || !config.project || !config.pat) {
        showError('Please configure Organization, Project, and PAT first');
        return;
    }
    
    showLoading(true);
    clearError();
    
    try {
        // Fetch work item details
        const itemUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${itemId}?$expand=relations&api-version=7.0`;
        const itemResponse = await fetch(itemUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat)
            }
        });
        
        if (!itemResponse.ok) {
            throw new Error(`Work item ${itemId} not found`);
        }
        
        const itemData = await itemResponse.json();
        const childTasks = await fetchChildTasks(itemData);
        
        const item = {
            id: itemData.id,
            type: itemData.fields['System.WorkItemType'],
            title: itemData.fields['System.Title'],
            state: itemData.fields['System.State'],
            plannedRelease: itemData.fields['Custom.plannedrelease'] || 'N/A',
            assignedTo: itemData.fields['System.AssignedTo']?.displayName || 'Unassigned',
            devTask: childTasks.dev,
            intTask: childTasks.int,
            selected: true
        };
        
        // Replace workItems with single item
        workItems = [item];
        displayWorkItems();
        showLoading(false);
        showSuccess(`Work item ${itemId} loaded successfully!`);
        
    } catch (error) {
        showLoading(false);
        showError(`Error: ${error.message}`);
    }
}

async function addCommentToSingleItem() {
    const itemId = document.getElementById('singleItemId').value.trim();
    
    if (!itemId) {
        showError('Please enter a Work Item ID');
        return;
    }
    
    if (!config.organization || !config.project || !config.pat) {
        showError('Please configure Organization, Project, and PAT first');
        return;
    }
    
    showLoading(true);
    clearError();
    
    try {
        // Fetch work item details
        const itemUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${itemId}?$expand=relations&api-version=7.0`;
        const itemResponse = await fetch(itemUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat)
            }
        });
        
        if (!itemResponse.ok) {
            throw new Error(`Work item ${itemId} not found`);
        }
        
        const itemData = await itemResponse.json();
        const childTasks = await fetchChildTasks(itemData);
        
        const item = {
            id: itemData.id,
            plannedRelease: itemData.fields['Custom.plannedrelease'] || 'N/A',
            devTask: childTasks.dev,
            intTask: childTasks.int
        };
        
        await addCommentToWorkItem(itemId, item);
        
        showLoading(false);
        showSuccess(`Comment added successfully to work item ${itemId}!`);
        
    } catch (error) {
        showLoading(false);
        showError(`Error: ${error.message}`);
    }
}

async function addCommentToWorkItem(workItemId, item) {
    const comment = generateComment(item);
    
    const commentUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${workItemId}/comments?api-version=7.0-preview`;
    
    const response = await fetch(commentUrl, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(':' + config.pat),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text: comment
        })
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Azure DevOps API Error:', errorBody);
        throw new Error(`Failed to add comment to ${workItemId}: ${response.statusText} - ${errorBody}`);
    }
    
    return await response.json();
}

function clearResults() {
    workItems = [];
    document.getElementById('workItemsSection').style.display = 'none';
    document.getElementById('previewSection').style.display = 'none';
    clearError();
}

function showLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `<div class="error">❌ ${message}</div>`;
}

function showSuccess(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.innerHTML = `<div class="success">✅ ${message}</div>`;
    setTimeout(() => {
        errorDiv.innerHTML = '';
    }, 5000);
}

function clearError() {
    document.getElementById('errorMessage').innerHTML = '';
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    if (tabName === 'main') {
        document.getElementById('mainTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tabName === 'testClosure') {
        document.getElementById('testClosureTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    } else if (tabName === 'settings') {
        document.getElementById('settingsTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[2].classList.add('active');
    }
}

// ==================== TEST CLOSURE REPORT FUNCTIONS ====================

let testReportData = null;

function toggleSearchType() {
    const searchType = document.querySelector('input[name="searchType"]:checked').value;
    const label = document.getElementById('searchLabel');
    const input = document.getElementById('testPlanSearch');
    const hint = document.getElementById('searchHint');
    
    if (searchType === 'id') {
        label.textContent = 'Test Plan ID:';
        input.placeholder = 'Enter Test Plan ID (e.g., 12345)';
        hint.textContent = 'Enter the numeric ID of the test plan';
    } else {
        label.textContent = 'Release Number:';
        input.placeholder = 'Enter Release Number (e.g., 26.1.4)';
        hint.textContent = 'Enter the release number that appears in test plan name (e.g., INT - Release 26.1.4)';
    }
}

async function testSearchPlans() {
    const searchValue = document.getElementById('testPlanSearch').value.trim();
    const searchType = document.querySelector('input[name="searchType"]:checked').value;
    
    if (!searchValue) {
        showTestReportError('Please enter a ' + (searchType === 'id' ? 'Test Plan ID' : 'Release Number'));
        return;
    }
    
    if (!config.organization || !config.project || !config.pat) {
        showTestReportError('Please configure Organization, Project, and PAT in Settings first');
        return;
    }
    
    showTestReportLoading(true);
    clearTestReportError();
    
    try {
        const plansUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans?api-version=7.1-preview.1`;
        const response = await fetch(plansUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat)
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`Failed to fetch test plans (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        
        let html = `<p style="margin-bottom: 10px;"><strong>Total Test Plans found:</strong> ${data.value.length}</p>`;
        
        if (searchType === 'release') {
            html += `<p style="margin-bottom: 15px; color: #666;"><strong>Searching for:</strong> "${searchValue}"</p>`;
            
            // Find matching plans
            const matchingPlans = data.value.filter(plan => 
                plan.name && plan.name.toLowerCase().includes(searchValue.toLowerCase())
            );
            
            if (matchingPlans.length > 0) {
                html += `<p style="color: #28a745; font-weight: bold; margin-bottom: 10px;"><i class="fas fa-check-circle"></i> Found ${matchingPlans.length} matching plan(s):</p>`;
                html += '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
                html += '<tr style="background: #007bff; color: white;"><th style="padding: 8px; text-align: left;">ID</th><th style="padding: 8px; text-align: left;">Name</th><th style="padding: 8px; text-align: left;">State</th></tr>';
                matchingPlans.forEach(plan => {
                    html += `<tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 8px;">${plan.id}</td>
                        <td style="padding: 8px;"><strong>${plan.name}</strong></td>
                        <td style="padding: 8px;">${plan.state || 'N/A'}</td>
                    </tr>`;
                });
                html += '</table>';
            } else {
                html += `<p style="color: #dc3545; font-weight: bold;"><i class="fas fa-times-circle"></i> No test plans found with "${searchValue}" in the name</p>`;
            }
            
            // Show all available plans
            html += `<details style="margin-top: 20px;">
                <summary style="cursor: pointer; font-weight: bold; color: #007bff;">Show all available Test Plans (${data.value.length})</summary>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
                <tr style="background: #6c757d; color: white;"><th style="padding: 6px; text-align: left;">ID</th><th style="padding: 6px; text-align: left;">Name</th></tr>`;
            
            data.value.forEach(plan => {
                const highlight = plan.name && plan.name.toLowerCase().includes(searchValue.toLowerCase());
                html += `<tr style="border-bottom: 1px solid #ddd; ${highlight ? 'background: #fff3cd;' : ''}">
                    <td style="padding: 6px;">${plan.id}</td>
                    <td style="padding: 6px;">${plan.name}</td>
                </tr>`;
            });
            html += '</table></details>';
        } else {
            // Just show all plans for ID search
            html += '<table style="width: 100%; border-collapse: collapse; font-size: 13px;">';
            html += '<tr style="background: #007bff; color: white;"><th style="padding: 8px; text-align: left;">ID</th><th style="padding: 8px; text-align: left;">Name</th><th style="padding: 8px; text-align: left;">State</th></tr>';
            data.value.forEach(plan => {
                const highlight = plan.id.toString() === searchValue;
                html += `<tr style="border-bottom: 1px solid #ddd; ${highlight ? 'background: #d4edda;' : ''}">
                    <td style="padding: 8px;"><strong>${plan.id}</strong></td>
                    <td style="padding: 8px;">${plan.name}</td>
                    <td style="padding: 8px;">${plan.state || 'N/A'}</td>
                </tr>`;
            });
            html += '</table>';
        }
        
        document.getElementById('testSearchContent').innerHTML = html;
        document.getElementById('testSearchResults').style.display = 'block';
        showTestReportLoading(false);
        
    } catch (error) {
        showTestReportLoading(false);
        showTestReportError(`Error: ${error.message}`);
        console.error('Test search error:', error);
    }
}

async function findTestPlanByRelease(releaseNumber) {
    const plansUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans?api-version=7.1-preview.1`;
    const response = await fetch(plansUrl, {
        headers: {
            'Authorization': 'Basic ' + btoa(':' + config.pat)
        }
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch test plans (${response.status})`);
    }
    
    const data = await response.json();
    
    // Search for plan with release number in name
    const matchingPlan = data.value.find(plan => 
        plan.name && plan.name.toLowerCase().includes(releaseNumber.toLowerCase())
    );
    
    if (!matchingPlan) {
        throw new Error(`No test plan found with release number "${releaseNumber}"`);
    }
    
    return matchingPlan.id;
}

async function generateTestReport() {
    const searchValue = document.getElementById('testPlanSearch').value.trim();
    const searchType = document.querySelector('input[name="searchType"]:checked').value;
    const targetRelease = document.getElementById('targetRelease').value.trim();
    
    if (!searchValue) {
        showTestReportError('Please enter a ' + (searchType === 'id' ? 'Test Plan ID' : 'Release Number'));
        return;
    }
    
    if (!config.organization || !config.project || !config.pat) {
        showTestReportError('Please configure Organization, Project, and PAT in Settings first');
        return;
    }
    
    showTestReportLoading(true);
    clearTestReportError();
    document.getElementById('testReportSection').style.display = 'none';
    
    try {
        // Determine Test Plan ID
        let testPlanId;
        if (searchType === 'release') {
            testPlanId = await findTestPlanByRelease(searchValue);
            showTestReportSuccess(`Found Test Plan ID ${testPlanId} for release ${searchValue}`);
        } else {
            testPlanId = searchValue;
        }
        
        // Fetch Test Plan details
        const planUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${testPlanId}?api-version=7.1-preview.1`;
        const planResponse = await fetch(planUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat)
            }
        });
        
        if (!planResponse.ok) {
            const errorText = await planResponse.text();
            console.error('API Error:', planResponse.status, errorText);
            throw new Error(`Test Plan ${testPlanId} not found (${planResponse.status})`);
        }
        
        const planData = await planResponse.json();
        
        // Fetch Test Suites
        const suitesUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/plans/${testPlanId}/suites?api-version=7.1-preview.1`;
        const suitesResponse = await fetch(suitesUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(':' + config.pat)
            }
        });
        
        if (!suitesResponse.ok) {
            const errorText = await suitesResponse.text();
            console.error('API Error:', suitesResponse.status, errorText);
            throw new Error(`Failed to fetch test suites (${suitesResponse.status})`);
        }
        
        const suitesData = await suitesResponse.json();
        
        // Fetch Test Points for each suite
        const suiteResults = await Promise.all(
            suitesData.value.map(async (suite) => {
                return await fetchTestSuiteDetails(testPlanId, suite);
            })
        );
        
        // Determine target release: use manual input if provided, otherwise use search value if searching by release
        const finalTargetRelease = targetRelease || (searchType === 'release' ? searchValue : 'N/A');
        
        // Build report data
        testReportData = {
            planId: testPlanId,
            planName: planData.name,
            targetRelease: finalTargetRelease,
            generated: new Date().toLocaleString('en-GB'),
            suites: suiteResults
        };
        
        // Calculate stats
        calculateTestStats(testReportData);
        
        // Generate and display report
        const reportHtml = generateReportHtml(testReportData);
        document.getElementById('testReportContent').innerHTML = reportHtml;
        document.getElementById('testReportSection').style.display = 'block';
        document.getElementById('copyReportBtn').style.display = 'inline-flex';
        
        showTestReportLoading(false);
        showTestReportSuccess('Test report generated successfully!');
        
    } catch (error) {
        showTestReportLoading(false);
        showTestReportError(`Error: ${error.message}`);
        console.error('Test report generation error:', error);
    }
}

async function fetchTestSuiteDetails(planId, suite) {
    // Fetch test cases in suite using Test Plan API
    const pointsUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/testplan/Plans/${planId}/Suites/${suite.id}/TestPoint?includePointDetails=true&api-version=7.1-preview.2`;
    const pointsResponse = await fetch(pointsUrl, {
        headers: {
            'Authorization': 'Basic ' + btoa(':' + config.pat)
        }
    });
    
    if (!pointsResponse.ok) {
        console.warn(`Failed to fetch test points for suite ${suite.id}`);
        return {
            id: suite.id,
            name: suite.name,
            testCases: [],
            workItem: null
        };
    }
    
    const pointsData = await pointsResponse.json();
    
    // Enrich test cases with latest results
    const testCases = await Promise.all((pointsData.value || []).map(async (point) => {
        let latestResult = null;
        
        // Get the outcome from the test point
        if (point.results) {
            latestResult = {
                outcome: point.results.outcome || 'Not Executed',
                lastTestRun: point.results.lastTestRun,
                completedDate: point.results.lastResultDetails?.dateCompleted
            };
        } else if (point.mostRecentResultOutcome) {
            latestResult = {
                outcome: point.mostRecentResultOutcome,
                lastTestRun: null,
                completedDate: point.mostRecentResultCompletedDate
            };
        }
        
        return {
            testCase: {
                id: point.testCaseReference?.id || point.testCase?.id,
                name: point.testCaseReference?.name || point.testCase?.name || 'Unknown'
            },
            results: latestResult ? [latestResult] : [],
            outcome: latestResult?.outcome || 'Not Executed'
        };
    }));
    
    // Fetch work item details if suite has parent work item
    let workItem = null;
    if (suite.requirementId) {
        try {
            const wiUrl = `https://dev.azure.com/${config.organization}/${config.project}/_apis/wit/workitems/${suite.requirementId}?api-version=7.0`;
            const wiResponse = await fetch(wiUrl, {
                headers: {
                    'Authorization': 'Basic ' + btoa(':' + config.pat)
                }
            });
            
            if (wiResponse.ok) {
                const wiData = await wiResponse.json();
                workItem = {
                    id: wiData.id,
                    type: wiData.fields['System.WorkItemType'],
                    state: wiData.fields['System.State'],
                    plannedRelease: wiData.fields['Custom.plannedrelease'] || 'N/A'
                };
            }
        } catch (error) {
            console.error(`Failed to fetch work item ${suite.requirementId}:`, error);
        }
    }
    
    return {
        id: suite.id,
        name: suite.name,
        testCases: testCases,
        workItem: workItem
    };
}

function calculateTestStats(reportData) {
    let totalTests = 0;
    let executedTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let blockedTests = 0;
    let notExecutedTests = 0;
    
    reportData.suites.forEach(suite => {
        suite.testCases.forEach(tc => {
            totalTests++;
            const outcome = tc.outcome || 'Not Executed';
            
            if (outcome !== 'Not Executed' && outcome !== 'Unspecified' && outcome !== 'None') {
                executedTests++;
            }
            
            if (outcome === 'Passed') {
                passedTests++;
            } else if (outcome === 'Failed') {
                failedTests++;
            } else if (outcome === 'Blocked') {
                blockedTests++;
            } else {
                notExecutedTests++;
            }
        });
    });
    
    reportData.stats = {
        totalSuites: reportData.suites.length,
        totalTests,
        executedTests,
        passedTests,
        failedTests,
        blockedTests,
        notExecutedTests,
        executionRate: totalTests > 0 ? ((executedTests / totalTests) * 100).toFixed(2) : 0,
        passRate: executedTests > 0 ? ((passedTests / executedTests) * 100).toFixed(0) : 0
    };
}

function generateReportHtml(data) {
    const stats = data.stats;
    const qualityGate = stats.passRate >= 95 && stats.executionRate >= 98 ? 'PASS' : 'FAIL';
    
    let html = `
<h1>Integration - ${data.planName} - Test Coverage Report</h1>

<h2>Table of Contents</h2>
<ul>
    <li><a href="#executive-summary">Executive Summary</a></li>
    <li><a href="#quality-gate">Quality Gate Status</a></li>
    <li><a href="#test-failures">Test Execution Failures</a></li>
    <li><a href="#detailed-results">Detailed Test Results</a></li>
    <li><a href="#summary-table">Test Summary by Suite</a></li>
    <li><a href="#recommendations">Recommendations</a></li>
</ul>

<h2 id="executive-summary">Executive Summary</h2>
<table>
    <tr><td>Property</td><td>Value</td></tr>
    <tr><td>Test Plan</td><td>${data.planName}</td></tr>
    <tr><td>Target Release</td><td>${data.targetRelease}</td></tr>
    <tr><td>Report Generated</td><td>${data.generated}</td></tr>
    <tr><td>Total Test Suites</td><td>${stats.totalSuites}</td></tr>
    <tr><td>Total Test Cases</td><td>${stats.totalTests}</td></tr>
    <tr><td>Executed Tests</td><td>${stats.executedTests}</td></tr>
    <tr><td>Passed Tests</td><td>${stats.passedTests}</td></tr>
    <tr><td>Failed Tests</td><td>${stats.failedTests}</td></tr>
    <tr><td>Blocked Tests</td><td>${stats.blockedTests}</td></tr>
    <tr><td>Not Executed Tests</td><td>${stats.notExecutedTests}</td></tr>
    <tr><td>Execution Rate</td><td>${stats.executionRate}%</td></tr>
    <tr><td>Pass Rate</td><td>${stats.passRate}%</td></tr>
</table>

<h2 id="quality-gate">Quality Gate Status</h2>
<p><strong>${qualityGate}</strong> - ${qualityGate === 'PASS' ? 'Quality criteria met' : 'Insufficient test coverage or significant test failures'}</p>

<h2 id="test-failures">Test Execution Failures</h2>
<p>Summary: ${stats.failedTests} test case(s) have failed in their most recent execution.</p>
${generateFailedTestsList(data)}

<h2 id="detailed-results">Detailed Test Results</h2>
${generateDetailedResults(data)}

<h2 id="summary-table">Test Summary by Suite</h2>
${generateSummaryTable(data)}

<h2 id="recommendations">Recommendations</h2>
${generateRecommendations(data)}
`;
    
    return html;
}

function generateFailedTestsList(data) {
    let html = '';
    data.suites.forEach(suite => {
        const failedTests = suite.testCases.filter(tc => tc.outcome === 'Failed');
        if (failedTests.length > 0) {
            html += `<h3>Suite: ${suite.name}</h3>`;
            failedTests.forEach(tc => {
                const lastRun = tc.results?.[0];
                html += `
<p>
    <strong>Test Case:</strong> ${tc.testCase?.name || 'Unknown'} (ID: ${tc.testCase?.id || 'N/A'})<br>
    <strong>Last Failure:</strong> ${lastRun?.completedDate ? new Date(lastRun.completedDate).toLocaleDateString('en-GB') : 'N/A'}<br>
    <strong>Test Run:</strong> ${lastRun?.lastTestRun?.name || 'N/A'}
</p>`;
            });
        }
    });
    return html || '<p>No test failures</p>';
}

function generateDetailedResults(data) {
    let html = '';
    
    data.suites.forEach(suite => {
        const totalTests = suite.testCases.length;
        const executedTests = suite.testCases.filter(tc => tc.outcome && tc.outcome !== 'Not Executed' && tc.outcome !== 'Unspecified' && tc.outcome !== 'None').length;
        const passedTests = suite.testCases.filter(tc => tc.outcome === 'Passed').length;
        const failedTests = suite.testCases.filter(tc => tc.outcome === 'Failed').length;
        const notExecutedTests = totalTests - executedTests;
        
        html += `
<h3>${suite.name}</h3>`;
        
        if (suite.workItem) {
            html += `
<h4>Work Item Details</h4>
<table>
    <tr><td>Property</td><td>Value</td></tr>
    <tr><td>ID</td><td>${suite.workItem.id}</td></tr>
    <tr><td>Type</td><td>${suite.workItem.type}</td></tr>
    <tr><td>State</td><td>${suite.workItem.state}</td></tr>
    <tr><td>Planned Release</td><td>${suite.workItem.plannedRelease}</td></tr>
</table>`;
        }
        
        html += `
<h4>Suite Overview</h4>
<p>
    Total Test Cases: ${totalTests}<br>
    Executed: ${executedTests} (${totalTests > 0 ? ((executedTests/totalTests)*100).toFixed(1) : 0}%)<br>
    Passed: ${passedTests} (${executedTests > 0 ? ((passedTests/executedTests)*100).toFixed(1) : 0}%)<br>
    ${failedTests > 0 ? `Failed: ${failedTests}<br>` : ''}
    ${notExecutedTests > 0 ? `Not Executed: ${notExecutedTests}` : ''}
</p>

<h4>Test Cases</h4>`;
        
        suite.testCases.forEach(tc => {
            const outcome = tc.outcome || 'Not Executed';
            const outcomeIcon = outcome === 'Passed' ? 'PASS' : outcome === 'Failed' ? 'FAIL' : outcome === 'Blocked' ? 'BLOCKED' : 'NOT EXECUTED';
            
            html += `
<h5>${tc.testCase?.name || 'Unknown Test Case'}</h5>
<p>
    Test Case ID: ${tc.testCase?.id || 'N/A'}<br>
    ${outcome !== 'Not Executed' && outcome !== 'Unspecified' && outcome !== 'None' ? `
    Execution History:<br>
    ${tc.results?.[0]?.completedDate ? new Date(tc.results[0].completedDate).toLocaleDateString('en-GB') : 'N/A'}: ${outcomeIcon}<br>
    Test Run: ${tc.results?.[0]?.lastTestRun?.name || 'N/A'}
    ` : `Status: ${outcomeIcon}`}
</p>`;
        });
    });
    
    return html;
}

function generateSummaryTable(data) {
    let html = `
<table>
    <tr>
        <th>Suite</th>
        <th>Total</th>
        <th>Executed</th>
        <th>Passed</th>
        <th>Failed</th>
        <th>Not Executed</th>
        <th>Execution %</th>
        <th>Pass %</th>
    </tr>`;
    
    data.suites.forEach(suite => {
        const totalTests = suite.testCases.length;
        const executedTests = suite.testCases.filter(tc => tc.outcome && tc.outcome !== 'Not Executed' && tc.outcome !== 'Unspecified' && tc.outcome !== 'None').length;
        const passedTests = suite.testCases.filter(tc => tc.outcome === 'Passed').length;
        const failedTests = suite.testCases.filter(tc => tc.outcome === 'Failed').length;
        const notExecutedTests = totalTests - executedTests;
        const executionRate = totalTests > 0 ? ((executedTests/totalTests)*100).toFixed(1) : 0;
        const passRate = executedTests > 0 ? ((passedTests/executedTests)*100).toFixed(0) : 0;
        
        html += `
    <tr>
        <td>${suite.name.substring(0, 30)}...</td>
        <td>${totalTests}</td>
        <td>${executedTests}</td>
        <td>${passedTests}</td>
        <td>${failedTests}</td>
        <td>${notExecutedTests}</td>
        <td>${executionRate}%</td>
        <td>${passRate}%</td>
    </tr>`;
    });
    
    html += `
</table>`;
    
    return html;
}

function generateRecommendations(data) {
    const stats = data.stats;
    let recommendations = '';
    
    if (stats.failedTests > 0) {
        recommendations += `<p>Failed Test Cases (${stats.failedTests} tests) - Investigate and fix failing tests before release</p>`;
    }
    
    if (stats.notExecutedTests > 0) {
        recommendations += `<p>Unexecuted Tests (${stats.notExecutedTests} tests) - Schedule execution of remaining test cases</p>`;
    }
    
    if (stats.executionRate < 98) {
        recommendations += `<p>Low execution rate (${stats.executionRate}%) - Increase test coverage</p>`;
    }
    
    if (recommendations === '') {
        recommendations = '<p>All quality criteria met - Ready for release</p>';
    }
    
    recommendations += `
<p>Report generated automatically from Azure DevOps</p>
<p>Last updated: ${new Date().toISOString()}</p>`;
    
    return recommendations;
}

function copyReportToClipboard() {
    const reportHtml = document.getElementById('testReportContent').innerHTML;
    navigator.clipboard.writeText(reportHtml).then(() => {
        showTestReportSuccess('Report HTML copied to clipboard!');
    }).catch(err => {
        showTestReportError('Failed to copy to clipboard: ' + err);
    });
}

function showTestReportLoading(show) {
    document.getElementById('testReportLoading').style.display = show ? 'block' : 'none';
}

function showTestReportError(message) {
    const errorDiv = document.getElementById('testReportError');
    errorDiv.innerHTML = `<div class="error">${message}</div>`;
}

function showTestReportSuccess(message) {
    const errorDiv = document.getElementById('testReportError');
    errorDiv.innerHTML = `<div class="success">${message}</div>`;
    setTimeout(() => {
        errorDiv.innerHTML = '';
    }, 5000);
}

function clearTestReportError() {
    document.getElementById('testReportError').innerHTML = '';
}
