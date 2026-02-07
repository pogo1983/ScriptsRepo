<?php
/**
 * API endpoint dla komentarzy
 * 
 * Użycie: POST /api/comments.php
 */

header('Content-Type: application/json');
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metoda niedozwolona']);
    exit;
}

// Pobierz dane z POST
$post_id = $_POST['post_id'] ?? null;
$author_name = $_POST['author_name'] ?? '';
$author_email = $_POST['author_email'] ?? '';
$content = $_POST['content'] ?? '';
$parent_id = $_POST['parent_id'] ?? null;

// Walidacja
if (!$post_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Brak ID posta']);
    exit;
}

// Dodaj komentarz
$result = addComment($post_id, $author_name, $author_email, $content, $parent_id);

if ($result['success']) {
    http_response_code(201);
} else {
    http_response_code(400);
}

echo json_encode($result);
?>
