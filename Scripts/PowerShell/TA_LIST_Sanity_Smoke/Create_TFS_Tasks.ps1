# TFS Task Generator for User Story 50079
# Creates DEV and INT tasks under the parent User Story
# Now includes Excel file update functionality

param(
    [Parameter(Mandatory=$false)]
    [string]$OrganizationUrl = "https://dev.azure.com/infomedics",
    
    [Parameter(Mandatory=$false)]
    [string]$ProjectName = "TIM",
    
    [Parameter(Mandatory=$true)]
    [string]$PAT, # Personal Access Token
    
    [Parameter(Mandatory=$false)]
    [string]$ParentUserStoryId = "50079", # User Story 50079
    
    [Parameter(Mandatory=$false)]
    [string]$ExcelPath = "d:\SQL\SQL\TA_LIST_Sanity_Smoke\TA_list_FINAL.xlsx" # Excel tracker file
)

# Test cases data - extracted from your list
$SanityTests = @(
    @{ ID = "S01"; Name = "Stop on Claim in Inzicht"; Status = "DONE"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Claims Management" },
    @{ ID = "S02"; Name = "Stop on Claim in TIM"; Status = "TODO"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Claims Management" },
    @{ ID = "S03"; Name = "Redelivery on a Claim"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Claims Management" },
    @{ ID = "S04"; Name = "Closing stop on a Claim"; Status = "90%"; Assigned = ""; DevPoints = 4; IntPoints = 2; Category = "Claims Management" },
    @{ ID = "S05"; Name = "Resurrect a Claim"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Claims Management" },
    @{ ID = "S06"; Name = "Send claim to Clearing"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Claims Management" },
    @{ ID = "S07"; Name = "Match Payment with a Claim"; Status = "TODO"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Payment Processing" },
    @{ ID = "S08"; Name = "Automatch Payment with a Claim"; Status = "TODO"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Payment Processing" },
    @{ ID = "S09"; Name = "Create Payment Agreement"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Payment Processing" },
    @{ ID = "S10"; Name = "Download PDF on Payment Page"; Status = "TODO"; Assigned = ""; DevPoints = 1; IntPoints = 1; Category = "Payment Processing" },
    @{ ID = "S11"; Name = "Pay a claim on Payment Page"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Payment Processing" },
    @{ ID = "S12"; Name = "Unmatch Payment from claim"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Payment Processing" },
    @{ ID = "S13"; Name = "Make a Payback"; Status = "TODO"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Payment Processing" },
    @{ ID = "S14"; Name = "Small open amount tests"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Payment Processing" },
    @{ ID = "S15"; Name = "Create IA 100%"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Integration & Automation" },
    @{ ID = "S16"; Name = "Create IA 0%"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Integration & Automation" },
    @{ ID = "S17"; Name = "Create IA with IRCR"; Status = "DONE"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Integration & Automation" },
    @{ ID = "S18"; Name = "IA with IRCR - Result print"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Integration & Automation" },
    @{ ID = "S19"; Name = "IA with IRCR - Result Stop"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Integration & Automation" },
    @{ ID = "S20"; Name = "IA with IRCR - Result SSP Action"; Status = "TODO"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Integration & Automation" },
    @{ ID = "S21"; Name = "Push through action"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Integration & Automation" },
    @{ ID = "S22"; Name = "Add/Change IRCR Code"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Integration & Automation" },
    @{ ID = "S23"; Name = "Add Message to BA from TIM"; Status = "DONE"; Assigned = ""; DevPoints = 1; IntPoints = 1; Category = "Business Administration" },
    @{ ID = "S24"; Name = "Add Message to Agent from Inzicht"; Status = "DONE"; Assigned = ""; DevPoints = 1; IntPoints = 1; Category = "Business Administration" },
    @{ ID = "S25"; Name = "Settle any settlement"; Status = "DONE"; Assigned = ""; DevPoints = 4; IntPoints = 2; Category = "Business Administration" },
    @{ ID = "S26"; Name = "Settle any settlement CHA"; Status = "TODO"; Assigned = "Cezary"; DevPoints = 4; IntPoints = 2; Category = "Business Administration" },
    @{ ID = "S27"; Name = "Create Copy of printed document"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Business Administration" },
    @{ ID = "S28"; Name = "Create BA and process claimfile"; Status = "DONE"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Business Administration" },
    @{ ID = "S29"; Name = "Change settle date - Ledger View"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Business Administration" },
    @{ ID = "S30"; Name = "Add Correction to Settlement"; Status = "TODO"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Business Administration" },
    @{ ID = "S31"; Name = "Login (TIM/Inzicht/IAM)"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "System Access" },
    @{ ID = "S32"; Name = "Change Password"; Status = "DONE"; Assigned = ""; DevPoints = 1; IntPoints = 1; Category = "System Access" },
    @{ ID = "S33"; Name = "Create Ticket in HelpDesk"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "System Access" },
    @{ ID = "S34"; Name = "Resolve Ticket in HelpDesk"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "System Access" },
    @{ ID = "S35"; Name = "Create Approval"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "System Access" },
    @{ ID = "S36"; Name = "Resolve Approval"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "System Access" },
    @{ ID = "S37"; Name = "Check Ledger View in Inzicht"; Status = "DONE"; Assigned = ""; DevPoints = 1; IntPoints = 1; Category = "Data Management" },
    @{ ID = "S38"; Name = "Upload claim file by Inzicht"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Data Management" },
    @{ ID = "S39"; Name = "Upload claim file by TIM UI"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Data Management" },
    @{ ID = "S40"; Name = "Upload claim file by Folder"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Data Management" },
    @{ ID = "S41"; Name = "Change Follow UP on interpretation"; Status = "TODO"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Data Management" },
    @{ ID = "S42"; Name = "Check UBO feature"; Status = "DONE"; Assigned = ""; DevPoints = 2; IntPoints = 1; Category = "Data Management" },
    @{ ID = "S43"; Name = "Complaint"; Status = "DONE"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Special Processes" },
    @{ ID = "S44"; Name = "Address Change"; Status = "TODO"; Assigned = "Tomek"; DevPoints = 3; IntPoints = 2; Category = "Special Processes" },
    @{ ID = "S45"; Name = "CMIB Deal"; Status = "TODO"; Assigned = ""; DevPoints = 4; IntPoints = 3; Category = "Special Processes" },
    @{ ID = "S46"; Name = "DPAY Process (ClaimFile/PM35+)"; Status = "TODO"; Assigned = ""; DevPoints = 5; IntPoints = 3; Category = "Special Processes" },
    @{ ID = "S47"; Name = "Create/Resolve Complaint Action"; Status = "TODO"; Assigned = "Przemo"; DevPoints = 5; IntPoints = 3; Category = "Special Processes" }
)

$SmokeTests = @(
    @{ ID = "SM01"; Name = "Settle Settlement for BA"; Status = "DONE"; Assigned = "Kamil"; DevPoints = 4; IntPoints = 3; Category = "Core Business" },
    @{ ID = "SM02"; Name = "Settle ROBP Settlement for BA"; Status = "TODO"; Assigned = ""; DevPoints = 4; IntPoints = 3; Category = "Core Business" },
    @{ ID = "SM03"; Name = "Generate PDP XML"; Status = "TODO"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Core Business" },
    @{ ID = "SM04"; Name = "Generate CSV XML"; Status = "TODO"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Core Business" },
    @{ ID = "SM05"; Name = "PA with DD and matching"; Status = "TODO"; Assigned = ""; DevPoints = 4; IntPoints = 3; Category = "Core Business" },
    @{ ID = "SM06"; Name = "PA with DD reject matching"; Status = "TODO"; Assigned = ""; DevPoints = 4; IntPoints = 3; Category = "Core Business" },
    @{ ID = "SM07"; Name = "Send Claim to Bailiff (full flow)"; Status = "TODO"; Assigned = ""; DevPoints = 5; IntPoints = 4; Category = "Core Business" },
    @{ ID = "SM08"; Name = "Create BA Invoice - DD - matching"; Status = "TODO"; Assigned = ""; DevPoints = 4; IntPoints = 3; Category = "Core Business" },
    @{ ID = "SM09"; Name = "DPAY WS scenarios"; Status = "TODO"; Assigned = ""; DevPoints = 5; IntPoints = 4; Category = "Core Business" },
    @{ ID = "SM10"; Name = "Create IA with different IRCR"; Status = "TODO"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Core Business" },
    @{ ID = "SM11"; Name = "Create Address Change action"; Status = "TODO"; Assigned = ""; DevPoints = 3; IntPoints = 2; Category = "Core Business" }
)

# Combine all tests
$AllTests = $SanityTests + $SmokeTests

function Create-TFSTask {
    param(
        [string]$Title,
        [string]$Description,
        [string]$AssignedTo,
        [int]$StoryPoints,
        [string]$WorkItemType = "Task",
        [string]$ParentWorkItemId,
        [string]$Tags = ""
    )

    $headers = @{
        'Authorization' = "Basic $([Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$PAT")))"
        'Content-Type' = 'application/json-patch+json'
    }

    $body = @(
        @{
            op = "add"
            path = "/fields/System.Title"
            value = $Title
        },
        @{
            op = "add"
            path = "/fields/System.Description"
            value = $Description
        }
    )

    if ($StoryPoints -gt 0) {
        $body += @{
            op = "add"
            path = "/fields/Microsoft.VSTS.Scheduling.StoryPoints"
            value = $StoryPoints
        }
    }

    if ($AssignedTo -and $AssignedTo -ne "") {
        $body += @{
            op = "add"
            path = "/fields/System.AssignedTo"
            value = $AssignedTo
        }
    }

    if ($Tags -and $Tags -ne "") {
        $body += @{
            op = "add"
            path = "/fields/System.Tags"
            value = $Tags
        }
    }

    if ($ParentWorkItemId) {
        $body += @{
            op = "add"
            path = "/relations/-"
            value = @{
                rel = "System.LinkTypes.Hierarchy-Reverse"
                url = "$OrganizationUrl/$ProjectName/_apis/wit/workItems/$ParentWorkItemId"
            }
        }
    }

    $uri = "$OrganizationUrl/$ProjectName/_apis/wit/workitems/`$$WorkItemType" + "?api-version=7.0"
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body ($body | ConvertTo-Json -Depth 10)
        Write-Host "✅ Created: $Title (ID: $($response.id))" -ForegroundColor Green
        return $response.id
    }
    catch {
        Write-Error "❌ Failed to create task: $Title. Error: $($_.Exception.Message)"
        return $null
    }
}
# Function to update Excel file with created task IDs
function Update-ExcelWithTaskIds {
    param(
        [string]$ExcelPath,
        [hashtable]$TaskMapping # Key: TestID, Value: @{DevTaskId, IntTaskId}
    )
    
    if (-not (Test-Path $ExcelPath)) {
        Write-Warning "Excel file not found at: $ExcelPath"
        return
    }
    
    try {
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false
        $workbook = $excel.Workbooks.Open($ExcelPath)
        $worksheet = $workbook.Worksheets["TA_Tracker"]
        
        $lastRow = $worksheet.UsedRange.Rows.Count
        
        Write-Host "Updating Excel file with task IDs and hyperlink columns..." -ForegroundColor Yellow
        
        # Find DevTaskID and IntTaskID columns
        $headers = @()
        for ($col = 1; $col -le $worksheet.UsedRange.Columns.Count; $col++) {
            $headers += $worksheet.Cells(1, $col).Value
        }
        
        $devTaskIdCol = ($headers.IndexOf("DevTaskID")) + 1
        $intTaskIdCol = ($headers.IndexOf("IntTaskID")) + 1
        $testIdCol = ($headers.IndexOf("ID")) + 1
        
        if ($devTaskIdCol -eq 0 -or $intTaskIdCol -eq 0 -or $testIdCol -eq 0) {
            Write-Warning "Required columns not found in Excel file"
            return
        }
        
        # Add hyperlink columns if they don't exist
        $devLinkCol = ($headers.IndexOf("DEV Task Link")) + 1
        $intLinkCol = ($headers.IndexOf("INT Task Link")) + 1
        
        if ($devLinkCol -eq 0) {
            # Add DEV Task Link column after IntTaskID
            $devLinkCol = $intTaskIdCol + 1
            $worksheet.Cells(1, $devLinkCol).Value = "DEV Task Link"
            Write-Host "Added DEV Task Link column" -ForegroundColor Green
        }
        
        if ($intLinkCol -eq 0) {
            # Add INT Task Link column after DEV Task Link
            $intLinkCol = $devLinkCol + 1
            $worksheet.Cells(1, $intLinkCol).Value = "INT Task Link"
            Write-Host "Added INT Task Link column" -ForegroundColor Green
        }
        
        # Update task IDs and add hyperlink formulas for each row
        for ($row = 2; $row -le $lastRow; $row++) {
            $testId = $worksheet.Cells($row, $testIdCol).Value
            
            if ($TaskMapping.ContainsKey($testId)) {
                $tasks = $TaskMapping[$testId]
                
                # Update DevTaskID
                if ($tasks.DevTaskId) {
                    $worksheet.Cells($row, $devTaskIdCol).Value = $tasks.DevTaskId
                }
                
                # Update IntTaskID  
                if ($tasks.IntTaskId) {
                    $worksheet.Cells($row, $intTaskIdCol).Value = $tasks.IntTaskId
                }
            }
            
            # Add hyperlink formulas (these will work when task IDs are populated)
            # DEV Task Link formula
            $devFormula = "=IF(" + [char]([int][char]'A' + $devTaskIdCol - 1) + "$row<>`"`",HYPERLINK(`"$OrganizationUrl/$ProjectName/_workitems/edit/`"&" + [char]([int][char]'A' + $devTaskIdCol - 1) + "$row,`"Open DEV `"&" + [char]([int][char]'A' + $devTaskIdCol - 1) + "$row),`"`")"
            $worksheet.Cells($row, $devLinkCol).Formula = $devFormula
            
            # INT Task Link formula  
            $intFormula = "=IF(" + [char]([int][char]'A' + $intTaskIdCol - 1) + "$row<>`"`",HYPERLINK(`"$OrganizationUrl/$ProjectName/_workitems/edit/`"&" + [char]([int][char]'A' + $intTaskIdCol - 1) + "$row,`"Open INT `"&" + [char]([int][char]'A' + $intTaskIdCol - 1) + "$row),`"`")"
            $worksheet.Cells($row, $intLinkCol).Formula = $intFormula
        }
        
        $workbook.Save()
        Write-Host "Excel file updated successfully with task IDs and hyperlink columns!" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to update Excel file: $($_.Exception.Message)"
    }
    finally {
        if ($workbook) { $workbook.Close() }
        if ($excel) { $excel.Quit() }
        
        # Clean up COM objects
        if ($worksheet) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($worksheet) | Out-Null }
        if ($workbook) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null }
        if ($excel) { [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null }
    }
}
function Create-AllTasks {
    param(
        [string]$FilterStatus = "", # "TODO", "DONE", "" for all
        [string]$FilterCategory = "", # Category filter
        [switch]$CreateOnlyDev,
        [switch]$CreateOnlyInt,
        [switch]$SkipDone
    )

    Write-Host "🚀 Starting TFS Task Creation for User Story $ParentUserStoryId" -ForegroundColor Cyan
    Write-Host "Organization: $OrganizationUrl" -ForegroundColor Gray
    Write-Host "Project: $ProjectName" -ForegroundColor Gray
    Write-Host ""

    $filteredTests = $AllTests

    if ($SkipDone) {
        $filteredTests = $filteredTests | Where-Object { $_.Status -ne "DONE" }
    }

    if ($FilterStatus) {
        $filteredTests = $filteredTests | Where-Object { $_.Status -eq $FilterStatus }
    }

    if ($FilterCategory) {
        $filteredTests = $filteredTests | Where-Object { $_.Category -eq $FilterCategory }
    }

    $totalTests = $filteredTests.Count
    $currentTest = 0
    $taskMapping = @{} # Track created task IDs for Excel update

    foreach ($test in $filteredTests) {
        $currentTest++
        Write-Host "[$currentTest/$totalTests] Processing $($test.ID): $($test.Name)" -ForegroundColor Yellow

        $devTitle = "DEV - $($test.ID) | $($test.Name)"
        $intTitle = "INT - $($test.ID) | $($test.Name)"
        
        $devDescription = @"
<h3>🛠️ Development Task: Automated Test Implementation</h3>
<p><strong>Test ID:</strong> $($test.ID)</p>
<p><strong>Test Name:</strong> $($test.Name)</p>
<p><strong>Category:</strong> $($test.Category)</p>
<p><strong>Parent User Story:</strong> 50079 - TA | Sanity and Smoke Tests Preparation in Playwright</p>

<h4>📋 Acceptance Criteria:</h4>
<ul>
<li>✅ Playwright test script created and working</li>
<li>✅ Test data prepared and documented</li>
<li>✅ Page objects implemented (if applicable)</li>
<li>✅ Test can run independently</li>
<li>✅ Test follows team coding standards</li>
<li>✅ Code reviewed and approved</li>
<li>✅ Test added to test suite</li>
</ul>

<h4>🔧 Technical Requirements:</h4>
<ul>
<li>Use Playwright framework</li>
<li>Follow existing page object patterns</li>
<li>Include proper error handling</li>
<li>Add appropriate assertions</li>
<li>Include test data setup/teardown</li>
</ul>

<h4>📁 Deliverables:</h4>
<ul>
<li>Test script file</li>
<li>Test data files (if needed)</li>
<li>Updated page objects (if needed)</li>
<li>Documentation updates</li>
</ul>
"@

        $intDescription = @"
<h3>🧪 Integration Testing Task: Test Validation</h3>
<p><strong>Test ID:</strong> $($test.ID)</p>
<p><strong>Test Name:</strong> $($test.Name)</p>
<p><strong>Category:</strong> $($test.Category)</p>
<p><strong>Parent User Story:</strong> 50079 - TA | Sanity and Smoke Tests Preparation in Playwright</p>

<h4>📋 Acceptance Criteria:</h4>
<ul>
<li>✅ Test executes successfully in INT environment</li>
<li>✅ Test results are documented and reviewed</li>
<li>✅ Any defects are logged and tracked</li>
<li>✅ Test is stable (multiple runs successful)</li>
<li>✅ Test is added to regression suite</li>
<li>✅ Performance impact assessed</li>
</ul>

<h4>🔍 Testing Scope:</h4>
<ul>
<li>Functional validation in INT environment</li>
<li>Cross-browser compatibility (if applicable)</li>
<li>Test data scenarios</li>
<li>Error handling validation</li>
<li>Integration with existing test suite</li>
</ul>

<h4>📊 Deliverables:</h4>
<ul>
<li>Test execution report</li>
<li>Defect reports (if any)</li>
<li>Performance assessment</li>
<li>Sign-off for production deployment</li>
</ul>
"@

        $devTaskId = $null
        $intTaskId = $null

        # Create DEV task
        if (-not $CreateOnlyInt) {
            Write-Host "  Creating DEV task..." -ForegroundColor Cyan
            $devTaskId = Create-TFSTask -Title $devTitle -Description $devDescription -StoryPoints $test.DevPoints -ParentWorkItemId $ParentUserStoryId -Tags "automation;playwright;development;$($test.Category.Replace(' ', '-').ToLower())" -AssignedTo $test.Assigned
        }

        # Create INT task
        if (-not $CreateOnlyDev) {
            Write-Host "  Creating INT task..." -ForegroundColor Cyan
            
            # If we created a DEV task, link INT task to it, otherwise link to User Story
            $parentId = if ($devTaskId) { $devTaskId } else { $ParentUserStoryId }
            
            $intTaskId = Create-TFSTask -Title $intTitle -Description $intDescription -StoryPoints $test.IntPoints -ParentWorkItemId $parentId -Tags "automation;playwright;integration-testing;$($test.Category.Replace(' ', '-').ToLower())"
        }

        # Store task IDs for Excel update
        if ($devTaskId -or $intTaskId) {
            $taskMapping[$test.ID] = @{
                DevTaskId = $devTaskId
                IntTaskId = $intTaskId
            }
        }

        Start-Sleep -Milliseconds 500 # Rate limiting
        Write-Host ""
    }

    Write-Host "🎉 Task creation completed!" -ForegroundColor Green
    Write-Host "📊 Created tasks for $totalTests tests" -ForegroundColor Green
    
    # Update Excel file with created task IDs
    if ($taskMapping.Count -gt 0 -and (Test-Path $ExcelPath)) {
        Write-Host "🔄 Updating Excel file with task IDs..." -ForegroundColor Yellow
        Update-ExcelWithTaskIds -ExcelPath $ExcelPath -TaskMapping $taskMapping
    } elseif (-not (Test-Path $ExcelPath)) {
        Write-Warning "Excel file not found at: $ExcelPath. Task IDs not updated in Excel."
    }
}

# Function to create tasks for specific categories
function Create-TasksForCategory {
    param([string]$Category)
    
    Write-Host "Creating tasks for category: $Category" -ForegroundColor Magenta
    Create-AllTasks -FilterCategory $Category
}

# Function to create tasks only for pending items
function Create-PendingTasks {
    Write-Host "Creating tasks only for pending tests..." -ForegroundColor Magenta
    Create-AllTasks -SkipDone
}

# Main execution
Write-Host "🔧 TFS Task Generator for User Story 50079" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available functions:" -ForegroundColor Yellow
Write-Host "• Create-AllTasks                    - Create all tasks" -ForegroundColor White
Write-Host "• Create-PendingTasks               - Create only pending tasks" -ForegroundColor White  
Write-Host "• Create-TasksForCategory 'Claims Management' - Create tasks for specific category" -ForegroundColor White
Write-Host "• Create-AllTasks -CreateOnlyDev    - Create only DEV tasks" -ForegroundColor White
Write-Host "• Create-AllTasks -CreateOnlyInt    - Create only INT tasks" -ForegroundColor White
Write-Host ""
Write-Host "Example usage:" -ForegroundColor Yellow
Write-Host ".\Create_TFS_Tasks.ps1 -PAT 'your-pat-token'" -ForegroundColor White
Write-Host "Create-PendingTasks" -ForegroundColor White
Write-Host ""

# If script is run directly (not imported), create pending tasks
if ($MyInvocation.InvocationName -ne '.') {
    Create-PendingTasks
}