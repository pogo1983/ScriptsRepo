<?php
/**
 * Funkcje pomocnicze dla bloga
 */

require_once 'config.php';
require_once 'lang.php';

/**
 * Zwraca treść w odpowiednim języku
 */
function getLocalizedField($row, $field) {
    global $lang;
    
    $fieldLang = $field . '_' . $lang;
    
    // Jeśli istnieje wersja w wybranym języku i nie jest pusta, zwróć ją
    if ($lang !== 'pl' && isset($row[$fieldLang]) && !empty($row[$fieldLang])) {
        return $row[$fieldLang];
    }
    
    // W przeciwnym razie zwróć wersję domyślną (PL)
    return $row[$field];
}

/**
 * Pobierz wszystkie posty (opublikowane)
 */
function getPosts($limit = null, $offset = 0, $category_id = null) {
    global $pdo;
    
    $sql = "SELECT p.*, u.display_name as author_name, c.name as category_name, c.slug as category_slug
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 'published'";
    
    if ($category_id) {
        $sql .= " AND p.category_id = :category_id";
    }
    
    $sql .= " ORDER BY p.published_at DESC";
    
    if ($limit) {
        $sql .= " LIMIT :limit OFFSET :offset";
    }
    
    $stmt = $pdo->prepare($sql);
    
    if ($category_id) {
        $stmt->bindValue(':category_id', $category_id, PDO::PARAM_INT);
    }
    
    if ($limit) {
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    return $stmt->fetchAll();
}

/**
 * Pobierz pojedynczy post po slug
 */
function getPost($slug) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT p.*, u.display_name as author_name, u.bio as author_bio, u.avatar_url as author_avatar,
               c.name as category_name, c.slug as category_slug
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = :slug AND p.status = 'published'
    ");
    
    $stmt->execute(['slug' => $slug]);
    $post = $stmt->fetch();
    
    // Zwiększ licznik wyświetleń
    if ($post) {
        $pdo->prepare("UPDATE posts SET views = views + 1 WHERE id = :id")
            ->execute(['id' => $post['id']]);
    }
    
    return $post;
}

/**
 * Pobierz tagi dla posta
 */
function getPostTags($post_id) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT t.* FROM tags t
        INNER JOIN post_tags pt ON t.id = pt.tag_id
        WHERE pt.post_id = :post_id
    ");
    
    $stmt->execute(['post_id' => $post_id]);
    return $stmt->fetchAll();
}

/**
 * Pobierz komentarze dla posta
 */
function getComments($post_id, $parent_id = null) {
    global $pdo;
    
    $sql = "SELECT * FROM comments 
            WHERE post_id = :post_id 
            AND status = 'approved'";
    
    if ($parent_id === null) {
        $sql .= " AND parent_id IS NULL";
    } else {
        $sql .= " AND parent_id = :parent_id";
    }
    
    $sql .= " ORDER BY created_at ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':post_id', $post_id, PDO::PARAM_INT);
    
    if ($parent_id !== null) {
        $stmt->bindValue(':parent_id', $parent_id, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    return $stmt->fetchAll();
}

/**
 * Dodaj komentarz
 */
function addComment($post_id, $author_name, $author_email, $content, $parent_id = null) {
    global $pdo;
    
    // Walidacja
    if (empty($author_name) || empty($author_email) || empty($content)) {
        return ['success' => false, 'message' => 'Wszystkie pola są wymagane.'];
    }
    
    if (!filter_var($author_email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'message' => 'Nieprawidłowy adres email.'];
    }
    
    // Sprawdź czy post istnieje
    $stmt = $pdo->prepare("SELECT id FROM posts WHERE id = :id AND status = 'published'");
    $stmt->execute(['id' => $post_id]);
    if (!$stmt->fetch()) {
        return ['success' => false, 'message' => 'Post nie istnieje.'];
    }
    
    // Status komentarza (pending jeśli moderacja włączona)
    $status = MODERATE_COMMENTS ? 'pending' : 'approved';
    
    // Dodaj komentarz
    $stmt = $pdo->prepare("
        INSERT INTO comments (post_id, parent_id, author_name, author_email, author_ip, content, status)
        VALUES (:post_id, :parent_id, :author_name, :author_email, :author_ip, :content, :status)
    ");
    
    $result = $stmt->execute([
        'post_id' => $post_id,
        'parent_id' => $parent_id,
        'author_name' => htmlspecialchars($author_name),
        'author_email' => $author_email,
        'author_ip' => $_SERVER['REMOTE_ADDR'] ?? null,
        'content' => htmlspecialchars($content),
        'status' => $status
    ]);
    
    if ($result) {
        $message = MODERATE_COMMENTS 
            ? 'Komentarz dodany. Czeka na moderację.' 
            : 'Komentarz dodany pomyślnie.';
        return ['success' => true, 'message' => $message];
    }
    
    return ['success' => false, 'message' => 'Błąd podczas dodawania komentarza.'];
}

/**
 * Wyślij wiadomość kontaktową
 */
function sendContactMessage($name, $email, $subject, $message) {
    global $pdo;
    
    // Walidacja
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        return ['success' => false, 'message' => 'Wszystkie pola są wymagane.'];
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'message' => 'Nieprawidłowy adres email.'];
    }
    
    // Zapisz wiadomość
    $stmt = $pdo->prepare("
        INSERT INTO contact_messages (name, email, subject, message, ip_address)
        VALUES (:name, :email, :subject, :message, :ip)
    ");
    
    $result = $stmt->execute([
        'name' => htmlspecialchars($name),
        'email' => $email,
        'subject' => htmlspecialchars($subject),
        'message' => htmlspecialchars($message),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? null
    ]);
    
    if ($result) {
        // Opcjonalnie: wyślij email do admina
        // mail(ADMIN_EMAIL, "Nowa wiadomość: " . $subject, $message, "From: " . $email);
        
        return ['success' => true, 'message' => 'Wiadomość wysłana pomyślnie!'];
    }
    
    return ['success' => false, 'message' => 'Błąd podczas wysyłania wiadomości.'];
}

/**
 * Zapisz subskrypcję newsletter
 */
function subscribeNewsletter($email) {
    global $pdo;
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'message' => 'Nieprawidłowy adres email.'];
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO newsletter_subscribers (email) 
            VALUES (:email)
            ON DUPLICATE KEY UPDATE status = 'active', subscribed_at = NOW()
        ");
        
        $stmt->execute(['email' => $email]);
        return ['success' => true, 'message' => 'Dziękujemy za subskrypcję!'];
    } catch (PDOException $e) {
        return ['success' => false, 'message' => 'Ten email jest już zapisany.'];
    }
}

