# 🍽️ Planner Dietetyczny

Aplikacja webowa do planowania posiłków, zarządzania jadłospisem i generowania list zakupów dla dwóch osób.

## ✅ Zrealizowane funkcje

### 🎯 Core Features
- ✅ **Wybór dań na cały tydzień** - 4 typy posiłków (śniadanie, obiad, podwieczorek, kolacja)
- ✅ **Automatyczne skalowanie kalorii** - dostosowanie gramatur do celu kalorycznego (1000-3000 kcal)
- ✅ **Lista zakupów** - automatyczne sumowanie składników dla obu osób
- ✅ **Filtry dni** - generuj zakupy tylko na wybrane dni tygodnia
- ✅ **Eksport do kalendarza (.ics)** - dodaj plan do Apple Calendar/Google Calendar
- ✅ **Persystencja** - wszystko zapisywane w localStorage

### ⭐ Personalizacja
- ✅ **Ulubione dania** - oznaczanie gwiazdkami i filtrowanie
- ✅ **Edytowalne imiona** - personalizacja dla każdej osoby
- ✅ **Własne dania** - dodawanie nowych przepisów
- ✅ **Konfigurowalne funkcje** - włącz/wyłącz moduły (Historia, Statystyki, Aktywność, Lodówka)

### 🔄 Wygoda
- ✅ **Randomizacja planu** - losuj cały tydzień lub pojedyncze posiłki (zakładka "🎲 Chybił trafił")
- ✅ **Copy week** - skopiuj plan z poprzedniego tygodnia
- ✅ **Batch cooking** - mnożnik porcji ×2/×3/×4 z propagacją na kolejne dni
- ✅ **Reset do domyślnych** - powrót do pierwszych dań w bazie

### 📚 Historia i Zarządzanie
- ✅ **Historia planów** - zapisywanie i przeglądanie poprzednich tygodni
- ✅ **Eksport/Import JSON** - backup i przywracanie danych
- ✅ **Zapisywanie planów** - wiele nazwanych planów do szybkiego wczytania

### 🏃‍♂️ Aktywność i Zdrowie (moduł opcjonalny)
- ✅ **Kalkulator spalonych kalorii** - 14 rodzajów aktywności
- ✅ **Dziennik aktywności** - tracking treningów z podsumowaniem tygodniowym
- ✅ **Tracker wagi** - historia pomiarów dla obu osób
- ✅ **Tracker wody** - cel dzienny i postęp

### 📊 Statystyki & Garmin (moduł opcjonalny)
- ✅ **Import CSV z Garmin Connect** - dla obu użytkowników osobno
- ✅ **Historia treningów** - pełna lista z filtrowaniem
- ✅ **Filtry** - osoba, typ aktywności, zakres dat
- ✅ **Wykres kalorii** - wizualizacja w czasie
- ✅ **Podsumowanie** - treningi, kalorie, dystans, czas
- ✅ **Eksport danych** - całość do CSV

### 🧊 Lodówka i Zakupy (moduł opcjonalny)
- ✅ **Zarządzanie lodówką** - co mam w lodówce z datami ważności
- ✅ **Sugestie dań** - na podstawie dostępnych produktów
- ✅ **Baza cen** - zarządzanie cenami produktów po sklepach
- ✅ **Szacowanie kosztów** - ile będą kosztować zakupy

### 💪 Plan Treningowy
- ✅ **Planner treningów** - na cały tydzień
- ✅ **Biblioteka ćwiczeń** - 6 kategorii (klatka, plecy, nogi, ramiona, core, cardio)
- ✅ **Integracja Garmin Connect** - linki i instrukcje

### 🎨 UI/UX
- ✅ **Responsywny design** - działa na desktop i mobile
- ✅ **Dark/Light mode friendly** - czytelne kolory
- ✅ **Accordion dla dni** - zwijanie/rozwijanie planów
- ✅ **Hamburger menu** - na mobile
- ✅ **Floating action buttons** - szybki dostęp do eksportu
- ✅ **Kolory dla osób** - różowy (Michalina) / niebieski (Marcin)

---

## 🚀 Planowane funkcje (TODO)

### 📊 Tracking & Analytics

#### Priorytet WYSOKI
- [ ] **Makroskładniki szczegółowe** - białko/węgle/tłuszcze dla każdego dania (nie tylko kalorie)
  - Dodać kolumny P/C/F do bazy dań
  - Wyświetlać w planie i na kartach dań
  - Sumować dzienny/tygodniowy rozkład makro

- [ ] **Wykresy tygodniowe/miesięczne** - wizualizacja spożycia
  - Chart.js - wykresy kalorii, makro
  - Porównanie dni w tygodniu
  - Trendy długoterminowe

