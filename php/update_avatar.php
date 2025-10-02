<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit();
}

$user_id = $_SESSION['user_id'];
$avatar = trim($_POST['avatar'] ?? '');
if (!$avatar) {
    echo json_encode(['success' => false, 'message' => 'No avatar path provided.']);
    exit();
}

$stmt = $conn->prepare("UPDATE users SET avatar=? WHERE id=?");
$stmt->bind_param("si", $avatar, $user_id);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Avatar updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update avatar.']);
}
$stmt->close();
$conn->close();
?> 