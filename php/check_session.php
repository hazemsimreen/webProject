<?php
require_once 'config.php';

header('Content-Type: application/json');

if (isset($_SESSION['id']) && isset($_SESSION['username'])) {
    echo json_encode([
        'loggedIn' => true,
        'id' => $_SESSION['id'],
        'username' => $_SESSION['username'],
        'email' => $_SESSION['email'] ?? '',
        'role' => $_SESSION['role'] ?? 'customer'
    ]);
} else {
    echo json_encode([
        'loggedIn' => false
    ]);
}
?>
