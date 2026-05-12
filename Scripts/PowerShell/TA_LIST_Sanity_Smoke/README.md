# TA Report Generator — Instrukcja

## Co to jest?

Skrypt `Generate-TA-Report.ps1` porównuje listę Test Cases z Excela z faktycznym stanem plików `.feature` w repozytorium `TimTestAutomation`. Wynikiem jest plik `.xlsx` z kolorowaniem, dropdownami i filtrami.

---

## Pliki w folderze

| Plik | Opis |
|------|------|
| `TestAutomation_tests_list.xlsx` | **Źródło prawdy** — lista TC, statusy, przypisane osoby, linki ADO |
| `Generate-TA-Report.ps1` | Skrypt generujący raport |
| `Create_TFS_Tasks.ps1` | Skrypt do tworzenia tasków w Azure DevOps |
| `README.md` | Ten plik |
| `TA_Report_<data>.xlsx` | Wygenerowane raporty (można usuwać stare) |

---

## Jak uruchomić skrypt?

Otwórz terminal PowerShell w tym folderze i wpisz:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
& ".\Generate-TA-Report.ps1"
```

Skrypt otworzy Excel w tle, przeskanuje repo i zapisze nowy plik `TA_Report_YYYYMMDD_HHmmss.xlsx`.

> **Wymagania:** Microsoft Excel musi być zainstalowany. Repo `TimTestAutomation` musi być sklonowane w `d:\git\TimTestAutomation\`.

---

## Struktura raportu (kolumny w .xlsx)

| # | Kolumna | Opis | Dropdown |
|---|---------|------|----------|
| 1 | `Actor` | Kto wykonuje test | ✅ Agent / Provider / Patient / Admin / System |
| 2 | `TC_ID` | Numer TC w formacie `TC-001` (auto-generowany) | — |
| 3 | `Test_Name` | Nazwa TC z Excela | — |
| 4 | `Domain` | Domena biznesowa (np. `Banking`, `Factoring`) | ✅ 15 opcji z zakładki Domains |
| 5 | `Test_Type` | Typ testu: `Sanity` / `Smoke` / `Functional` itp. | ✅ 5 opcji z zakładki Test_Types |
| 6 | `Excel_Status` | Status z Excela (kolorowany) | ✅ TODO / IN PROGRESS / ALMOST / DONE / BLOCKED / ON HOLD |
| 7 | `Person` | Przypisana osoba | ✅ 56 osób z zakładki Team_Members |
| 8 | `Priority` | Priorytet | ✅ Low / Medium / High / Critical |
| 9 | `Feature_Files` | Ścieżki do `.feature` w repo (wieloliniowe) | — |
| 10 | `Notes` | Notatki z Excela | — |
| 11 | `ADO_Dev` | Klikalny link do taska DEV w Azure DevOps | — |
| 12 | `ADO_Int` | Klikalny link do taska INT w Azure DevOps | — |

---

## Kolorowanie komórki Excel_Status

| Kolor | Znaczenie |
|-------|-----------|
| 🟢 Zielony | `DONE` |
| 🟡 Żółty | `IN PROGRESS` / `ALMOST` |
| 🔴 Czerwony/różowy | `TODO` |

---

## Zakładki słownikowe (reference sheets)

Raport zawiera 6 zakładek pomocniczych (tylko do odczytu — nie edytuj):

| Zakładka | Zawartość |
|----------|-----------|
| `Test_Types` | Sanity, Smoke, Functional, Regression, E2E |
| `Actors` | Agent, Provider, Patient, Admin, System |
| `Status_Options` | TODO, IN PROGRESS, ALMOST, DONE, BLOCKED, ON HOLD |
| `Priorities` | Low, Medium, High, Critical |
| `Domains` | 15 domen biznesowych |
| `Team_Members` | 56 pełnych nazwisk członków zespołu |

---

## ADO linki (Azure DevOps)

Kolumny `ADO_Dev` i `ADO_Int` są wypełniane automatycznie z source Excela:

- **Source Excel kolumny:** `DevTaskID` (kol 9), `IntTaskID` (kol 10), `DEV Task Link` (kol 11), `INT Task Link` (kol 12)
- Jeśli URL jest wypełniony → komórka w raporcie jest **klikalnym hyperlinkiem** (wyświetla tylko ID, klick otwiera ADO)
- Jeśli tylko ID bez URL → wyświetla sam numer

Żeby dodać/zaktualizować link do ADO dla TC:
1. Otwórz `TestAutomation_tests_list.xlsx`, arkusz `TA_List`
2. Wpisz ID taska w kolumnie `DevTaskID` lub `IntTaskID`
3. Wpisz pełny URL w kolumnie `DEV Task Link` lub `INT Task Link` (np. `https://dev.azure.com/org/project/_workitems/edit/12345`)
4. Uruchom skrypt → linki pojawią się automatycznie w raporcie

