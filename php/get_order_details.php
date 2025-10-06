<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit();
}

$user_id = $_SESSION['user_id'];
$order_id = $_GET['order_id'] ?? null;

if (!$order_id) {
    echo json_encode(['success' => false, 'message' => 'Order ID is required.']);
    exit();
}

// Check if user has permission to view this order
$stmt = $conn->prepare("SELECT user_id FROM orders WHERE id = ?");
$stmt->bind_param("i", $order_id);
$stmt->execute();
$stmt->bind_result($order_user_id);
if (!$stmt->fetch()) {
    $stmt->close();
    echo json_encode(['success' => false, 'message' => 'Order not found.']);
    exit();
}
$stmt->close();

// Check if user owns the order or is admin
if ($order_user_id != $user_id && (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin')) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. You can only view your own orders.']);
    exit();
}

// Get order details with items
$sql = "SELECT 
    o.id,
    o.order_number,
    o.status,
    o.total_amount,
    o.shipping_address,
    o.billing_address,
    o.shipping_method,
    o.shipping_cost,
    o.tax_amount,
    o.discount_amount,
    o.payment_method,
    o.payment_status,
    o.notes,
    o.created_at,
    o.updated_at,
    u.name as customer_name,
    u.email as customer_email,
    u.phone as customer_phone
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $order_id);
$stmt->execute();
$result = $stmt->get_result();
$order = $result->fetch_assoc();
$stmt->close();

if (!$order) {
    echo json_encode(['success' => false, 'message' => 'Order not found.']);
    exit();
}

// Get order items
$sql = "SELECT 
    oi.id,
    oi.product_id,
    oi.quantity,
    oi.unit_price,
    oi.total_price,
    p.name as product_name,
    p.image as product_image,
    p.description as product_description
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = ?
ORDER BY oi.id ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $order_id);
$stmt->execute();
$result = $stmt->get_result();

$order_items = [];
while ($row = $result->fetch_assoc()) {
    $order_items[] = $row;
}
$stmt->close();

$order['items'] = $order_items;

$conn->close();
echo json_encode(['success' => true, 'order' => $order]);
?>
