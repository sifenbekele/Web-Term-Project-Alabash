<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

// Only allow admins to update orders
if (!isset($_SESSION['user_id']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Admins only.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $order_id = $_POST['order_id'] ?? '';
    $status = $_POST['status'] ?? '';
    $allowed_statuses = ['ordered', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!$order_id || !$status || !in_array($status, $allowed_statuses)) {
        echo json_encode(['success' => false, 'message' => 'Order ID and valid status are required.']);
        exit();
    }

    $stmt = $conn->prepare("UPDATE orders SET status=? WHERE id=?");
    $stmt->bind_param("si", $status, $order_id);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Order status updated successfully.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update order status.']);
    }
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?> 