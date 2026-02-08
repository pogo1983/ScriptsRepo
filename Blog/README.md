# Blog - Kompletny System Blogowy

Nowoczesny, responsywny blog z pełnym backendem PHP + MySQL.

## 📋 Zawartość

### Frontend (HTML/CSS/JS)
- ✅ **index.html** - Strona główna z listą postów
- ✅ **post.html** - Pojedynczy post z komentarzami
- ✅ **about.html** - Strona o autorze
- ✅ **contact.html** - Formularz kontaktowy
- ✅ **styles.css** - Kompletne style (responsywne)
- ✅ **js/blog.js** - Interakcje JavaScript

### Backend (PHP + MySQL)
- ✅ **config.php** - Konfiguracja bazy danych
- ✅ **functions.php** - Funkcje pomocnicze (CRUD)
- ✅ **api/comments.php** - API dla komentarzy
- ✅ **api/contact.php** - API dla formularza kontaktowego
- ✅ **api/newsletter.php** - API dla newslettera
- ✅ **database/schema.sql** - Schemat bazy danych

## 🚀 Instalacja na serwerze

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
CREATE USER 'blog_user'@'localhost' IDENTIFIED BY 'TWOJE_HASLO';
GRANT ALL PRIVILEGES ON blog_db.* TO 'blog_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Krok 2: Zaimportuj schemat

```bash
mysql -u blog_user -p blog_db < database/schema.sql
```

## 🔧 Zarządzanie serwerami (localhost)

### MySQL
```bash
# Start MySQL
brew services start mysql

# Stop MySQL
brew services stop mysql

# Status MySQL
brew services list | grep mysql

# Połączenie z bazą
mysql -u root
use blog_db;
```

### PHP Development Server
```bash
# Start PHP (w folderze Blog/)
php -S localhost:8000

# Stop PHP
Ctrl + C

# Start w tle
php -S localhost:8000 &

# Sprawdź czy działa
lsof -i :8000
```

### Krok 3: Skonfiguruj config.php

