<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

// Only allow admins to view orders
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
    exit();
}

$sql = "SELECT 
    o.id, 
    o.order_number,
    o.user_id, 
    o.status, 
    o.total_amount,
    o.payment_status,
    o.created_at,
    u.name as customer_name,
    u.email as customer_email,
    COUNT(oi.id) as item_count
FROM orders o 
JOIN users u ON o.user_id = u.id 
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.user_id, o.status, o.total_amount, o.payment_status, o.created_at, u.name, u.email
ORDER BY o.created_at DESC";

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