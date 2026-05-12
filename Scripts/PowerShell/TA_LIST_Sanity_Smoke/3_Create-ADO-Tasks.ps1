# ============================================================
#  Create_ADO_Tasks.ps1
# ============================================================
#  CEL: Tworzy taski DEV + INT w Azure DevOps dla TC z TA_Inventory.xlsx.
#       Po utworzeniu zapisuje ID tasków z powrotem do kolumn ADO_Dev / ADO_Int.
#
#  WYMAGANIA:
#    - PAT (Personal Access Token) z uprawnieniami Work Items: Read & Write
#    - TA_Inventory.xlsx z wypełnionymi danymi TC
#
#  Uzycie:
#    # Podglad — co by zostalo utworzone (bez tworzenia)
#    & .\Create_ADO_Tasks.ps1 -WhatIf
#
#    # Domyslnie: tworzy taski dla TODO + IN PROGRESS + ALMOST (pomija DONE)
#    & .\Create_ADO_Tasks.ps1
#
#    # Tylko TODO
#    & .\Create_ADO_Tasks.ps1 -FilterStatus "TODO"
#
#    # Takze DONE (np. zeby wpiac ADO linki historycznie)
#    & .\Create_ADO_Tasks.ps1 -IncludeDone
#
#    # Konkretny TC
#    & .\Create_ADO_Tasks.ps1 -FilterTcId "TC-005"
#
#    # Filtruj po aktorze
#    & .\Create_ADO_Tasks.ps1 -FilterActor "Provider"
#
#    # Tylko DEV lub tylko INT taski
#    & .\Create_ADO_Tasks.ps1 -OnlyDev
#    & .\Create_ADO_Tasks.ps1 -OnlyInt
#
#    # Twórz nawet jesli ADO juz istnieje (nadpisz linki)
#    & .\Create_ADO_Tasks.ps1 -Force
# ============================================================
# ============================================================
#  WPISZ SWÓJ PAT TUTAJ (lub podaj przez parametr -PAT)
# ============================================================
$DefaultPAT = ""  # <-- wklej swój token

param(
    [string]$PAT = $DefaultPAT,

    [string]$OrganizationUrl   = "https://dev.azure.com/infomedics",
    [string]$ProjectName       = "TIM",
    [string]$ParentUserStoryId = "50079",
    [string]$InventoryFile     = "d:\SQL\SQL\TA_LIST_Sanity_Smoke\TA_Inventory.xlsx",

    [string]$FilterTcId    = "",   # np. "TC-005" — tylko ten jeden TC
    [string]$FilterActor   = "",   # np. "Agent" — filtruj po aktorze
    [string]$FilterStatus  = "",   # np. "TODO" — konkretny status; puste = TODO+IN PROGRESS+ALMOST
    [switch]$IncludeDone,          # uwzgledniaj tez TC ze statusem DONE
    [switch]$OnlyDev,              # twórz tylko DEV taski
    [switch]$OnlyInt,              # twórz tylko INT taski
    [switch]$Force,                # twórz nawet jeśli ADO_Dev/ADO_Int już wypełnione
    [switch]$WhatIf                # tylko pokaż co by zostało utworzone
)

# ============================================================
# Kolumny w TA_Report (1-based)
# ============================================================
$colActor        = 1
$colTcId         = 2
$colTestName     = 3
$colDomain       = 4
$colTestType     = 5
$colStatus       = 6
$colPerson       = 7
$colPriority     = 8
$colFeatureFiles = 9
$colNotes        = 10
$colAdoDev       = 11
$colAdoInt       = 12

# ============================================================
# 1. Czytaj TA_Inventory.xlsx
# ============================================================
if (-not $PAT) {
    Write-Host "BLAD: Nie podano PAT. Wpisz token w zmiennej `$DefaultPAT na gorze skryptu lub przekaz przez -PAT." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $InventoryFile)) {
    Write-Host "BLAD: Nie znaleziono $InventoryFile" -ForegroundColor Red
    exit 1
}

Write-Host "Czytam $([System.IO.Path]::GetFileName($InventoryFile))..." -ForegroundColor Cyan
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open($InventoryFile)
$ws = $wb.Sheets.Item("TA_Report")

