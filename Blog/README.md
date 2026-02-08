# Blog - Kompletny System Blogowy

Nowoczesny, responsywny blog z pełnym backendem PHP + MySQL oraz wsparciem wielojęzyczności (PL/EN).

---

## 📋 Spis treści

1. [Funkcje](#-funkcje)
2. [Struktura projektu](#-struktura-projektu)
3. [Instalacja na serwerze produkcyjnym](#-instalacja-na-serwerze-produkcyjnym)
4. [Instalacja lokalna (XAMPP/MAMP)](#-instalacja-lokalna-xamppmamp)
5. [Zarządzanie serwerami (localhost)](#-zarządzanie-serwerami-localhost)
6. [Struktura bazy danych](#-struktura-bazy-danych)
7. [Panel administracyjny](#-panel-administracyjny)
8. [Wielojęzyczność](#-wielojęzyczność)
9. [Bezpieczeństwo](#-bezpieczeństwo)
10. [Customizacja](#-customizacja)
11. [Backup](#-backup)
12. [Troubleshooting](#-troubleshooting)

---

## ✨ Funkcje

### Obecnie działające:
- ✅ **Dynamiczne posty** - wyświetlanie z bazy danych
- ✅ **System komentarzy** - z moderacją
- ✅ **Formularz kontaktowy** - zapisywanie wiadomości
- ✅ **Newsletter** - subskrypcje email
- ✅ **Kategorie i tagi** - organizacja treści
- ✅ **Panel admina** - dodawanie/usuwanie postów przez przeglądarkę
- ✅ **Autentykacja** - bezpieczny login do panelu
- ✅ **Wielojęzyczność** - przełączanie PL/EN z flagami 🇵🇱 🇬🇧
- ✅ **Paginacja** - dynamiczne stronicowanie
- ✅ **Responsywny design** - działa na wszystkich urządzeniach
- ✅ **REST API** - endpoints dla wszystkich formularzy

### Do zrobienia (opcjonalnie):
- ⏳ Edycja postów w panelu admina
- ⏳ Wyszukiwarka
- ⏳ Upload obrazków
- ⏳ RSS feed
- ⏳ Panel moderacji komentarzy

---

## 📁 Struktura projektu

```
Blog/
├── index.php              # Strona główna (lista postów)
├── post.php               # Pojedynczy post
├── about.php              # O mnie
├── contact.php            # Kontakt
├── .htaccess              # Konfiguracja Apache
├── README.md              # Ta dokumentacja
│
├── includes/
│   ├── config.php         # ⚙️ Konfiguracja bazy danych
│   ├── functions.php      # Funkcje PHP (CRUD)
│   └── lang.php           # System wielojęzyczności
│
├── admin/
│   ├── admin.php          # Panel zarządzania postami
│   ├── login.php          # Logowanie
│   └── logout.php         # Wylogowanie
│
├── api/
│   ├── comments.php       # API komentarzy
│   ├── contact.php        # API formularza
│   └── newsletter.php     # API newslettera
│
├── assets/
│   ├── css/
│   │   └── styles.css     # Style CSS
│   └── js/
│       └── blog.js        # JavaScript
│
└── database/
    └── schema.sql         # Schemat bazy danych
```

---

## 🚀 Instalacja na serwerze produkcyjnym

### Wymagania
- PHP 7.4+ (zalecane 8.0+)
- MySQL 5.7+ lub MariaDB 10.2+
- Apache/Nginx z mod_rewrite

### Krok 1: Utwórz bazę danych

```bash
mysql -u root -p
```

```sql
CREATE DATABASE blog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'TWOJE_BEZPIECZNE_HASLO';
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Krok 2: Zaimportuj schemat

```bash
mysql -u blog_user -p blog_db < database/schema.sql
```

### Krok 3: Skonfiguruj includes/config.php

Edytuj `includes/config.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'blog_db');
define('DB_USER', 'blog_user');                      // Twój użytkownik
define('DB_PASS', 'TWOJE_HASLO');                    // Twoje hasło
define('SITE_URL', 'https://twoja-domena.pl');
define('ADMIN_EMAIL', 'twoj@email.pl');
define('SECRET_KEY', 'wygeneruj-losowy-ciag-32+');   // min 32 znaki
define('DEBUG_MODE', false);                          // WYŁĄCZ na produkcji!
```

### Krok 4: Ustaw uprawnienia (Linux)

```bash
chmod 755 Blog/
chmod 644 Blog/*.php
chmod 755 Blog/includes/ Blog/admin/ Blog/api/ Blog/assets/
chmod 644 Blog/includes/*.php Blog/admin/*.php Blog/api/*.php
chmod 600 Blog/includes/config.php                    # Dodatkowe zabezpieczenie
```

### Krok 5: Testuj instalację

1. Otwórz: `https://twoja-domena.pl/Blog/`
2. Sprawdź stronę główną
3. Przetestuj formularz kontaktowy: `/contact.php`
4. Przetestuj komentarze na: `/post.php`
5. Zaloguj się do panelu: `/admin/login.php` (admin/admin123)

---

## 💻 Instalacja lokalna (XAMPP/MAMP)

### XAMPP (Windows/Mac/Linux):

1. **Skopiuj projekt** do folderu:
   - Windows: `C:\xampp\htdocs\Blog`
   - Mac: `/Applications/XAMPP/htdocs/Blog`
   - Linux: `/opt/lampp/htdocs/Blog`

2. **Uruchom XAMPP Control Panel**
   - Start: Apache + MySQL

3. **Utwórz bazę danych**
   - Otwórz phpMyAdmin: `http://localhost/phpmyadmin`
   - Utwórz bazę: `blog_db`
   - Import → wybierz `database/schema.sql`

4. **Skonfiguruj config.php**:
   ```php
   define('DB_USER', 'root');
   define('DB_PASS', '');               // Puste na XAMPP
   define('SITE_URL', 'http://localhost/Blog');
   define('DEBUG_MODE', true);          // Włącz dla lokalnego testowania
   ```

5. **Otwórz w przeglądarce**: `http://localhost/Blog/`

### MAMP (Mac):

Analogicznie, folder: `/Applications/MAMP/htdocs/Blog`

---

## 🔧 Zarządzanie serwerami (localhost)

### MySQL

```bash
# Start MySQL
brew services start mysql

# Stop MySQL
brew services stop mysql

# Restart MySQL
brew services restart mysql

# Status MySQL
brew services list | grep mysql

# Połączenie z bazą
mysql -u root
use blog_db;
SHOW TABLES;

# Sprawdź czy działa
mysql -u root -e "SELECT 'OK' as status;"
```

### GUI - Rozszerzenie VS Code

**Zainstalowane**: MySQL (cweijan.vscode-mysql-client2)

**Jak się połączyć**:
1. Kliknij ikonę bazy danych w lewym panelu VS Code
2. Kliknij **"+"** aby dodać nowe połączenie
3. Wybierz **"MySQL"**
4. Podaj dane:
   - Host: `localhost`
   - Port: `3306`
   - User: `root`
   - Password: (pusty)
   - Database: `blog_db` (opcjonalnie)

⚠️ **Uwaga**: MySQL musi być uruchomiony (`brew services start mysql`)

### PHP Development Server

```bash
# Start PHP (w folderze Blog/)
cd Blog
php -S localhost:8000

# Stop PHP
Ctrl + C

# Start w tle
php -S localhost:8000 > /dev/null 2>&1 &

# Sprawdź czy działa
lsof -i :8000
curl http://localhost:8000

# Zabij proces PHP
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill
```

### Szybki start wszystkiego

```bash
# Uruchom MySQL i PHP jedną komendą
brew services start mysql && cd Blog && php -S localhost:8000
```

---

## 📊 Struktura bazy danych

### Tabele:

1. **users** - Użytkownicy (autorzy)
   - id, username, email, password_hash, display_name, bio, avatar_url, role, created_at, updated_at

2. **posts** - Posty blogowe
   - id, title, slug, excerpt, content, featured_image, author_id, category_id, status, views, published_at, created_at, updated_at

3. **categories** - Kategorie postów
   - id, name, slug, description, post_count, created_at, updated_at

4. **tags** - Tagi
   - id, name, slug, post_count, created_at, updated_at

5. **post_tags** - Powiązania postów z tagami (junction table)
   - post_id, tag_id

6. **comments** - Komentarze
   - id, post_id, parent_id, author_name, author_email, content, status, created_at

7. **contact_messages** - Wiadomości kontaktowe
   - id, name, email, subject, message, status, created_at

8. **newsletter_subscribers** - Subskrybenci newslettera
   - id, email, status, subscribed_at

9. **settings** - Ustawienia bloga
   - id, setting_key, setting_value, created_at, updated_at

### Domyślne dane:

- **Admin**: login: `admin`, email: `admin@blog.pl`, hasło: `admin123` ⚠️ **ZMIEŃ TO!**
- **Kategorie**: Technologia, Programowanie, Lifestyle, Podróże
- **Tagi**: HTML, CSS, JavaScript, PHP, MySQL, Tutorial, Tips, Web Design
- **1 przykładowy post**

### Triggery:

- Auto-update `post_count` w categories po dodaniu/usunięciu posta
- Auto-update `post_count` w tags po dodaniu/usunięciu post_tags

---

## 👨‍💼 Panel administracyjny

### Logowanie

**URL**: `/admin/login.php`

**Domyślne dane**:
- Login: `admin`
- Hasło: `admin123`

⚠️ **ZMIEŃ TO NATYCHMIAST!** (zobacz sekcja [Bezpieczeństwo](#-bezpieczeństwo))

### Zarządzanie postami

**URL**: `/admin/admin.php`

**Funkcje**:
- ✅ Dodawanie nowych postów (tytuł, slug, excerpt, treść, kategoria)
- ✅ Podgląd wszystkich postów z licznikami wyświetleń
- ✅ Usuwanie postów z potwierdzeniem
- ✅ Automatyczne generowanie slug z tytułu
- ✅ Przełącznik języka PL/EN

**Do zrobienia**:
- ⏳ Edycja istniejących postów
- ⏳ Upload obrazków
- ⏳ Moderacja komentarzy

---

## 🌍 Wielojęzyczność

### System tłumaczeń

**Plik**: `includes/lang.php`

**Wspierane języki**: Polski (PL), English (EN)

**Przełączanie**:
- Kliknij flagę 🇵🇱 lub 🇬🇧 w nawigacji
- Język zapisuje się w sesji
- Działa na wszystkich stronach

### Dodawanie tłumaczeń

Edytuj `includes/lang.php`:

```php
$translations = [
    'pl' => [
        'key' => 'Wartość po polsku',
    ],
    'en' => [
        'key' => 'English value',
    ]
];
```

Użycie w kodzie:

```php
<?php echo t('key'); ?>
```

---

## 🔐 Bezpieczeństwo

### CHECKLIST przed produkcją:

- [ ] **Zmień hasło admina**
- [ ] **Zmień SECRET_KEY**
- [ ] **Wyłącz DEBUG_MODE**
- [ ] **Zmień DB_USER i DB_PASS**
- [ ] **Włącz HTTPS (SSL)**
- [ ] **Zabezpiecz config.php**
- [ ] **Zabezpiecz folder /database/**
- [ ] **Ustaw poprawne uprawnienia (chmod)**
- [ ] **Skonfiguruj backupy**
- [ ] **Przetestuj wszystkie formularze**

### 1. Zmiana hasła admina

```bash
# Wygeneruj hash nowego hasła
php -r "echo password_hash('NOWE_BEZPIECZNE_HASLO', PASSWORD_DEFAULT);"
```

```sql
# Zaktualizuj w bazie
UPDATE users SET password_hash = '$2y$10$WYGENEROWANY_HASH' WHERE username = 'admin';
```

### 2. Zmiana SECRET_KEY

Wygeneruj losowy ciąg (min 32 znaki):

```bash
openssl rand -base64 32
```

Wklej do `includes/config.php`:

```php
define('SECRET_KEY', 'tu-wygenerowany-ciag');
```

### 3. Wyłącz DEBUG_MODE

W `includes/config.php`:

```php
define('DEBUG_MODE', false);  // WAŻNE na produkcji!
```

### 4. Zabezpiecz pliki (.htaccess)

Utwórz/edytuj `.htaccess` w głównym folderze:

```apache
# Włącz mod_rewrite
RewriteEngine On

# Przekieruj na HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Blokuj dostęp do config.php
<FilesMatch "^config\.php$">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Blokuj dostęp do folderu database
RedirectMatch 403 ^/database/

# Blokuj dostęp do plików .git
RedirectMatch 403 ^/\.git
```

### 5. Implementowane zabezpieczenia

✅ **PDO Prepared Statements** - wszystkie zapytania SQL  
✅ **Password hashing** - bcrypt dla haseł  
✅ **htmlspecialchars()** - escapowanie output  
✅ **Session-based auth** - bezpieczne sesje  
✅ **CSRF protection** - w planach  

---

## 🎨 Customizacja

### Zmiana kolorów

Edytuj zmienne CSS w `assets/css/styles.css`:

```css
:root {
    --primary-color: #2563eb;      /* Kolor główny */
    --primary-dark: #1e40af;       /* Ciemniejszy odcień */
    --text-color: #1e293b;         /* Kolor tekstu */
    --bg-light: #f8fafc;           /* Tło jasne */
    --border-color: #e2e8f0;       /* Kolor ramek */
}
```

### Zmiana logo/tytułu

1. **W plikach PHP** zmień:
   ```php
   <h1 class="logo">Moja Nazwa</h1>
   ```

2. **W config.php**:
   ```php
   define('SITE_TITLE', 'Mój Blog');
   ```

3. **W bazie danych**:
   ```sql
   UPDATE settings SET setting_value = 'Nowa nazwa' WHERE setting_key = 'site_title';
   ```

### Zmiana liczby postów na stronę

W `includes/config.php`:

```php
define('POSTS_PER_PAGE', 10);  // Domyślnie 5
```

---

## 💾 Backup

### Backup bazy danych

```bash
# Pełny backup
mysqldump -u blog_user -p blog_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Tylko struktura (bez danych)
mysqldump -u blog_user -p --no-data blog_db > schema_backup.sql

# Tylko dane (bez struktury)
mysqldump -u blog_user -p --no-create-info blog_db > data_backup.sql
```

### Przywracanie

```bash
mysql -u blog_user -p blog_db < backup_20260208_123045.sql
```

### Automatyczny backup (cron)

```bash
# Edytuj crontab
crontab -e

# Dodaj linię (backup codziennie o 3:00)
0 3 * * * mysqldump -u blog_user -p'HASLO' blog_db > /path/to/backups/blog_$(date +\%Y\%m\%d).sql
```

---

## 🐛 Troubleshooting

### Problem: "Błąd połączenia z bazą danych"

**Rozwiązania**:
- ✓ Sprawdź dane w `includes/config.php`
- ✓ Sprawdź czy MySQL działa: `mysql -u root -p`
- ✓ Sprawdź czy użytkownik ma uprawnienia:
  ```sql
  SHOW GRANTS FOR 'blog_user'@'localhost';
  ```
- ✓ Sprawdź czy baza istnieje:
  ```sql
  SHOW DATABASES LIKE 'blog_db';
  ```

### Problem: Formularze nie działają

**Rozwiązania**:
- ✓ Sprawdź ścieżkę do API w `assets/js/blog.js`
- ✓ Sprawdź uprawnienia: `chmod 755 api/` i `chmod 644 api/*.php`
- ✓ Włącz `DEBUG_MODE` i sprawdź błędy w przeglądarce (Console)
- ✓ Sprawdź logi PHP: `tail -f /var/log/php/error.log`

### Problem: 404 na API

**Rozwiązania**:
- ✓ Sprawdź czy folder `/api/` istnieje
- ✓ Sprawdź uprawnienia: `ls -la api/`
- ✓ Sprawdź czy mod_rewrite działa:
  ```bash
  apache2ctl -M | grep rewrite
  ```
- ✓ Sprawdź `.htaccess`

### Problem: Nie działa logowanie do panelu admina

**Rozwiązania**:
- ✓ Sprawdź czy sesje są włączone: `session_start()` w `config.php`
- ✓ Sprawdź uprawnienia folderu sesji:
  ```bash
  chmod 1777 /var/lib/php/sessions
  ```
- ✓ Sprawdź czy hasło jest poprawne (domyślnie: `admin123`)
- ✓ Zresetuj hasło admina (patrz [Bezpieczeństwo](#-bezpieczeństwo))

### Problem: Brak flag w przełączniku języka

**Rozwiązania**:
- ✓ Sprawdź encoding plików: powinno być UTF-8
- ✓ Sprawdź czy przeglądarka wspiera emoji
- ✓ Sprawdź czy w `<head>` jest: `<meta charset="UTF-8">`

### Logi systemowe

```bash
# Logi PHP
tail -f /var/log/php/error.log

# Logi Apache
tail -f /var/log/apache2/error.log

# Logi MySQL
tail -f /var/log/mysql/error.log

# Logi PHP (XAMPP Windows)
C:\xampp\php\logs\php_error_log

# Logi Apache (XAMPP Windows)
C:\xampp\apache\logs\error.log
```

---

## 📞 Wsparcie

### Informacje pomocne przy zgłaszaniu problemów:

- Wersja PHP: `php -v`
- Wersja MySQL: `mysql --version`
- System operacyjny
- Komunikat błędu (pełny tekst)
- Logi z serwera

### Kontakt

- Sprawdź najpierw [Troubleshooting](#-troubleshooting)
- Sprawdź logi systemowe
- Włącz `DEBUG_MODE` i zobacz szczegóły błędów

---

## 📄 Licencja

Projekt open-source. Możesz swobodnie modyfikować i używać w swoich projektach.

---

## ✨ Changelog

- **2026-02-08**: Wielojęzyczność (PL/EN), paginacja, reorganizacja plików
- **2026-02-07**: Panel admina, autentykacja, REST API
- **2026-02-06**: Wersja początkowa

---

## 🙏 Autor

Stworzono z ❤️ do nauki i rozwoju.

**Powodzenia!** 🚀
