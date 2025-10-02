<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit();
}

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT name, email, role, avatar FROM users WHERE id=?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($name, $email, $role, $avatar);
if ($stmt->fetch()) {
    echo json_encode(['success' => true, 'name' => $name, 'email' => $email, 'role' => $role, 'avatar' => $avatar]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found.']);
}
$stmt->close();
$conn->close();
?> 