#### Priorytet ŚREDNI
- [ ] **Progress tracking - zdjęcia przed/po**
  - Upload i przechowywanie zdjęć (base64 w localStorage lub Supabase)
  - Timeline zmian
  - Porównanie side-by-side

- [ ] **Raporty i statystyki**
  - Najpopularniejsze dania
  - Compliance rate (ile dni trzymałeś się planu)
  - Średnie kalorie/makro per tydzień

### ⭐ Personalizacja

#### Priorytet WYSOKI
- [ ] **Auto-generowanie planu (AI/Smart)**
  - Algorytm dobierający zbalansowane dania
  - Uwzględnianie preferencji i wykluczeń
  - Różnorodność (nie powtarzaj tego samego w tydzień)

- [ ] **Wykluczanie alergenów**
  - Checkbox: mleko, jaja, orzechy, gluten, soja, ryby, skorupiaki
  - Filtrowanie dań bez alergenów
  - Ostrzeżenia przy dodawaniu dań

#### Priorytet ŚREDNI
- [ ] **Filtry dietetyczne**
  - Keto, Low-carb, Paleo, Wegańskie, Wegetariańskie
  - Tagowanie dań w bazie
  - Szybkie przełączanie trybu

- [ ] **Preferencje smakowe**
  - Oceny dań 1-5 ⭐
  - "Nie lubię tego składnika" - wykluczanie
  - Sugestie oparte na ocenach

### 💰 Budżet & Zakupy

#### Priorytet WYSOKI
- [ ] **Automatyczne szacowanie kosztów** (rozszerzenie istniejącej funkcji)
  - Auto-wypełnianie cen z bazy
  - Porównanie kosztów tygodniowych
  - Alert: "Ten tydzień droższy o 20%"

#### Priorytet ŚREDNI
- [ ] **Sezonowość produktów**
  - Baza sezonowych warzyw/owoców
  - Sugestie: "teraz tańsze: pomidory, truskawki"
  - Kolorowe oznaczenia (zielone = sezon)

- [ ] **Smart shopping - grupowanie**
  - Grupuj po działach (nabiał, mięso, warzywa, pieczywo)
  - Grupuj po sklepach (Biedronka, Lidl, Auchan)
  - Optymalizacja trasy zakupów

### 🔄 Wygoda

#### Priorytet WYSOKI
- [ ] **Zamiana dań** - "nie lubię tego, pokaż alternatywę"
  - Przycisk "🔄 Zamień" przy daniu
  - Losuj z podobnych (ten sam typ posiłku)
  - Uwzględnij kalorie i preferencje

- [ ] **Quick add** - szybkie dodawanie prostych posiłków
  - "Kanapka", "Jogurt z owocami", "Sałatka"
  - Bez pełnego przepisu, tylko składniki podstawowe

#### Priorytet ŚREDNI
- [ ] **Meal templates** - gotowe szablony dnia
  - "Dzień aktywny", "Dzień leniwy", "Dzień fit"
  - Szybkie wstawienie całego dnia

- [ ] **Leftovers tracking**
  - Oznaczaj "zostały resztki"
  - Sugestie wykorzystania resztek następnego dnia

### 👨‍👩‍👧‍👦 Współdzielenie

#### Priorytet WYSOKI
- [ ] **Family sharing - QR code/link**
  - Backend (Supabase)
  - Generuj QR code do udostępnienia planu
  - Sync między urządzeniami (Mac ↔ iPhone)

#### Priorytet ŚREDNI
- [ ] **Oceny i komentarze do dań**
  - "5/5, pycha!" 
  - Historia ocen
  - Top rated meals

- [ ] **Notatki do dań**
  - "Dodać więcej czosnku"
  - "Świetne z ryżem"
  - Przechowywane per danie

### 📱 Integracje

#### Priorytet WYSOKI
- [ ] **Apple Health / Google Fit sync**
  - API do odczytu kalorii/treningów
  - Auto-update dziennika aktywności
  - Synchronizacja wagi

#### Priorytet ŚREDNI
- [ ] **Supabase backend**
  - PostgreSQL database
  - Real-time sync
  - Multi-device support
  - Backup w chmurze

#### Priorytet NISKI
- [ ] **Smart home integration**
  - "Alexa, co dzisiaj na obiad?"
  - "Hey Siri, dodaj do listy zakupów"

- [ ] **Barcode scanner**
  - Skanuj produkty z lodówki
  - Auto-dodawanie do inwentarza

---

## 💡 Inne propozycje ulepszeń

