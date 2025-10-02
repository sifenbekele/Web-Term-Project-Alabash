<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

// Only allow admins to add products
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = $_POST['price'] ?? '';
    $image = trim($_POST['image'] ?? ''); // Expecting image filename or path

    if (!$name || !$price) {
        echo json_encode(['success' => false, 'message' => 'Product name and price are required.']);
        exit();
    }

    $stmt = $conn->prepare("INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssds", $name, $description, $price, $image);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product added successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add product.']);
    }
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?> 