/**
 * Pobierz wszystkie kategorie
 */
function getCategories() {
    global $pdo;
    
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY name ASC");
    return $stmt->fetchAll();
}

/**
 * Pobierz popularne tagi
 */
function getPopularTags($limit = 10) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT * FROM tags ORDER BY post_count DESC LIMIT :limit");
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
}

/**
 * Pobierz ostatnie posty
 */
function getRecentPosts($limit = 5) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT id, title, slug, published_at 
        FROM posts 
        WHERE status = 'published' 
        ORDER BY published_at DESC 
        LIMIT :limit
    ");
    
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
}

/**
 * Wyszukaj posty
 */
function searchPosts($query) {
    global $pdo;
    
    $stmt = $pdo->prepare("
        SELECT p.*, u.display_name as author_name, c.name as category_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.status = 'published'
        AND (p.title LIKE :query OR p.content LIKE :query)
        ORDER BY p.published_at DESC
    ");
    
    $stmt->execute(['query' => '%' . $query . '%']);
    return $stmt->fetchAll();
}

/**
 * Formatuj datę
 */
function formatDate($date) {
    $timestamp = strtotime($date);
    return date('j F Y', $timestamp);
}

/**
 * Sanitize output
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Upload obrazka
 */
function uploadImage($file) {
    // Sprawdź czy plik został przesłany
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'message' => 'Błąd podczas przesyłania pliku.'];
    }
    
    // Dozwolone typy plików
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    // Sprawdź typ MIME
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        return ['success' => false, 'message' => 'Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, GIF, WebP.'];
    }
    
    // Sprawdź rozszerzenie
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions)) {
        return ['success' => false, 'message' => 'Nieprawidłowe rozszerzenie pliku.'];
    }
    
    // Sprawdź rozmiar (max 5 MB)
    $maxSize = 5 * 1024 * 1024; // 5 MB
    if ($file['size'] > $maxSize) {
        return ['success' => false, 'message' => 'Plik jest za duży. Maksymalny rozmiar: 5 MB.'];
    }
    
    // Wygeneruj unikalną nazwę
    $fileName = uniqid() . '_' . time() . '.' . $extension;
    $uploadDir = __DIR__ . '/../uploads/';
    $uploadPath = $uploadDir . $fileName;
    
    // Sprawdź czy folder uploads istnieje
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Przenieś plik
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        // Zwróć relatywną ścieżkę
        return ['success' => true, 'path' => 'uploads/' . $fileName];
    } else {
        return ['success' => false, 'message' => 'Nie udało się zapisać pliku.'];
    }
}
?>