$tcList = [System.Collections.Generic.List[PSCustomObject]]::new()
$r = 2
while ($true) {
    $tcId = $ws.Cells.Item($r, $colTcId).Value2
    $name = $ws.Cells.Item($r, $colTestName).Value2
    if (-not $tcId -and -not $name) { break }

    $tcList.Add([PSCustomObject]@{
        Row          = $r
        TcId         = $tcId
        Name         = $name
        Actor        = $ws.Cells.Item($r, $colActor).Value2
        Domain       = $ws.Cells.Item($r, $colDomain).Value2
        Status       = $ws.Cells.Item($r, $colStatus).Value2
        Priority     = $ws.Cells.Item($r, $colPriority).Value2
        Person       = $ws.Cells.Item($r, $colPerson).Value2
        FeatureFiles = $ws.Cells.Item($r, $colFeatureFiles).Value2
        AdoDev       = $ws.Cells.Item($r, $colAdoDev).Value2
        AdoInt       = $ws.Cells.Item($r, $colAdoInt).Value2
    })
    $r++
}
Write-Host "  -> Wczytano $($tcList.Count) TC" -ForegroundColor Green

# ============================================================
# 2. Filtrowanie
# ============================================================
$toProcess = $tcList

if ($FilterTcId) {
    $toProcess = $toProcess | Where-Object { $_.TcId -eq $FilterTcId }
}
if ($FilterActor) {
    $toProcess = $toProcess | Where-Object { $_.Actor -eq $FilterActor }
}

# Status filtering
if ($FilterStatus) {
    # konkretny status podany jawnie
    $toProcess = $toProcess | Where-Object { $_.Status -eq $FilterStatus }
} elseif (-not $IncludeDone) {
    # domyslnie: pomijaj DONE — twórz tylko dla TC które jeszcze wymagają pracy
    $toProcess = $toProcess | Where-Object { $_.Status -ne "DONE" }
}

if (-not $Force) {
    # Pomijaj TC które już mają ADO linki (chyba że -Force)
    $toProcess = $toProcess | Where-Object {
        (-not $OnlyInt -and -not $_.AdoDev) -or
        (-not $OnlyDev -and -not $_.AdoInt) -or
        ($OnlyDev   -and -not $_.AdoDev) -or
        ($OnlyInt   -and -not $_.AdoInt)
    }
}

Write-Host "  -> Do przetworzenia: $($toProcess.Count) TC" -ForegroundColor Green

if ($toProcess.Count -eq 0) {
    Write-Host ""
    Write-Host "Brak TC do przetworzenia." -ForegroundColor Yellow
    Write-Host "Użyj -Force żeby nadpisać istniejące ADO linki, lub -FilterTcId 'TC-XXX' dla konkretnego TC." -ForegroundColor Gray
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    exit 0
}

if ($WhatIf) {
    Write-Host ""
    Write-Host "=== WHATIF — taski które zostałyby utworzone ===" -ForegroundColor Yellow
    foreach ($tc in $toProcess) {
        $devLabel = if (-not $OnlyInt) { "DEV - $($tc.TcId) | $($tc.Name)" } else { "(pomijam DEV)" }
        $intLabel = if (-not $OnlyDev) { "INT - $($tc.TcId) | $($tc.Name)" } else { "(pomijam INT)" }
        Write-Host "  $($tc.TcId)  [$($tc.Actor)]  $($tc.Name)" -ForegroundColor White
        if (-not $OnlyInt) { Write-Host "    DEV: $devLabel" -ForegroundColor Cyan }
        if (-not $OnlyDev) { Write-Host "    INT: $intLabel" -ForegroundColor Magenta }
    }
    Write-Host ""
    Write-Host "Łącznie: $($toProcess.Count) TC → max $($toProcess.Count * (2 - [int]$OnlyDev.IsPresent - [int]$OnlyInt.IsPresent)) tasków ADO" -ForegroundColor Yellow
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    exit 0
}