Edytuj `config.php` i zmień:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'blog_db');
define('DB_USER', 'blog_user');           // Twój użytkownik
define('DB_PASS', 'TWOJE_HASLO');         // Twoje hasło
define('SITE_URL', 'https://twoja-domena.pl');
define('ADMIN_EMAIL', 'twoj@email.pl');
define('SECRET_KEY', 'wygeneruj-losowy-ciag-znakow');
define('DEBUG_MODE', false);              // WYŁĄCZ na produkcji!
```

### Krok 4: Ustaw uprawnienia (Linux)

```bash
chmod 755 Blog/
chmod 644 Blog/*.php Blog/*.html Blog/*.css
chmod 755 Blog/api/
chmod 644 Blog/api/*.php
```

### Krok 5: Konfiguracja Apache (.htaccess)

Opcjonalnie stwórz `.htaccess` w głównym folderze:

```apache
# Włącz mod_rewrite
RewriteEngine On

# Przekieruj na HTTPS (opcjonalnie)
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Blokuj dostęp do plików konfiguracyjnych
<FilesMatch "^(config|functions)\.php$">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Blokuj dostęp do folderu database
RedirectMatch 403 ^/database/
```

### Krok 6: Testuj instalację

1. Otwórz w przeglądarce: `https://twoja-domena.pl/Blog/`
2. Sprawdź czy strona się ładuje
3. Przetestuj formularz kontaktowy: `https://twoja-domena.pl/Blog/contact.html`
4. Przetestuj komentarze na: `https://twoja-domena.pl/Blog/post.html`

## 📊 Struktura bazy danych

### Tabele:
- **users** - Użytkownicy (autorzy)
- **posts** - Posty blogowe
- **categories** - Kategorie postów
- **tags** - Tagi
- **post_tags** - Powiązania postów z tagami
- **comments** - Komentarze
- **contact_messages** - Wiadomości kontaktowe
- **newsletter_subscribers** - Subskrybenci newslettera
- **settings** - Ustawienia bloga

### Domyślne dane:
- **Admin** - login: `admin`, email: `admin@blog.pl`, hasło: `admin123` ⚠️ **ZMIEŃ TO!**
- 4 kategorie (Technologia, Programowanie, Lifestyle, Podróże)
- 8 tagów (HTML, CSS, JavaScript, PHP, MySQL, Tutorial, Tips, Web Design)
- 1 przykładowy post

## 🔐 Bezpieczeństwo

### Przed uruchomieniem na produkcji:

1. **Zmień hasło admina:**
```sql
UPDATE users SET password_hash = '$2y$10$NEW_HASH' WHERE username = 'admin';
```
Wygeneruj hash: `php -r "echo password_hash('NOWE_HASLO', PASSWORD_DEFAULT);"`

2. **Zmień SECRET_KEY** w `config.php`

3. **Wyłącz DEBUG_MODE** w `config.php`:
```php
define('DEBUG_MODE', false);
```

4. **Ogranicz dostęp do plików:**
- Nie udostępniaj publicznie `config.php`, `functions.php`
- Zabezpiecz folder `/database/`

5. **Włącz HTTPS** (SSL/TLS)

6. **Backupy bazy danych:**
```bash
mysqldump -u blog_user -p blog_db > backup_$(date +%Y%m%d).sql
```

## 🛠️ Rozwój lokalny (XAMPP/MAMP)

### XAMPP (Windows/Mac/Linux):

1. Skopiuj folder `Blog/` do `C:\xampp\htdocs\` (lub `/Applications/XAMPP/htdocs/`)
2. Uruchom XAMPP Control Panel
3. Start Apache + MySQL
4. Otwórz phpMyAdmin: `http://localhost/phpmyadmin`
5. Zaimportuj `database/schema.sql`
6. Edytuj `config.php`:
```php
define('DB_USER', 'root');
define('DB_PASS', '');  // Puste hasło na XAMPP
define('SITE_URL', 'http://localhost/Blog');
define('DEBUG_MODE', true);
```
7. Otwórz: `http://localhost/Blog/`

### MAMP (Mac):

Analogicznie, folder w `/Applications/MAMP/htdocs/`

## 📝 Użytkowanie

### Dodawanie nowych postów

Obecnie posty dodaje się przez SQL. W przyszłości można dodać panel admina.

```sql
INSERT INTO posts (title, slug, excerpt, content, author_id, category_id, status, published_at) 
VALUES (
    'Tytuł posta',
    'tytul-posta',
    'Krótki opis...',
    '<p>Treść posta...</p>',
    1,
    1,
    'published',
    NOW()
);
```

### Moderacja komentarzy

```sql
-- Zobacz oczekujące komentarze
SELECT * FROM comments WHERE status = 'pending';

-- Zatwierdź komentarz
UPDATE comments SET status = 'approved' WHERE id = X;

-- Usuń spam
UPDATE comments SET status = 'spam' WHERE id = X;
```

### Zarządzanie kategoriami

```sql
-- Dodaj kategorię
INSERT INTO categories (name, slug, description) 
VALUES ('Nowa Kategoria', 'nowa-kategoria', 'Opis kategorii');

-- Edytuj kategorię
UPDATE categories SET name = 'Zmieniona nazwa' WHERE id = X;
```

## 🎨 Customizacja

### Zmiana kolorów

Edytuj zmienne CSS w `styles.css`:

```css
:root {
    --primary-color: #2563eb;      /* Kolor główny */
    --primary-dark: #1e40af;       /* Ciemniejszy odcień */
    --text-color: #1e293b;         /* Kolor tekstu */
    --bg-light: #f8fafc;           /* Tło jasne */
}
```

### Zmiana logo/tytułu

1. W plikach HTML zmień `<h1 class="logo">Mój Blog</h1>`
2. W `config.php` zmień `define('SITE_TITLE', 'Twoja Nazwa')`
3. W bazie danych: `UPDATE settings SET setting_value = 'Nowa nazwa' WHERE setting_key = 'site_title'`

## 📱 Funkcje

### Obecnie działające:
- ✅ Wyświetlanie postów z bazy danych
- ✅ System komentarzy (z moderacją)
- ✅ Formularz kontaktowy
- ✅ Newsletter
- ✅ Kategorie i tagi
- ✅ Responsywny design
- ✅ REST API dla wszystkich formularzy

### Do zrobienia (opcjonalnie):
- ⏳ Panel admina (dodawanie/edycja postów przez przeglądarkę)
- ⏳ Wyszukiwarka
- ⏳ Paginacja
- ⏳ Logowanie użytkowników
- ⏳ Upload obrazków
- ⏳ RSS feed

## 🐛 Troubleshooting

### Problem: "Błąd połączenia z bazą danych"
- Sprawdź dane w `config.php`
- Sprawdź czy MySQL działa: `mysql -u root -p`
- Sprawdź czy użytkownik ma uprawnienia

### Problem: Formularze nie działają
- Sprawdź ścieżkę do API: powinno być `/api/comments.php` a nie `/Blog/api/comments.php`
- Sprawdź logi błędów PHP: `/var/log/apache2/error.log`
- Włącz `DEBUG_MODE` i zobacz szczegóły błędów

### Problem: 404 na API
- Sprawdź czy folder `/api/` istnieje
- Sprawdź uprawnienia: `chmod 755 api/`
- Sprawdź czy mod_rewrite działa w Apache

## 📞 Wsparcie

W razie problemów sprawdź:
- Logi PHP: `/var/log/php/error.log`
- Logi Apache: `/var/log/apache2/error.log`
- Logi MySQL: `/var/log/mysql/error.log`

## 📄 Licencja

Projekt open-source, możesz swobodnie modyfikować i używać.

## ✨ Autor

Stworzono z ❤️ do nauki i rozwoju.
