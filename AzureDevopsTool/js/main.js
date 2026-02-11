// ==================== APPLICATION INITIALIZATION ====================

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

// Update comment template when dropdown changes
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('commentTemplate')?.addEventListener('change', function() {
        loadCommentTemplate();
    });
    
    document.getElementById('customCommentText')?.addEventListener('change', function() {
        if (document.getElementById('commentTemplate').value === 'custom') {
            saveCustomTemplate();
        }
    });
});
