// ==================== TEST CLOSURE REPORT MODULE ====================

let testReportData = null;

function toggleSearchType() {
    const searchType = document.querySelector('input[name="searchType"]:checked').value;
    const label = document.getElementById('searchLabel');
    const input = document.getElementById('testPlanSearch');
    const hint = document.getElementById('searchHint');
    
    if (searchType === 'id') {
        label.textContent = 'Test Plan ID';
        input.placeholder = 'e.g., 12345';
        hint.textContent = 'Enter the Test Plan ID from Azure DevOps';
    } else {
        label.textContent = 'Release Number';
        input.placeholder = 'e.g., 26.1.4';
        hint.textContent = 'Enter the release number (e.g., for "INT - Release 26.1.4" enter "26.1.4")';
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
        
        // Use search value as target release when searching by release number
        const finalTargetRelease = searchType === 'release' ? searchValue : 'N/A';
        
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
        document.getElementById('copyMarkdownBtn').style.display = 'inline-flex';
        
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
    const testCases = (pointsData.value || []).map((point) => {
        let latestResult = null;
        let outcome = 'Not Executed';
        
        // Check results.outcome which contains the actual test execution outcome
        if (point.results && point.results.outcome) {
            // Capitalize first letter: "passed" -> "Passed"
            outcome = point.results.outcome.charAt(0).toUpperCase() + point.results.outcome.slice(1);
            latestResult = {
                outcome: outcome,
                lastTestRun: { name: 'N/A' },
                completedDate: point.results.lastResultDetails?.dateCompleted || point.lastUpdatedDate
            };
        }
        
        return {
            testCase: {
                id: point.testCaseReference?.id || point.testCase?.id,
                name: point.testCaseReference?.name || point.testCase?.name || 'Unknown'
            },
            results: latestResult ? [latestResult] : [],
            outcome: outcome
        };
    });
    
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
    <li><a href="#test-failures">Test Execution Failures</a></li>
    <li><a href="#detailed-results">Detailed Test Results</a></li>
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

<h2 id="test-failures">Test Execution Failures</h2>
<p>Summary: ${stats.failedTests} test case(s) have failed in their most recent execution.</p>
${generateFailedTestsList(data)}

<h2 id="detailed-results">Detailed Test Results</h2>
${generateDetailedResults(data)}
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
        
        // Skip suites with no test cases
        if (totalTests === 0) return;
        
        const executedTests = suite.testCases.filter(tc => tc.outcome && tc.outcome !== 'Not Executed' && tc.outcome !== 'Unspecified' && tc.outcome !== 'None').length;
        const passedTests = suite.testCases.filter(tc => tc.outcome === 'Passed').length;
        const failedTests = suite.testCases.filter(tc => tc.outcome === 'Failed').length;
        const notExecutedTests = totalTests - executedTests;
        
        html += `
<h3>${suite.name}</h3>`;
        
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
<p><strong>TC ${tc.testCase?.id || 'N/A'}:</strong> ${tc.testCase?.name || 'Unknown Test Case'} - <strong>${outcomeIcon}</strong></p>`;
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

function copyMarkdownToClipboard() {
    const markdown = generateMarkdownReport(testReportData);
    navigator.clipboard.writeText(markdown).then(() => {
        showTestReportSuccess('Report Markdown copied to clipboard! Ready for Azure Wiki.');
    }).catch(err => {
        showTestReportError('Failed to copy to clipboard: ' + err);
    });
}

function generateMarkdownReport(data) {
    const stats = data.stats;
    const qualityGate = stats.passRate >= 95 && stats.executionRate >= 98 ? 'PASS' : 'FAIL';
    
    let md = `# Integration - ${data.planName} - Test Coverage Report\n\n`;
    
    md += `## Table of Contents\n\n`;
    md += `- [Executive Summary](#executive-summary)\n`;
    md += `- [Test Execution Failures](#test-failures)\n`;
    md += `- [Detailed Test Results](#detailed-results)\n\n`;
    
    md += `## Executive Summary\n\n`;
    md += `| Property | Value |\n`;
    md += `|----------|-------|\n`;
    md += `| Test Plan | ${data.planName} |\n`;
    md += `| Target Release | ${data.targetRelease} |\n`;
    md += `| Report Generated | ${data.generated} |\n`;
    md += `| Total Test Suites | ${stats.totalSuites} |\n`;
    md += `| Total Test Cases | ${stats.totalTests} |\n`;
    md += `| Executed Tests | ${stats.executedTests} |\n`;
    md += `| Passed Tests | ${stats.passedTests} |\n`;
    md += `| Failed Tests | ${stats.failedTests} |\n`;
    md += `| Blocked Tests | ${stats.blockedTests} |\n`;
    md += `| Not Executed Tests | ${stats.notExecutedTests} |\n`;
    md += `| Execution Rate | ${stats.executionRate}% |\n`;
    md += `| Pass Rate | ${stats.passRate}% |\n\n`;
    
    md += `## Test Execution Failures\n\n`;
    md += `Summary: ${stats.failedTests} test case(s) have failed in their most recent execution.\n\n`;
    md += generateFailedTestsMarkdown(data);
    
    md += `## Detailed Test Results\n\n`;
    md += generateDetailedResultsMarkdown(data);
    
    return md;
}

function generateFailedTestsMarkdown(data) {
    let md = '';
    data.suites.forEach(suite => {
        const failedTests = suite.testCases.filter(tc => tc.outcome === 'Failed');
        if (failedTests.length > 0) {
            md += `### Suite: ${suite.name}\n\n`;
            failedTests.forEach(tc => {
                const lastRun = tc.results?.[0];
                md += `**Test Case:** ${tc.testCase?.name || 'Unknown'} (ID: ${tc.testCase?.id || 'N/A'})\n`;
                md += `**Last Failure:** ${lastRun?.completedDate ? new Date(lastRun.completedDate).toLocaleDateString('en-GB') : 'N/A'}\n`;
                md += `**Test Run:** ${lastRun?.lastTestRun?.name || 'N/A'}\n\n`;
            });
        }
    });
    return md || 'No test failures\n\n';
}

function generateDetailedResultsMarkdown(data) {
    let md = '';
    
    data.suites.forEach((suite, index) => {
        const totalTests = suite.testCases.length;
        
        // Skip suites with no test cases
        if (totalTests === 0) return;
        
        const executedTests = suite.testCases.filter(tc => tc.outcome && tc.outcome !== 'Not Executed' && tc.outcome !== 'Unspecified' && tc.outcome !== 'None').length;
        const passedTests = suite.testCases.filter(tc => tc.outcome === 'Passed').length;
        const failedTests = suite.testCases.filter(tc => tc.outcome === 'Failed').length;
        const notExecutedTests = totalTests - executedTests;
        
        // Add horizontal line separator between suites (not before first suite)
        if (index > 0) {
            md += `---\n\n`;
        }
        
        // Extract work item ID from suite name and create hyperlink
        const workItemMatch = suite.name.match(/^(\d+)\s*:/);
        let suiteTitle = suite.name;
        if (workItemMatch) {
            const workItemId = workItemMatch[1];
            const restOfName = suite.name.substring(workItemMatch[0].length).trim();
            suiteTitle = `[${workItemId}](https://dev.azure.com/${config.organization}/${config.project}/_workitems/edit/${workItemId}) : ${restOfName}`;
        }
        
        md += `### ${suiteTitle}\n\n`;
        
        md += `#### Suite Overview\n\n`;
        md += `- Total Test Cases: ${totalTests}\n`;
        md += `- Executed: ${executedTests} (${totalTests > 0 ? ((executedTests/totalTests)*100).toFixed(1) : 0}%)\n`;
        md += `- Passed: ${passedTests} (${executedTests > 0 ? ((passedTests/executedTests)*100).toFixed(1) : 0}%)\n`;
        if (failedTests > 0) md += `- Failed: ${failedTests}\n`;
        if (notExecutedTests > 0) md += `- Not Executed: ${notExecutedTests}\n`;
        md += `\n#### Test Cases\n\n`;
        
        suite.testCases.forEach(tc => {
            const outcome = tc.outcome || 'Not Executed';
            let outcomeFormatted = '';
            
            // Color code outcomes using HTML spans for Azure Wiki
            if (outcome === 'Passed') {
                outcomeFormatted = '<span style="color:green; font-weight:bold;">PASS</span>';
            } else if (outcome === 'Failed') {
                outcomeFormatted = '<span style="color:red; font-weight:bold;">FAIL</span>';
            } else if (outcome === 'Blocked') {
                outcomeFormatted = '<span style="color:orange; font-weight:bold;">BLOCKED</span>';
            } else {
                outcomeFormatted = '<span style="color:gray; font-weight:bold;">NOT EXECUTED</span>';
            }
            
            md += `- **TC ${tc.testCase?.id || 'N/A'}:** ${tc.testCase?.name || 'Unknown Test Case'} - ${outcomeFormatted}\n`;
        });
    });
    
    return md;
}

function generateSummaryTableMarkdown(data) {
    let md = `| Suite | Total | Executed | Passed | Failed | Not Executed | Execution % | Pass % |\n`;
    md += `|-------|-------|----------|--------|--------|--------------|-------------|--------|\n`;
    
    data.suites.forEach(suite => {
        const totalTests = suite.testCases.length;
        const executedTests = suite.testCases.filter(tc => tc.outcome && tc.outcome !== 'Not Executed' && tc.outcome !== 'Unspecified' && tc.outcome !== 'None').length;
        const passedTests = suite.testCases.filter(tc => tc.outcome === 'Passed').length;
        const failedTests = suite.testCases.filter(tc => tc.outcome === 'Failed').length;
        const notExecutedTests = totalTests - executedTests;
        const executionRate = totalTests > 0 ? ((executedTests/totalTests)*100).toFixed(1) : 0;
        const passRate = executedTests > 0 ? ((passedTests/executedTests)*100).toFixed(0) : 0;
        
        const suiteName = suite.name.length > 40 ? suite.name.substring(0, 40) + '...' : suite.name;
        md += `| ${suiteName} | ${totalTests} | ${executedTests} | ${passedTests} | ${failedTests} | ${notExecutedTests} | ${executionRate}% | ${passRate}% |\n`;
    });
    
    md += `\n`;
    return md;
}

function generateRecommendationsMarkdown(data) {
    const stats = data.stats;
    let md = '';
    
    if (stats.failedTests > 0) {
        md += `- **Failed Test Cases** (${stats.failedTests} tests) - Investigate and fix failing tests before release\n`;
    }
    
    if (stats.notExecutedTests > 0) {
        md += `- **Unexecuted Tests** (${stats.notExecutedTests} tests) - Schedule execution of remaining test cases\n`;
    }
    
    if (stats.executionRate < 98) {
        md += `- **Low execution rate** (${stats.executionRate}%) - Increase test coverage\n`;
    }
    
    if (md === '') {
        md = '- All quality criteria met - Ready for release\n';
    }
    
    return md;
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
