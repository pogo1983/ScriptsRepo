# GitHub Copilot Instructions — AzureDevopsTool

## Cel projektu
Przeglądarkowe narzędzie (vanilla JS, zero zależności) do pracy z Azure DevOps REST API.
Używane przez testerów i deweloperów firmy **Infomedics** w projekcie **TIM**.
Uruchamiane lokalnie jako `index.html` — brak backendu, brak bundlera, brak frameworka.

---

## Struktura plików

```
AzureDevopsTool/
├── index.html          # Główny plik HTML — zawiera cały markup UI
├── styles.css          # Wszystkie style CSS
├── script.js           # ⚠️ DEPRECATED — backup oryginalnego monolitu (1419 linii), nie edytować
└── js/
    ├── config.js       # Konfiguracja, PAT, organizacje/projekty, szablony komentarzy
    ├── utils.js        # UI helpers: showLoading, showError, showSuccess, switchTab
    ├── workItems.js    # Moduł Work Items (~680 linii) — bulk komentarze
    ├── testClosure.js  # Moduł Test Closure (~570 linii) — raport z testów
    └── main.js         # Inicjalizacja aplikacji, event listenery
```

**Kolejność ładowania skryptów jest istotna:**
`config.js` → `utils.js` → `workItems.js` → `testClosure.js` → `main.js`

---

## Globalny stan aplikacji

Zdefiniowany w `config.js`:
```js
let config = {
    organization: 'infomedics',
    project: 'TIM',
    pat: ''   // Personal Access Token — nigdy nie commitować!
};
```

Zdefiniowany w `workItems.js`:
```js
let workItems = [];  // tablica pobranych work itemów
```

Zdefiniowany w `testClosure.js`:
```js
let testReportData = null;  // dane raportu testowego
```

---

## Zakładki UI (Tabs)

| Tab | ID elementu | Funkcja przełączająca |
|-----|-------------|----------------------|
| Main | `mainTab` | `switchTab('main')` |
| Test Closure | `testClosureTab` | `switchTab('testClosure')` |
| Settings | `settingsTab` | `switchTab('settings')` |

---

## Moduł: Work Items (`workItems.js`)

### Główne funkcje
| Funkcja | Opis |
|---------|------|
| `checkMultipleVersions()` | Wykrywa wiele wersji oddzielonych `;` lub `,` w polu Planned Release |
| `getSelectedWorkItemTypes()` | Zwraca zaznaczone typy WI z checkboxów `[id^="type"]` |
| `toggleWorkItemType(cb)` | Obsługuje logikę "All vs konkretne typy" |
| `loadCommentTemplate()` | Ładuje szablon komentarza i wywołuje `updatePreview()` |
| `fetchWorkItems()` | Główna funkcja pobierania WI z ADO API |
| `addBulkComments()` | Dodaje komentarze do zaznaczonych WI |
| `updatePreview()` | Aktualizuje podgląd komentarza z podstawionymi zmiennymi |

### Szablony komentarzy (zdefiniowane w `config.js`)
- `readyForTest` — szablon z placeholderami `{PLANNED_RELEASE}`, `{TESTER}`, `{DEVELOPER}`
- `readyForProduction` — stały tekst
- `closed` — stały tekst dla zamkniętych itemów
- `custom` — dowolny tekst zapisywany w `localStorage`

### API endpoints (Work Items)
```
GET  https://dev.azure.com/{org}/{project}/_apis/wit/wiql?api-version=7.1
POST https://dev.azure.com/{org}/{project}/_apis/wit/workitemsbatch?api-version=7.1
POST https://dev.azure.com/{org}/{project}/_apis/wit/workItems/{id}/comments?api-version=7.1-preview.3
```

---

## Moduł: Test Closure (`testClosure.js`)

