<?php
header('Content-Type: application/json');
require 'db.php';

$sql = "SELECT id, name, description, price, image, created_at FROM products ORDER BY created_at DESC";
$result = $conn->query($sql);

$products = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

$conn->close();
echo json_encode(['success' => true, 'products' => $products]);
?> 