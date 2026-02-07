<?php
/**
 * API endpoint dla formularza kontaktowego
 * 
 * Użycie: POST /api/contact.php
 */

header('Content-Type: application/json');
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metoda niedozwolona']);
    exit;
}

// Pobierz dane z POST
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$subject = $_POST['subject'] ?? '';
$message = $_POST['message'] ?? '';

// Wyślij wiadomość
$result = sendContactMessage($name, $email, $subject, $message);

if ($result['success']) {
    http_response_code(200);
} else {
    http_response_code(400);
}

echo json_encode($result);
?>