### Główne funkcje
| Funkcja | Opis |
|---------|------|
| `toggleSearchType()` | Przełącza między wyszukiwaniem po ID planu lub Release Number |
| `testSearchPlans()` | Szuka Test Planów pasujących do zapytania |
| `fetchTestSuiteDetails()` | Pobiera szczegóły suite'ów + wyniki testów |
| `calculateQualityGate()` | Liczy bramkę jakości na podstawie wyników |
| `generateExecutiveSummary()` | Generuje podsumowanie dla managementu |
| `generateHTMLReport()` | Generuje raport HTML gotowy do wklejenia |

### API endpoints (Test Plans)
```
GET https://dev.azure.com/{org}/{project}/_apis/testplan/plans?api-version=7.1-preview.1
GET https://dev.azure.com/{org}/{project}/_apis/testplan/plans/{planId}/suites?api-version=7.1-preview.1
GET https://dev.azure.com/{org}/{project}/_apis/testplan/plans/{planId}/suites/{suiteId}/TestPoint?api-version=7.1-preview.2
GET https://dev.azure.com/{org}/{project}/_apis/test/runs/{runId}/results?api-version=7.1
```

---

## Autentykacja

- Używa **Basic Auth** z PAT tokenem: `btoa(':' + config.pat)`
- PAT jest przechowywany **tylko w pamięci** (zmienna `config.pat`)
- Opcja zapisu w `localStorage` dostępna w Settings — użytkownik musi świadomie zaznaczyć
- **KRYTYCZNE:** Pole `TESTING_PAT_TOKEN` w `index.html` musi być puste przed commitem!

```js
// Prawidłowy nagłówek autentykacji
headers: { 'Authorization': 'Basic ' + btoa(':' + config.pat) }
```

---

## LocalStorage — klucze

| Klucz | Zawartość |
|-------|-----------|
| `azureDevOpsOrg` | Zapisana organizacja |
| `azureDevOpsProject` | Zapisany projekt |
| `azureDevOpsPAT` | Zapisany PAT (tylko jeśli user wyrazi zgodę) |
| `customCommentTemplate` | Niestandardowy szablon komentarza |

---

## Konwencje kodowania

- **Vanilla JS** — bez TypeScript, bez frameworków, bez npm
- Zmienne globalne zamiast modułów ES (ze względu na ładowanie przez `<script>` tagi)
- Funkcje są globalnie dostępne (wywoływane z atrybutów `onclick` w HTML)
- `async/await` dla wywołań API
- `fetch()` natywne — bez axios ani jQuery
- Obsługa błędów przez `try/catch` + `showError()` / `showTestReportError()`
- Stylizacja przez klasy CSS, nie inline styles (poza wyjątkami w dynamicznie generowanym HTML)

---

## Bezpieczeństwo — zasady

1. Nigdy nie commitować PAT tokenu — sprawdzić `TESTING_PAT_TOKEN = ''` przed każdym commitem
2. PAT nie jest logowany do konsoli (poza debug mode)
3. Dane z ADO API są tylko wyświetlane — nie są wysyłane nigdzie indziej
4. Brak zewnętrznych zależności JS (tylko Font Awesome CSS przez CDN)

---

## Typowe zadania deweloperskie

### Dodanie nowego szablonu komentarza
1. Dodaj klucz do `commentTemplates` w `config.js`
2. Dodaj opcję `<option>` w `index.html` (select `#commentTemplate`)

### Dodanie nowej organizacji/projektu
1. Dodaj obiekt do `availableConfigs` w `config.js`

### Dodanie nowego typu work itemu
1. Dodaj checkbox w `index.html` z `id="typeXxx"` i odpowiednią wartością

### Debugowanie wywołań API
- Sprawdź Network tab w DevTools
- Wszystkie błędy API są logowane przez `console.error()`
- Status HTTP i treść błędu są pokazywane użytkownikowi przez `showError()`

---

## Znane ograniczenia

- Narzędzie działa tylko lokalnie (CORS — ADO API nie pozwala na wywołania z dowolnych domen)
- Brak paginacji — pobiera max wyników z jednego zapytania WIQL
- Brak cache'owania wyników między sesjami
- `script.js` (deprecated) zawiera starą wersję — **nie synchronizować z modułami**
