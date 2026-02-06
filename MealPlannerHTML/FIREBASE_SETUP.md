# 🔥 Konfiguracja Firebase dla Planner Dietetyczny

## Krok 1: Utwórz projekt Firebase

1. Przejdź do [Firebase Console](https://console.firebase.google.com/)
2. Kliknij **"Add project"** (Dodaj projekt)
3. Nazwa projektu: `meal-planner` (lub dowolna)
4. Wyłącz Google Analytics (nie jest potrzebny)
5. Kliknij **"Create project"**

## Krok 2: Dodaj aplikację webową

1. W Firebase Console, kliknij ikonę **</>** (Web)
2. Nazwa aplikacji: `Meal Planner`
3. **NIE** zaznaczaj "Firebase Hosting" (na razie)
4. Kliknij **"Register app"**
5. **SKOPIUJ** kod konfiguracji (firebaseConfig)

## Krok 3: Wklej konfigurację do index.html

1. Otwórz plik `index.html`
2. Znajdź sekcję:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  ...
};
```
3. **ZASTĄP** swoimi danymi z Firebase Console

## Krok 4: Włącz Authentication

1. W Firebase Console → **Authentication** → **Get started**
2. Zakładka **Sign-in method**
3. Włącz **Google** provider:
   - Kliknij **Google**
   - Włącz przełącznik **Enable**
   - Wybierz email support
   - Kliknij **Save**

## Krok 5: Włącz Firestore Database

1. W Firebase Console → **Firestore Database** → **Create database**
2. Wybierz **Start in test mode** (na początek)
3. Lokalizacja: **europe-west** (najbliżej Polski)
4. Kliknij **Enable**

## Krok 6: Skonfiguruj Security Rules (WAŻNE!)

1. W Firestore Database → zakładka **Rules**
2. Wklej poniższe reguły:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Użytkownicy mogą czytać/pisać tylko swoje dane
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Kliknij **Publish**

## Krok 7: Testuj aplikację

1. Otwórz `index.html` w przeglądarce
2. Powinien pojawić się ekran logowania
3. Kliknij **"Zaloguj przez Google"**
4. Zaloguj się kontem Google
5. Dane będą synchronizowane między urządzeniami! ✅

## Krok 8: Deploy na Firebase Hosting (opcjonalnie)

```bash
# Zainstaluj Firebase CLI
npm install -g firebase-tools

# Zaloguj się
firebase login

# Inicjalizuj projekt w folderze MealPlannerHTML
cd MealPlannerHTML
firebase init hosting

# Wybierz istniejący projekt
# Public directory: . (kropka - bieżący folder)
# Single-page app: No
# Overwrite index.html: No

# Deploy!
firebase deploy
```

Twoja strona będzie dostępna pod: `https://meal-planner-XXXX.web.app`

## Gotowe! 🎉

Teraz możesz:
- ✅ Logować się z dowolnego urządzenia
- ✅ Dane synchronizują się automatycznie
- ✅ Offline mode - działa bez internetu
- ✅ Backup w chmurze

## Troubleshooting

**Problem: "Firebase is not defined"**
- Sprawdź połączenie internetowe
- Upewnij się że firebaseConfig jest poprawny

**Problem: "Permission denied"**
- Sprawdź Security Rules w Firestore
- Upewnij się że użytkownik jest zalogowany

**Problem: Dane się nie synchronizują**
- Sprawdź konsolę przeglądarki (F12)
- Sprawdź czy Firestore jest włączony
- Sprawdź Security Rules
