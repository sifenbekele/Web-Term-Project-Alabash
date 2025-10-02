<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

// Only allow logged-in users
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit();
}

$user_id = $_SESSION['user_id'];
$sql = "SELECT o.id, o.created_at, o.quantity, o.status, p.price FROM orders o JOIN products p ON o.product_id = p.id WHERE o.user_id = ? ORDER BY o.created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($id, $created_at, $quantity, $status, $price);
$orders = [];
while ($stmt->fetch()) {
    $orders[] = [
        'id' => $id,
        'created_at' => $created_at,
        'quantity' => $quantity,
        'status' => $status,
        'price' => $price
    ];
}
$stmt->close();
$conn->close();
echo json_encode(['success' => true, 'orders' => $orders]);
?> 