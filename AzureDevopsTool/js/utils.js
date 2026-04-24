// ==================== UTILITY FUNCTIONS ====================

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
    const tabMap = {
        main:            { id: 'mainTab',            btnIndex: 0 },
        testClosure:     { id: 'testClosureTab',     btnIndex: 1 },
        testPlanBuilder: { id: 'testPlanBuilderTab', btnIndex: 2 },
        settings:        { id: 'settingsTab',        btnIndex: 3 }
    };

    const target = tabMap[tabName];
    if (target) {
        document.getElementById(target.id).classList.add('active');
        document.querySelectorAll('.tab-btn')[target.btnIndex].classList.add('active');
    }

    if (tabName === 'testPlanBuilder') {
        tpbInit();
    }
}
