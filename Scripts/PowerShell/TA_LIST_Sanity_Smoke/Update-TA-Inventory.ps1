# ============================================================
#  [SKRYPT 2/2]  Update-TA-Inventory.ps1
# ============================================================
#  CEL: Codzienne/regularne aktualizacje inventory.
#       Uruchamiaj po dodaniu nowych .feature files do repo.
#
#  CO ROBI:
#    - Czyta TA_Inventory.xlsx jako baze (nigdy go nie modyfikuje)
#    - Skanuje repo w poszukiwaniu .feature files
#    - Porownuje z tym co juz jest w inventory
#    - Jezeli znajdzie nowe pliki -> dodaje je jako TC-NNN z Status=DONE
#    - Zapisuje NOWY plik: TA_Inventory_YYYY-MM-DD.xlsx
#
#  ZASADY:
#    + Tylko DODAJE nowe wiersze - nigdy nic nie usuwa ani nie nadpisuje
#    + Istniejace statusy / osoby / notatki sa nienaruszone
#    + Nowe TC dostaja: Actor=?, Status=DONE, Notes=[AUTO] data
#    + Plik datowany wgrywasz na SharePoint jako aktualna wersja
#
#  WORKFLOW:
#    1. Deweloper dodaje nowy .feature do repo
#    2. Uruchamiasz: & .\Update-TA-Inventory.ps1
#    3. Skrypt tworzy TA_Inventory_YYYY-MM-DD.xlsx
#    4. Uzupelniasz Actor / Domain / Person w nowych wierszach
#    5. Wgrywasz plik na SharePoint (podmiana)
#    6. (opcjonalnie) Skopiuj datowany plik jako TA_Inventory.xlsx
#       zeby byl podstawa dla kolejnego update
#
#  Uzycie:
#    & .\Update-TA-Inventory.ps1              # wykryj nowe + zapisz datowany plik
#    & .\Update-TA-Inventory.ps1 -DiffOnly    # tylko pokaz co jest nowe (bez zapisu)
# ============================================================
param([switch]$DiffOnly)

$RepoRoot      = "d:\git\TimTestAutomation\AutomationTests"
$InventoryFile = "d:\SQL\SQL\TA_LIST_Sanity_Smoke\TA_Inventory.xlsx"
$OutputFile    = "d:\SQL\SQL\TA_LIST_Sanity_Smoke\TA_Inventory_$(Get-Date -Format 'yyyy-MM-dd').xlsx"

# Kolumny w TA_Report (1-based)
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

# ============================================================
# 1. Otworz TA_Inventory.xlsx i wczytaj zmapowane pliki
# ============================================================
if (-not (Test-Path $InventoryFile)) {
    Write-Host "BLAD: Nie znaleziono $InventoryFile" -ForegroundColor Red
    Write-Host "Najpierw uruchom Generate-TA-Report.ps1 zeby stworzyc inventory." -ForegroundColor Yellow
    exit 1
}

Write-Host "Czytam $([System.IO.Path]::GetFileName($InventoryFile))..." -ForegroundColor Cyan
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open($InventoryFile)
$ws = $wb.Sheets.Item("TA_Report")

# Zbierz wszystkie zmapowane basename'y z kolumny Feature_Files
$mappedBasenames = [System.Collections.Generic.HashSet[string]]::new(
    [System.StringComparer]::OrdinalIgnoreCase)
$maxTcNum = 0
$tcCount  = 0
$r = 2

while ($true) {
    $featureFiles = $ws.Cells.Item($r, $colFeatureFiles).Value2
    $tcId         = $ws.Cells.Item($r, $colTcId).Value2
    # Zatrzymaj gdy oba puste (koniec danych)
    if (-not $tcId -and -not $featureFiles) { break }

    if ($tcId -match "TC-(\d+)") {
        $num = [int]$Matches[1]
        if ($num -gt $maxTcNum) { $maxTcNum = $num }
    }

    if ($featureFiles) {
        foreach ($line in ($featureFiles -split "`n")) {
            $trimmed = $line.Trim()
            if ($trimmed) {
                $basename = [System.IO.Path]::GetFileNameWithoutExtension($trimmed).ToLower()
                $mappedBasenames.Add($basename) | Out-Null
            }
        }
    }

    $tcCount++
    $r++
}
$lastRow = $r - 1