# ============================================================
# 3. Funkcja tworzenia taska ADO
# ============================================================
function New-AdoTask {
    param(
        [string]$Title,
        [string]$Description,
        [string]$AssignedTo,
        [string]$Tags,
        [string]$ParentId
    )

    $headers = @{
        'Authorization' = "Basic $([Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$PAT")))"
        'Content-Type'  = 'application/json-patch+json'
    }

    $body = [System.Collections.Generic.List[object]]::new()
    $body.Add(@{ op="add"; path="/fields/System.Title";       value=$Title })
    $body.Add(@{ op="add"; path="/fields/System.Description"; value=$Description })

    if ($AssignedTo) {
        $body.Add(@{ op="add"; path="/fields/System.AssignedTo"; value=$AssignedTo })
    }
    if ($Tags) {
        $body.Add(@{ op="add"; path="/fields/System.Tags"; value=$Tags })
    }
    if ($ParentId) {
        $body.Add(@{
            op    = "add"
            path  = "/relations/-"
            value = @{
                rel = "System.LinkTypes.Hierarchy-Reverse"
                url = "$OrganizationUrl/$ProjectName/_apis/wit/workItems/$ParentId"
            }
        })
    }

    $uri = "$OrganizationUrl/$ProjectName/_apis/wit/workitems/`$Task?api-version=7.0"
    try {
        $resp = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -Body ($body | ConvertTo-Json -Depth 10)
        return $resp.id
    }
    catch {
        Write-Host "    BLAD: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# ============================================================
# 4. Twórz taski i zapisuj ID z powrotem do inventory
# ============================================================
$adoBaseUrl = "$OrganizationUrl/$ProjectName/_workitems/edit"
$created    = 0
$failed     = 0
$i          = 0

foreach ($tc in $toProcess) {
    $i++
    Write-Host "[$i/$($toProcess.Count)] $($tc.TcId)  $($tc.Name)" -ForegroundColor Yellow

    $tags        = "automation;playwright;$($tc.Domain -replace '[^a-zA-Z0-9]','-')"
    $assignedTo  = if ($tc.Person) { $tc.Person } else { "" }

    # --- DEV task ---
    if (-not $OnlyInt) {
        $devTitle = "DEV - $($tc.TcId) | $($tc.Name)"
        $devDesc  = "<b>TC:</b> $($tc.TcId)<br><b>Actor:</b> $($tc.Actor)<br><b>Domain:</b> $($tc.Domain)<br><b>Feature:</b> $($tc.FeatureFiles)<br><br><b>Cel:</b> Implementacja testu automatycznego w Playwright."

        $devId = New-AdoTask -Title $devTitle -Description $devDesc -AssignedTo $assignedTo -Tags $tags -ParentId $ParentUserStoryId

        if ($devId) {
            $devUrl = "$adoBaseUrl/$devId"
            $ws.Cells.Item($tc.Row, $colAdoDev).Hyperlinks.Add(
                $ws.Cells.Item($tc.Row, $colAdoDev),
                $devUrl, "", "", $devId.ToString()
            ) | Out-Null
            Write-Host "    DEV: #$devId  $devUrl" -ForegroundColor Cyan
            $created++
        } else {
            $failed++
        }
    }

    # --- INT task ---
    if (-not $OnlyDev) {
        $intTitle = "INT - $($tc.TcId) | $($tc.Name)"
        $intDesc  = "<b>TC:</b> $($tc.TcId)<br><b>Actor:</b> $($tc.Actor)<br><b>Domain:</b> $($tc.Domain)<br><b>Feature:</b> $($tc.FeatureFiles)<br><br><b>Cel:</b> Weryfikacja testu na środowisku INT."

        $intId = New-AdoTask -Title $intTitle -Description $intDesc -AssignedTo $assignedTo -Tags $tags -ParentId $ParentUserStoryId

        if ($intId) {
            $intUrl = "$adoBaseUrl/$intId"
            $ws.Cells.Item($tc.Row, $colAdoInt).Hyperlinks.Add(
                $ws.Cells.Item($tc.Row, $colAdoInt),
                $intUrl, "", "", $intId.ToString()
            ) | Out-Null
            Write-Host "    INT: #$intId  $intUrl" -ForegroundColor Magenta
            $created++
        } else {
            $failed++
        }
    }

    Start-Sleep -Milliseconds 300  # rate limiting ADO API
}

# ============================================================
# 5. Zapisz inventory z nowymi ADO linkami
# ============================================================
Write-Host ""
Write-Host "Zapisuję inventory z nowymi ADO linkami..." -ForegroundColor Cyan
$outputFile = "d:\SQL\SQL\TA_LIST_Sanity_Smoke\TA_Inventory_$(Get-Date -Format 'yyyy-MM-dd').xlsx"
try {
    $wb.SaveAs($outputFile, 51)
} finally {
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Gotowe!" -ForegroundColor Green
Write-Host " Utworzono tasków: $created" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host " Błędy:           $failed" -ForegroundColor Red
}
Write-Host " Zapisano:         $outputFile" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
