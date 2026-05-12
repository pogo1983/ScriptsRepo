# TA Inventory — Instrukcja

## Co to jest?

Zestaw dwóch skryptów PowerShell do zarządzania inwentaryzacją test cases (TC) projektu **TimTestAutomation**.
Łączy dane ze źródłowego Excela z faktycznym stanem plików `.feature` w repo i zapisuje wynik jako `TA_Inventory.xlsx`.

> **Wymagania:** Microsoft Excel zainstalowany lokalnie. Repo sklonowane w `d:\git\TimTestAutomation\`.

---

## Pliki w folderze

| Plik | Opis |
|------|------|
| `1_Generate-TA-Report.ps1` | **Skrypt 1** — bootstrap, buduje `TA_Inventory.xlsx` od zera |
| `2_Update-TA-Inventory.ps1` | **Skrypt 2** — codzienny update, dodaje nowe TC |
| `3_Create-ADO-Tasks.ps1` | **Skrypt 3** — tworzy taski DEV+INT w ADO na podstawie `TA_Inventory.xlsx` |
| `TA_Inventory.xlsx` | Baza inventory — główny plik roboczy |
| `TestAutomation_tests_list.xlsx` | Źródłowy Excel z 81 TC (nie modyfikuj) |
| `TA_Workspace.code-workspace` | VS Code workspace |

---

## Skrypt 1 — `1_Generate-TA-Report.ps1` (bootstrap)

**Kiedy uruchamiać:** tylko gdy zmieniasz mapowanie (`$mapping` / `$extraTCs`) lub strukturę kolumn.

**Co robi:**
- Czyta `TestAutomation_tests_list.xlsx` (81 TC)
- Skanuje repo (`AutomationTests\`) w poszukiwaniu `.feature` files
- Łączy dane wg `$mapping` + `$extraTCs` — zasada **1 feature = 1 TC**
- TC z podpiętym feature file → status = `DONE` automatycznie
- **Nadpisuje `TA_Inventory.xlsx` bezpowrotnie** — ręczne zmiany zostaną utracone

```powershell
# Generuj pełny raport
& .\1_Generate-TA-Report.ps1

# Tylko sprawdź czy są niezamapowane pliki (bez zapisu)
& .\1_Generate-TA-Report.ps1 -DiffOnly
```

---

## Skrypt 2 — `2_Update-TA-Inventory.ps1` (codzienny update)

**Kiedy uruchamiać:** po każdym nowym `.feature` dodanym do repo.

**Co robi:**
- Czyta `TA_Inventory.xlsx` jako bazę — **nigdy go nie modyfikuje**
- Tylko dodaje nowe wiersze — nigdy nic nie usuwa
- Nowe TC: `Actor=?`, `Status=DONE` (zielone), `Notes=[AUTO] yyyy-MM-dd`
- Zapisuje **nowy plik datowany**: `TA_Inventory_YYYY-MM-DD.xlsx` → wgrywasz na SharePoint

```powershell
# Wykryj nowe feature files + zapisz datowany plik
& .\2_Update-TA-Inventory.ps1

# Jak wyżej + automatycznie podmień TA_Inventory.xlsx (zalecane)
& .\2_Update-TA-Inventory.ps1 -UpdateBase

# Tylko sprawdź co nowego (bez zapisu)
& .\2_Update-TA-Inventory.ps1 -DiffOnly

# Sprawdź też czy istniejące ścieżki wciąż istnieją w repo (wykrywa przemianowania)
& .\2_Update-TA-Inventory.ps1 -Sync -UpdateBase

# Sprawdź bez zapisu
& .\2_Update-TA-Inventory.ps1 -Sync -DiffOnly
```

### Opcja `-Sync` — co wykrywa?

Gdy feature file zostanie **przemianowany lub przeniesiony**, inventory ma martwą ścieżkę.
`-Sync` sprawdza każdy wpis w kolumnie `Feature_Files` i:
- Jeśli plik nie istnieje → podświetla wiersz na **pomarańczowo** + dodaje `[BRAK PLIKU]` w Notes
- Daje znać że trzeba ręcznie zaktualizować ścieżkę lub usunąć wpis

---

## Workflow — jak to działa w praktyce?

```
1. [jednorazowo] & .\1_Generate-TA-Report.ps1
        ↓
   TA_Inventory.xlsx (baza, 156 TC)

2. [ręcznie] edytujesz TA_Inventory.xlsx
   (zmieniasz statusy, przypisujesz osoby, uzupełniasz Domain/Actor)

3. [deweloper dodaje nowy .feature do repo]

4. & .\2_Update-TA-Inventory.ps1
        ↓
   TA_Inventory_2026-05-12.xlsx (nowy plik z dodanym TC)

5. Wgrywasz datowany plik na SharePoint

6. Kopiujesz jako nową bazę:
   Copy-Item .\TA_Inventory_2026-05-12.xlsx .\TA_Inventory.xlsx -Force

7. [co jakiś czas] & .\2_Update-TA-Inventory.ps1 -Sync
   (sprawdza czy żaden feature nie został przemianowany)

8. [tworzenie tasków ADO] & .\3_Create-ADO-Tasks.ps1
   (dla TODO / IN PROGRESS / ALMOST bez istniejącego ADO linku)