### UX/UI
- [ ] **Dark mode** - pełne wsparcie ciemnego motywu
- [ ] **Animacje** - płynne transitions przy zmianach
- [ ] **Drag & drop** - przeciąganie dań między dniami
- [ ] **Print view** - wydruk jadłospisu i listy zakupów
- [ ] **PWA** - instalacja jako aplikacja na telefonie
- [ ] **Offline mode** - pełna funkcjonalność bez internetu (już jest przez localStorage)

### Performance
- [ ] **Lazy loading** - ładuj dane tylko gdy potrzebne
- [ ] **Image optimization** - zdjęcia dań (jeśli dodamy)
- [ ] **Service Worker** - cache dla szybszego ładowania

### Database & Data
- [ ] **Większa baza dań** - więcej przepisów (50+ dań per kategoria)
- [ ] **Przepisy krok po kroku** - szczegółowe instrukcje
- [ ] **Zdjęcia dań** - wizualizacja
- [ ] **Czas przygotowania** - "20 min", "45 min"
- [ ] **Poziom trudności** - "łatwe", "średnie", "trudne"
- [ ] **Tagi** - "szybkie", "dietetyczne", "comfort food"

### AI & Smart Features
- [ ] **Recipe suggestions based on weather** - "zimno → zupa", "gorąco → sałatka"
- [ ] **Predictive shopping** - "zwykle kupujesz mleko w czwartki"
- [ ] **Habit tracking** - "jedzenie o regularnych porach"
- [ ] **Meal reminders** - push notifications "Czas na obiad!"

### Social & Gamification
- [ ] **Challenges** - "7 dni bez cukru"
- [ ] **Achievements** - "10 tygodni z rzędu!"
- [ ] **Leaderboard** - współzawodnictwo ze znajomymi
- [ ] **Share recipes** - eksport przepisu jako karta do social media

### Advanced Analytics
- [ ] **Correlation tracking** - "czuję się lepiej gdy jem więcej białka"
- [ ] **Meal timing analysis** - "najlepsze wyniki gdy jem 4 posiłki"
- [ ] **Budget trends** - "wydajesz średnio 450 zł/tydzień"
- [ ] **Waste tracking** - "wyrzucasz 10% jedzenia"

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: localStorage (clientside)
- **Charts**: Plan na Chart.js/D3.js dla wykresów
- **Backend (future)**: Supabase (PostgreSQL)
- **Export**: .ics (iCalendar), JSON, CSV

## 📦 Struktura projektu

```
MealPlannerHTML/
├── index.html              # Main HTML
├── data.js                 # Database dań
├── css/
│   ├── base.css           # Variables, base styles
│   ├── layout.css         # Layout, container, grid
│   ├── components.css     # Buttons, cards, forms
│   ├── meal-planner.css   # Planner-specific styles
│   ├── random-meal.css    # Random meal tab
│   ├── history.css        # History tab
│   ├── modules.css        # Activity, stats, fridge
│   └── responsive.css     # Mobile breakpoints
├── js/
│   ├── app.js             # Initialization
│   ├── utils.js           # Helper functions
│   ├── meal-planner.js    # Core planner logic
│   ├── batch-cooking.js   # Batch cooking features
│   ├── random-meal.js     # Random meal picker
│   ├── history.js         # Plan history
│   ├── meal-manager.js    # Dish management
│   ├── export.js          # .ics calendar export
│   ├── activity.js        # Activity tracking
│   ├── weight.js          # Weight tracking
│   ├── water.js           # Water tracking
│   ├── fridge.js          # Fridge management
│   ├── prices.js          # Price management
│   ├── training.js        # Training planner
│   ├── stats.js           # Garmin stats
│   └── ui.js              # UI utilities
└── README.md              # This file
```

## 🚀 Getting Started

1. Otwórz `index.html` w przeglądarce
2. Wybierz cele kaloryczne
3. Wybierz dania na każdy dzień
4. Kliknij "📋 Pokaż jadłospis i listę zakupów"
5. Eksportuj do kalendarza lub zapisz plan

## 💾 Backup danych

Wszystkie dane przechowywane są w localStorage przeglądarki. Zalecane backupy:

1. **Historia planów** → Eksportuj do JSON (zakładka Historia)
2. **Treningi** → Eksportuj do CSV (zakładka Statystyki)
3. **Własne dania** → Zapisane automatycznie w localStorage

## 🤝 Contributing

Propozycje nowych funkcji i zgłaszanie błędów mile widziane!

## 📄 License

Private project - All rights reserved

---

**Ostatnia aktualizacja**: 8 lutego 2026
**Wersja**: 2.0 - Feature-rich meal planner
