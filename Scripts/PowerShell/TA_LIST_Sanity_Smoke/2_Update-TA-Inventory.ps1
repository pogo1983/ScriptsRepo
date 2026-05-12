# ============================================================
#  [SKRYPT 2/3]  2_Update-TA-Inventory.ps1
# ============================================================
#  CEL: Jedyne narzedzie do codziennej obslugi inventory.
#       Uruchamiaj po kazdej zmianie w repo lub inventory.
#
#  CO ROBI:
#    - Czyta TA_Inventory.xlsx jako baze
#    - Skanuje repo w poszukiwaniu .feature files
#    - Jezeli znajdzie nowe pliki -> dodaje je jako TC-NNN z Status=DONE
#    - Zapisuje datowany plik: TA_Inventory_YYYY-MM-DD.xlsx
#    - Opcjonalnie (-UpdateBase) podmienia TA_Inventory.xlsx
#
#  ZASADY:
#    + Tylko DODAJE nowe wiersze - nigdy nic nie usuwa ani nie nadpisuje
#    + Istniejace dane (statusy, osoby, notatki, ADO linki) sa nienaruszone
#    + Nowe TC dostaja: Actor=?, Status=DONE, Notes=[AUTO] data
#    + Odporna na nowe kolumny - uzywa nazwanych stalych dla nr kolumn
#
#  WORKFLOW (zalecany):
#    1. Deweloper dodaje nowy .feature do repo
#    2. Uruchamiasz: & .\2_Update-TA-Inventory.ps1 -UpdateBase
#    3. Skrypt tworzy TA_Inventory_YYYY-MM-DD.xlsx (kopia datowana)
#       i automatycznie podmienia TA_Inventory.xlsx (nowa baza)
#    4. Uzupelniasz Actor / Domain / Person w nowych wierszach
#
#  Uzycie:
#    & .\2_Update-TA-Inventory.ps1                        # wykryj nowe + zapisz datowany plik
#    & .\2_Update-TA-Inventory.ps1 -UpdateBase            # jak wyzej + podmien TA_Inventory.xlsx
#    & .\2_Update-TA-Inventory.ps1 -DiffOnly              # tylko pokaz co jest nowe (bez zapisu)
#    & .\2_Update-TA-Inventory.ps1 -Sync                  # wykryj nowe + sprawdz czy stare sciezki wciaz istnieja
#    & .\2_Update-TA-Inventory.ps1 -Sync -UpdateBase      # pelny update z podmiana bazy
#    & .\2_Update-TA-Inventory.ps1 -Sync -DiffOnly        # tylko raport (bez zapisu)
#    & .\2_Update-TA-Inventory.ps1 -SkipGitAuthor         # nie pobieraj autora z git log
# ============================================================
param([switch]$DiffOnly, [switch]$Sync, [switch]$UpdateBase, [switch]$SkipGitAuthor)

$GitRoot = "d:\git\TimTestAutomation"

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
# Dla trybu Sync: lista wierszy z ich sciezkami (do weryfikacji)
$rowPaths = [System.Collections.Generic.List[PSCustomObject]]::new()
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
                if ($Sync) {
                    $rowPaths.Add([PSCustomObject]@{ Row=$r; TcId=$tcId; RelPath=$trimmed })
                }
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
        $rel    = $_.FullName -replace [regex]::Escape($RepoRoot + "\"), ""
        $lines  = Get-Content $_.FullName -TotalCount 25
        $allTags = ($lines | Where-Object { $_ -match "^\s*@" }) -join " "
        $domain  = if ($allTags -match "@Domain:(\S+)")  { $Matches[1] -replace "@.*", "" } else { "" }
        $actor   = if ($allTags -match "@Actor:(\w+)")   { $Matches[1] } else { "" }
        $suite   = if ($allTags -match "@Suite:(\w+)")   { $Matches[1] } else { "" }
        $gitRel  = $_.FullName -replace [regex]::Escape($GitRoot + "\\"), "" -replace "\\", "/"
        $author  = if (-not $SkipGitAuthor) {
            $raw = git -C $GitRoot log --diff-filter=A --follow --format="%an" -- $gitRel 2>$null | Select-Object -First 1
            if (-not $raw) { $raw = git -C $GitRoot log --follow --format="%an" -1 -- $gitRel 2>$null | Select-Object -First 1 }
            $raw
        } else { "" }
        [PSCustomObject]@{ BaseName = $_.BaseName; RelPath = $rel; Domain = $domain; Actor = $actor; Suite = $suite; Author = $author }
    } | Sort-Object RelPath

Write-Host "  -> Znaleziono $($features.Count) .feature files w repo" -ForegroundColor Green

# Zbuduj set aktualnych sciezek (lowercase) dla weryfikacji
$repoRelPaths = [System.Collections.Generic.HashSet[string]]::new(
    [System.StringComparer]::OrdinalIgnoreCase)
