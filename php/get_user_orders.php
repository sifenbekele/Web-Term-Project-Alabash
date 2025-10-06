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
$sql = "SELECT 
    o.id, 
    o.order_number,
    o.status, 
    o.total_amount,
    o.payment_status,
    o.created_at,
    oi.product_id,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    p.name as product_name,
    p.image as product_image
FROM orders o 
JOIN order_items oi ON o.id = oi.order_id 
JOIN products p ON oi.product_id = p.id 
WHERE o.user_id = ? 
ORDER BY o.created_at DESC, oi.id ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
$current_order = null;

while ($row = $result->fetch_assoc()) {
    // If this is a new order, create the order structure
    if ($current_order === null || $current_order['id'] != $row['id']) {
        if ($current_order !== null) {
            $orders[] = $current_order;
        }
        
        $current_order = [
            'id' => $row['id'],
            'order_number' => $row['order_number'],
            'status' => $row['status'],
            'total_amount' => $row['total_amount'],
            'payment_status' => $row['payment_status'],
            'created_at' => $row['created_at'],
            'items' => []
        ];
    }
    
    // Add the item to the current order
    $current_order['items'][] = [
        'product_id' => $row['product_id'],
        'product_name' => $row['product_name'],
        'product_image' => $row['product_image'],
        'quantity' => $row['quantity'],
        'unit_price' => $row['unit_price'],
        'total_price' => $row['total_price']
    ];
}

// Add the last order if it exists
if ($current_order !== null) {
    $orders[] = $current_order;
}

$stmt->close();
$conn->close();
echo json_encode(['success' => true, 'orders' => $orders]);
?> 