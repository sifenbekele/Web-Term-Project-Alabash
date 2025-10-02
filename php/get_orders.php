<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

// Only allow admins to view orders
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
    exit();
}

$sql = "SELECT o.id, o.user_id, o.product_id, o.quantity, o.status, o.created_at, p.price FROM orders o JOIN products p ON o.product_id = p.id ORDER BY o.created_at DESC";
$result = $conn->query($sql);
$orders = [];
if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
}
$conn->close();
echo json_encode(['success' => true, 'orders' => $orders]);
?> 