Write-Host "  -> Wczytano $tcCount TC z inventory, ostatni numer: TC-$($maxTcNum.ToString('000'))" -ForegroundColor Green

# ============================================================
# 2. Skanuj repo i znajdz nowe pliki
# ============================================================
Write-Host "Skanuję repo..." -ForegroundColor Cyan
$features = Get-ChildItem -Path $RepoRoot -Recurse -Filter "*.feature" |
    Where-Object { $_.FullName -notmatch "\\Prepare\\" }

$newFiles = $features |
    Where-Object { -not $mappedBasenames.Contains($_.BaseName) } |
    ForEach-Object {
        $rel = $_.FullName -replace [regex]::Escape($RepoRoot + "\"), ""
        [PSCustomObject]@{ BaseName = $_.BaseName; RelPath = $rel }
    } | Sort-Object RelPath

Write-Host "  -> Znaleziono $($features.Count) .feature files w repo" -ForegroundColor Green

# ============================================================
# 3. Wynik
# ============================================================
Write-Host ""

if ($newFiles.Count -eq 0) {
    Write-Host "Inventory jest aktualne - brak nowych feature files!" -ForegroundColor Green
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    exit 0
}

Write-Host "Nowe feature files ($($newFiles.Count) szt):" -ForegroundColor Yellow
$newFiles | ForEach-Object { Write-Host "  $_($_.RelPath)" -ForegroundColor White }

if ($DiffOnly) {
    Write-Host ""
    Write-Host "Tryb DiffOnly - plik nie zostal zmodyfikowany." -ForegroundColor Cyan
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    exit 0
}

# ============================================================
# 4. Dodaj nowe wiersze do inventory
# ============================================================
Write-Host ""
Write-Host "Dodaję nowe wiersze..." -ForegroundColor Cyan

$colorDone = 0xC6EFCE  # zielony jak DONE

$tcIndex = $maxTcNum + 1
$rowIdx  = $lastRow + 1

foreach ($f in $newFiles) {
    $tcId     = "TC-{0:000}" -f $tcIndex
    $tcIndex++

    # Zamien CamelCase na spacje jako propozycja nazwy
    $testName = $f.BaseName -creplace "([a-z])([A-Z])", '$1 $2'

    $ws.Cells.Item($rowIdx, $colActor).Value2        = "?"
    $ws.Cells.Item($rowIdx, $colTcId).Value2         = $tcId
    $ws.Cells.Item($rowIdx, $colTestName).Value2     = $testName
    $ws.Cells.Item($rowIdx, $colDomain).Value2       = ""
    $ws.Cells.Item($rowIdx, $colTestType).Value2     = ""
    $ws.Cells.Item($rowIdx, $colStatus).Value2       = "DONE"
    $ws.Cells.Item($rowIdx, $colPerson).Value2       = ""
    $ws.Cells.Item($rowIdx, $colPriority).Value2     = "Medium"
    $ws.Cells.Item($rowIdx, $colFeatureFiles).Value2 = $f.RelPath
    $ws.Cells.Item($rowIdx, $colNotes).Value2        = "[AUTO] $(Get-Date -Format 'yyyy-MM-dd')"

    $ws.Cells.Item($rowIdx, $colStatus).Interior.Color  = $colorDone
    $ws.Cells.Item($rowIdx, $colFeatureFiles).WrapText  = $true

    Write-Host "  + $tcId  $testName" -ForegroundColor Green
    Write-Host "         $($f.RelPath)" -ForegroundColor DarkGray

    $rowIdx++
}

try {
    $wb.SaveAs($OutputFile, 51)  # 51 = xlOpenXMLWorkbook (.xlsx)
} finally {
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Dodano $($newFiles.Count) nowych TC do inventory" -ForegroundColor Green
Write-Host " Zapisano: $OutputFile" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
