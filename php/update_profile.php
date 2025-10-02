<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit();
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $current_password = $_POST['currentPassword'] ?? '';
    $new_email = trim($_POST['newEmail'] ?? '');
    $new_password = $_POST['newPassword'] ?? '';
    $confirm_password = $_POST['confirmPassword'] ?? '';
    $name = trim($_POST['name'] ?? '');

    // Fetch current user info
    $stmt = $conn->prepare("SELECT email, password FROM users WHERE id=?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($current_email, $hashed_password);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'User not found.']);
        $stmt->close();
        $conn->close();
        exit();
    }
    $stmt->close();

    // Check current password
    if (!password_verify($current_password, $hashed_password)) {
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
        $conn->close();
        exit();
    }

    // Validate new email if provided
    if ($new_email && $new_email !== $current_email) {
        $stmt = $conn->prepare("SELECT id FROM users WHERE email=? AND id<>?");
        $stmt->bind_param("si", $new_email, $user_id);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'Email already in use.']);
            $stmt->close();
            $conn->close();
            exit();
        }
        $stmt->close();
    }

    // Validate new password if provided
    if ($new_password || $confirm_password) {
        if ($new_password !== $confirm_password) {
            echo json_encode(['success' => false, 'message' => 'New passwords do not match.']);
            $conn->close();
            exit();
        }
        if (strlen($new_password) < 6) {
            echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters.']);
            $conn->close();
            exit();
        }
    }

    // Update user info
    $fields = [];
    $params = [];
    $types = '';
    if ($new_email && $new_email !== $current_email) {
        $fields[] = 'email=?';
        $params[] = $new_email;
        $types .= 's';
    }
    if ($new_password) {
        $fields[] = 'password=?';
        $params[] = password_hash($new_password, PASSWORD_DEFAULT);
        $types .= 's';
    }
    if ($name) {
        $fields[] = 'name=?';
        $params[] = $name;
        $types .= 's';
    }
    if (count($fields) > 0) {
        $params[] = $user_id;
        $types .= 'i';
        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id=?';
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Profile updated successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update profile.']);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'No changes to update.']);
    }
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?> 