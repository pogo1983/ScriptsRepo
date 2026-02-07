<?php
/**
 * Konfiguracja bazy danych
 * 
 * WAŻNE: Po wgraniu na serwer, zmień dane dostępowe!
 */

session_start(); // Rozpocznij sesję dla języków i autentykacji

// Konfiguracja bazy danych
define('DB_HOST', 'localhost');          // Host bazy danych
define('DB_NAME', 'blog_db');            // Nazwa bazy danych
define('DB_USER', 'root');               // Użytkownik (ZMIEŃ NA PRODUKCJI!)
define('DB_PASS', '');                   // Hasło (ZMIEŃ NA PRODUKCJI!)
define('DB_CHARSET', 'utf8mb4');

// Ustawienia aplikacji
define('SITE_URL', 'http://localhost:8000');  // URL strony (ZMIEŃ NA PRODUKCJI!)
define('SITE_TITLE', 'Mój Blog');
define('SITE_DESCRIPTION', 'Dzielę się swoimi myślami, doświadczeniami i pomysłami');

// Ustawienia email
define('ADMIN_EMAIL', 'admin@blog.pl');   // Email administratora (ZMIEŃ!)
define('SMTP_HOST', 'localhost');
define('SMTP_PORT', 25);

// Ustawienia bezpieczeństwa
define('SECRET_KEY', 'zmien-to-na-losowy-ciag-znakow-1234567890');  // ZMIEŃ TO!
define('ENABLE_COMMENTS', true);
define('MODERATE_COMMENTS', true);        // Czy moderować komentarze przed publikacją

// Ustawienia paginacji
define('POSTS_PER_PAGE', 10);
define('COMMENTS_PER_POST', 50);

// Tryb deweloperski (wyłącz na produkcji!)
define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Połączenie z bazą danych
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    if (DEBUG_MODE) {
        die("Błąd połączenia z bazą danych: " . $e->getMessage());
    } else {
        die("Wystąpił błąd. Spróbuj ponownie później.");
    }
}

// Rozpocznij sesję
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
