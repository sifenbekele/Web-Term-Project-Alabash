<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

function respond($success, $message) {
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!$email || !$password) {
        respond(false, 'Email and password are required.');
    }

    $stmt = $conn->prepare("SELECT id, password, role FROM users WHERE email = ?");
    if (!$stmt) {
        respond(false, 'Database error: prepare failed.');
    }
    $stmt->bind_param("s", $email);
    if (!$stmt->execute()) {
        respond(false, 'Database error: execute failed.');
    }
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($user_id, $hashed_password, $user_role);
        $stmt->fetch();
        if (password_verify($password, $hashed_password)) {
            // Regenerate session ID to prevent fixation
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user_id;
            $_SESSION['email'] = $email;
            $_SESSION['role'] = $user_role;
            respond(true, 'Login successful!');
        } else {
            respond(false, 'Invalid credentials.');
        }
    } else {
        respond(false, 'Invalid credentials.');
    }
    $stmt->close();
    $conn->close();
} else {
    respond(false, 'Invalid request.');
}
?> 