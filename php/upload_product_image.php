<?php
header('Content-Type: application/json');

$targetDir = '../assets/'; // Or use '../uploads/' if you want a separate folder
if (!isset($_FILES['image'])) {
    echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
    exit();
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Invalid file type.']);
    exit();
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('product_', true) . '.' . $ext;
$targetFile = $targetDir . $filename;

if (move_uploaded_file($file['tmp_name'], $targetFile)) {
    // Return the relative path to use in the DB
    echo json_encode(['success' => true, 'path' => 'assets/' . $filename]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to upload image.']);
}
?> 