foreach ($f in $features) {
    $rel = $f.FullName -replace [regex]::Escape($RepoRoot + "\"), ""
    $repoRelPaths.Add($rel) | Out-Null
}

# ============================================================
# 3. Sync — weryfikacja istniejacych sciezek (opcjonalnie)
# ============================================================
$brokenRows = [System.Collections.Generic.List[PSCustomObject]]::new()
if ($Sync -and $rowPaths.Count -gt 0) {
    Write-Host ""
    Write-Host "Weryfikuję istniejące ścieżki (-Sync)..." -ForegroundColor Cyan
    $colorBroken = 0xFFD966  # pomarańczowy/żółty
    foreach ($entry in $rowPaths) {
        $absPath = Join-Path $RepoRoot $entry.RelPath
        if (-not (Test-Path $absPath)) {
            $brokenRows.Add($entry)
            # Podswietl komorke Feature_Files na pomaranczowo
            $ws.Cells.Item($entry.Row, $colFeatureFiles).Interior.Color = $colorBroken
            # Dodaj notatke w Notes jezeli jej nie ma
            $currentNote = $ws.Cells.Item($entry.Row, $colNotes).Value2
            if (-not ($currentNote -like "*BRAK PLIKU*")) {
                $ws.Cells.Item($entry.Row, $colNotes).Value2 = "[BRAK PLIKU] $(Get-Date -Format 'yyyy-MM-dd')" + $(if ($currentNote) { " | $currentNote" } else { "" })
            }
        }
    }
    if ($brokenRows.Count -eq 0) {
        Write-Host "  -> Wszystkie ścieżki poprawne!" -ForegroundColor Green
    } else {
        Write-Host "  -> Znaleziono $($brokenRows.Count) wpisów z brakującym plikiem:" -ForegroundColor Red
        foreach ($b in $brokenRows) {
            Write-Host "     $($b.TcId)  $($b.RelPath)" -ForegroundColor Red
        }
        Write-Host "  -> Wpisy oznaczone pomarańczowo w kolumnie Feature_Files" -ForegroundColor Yellow
    }
}

# ============================================================
# 4. Wynik — nowe pliki
# ============================================================
Write-Host ""

if ($newFiles.Count -eq 0 -and $brokenRows.Count -eq 0) {
    Write-Host "Inventory jest aktualne - brak nowych feature files!" -ForegroundColor Green
    $wb.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    exit 0
}

if ($newFiles.Count -eq 0 -and $brokenRows.Count -gt 0) {
    # Tylko broken - zapisz plik z oznaczeniami i wyjdz
    if (-not $DiffOnly) {
        try {
            $wb.SaveAs($OutputFile, 51)
        } finally {
            $wb.Close($false)
            $excel.Quit()
            [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
        }
        Write-Host ""
        Write-Host "Zapisano: $OutputFile" -ForegroundColor Green
        if ($UpdateBase) {
            Copy-Item $OutputFile $InventoryFile -Force
            Write-Host "Zaktualizowano bazę: $([System.IO.Path]::GetFileName($InventoryFile))" -ForegroundColor Cyan
        }
    } else {
        $wb.Close($false)
        $excel.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    }
    exit 0
}

if ($newFiles.Count -gt 0) {
    Write-Host "Nowe feature files ($($newFiles.Count) szt):" -ForegroundColor Yellow
    $newFiles | ForEach-Object { Write-Host "  $($_.RelPath)" -ForegroundColor White }
}

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

# ============================================================
# 5. Dodaj nowe wiersze do inventory
# ============================================================
$colorDone = 0xC6EFCE  # zielony jak DONE

$tcIndex = $maxTcNum + 1
$rowIdx  = $lastRow + 1

foreach ($f in $newFiles) {
    $tcId     = "TC-{0:000}" -f $tcIndex
    $tcIndex++

    # Zamien CamelCase na spacje jako propozycja nazwy
    $testName = $f.BaseName -creplace "([a-z])([A-Z])", '$1 $2'
    $actor    = if ($f.Actor) { $f.Actor } else { "?" }
    $testType = if ($f.Suite -eq "Sanity") { "Sanity" } elseif ($f.Suite -eq "Smoke") { "Smoke" } else { "" }
    $person   = if ($f.Author) { $f.Author } else { "" }

    $ws.Cells.Item($rowIdx, $colActor).Value2        = $actor
    $ws.Cells.Item($rowIdx, $colTcId).Value2         = $tcId
    $ws.Cells.Item($rowIdx, $colTestName).Value2     = $testName
    $ws.Cells.Item($rowIdx, $colDomain).Value2       = $f.Domain
    $ws.Cells.Item($rowIdx, $colTestType).Value2     = $testType
    $ws.Cells.Item($rowIdx, $colStatus).Value2       = "DONE"
    $ws.Cells.Item($rowIdx, $colPerson).Value2       = $person
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
Write-Host "Zapisano: $OutputFile" -ForegroundColor Green

if ($UpdateBase) {
    Copy-Item $OutputFile $InventoryFile -Force
    Write-Host "Zaktualizowano baze: $([System.IO.Path]::GetFileName($InventoryFile))" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Dodano $($newFiles.Count) nowych TC do inventory" -ForegroundColor Green
Write-Host " Zapisano: $OutputFile" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
