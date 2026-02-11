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
