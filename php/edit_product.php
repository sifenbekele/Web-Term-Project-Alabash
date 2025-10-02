<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

// Only allow admins to edit products
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $price = $_POST['price'] ?? '';
    $image = trim($_POST['image'] ?? '');

    if (!$id || !$name || !$price) {
        echo json_encode(['success' => false, 'message' => 'Product ID, name, and price are required.']);
        exit();
    }

    $stmt = $conn->prepare("UPDATE products SET name=?, description=?, price=?, image=? WHERE id=?");
    $stmt->bind_param("ssdsi", $name, $description, $price, $image, $id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Product updated successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update product.']);
    }
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?> 