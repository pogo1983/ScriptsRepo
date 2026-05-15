# Export all Test Case titles from ADO using WIQL (fast, single query)
# Run locally — never hardcode your PAT; set it in the terminal session only
#
# Usage:
#   $env:ADO_PAT = "your-pat-here"   # set in terminal, do NOT hardcode
#   .\export-tc-names.ps1
#
# Output: tc-names.csv  (Id, Title)

param(
    [string]$OrgUrl  = "https://dev.azure.com/infomedics",
    [string]$Project = "TIM",
    [string]$Pat     =  PAT
)

if (-not $Pat) { Write-Error "Set `$env:ADO_PAT before running."; exit 1 }

$base64  = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$Pat"))
$headers = @{ Authorization = "Basic $base64"; "Content-Type" = "application/json" }

function Invoke-AdoGet($url) {
    try   { return Invoke-RestMethod $url -Headers $headers -ErrorAction Stop }
    catch {
        Write-Warning "GET $($_.Exception.Response.StatusCode.value__)  $url"
        return $null
    }
}

function Invoke-AdoPost($url, $body) {
    try   { return Invoke-RestMethod $url -Method Post -Headers $headers -Body ($body | ConvertTo-Json -Depth 5) -ErrorAction Stop }
    catch {
        Write-Warning "POST $($_.Exception.Response.StatusCode.value__)  $url"
        return $null
    }
}

# ── 1. WIQL: get all Test Case IDs ──────────────────────────────────────────
Write-Host "Querying all Test Cases via WIQL..."
$wiql = @{ query = "SELECT [System.Id] FROM WorkItems WHERE [System.WorkItemType] = 'Test Case' AND [System.TeamProject] = '$Project' ORDER BY [System.Id]" }
$wiqlResult = Invoke-AdoPost "$OrgUrl/$Project/_apis/wit/wiql?api-version=6.0" $wiql

if (-not $wiqlResult) { Write-Error "WIQL query failed."; exit 1 }

$allIds = $wiqlResult.workItems | ForEach-Object { $_.id }
Write-Host "Found $($allIds.Count) test cases — fetching titles in batches..."

# ── 2. Batch-fetch titles (200 IDs per request) ──────────────────────────────
$results = [System.Collections.Generic.List[object]]::new()
$batchSize = 200
$total = $allIds.Count
$done  = 0

for ($i = 0; $i -lt $allIds.Count; $i += $batchSize) {
    $batch = $allIds[$i .. [Math]::Min($i + $batchSize - 1, $allIds.Count - 1)]
    $body  = @{ ids = $batch; fields = @("System.Id","System.Title") }
    $r     = Invoke-AdoPost "$OrgUrl/_apis/wit/workitemsbatch?api-version=6.0" $body
    if ($r) {
        foreach ($wi in $r.value) {
            $results.Add([PSCustomObject]@{
                Id    = $wi.id
                Title = $wi.fields.'System.Title'
            })
        }
    }
    $done += $batch.Count
    Write-Host "  $done / $total"
}

# ── 3. Export ────────────────────────────────────────────────────────────────
$results | Export-Csv      "tc-names.csv"  -NoTypeInformation -Encoding UTF8
$results | ConvertTo-Json  -Depth 3 | Set-Content "tc-names.json" -Encoding UTF8

Write-Host "`nExported $($results.Count) test cases"
Write-Host "  → tc-names.csv"
Write-Host "  → tc-names.json"
$results | Select-Object -First 10 | Format-Table Id, Title -AutoSize

