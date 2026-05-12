# GitHub Copilot Instructions — TA Inventory (TA_LIST_Sanity_Smoke)

## Cel folderu
Ten folder zawiera skrypty do zarządzania inwentaryzacją test cases (TC) dla projektu TimTestAutomation.
Źródłem danych jest `TestAutomation_tests_list.xlsx` + pliki `.feature` z repo `d:\git\TimTestAutomation\AutomationTests`.

---

## Skrypty — zasady i workflow

### [SKRYPT 1/3] `1_Generate-TA-Report.ps1` — bootstrap
- **Uruchamiaj rzadko** — tylko gdy zmieniasz `$mapping`, `$extraTCs` lub strukturę kolumn
- Czyta `TestAutomation_tests_list.xlsx` (81 TC) + skanuje repo (111 `.feature` files)
- **Nadpisuje `TA_Inventory.xlsx` bezpowrotnie** — ręczne zmiany w pliku zostaną utracone
- TC z podpiętym feature file → status automatycznie = `DONE`
- Tryb diff (nie zapisuje): `& .\1_Generate-TA-Report.ps1 -DiffOnly`

### [SKRYPT 2/3] `2_Update-TA-Inventory.ps1` — codzienny update
- **Uruchamiaj po każdym nowym `.feature` dodanym do repo**
- Czyta `TA_Inventory.xlsx` jako bazę — **nigdy go nie modyfikuje**
- Tylko dodaje nowe wiersze — nigdy nic nie usuwa
- Nowe TC: `Actor=?`, `Status=DONE`, `Notes=[AUTO] yyyy-MM-dd`
- Zapisuje **nowy plik datowany**: `TA_Inventory_YYYY-MM-DD.xlsx` → wgrywasz na SharePoint
- Tryb diff (bez zapisu): `& .\2_Update-TA-Inventory.ps1 -DiffOnly`

---

## Struktura `TA_Inventory.xlsx`

### Arkusz `TA_Report` — kolumny (1-based)
| # | Nazwa | Opis |
|---|-------|------|
| 1 | Actor | Agent / Provider / Patient / Admin / System |
| 2 | TC_ID | TC-001, TC-002, ... |
| 3 | Test_Name | Nazwa test case |
| 4 | Domain | Domena biznesowa (dropdown z arkusza `Domains`) |
| 5 | Test_Type | Sanity / Smoke / "" (z tagu `@Suite` w `.feature`) |
| 6 | Excel_Status | DONE / IN PROGRESS / ALMOST / TODO (dropdown) |
| 7 | Person | Przypisana osoba (dropdown z arkusza `Team_Members`) |
| 8 | Priority | High / Medium / Low (dropdown) |
| 9 | Feature_Files | Ścieżka względna do `.feature` (1 plik = 1 TC) |
| 10 | Notes | Notatki, `[AUTO] data` dla auto-dodanych |
| 11 | ADO_Dev | Link do ADO (Dev) |
| 12 | ADO_Int | Link do ADO (Int) |
| 13 | Related_TC | Powiązane TC (np. TC-012, TC-034) |

### Arkusze referencyjne
`Test_Types`, `Actors`, `Status_Options`, `Priorities`, `Domains`, `Team_Members`

---

## Zasady mappingu (`Generate-TA-Report.ps1`)

### `$mapping` — TC ze źródłowego Excel
- Klucze: `S01`–`S67`, `SM01`–`SM14`
- **1 klucz = 1 feature file** (zasada: 1 feature per TC)
- Jeśli TC ma wiele wariantów → każdy wariant w osobnym `$extraTCs`
- TC bez feature = `@()` → status pozostaje z Excela (zwykle TODO)

### `$extraTCs` — TC spoza źródłowego Excel
- Lista `[PSCustomObject]` z polami: `Actor`, `Name`, `Domain`, `Priority`, `Status`, `Person`, `Files`
- `Files=@("ścieżka\względna\do.feature")` — **zawsze 1 plik**
- Grupowane komentarzami: `# --- Domain ---`
- Nowe wpisy doklejaj na końcu odpowiedniej sekcji domeny

### `$actorMapping` — przypisanie aktora do klucza S/SM
- Hashtable `S01 → "Provider"`, `S09 → "Agent"` itd.
- Dla `$extraTCs` aktor podawany bezpośrednio w obiekcie

---

## Reguły statusu
- TC ma feature file + Excel mówi TODO → **automatycznie DONE** (logika w skrypcie)
- TC ma feature file + Excel mówi IN PROGRESS / ALMOST → zachowany status z Excela
- TC bez feature file → zachowany status z Excela (TODO jeśli nie ustawiony)
- Nowe TC dodane przez Update script → **DONE** (skoro plik istnieje w repo)

---

## Ważne szczegóły techniczne

### COM Excel / zombie procesy
- Oba skrypty używają `New-Object -ComObject Excel.Application`
- `try/finally` zapewnia `Quit()` + `ReleaseComObject()` nawet przy błędzie
- Jeśli `SaveAs` rzuca `Cannot access` → plik jest otwarty w Excelu — zamknij go
- Zombie procesy czyść: `Get-Process EXCEL | Where-Object { $_.MainWindowTitle -eq "" } | Stop-Process -Force`

### WrapText — ważny bug
- `$ws.Columns.Item(9).WrapText = $true` na całej kolumnie **korumpuje ostatnie wiersze** przy SaveAs
- Używaj zawsze na zakresie danych: `$ws.Range($ws.Cells.Item(2,9), $ws.Cells.Item($dataRows+1,9)).WrapText = $true`

### UsedRange — zawodne
- `$ws.UsedRange.Rows.Count` zwraca błędne wartości
- Używaj pętli `while` skanującej do pierwszego pustego wiersza (obie kolumny TC_ID i Feature_Files puste)

### Ścieżki w `$mapping` i `$extraTCs`
- Ścieżki względne od `AutomationTests\` np. `"Agent\Login\LoginToTIM.feature"`
- Backslahe podwajane tylko gdy konieczne (niektóre wpisy historycznie mają `\\`)
- Pliki z `\Prepare\` są **wykluczone** ze skanowania repo

---

## Aktualny stan inventory (maj 2026)
- **156 TC** łącznie: 81 ze źródłowego Excel + 75 z `$extraTCs`
- **DONE: 124**, IN PROGRESS: 9, ALMOST: 1, **TODO: 20** (tylko brakujące implementacje)
- **111 `.feature` files** w repo — wszystkie zmapowane (DiffOnly = 0 unmapped)
- Zasada: **1 feature file = 1 TC** (bez wyjątków)

## TODO — brakujące feature files (20 TC)
TC bez feature: TC-004, TC-005, TC-006, TC-008, TC-017, TC-024, TC-029, TC-033, TC-044, TC-050, TC-052, TC-054, TC-056, TC-057, TC-058, TC-059, TC-075, TC-077, TC-078 + kilka Ledger Connector

---

## Pliki w folderze
| Plik | Opis |
|------|------|
| `Generate-TA-Report.ps1` | Skrypt 1/2 — bootstrap |
| `Update-TA-Inventory.ps1` | Skrypt 2/2 — codzienny update |
| `TA_Inventory.xlsx` | Baza inventory (nie edytuj ręcznie struktury) |
| `TestAutomation_tests_list.xlsx` | Źródłowy Excel z 81 TC (nie modyfikuj) |
| `TA_Workspace.code-workspace` | VS Code workspace |
| `Create_TFS_Tasks.ps1` | Osobny skrypt do TFS (niezwiązany z inventory) |
