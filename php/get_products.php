<?php
header('Content-Type: application/json');
require 'db.php';

// Get optional filters
$category = $_GET['category'] ?? '';
$brand = $_GET['brand'] ?? '';
$min_price = $_GET['min_price'] ?? '';
$max_price = $_GET['max_price'] ?? '';
$featured = $_GET['featured'] ?? '';
$search = $_GET['search'] ?? '';

// Build the query with filters
$sql = "SELECT id, name, description, price, image, category, brand, size, color, material, stock_quantity, sku, is_featured, created_at FROM products WHERE is_active = 1";
$params = [];
$types = '';

if (!empty($category)) {
    $sql .= " AND category = ?";
    $params[] = $category;
    $types .= 's';
}

if (!empty($brand)) {
    $sql .= " AND brand = ?";
    $params[] = $brand;
    $types .= 's';
}

if (!empty($min_price) && is_numeric($min_price)) {
    $sql .= " AND price >= ?";
    $params[] = $min_price;
    $types .= 'd';
}

if (!empty($max_price) && is_numeric($max_price)) {
    $sql .= " AND price <= ?";
    $params[] = $max_price;
    $types .= 'd';
}

if ($featured === '1' || $featured === 'true') {
    $sql .= " AND is_featured = 1";
}

if (!empty($search)) {
    $sql .= " AND (name LIKE ? OR description LIKE ? OR brand LIKE ?)";
    $search_term = "%$search%";
    $params[] = $search_term;
    $params[] = $search_term;
    $params[] = $search_term;
    $types .= 'sss';
}

$sql .= " ORDER BY is_featured DESC, created_at DESC";

$stmt = $conn->prepare($sql);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$products = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

$stmt->close();
$conn->close();
echo json_encode(['success' => true, 'products' => $products]);
?> 