```

---

## Struktura `TA_Inventory.xlsx`

### Arkusz `TA_Report` — kolumny

| # | Nazwa | Opis | Dropdown |
|---|-------|------|----------|
| 1 | Actor | Agent / Provider / Patient / Admin / System | ✅ |
| 2 | TC_ID | TC-001, TC-002, ... (auto) | — |
| 3 | Test_Name | Nazwa test case | — |
| 4 | Domain | Domena biznesowa | ✅ 15 opcji |
| 5 | Test_Type | Sanity / Smoke / "" (z tagu `@Suite`) | ✅ |
| 6 | Excel_Status | DONE / IN PROGRESS / ALMOST / TODO | ✅ (kolorowane) |
| 7 | Person | Przypisana osoba | ✅ 56 nazwisk |
| 8 | Priority | High / Medium / Low | ✅ |
| 9 | Feature_Files | Ścieżka do `.feature` (1 plik = 1 TC) | — |
| 10 | Notes | Notatki, `[AUTO] data` dla auto-dodanych | — |
| 11 | ADO_Dev | Klikalny link ADO (Dev) | — |
| 12 | ADO_Int | Klikalny link ADO (Int) | — |
| 13 | Related_TC | Powiązane TC (np. TC-012, TC-034) | — |

### Kolorowanie statusów

| Kolor | Status |
|-------|--------|
| 🟢 Zielony | `DONE` |
| 🟡 Żółty | `IN PROGRESS` / `ALMOST` |
| 🔴 Czerwony | `TODO` |
| 🟠 Pomarańczowy | `Feature_Files` — brakujący plik (wykryty przez `-Sync`) |

### Arkusze referencyjne (tylko do odczytu)

`Test_Types` · `Actors` · `Status_Options` · `Priorities` · `Domains` · `Team_Members`

---

## Aktualny stan inventory (maj 2026)

- **156 TC** łącznie: 81 ze źródłowego Excel + 75 z `$extraTCs`
- **DONE: 124** · IN PROGRESS: 9 · ALMOST: 1 · **TODO: 20**
- **111 `.feature` files** w repo — wszystkie zmapowane
- Zasada: **1 feature file = 1 TC** (bez wyjątków)

### TODO — TC bez feature file (20 szt.)

TC-004, TC-005, TC-006, TC-008, TC-017, TC-024, TC-029, TC-033, TC-044, TC-050,
TC-052, TC-054, TC-056, TC-057, TC-058, TC-059, TC-075, TC-077, TC-078 + kilka Ledger Connector

---

## Jak dodać nowy TC do mappingu?

### A) Nowy TC spoza source Excela → dodaj do `$extraTCs` w skrypcie 1

```powershell
$extraTCs.Add([PSCustomObject]@{
    Actor    = "Agent"
    Name     = "Mój Nowy Test"
    Domain   = "Payment Matching"
    Priority = "Medium"
    Status   = "TODO"
    Person   = ""
    Files    = @("Agent\Folder\MójNowyTest.feature")
})
```

### B) Nowy TC z source Excela (nowy wiersz w `TestAutomation_tests_list.xlsx`)

1. Dodaj klucz do `$actorMapping`: `"S99" = "Agent"`
2. Dodaj klucz do `$mapping`: `"S99" = @("Agent\Folder\Feature.feature")`
3. Jeśli plik jeszcze nie istnieje: `"S99" = @()`
4. Uruchom `Generate-TA-Report.ps1`

---

## Normalizacja nazwisk

Stare skróty z source Excela są automatycznie konwertowane:

| Skrót | Pełne nazwisko |
|-------|----------------|
| `CezaryF` | Cezary Frączkowski |
| `KamilM` | Kamil Małysiak |
| `KamilK` | Kamil Kosko |
| `TomaszS` | Tomasz Statkowski |
| `Sylwia` | Sylwia Kulig |

Nową normalizację dodaj w `$personNormalize` w skrypcie 1.

---

## Zombie procesy Excel — jak czyścić?

Jeśli skrypt przerwie się z błędem (np. plik zablokowany), mogą zostać procesy w tle:

```powershell
Get-Process EXCEL | Where-Object { $_.MainWindowTitle -eq "" } | Stop-Process -Force
```

---

## `3_Create-ADO-Tasks.ps1` — tworzenie tasków ADO

Tworzy taski **DEV + INT** w Azure DevOps dla TC z `TA_Inventory.xlsx`.
Po utworzeniu zapisuje klikalny link z powrotem do kolumn `ADO_Dev` / `ADO_Int`.

> **Konfiguracja:** wklej swój PAT w zmiennej `$DefaultPAT` na górze skryptu.

### Domyślne zachowanie

- Tworzy taski tylko dla statusów **TODO / IN PROGRESS / ALMOST** — pomija DONE
- Pomija TC które już mają ADO link (chyba że `-Force`)

```powershell
# Podgląd — co by zostało utworzone (bez API calls)
& .\3_Create-ADO-Tasks.ps1 -WhatIf

# Utwórz taski (TODO + IN PROGRESS + ALMOST bez ADO linku)
& .\3_Create-ADO-Tasks.ps1

# Tylko konkretny status
& .\3_Create-ADO-Tasks.ps1 -FilterStatus "TODO"

# Tylko konkretny TC
& .\3_Create-ADO-Tasks.ps1 -FilterTcId "TC-005"

# Tylko DEV lub tylko INT
& .\3_Create-ADO-Tasks.ps1 -OnlyDev
& .\3_Create-ADO-Tasks.ps1 -OnlyInt

# Uwzględnij też DONE (np. wpiąć ADO linki historycznie)
& .\3_Create-ADO-Tasks.ps1 -IncludeDone

# Nadpisz istniejące ADO linki
& .\3_Create-ADO-Tasks.ps1 -Force
```

Wynik zapisywany jako `TA_Inventory_YYYY-MM-DD.xlsx` z uzupełnionymi linkami ADO.
