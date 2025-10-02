<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'logged_in' => true,
        'user_id' => $_SESSION['user_id'],
        'email' => $_SESSION['email'] ?? null,
        'role' => $_SESSION['role'] ?? 'customer'
    ]);
} else {
    echo json_encode([
        'logged_in' => false
    ]);
}
?> 