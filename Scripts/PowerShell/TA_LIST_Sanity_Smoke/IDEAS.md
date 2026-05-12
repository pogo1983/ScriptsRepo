# Pomysły na rozwój — TA Inventory

## Automatyzacja / CI-CD
- [ ] Uruchamiaj `2_Update-TA-Inventory.ps1 -UpdateBase` automatycznie przy merge do `main`
- [ ] Webhook do Teams/Slack po dodaniu nowych TC ("Dodano TC-157, TC-158...")
- [ ] Pobieranie wyników pipeline z Allure/ADO → kolumna `Last_Run_Status` (passed/failed/skipped)

## Raportowanie / Trendy
- [ ] Arkusz `History` w Excelu — każdy update dopisuje wiersz: `data | DONE | IN_PROGRESS | TODO | total`
- [ ] Coverage per Domain i per Actor — `% DONE` na wykresie, widać białe plamy
- [ ] Widok "ile TC pokrywa każdy deweloper" (kolumna Person → statystyki)

## Pokrycie testami
- [ ] Zmapować domeny biznesowe (z `@Domain`) na TC w inventory — które domeny mają 0 testów?
- [ ] Porównanie: ile scenariuszy Gherkin per feature vs ile TC — niektóre feature mają np. 5 scenariuszy a są liczone jako 1 TC
- [ ] Tagowanie krytycznych ścieżek (`@CriticalPath`) i śledzenie ich pokrycia osobno
- [ ] Identyfikacja TC które nie mają `@Suite:Sanity` ani `@Suite:Smoke` — czy powinny?

## Jakość dokumentacji feature files
- [ ] Skrypt `4_Validate-Tags.ps1` — sprawdza czy każdy `.feature` ma wymagane tagi:
      `@Domain`, `@Actor`, `@App`, `@Prio`, `@Feature`, `@Owner`, `@allure.label.parentSuite`, `@allure.label.suite`
      Raportuje brakujące tagi per plik
- [ ] Sprawdzanie spójności wartości tagów (np. czy `@Domain:` ma wartość z dozwolonej listy)
- [ ] Wykrywanie feature files bez żadnego `Scenario:` (puste/szkieletowe pliki)
- [ ] Sprawdzanie czy `Feature:` tytuł jest unikalny w całym repo

## Inventory — drobne ulepszenia
- [ ] Kolumna `Last_Updated` — data ostatniej zmiany statusu (skrypt Update mógłby ją wypełniać)
- [ ] Kolumna `Sprint` lub `Milestone` — do planowania iteracji
- [ ] Eksport widoku "TODO only" do osobnego pliku dla PM-a (bez wewnętrznych kolumn ADO)
