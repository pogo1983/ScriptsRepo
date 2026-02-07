<?php
/**
 * API endpoint dla newsletter
 * 
 * Użycie: POST /api/newsletter.php
 */

header('Content-Type: application/json');
require_once '../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Metoda niedozwolona']);
    exit;
}

// Pobierz email z POST
$email = $_POST['email'] ?? '';

// Zapisz subskrypcję
$result = subscribeNewsletter($email);

if ($result['success']) {
    http_response_code(200);
} else {
    http_response_code(400);
}

echo json_encode($result);
?>