---

## Jak filtrować?

Po otwarciu pliku w Excelu użyj **Data → Filter** (lub `Ctrl+Shift+L`). Każda kolumna ma dropdown. Przydatne filtry:

- `Actor = Provider` → wszystkie testy Provider
- `Excel_Status = TODO` → co jeszcze do zrobienia
- `Domain = Banking` → testy dla konkretnej domeny
- `Test_Type = Sanity` lub `Smoke` → testy oznaczone jako Sanity/Smoke
- `Person = Kamil Małysiak` → testy przypisane do konkretnej osoby

---

## Jak aktualizować listę TC?

1. Otwórz `TestAutomation_tests_list.xlsx`
2. Edytuj arkusz `TA_List` — zmień status, przypisz osobę (pełne nazwisko), dodaj linki ADO
3. Uruchom skrypt → wygeneruje nowy raport z aktualnym stanem repo

> Nie edytuj pliku `TA_Report_*.xlsx` bezpośrednio — jest generowany automatycznie i zostanie nadpisany.

---

## Jak dodać nowy TC do skryptu?

Gdy dodasz nowy TC do Excela (nowy wiersz w `TA_List`), musisz też dodać go do skryptu w dwóch miejscach:

**1. Mapping aktor** (`$actorMapping` w skrypcie, sekcja 3a):
```powershell
"S99" = "Agent"  # nazwa nowego TC
```

**2. Mapping feature files** (`$mapping` w skrypcie, sekcja 3b):
```powershell
"S99" = @("Agent\Sciezka\Do\NowegoPlikuFeature.feature")
```

Jeśli test jest `TODO` i plik jeszcze nie istnieje, wpisz pustą tablicę:
```powershell
"S99" = @()
```

> `TC_ID` w formacie `TC-001` jest nadawany automatycznie przez skrypt wg kolejności wierszy w source Excelu — nie trzeba go nigdzie wpisywać.

---

## Normalizacja nazwisk

Skrypt automatycznie konwertuje stare skróty z source Excela na pełne nazwiska:

| Skrót w Excelu | Pełne nazwisko |
|----------------|----------------|
| `CezaryF` | Cezary Frączkowski |
| `KamilM` | Kamil Małysiak |
| `KamilK` | Kamil Kosko |
| `TomaszS` | Tomasz Statkowski |
| `Sylwia` | Sylwia Kulig |

Żeby dodać nową normalizację — edytuj `$personNormalize` w skrypcie (sekcja przed `$report`).

---

## Statusy TC — co oznaczają?

| Status | Znaczenie |
|--------|-----------|
| `DONE` | Test zaimplementowany i działa |
| `IN PROGRESS` | W trakcie implementacji |
| `ALMOST` | Prawie gotowy — wymaga drobnych poprawek |
| `TODO` | Jeszcze nie zaczęty |
| `BLOCKED` | Zablokowany — czeka na zewnętrzną zależność |
| `ON HOLD` | Wstrzymany |

---

## Feature files bez TC w Excelu

W repo istnieje **54 pliki `.feature`** (poza `Prepare/`) które nie są podpięte pod żaden TC w source Excelu. Są to głównie:

- `Agent\BulkFee\` — ApproveFee, DeclineFee
- `Agent\BusinessAccount\SpecialAgreementNote`
- `Agent\Claim\Search\` — ClaimSearchFromForm, ClaimSearchFromUri
- `Agent\ClaimFile\AdminCode\` — 4 pliki
- `Agent\ClaimFile\BSN\` — 4 pliki
- `Agent\ClaimFile\ProcessFile\CHA_IM001`
- `Agent\Maintenance\` — NotificationCSV, NotificationTIMInzichtIntegration, ObjectionReason
- `Agent\RuleInterpreter\` — RuleInterpretationDetails, RuleInterpreter
- `Agent\Rules\` — AddNewRule, DeleteRule, UpdateRule
- `Agent\ToDo\Matching\` — 9 plików (AssignPayments, Filter, Sort, Forward, itp.)
- `Automated\InvoiceExpiration\` — 5 plików
- `Patient\Claim\` — 5 plików (ShowClaim, ExtendDueDate)
- `Provider\Claim\AddressChange\` — 2 pliki
- `Provider\Claim\Retrocessions\` — 2 pliki
- `Provider\Login\` — AuthenticatorLogin, EmailLogin, SMSLogin
- `Provider\NavigationTOREMOVEMAYBE\` — 3 pliki (prawdopodobnie do usunięcia)
- `Provider\Report\DownloadAllClaimFiles`
- `Admin\User\DeleteUser`

Żeby je podpiąć: dodaj nowy TC do `TestAutomation_tests_list.xlsx` i zmapuj w skrypcie w sekcji `$mapping`.
