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
    } else if (tabName === 'settings') {
        document.getElementById('settingsTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}
