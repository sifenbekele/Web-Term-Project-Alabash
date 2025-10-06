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
    $image = trim($_POST['image'] ?? '');
    $category = trim($_POST['category'] ?? 'General');
    $brand = trim($_POST['brand'] ?? '');
    $size = trim($_POST['size'] ?? '');
    $color = trim($_POST['color'] ?? '');
    $material = trim($_POST['material'] ?? '');
    $stock_quantity = $_POST['stock_quantity'] ?? 0;
    $sku = trim($_POST['sku'] ?? '');
    $weight = isset($_POST['weight']) && $_POST['weight'] !== '' ? (float)$_POST['weight'] : null;
    $dimensions = trim($_POST['dimensions'] ?? '');
    $is_featured = isset($_POST['is_featured']) ? 1 : 0;

    if (!$name || !$price) {
        echo json_encode(['success' => false, 'message' => 'Product name and price are required.']);
        exit();
    }

    if (!is_numeric($price) || $price < 0) {
        echo json_encode(['success' => false, 'message' => 'Price must be a valid positive number.']);
        exit();
    }

    if (!is_numeric($stock_quantity) || $stock_quantity < 0) {
        echo json_encode(['success' => false, 'message' => 'Stock quantity must be a valid non-negative number.']);
        exit();
    }

    // Check if SKU already exists (if provided)
    if (!empty($sku)) {
        $stmt = $conn->prepare("SELECT id FROM products WHERE sku = ?");
        $stmt->bind_param("s", $sku);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            echo json_encode(['success' => false, 'message' => 'SKU already exists.']);
            $stmt->close();
            exit();
        }
        $stmt->close();
    }

    $stmt = $conn->prepare("INSERT INTO products (name, description, price, image, category, brand, size, color, material, stock_quantity, sku, weight, dimensions, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    // weight is DECIMAL; bind as double (d). Types: ssd sssss ss i s d s i
    $stmt->bind_param("ssdssssssisdsi", $name, $description, $price, $image, $category, $brand, $size, $color, $material, $stock_quantity, $sku, $weight, $dimensions, $is_featured);
    
    if ($stmt->execute()) {
        $product_id = $conn->insert_id;
        echo json_encode(['success' => true, 'message' => 'Product added successfully.', 'product_id' => $product_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add product.']);
    }
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?> 