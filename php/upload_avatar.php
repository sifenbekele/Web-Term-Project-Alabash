<?php
header('Content-Type: application/json');
session_start();

$targetDir = '../assets/'; // Or use '../uploads/' if you want a separate folder
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit();
}
if (!isset($_FILES['avatar'])) {
    echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
    exit();
}

$file = $_FILES['avatar'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type.']);
    exit();
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('avatar_', true) . '.' . $ext;
$targetFile = $targetDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetFile)) {
    // Optionally, update the user's avatar in the DB (if you add an avatar column)
    // For now, just return the path
    echo json_encode(['success' => true, 'path' => 'assets/' . $filename]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to upload avatar.']);
}
?> 