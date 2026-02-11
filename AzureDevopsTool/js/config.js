// ==================== CONFIGURATION ====================

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
let config = {
    organization: 'infomedics',
    project: 'TIM',
    pat: ''
};

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
