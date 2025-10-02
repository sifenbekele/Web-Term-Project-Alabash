<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit();
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'] ?? 'customer';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $order_id = $_POST['order_id'] ?? '';
    if (!$order_id) {
        echo json_encode(['success' => false, 'message' => 'Order ID is required.']);
        exit();
    }

    if ($role === 'admin') {
        // Admin can delete any order
        $stmt = $conn->prepare("DELETE FROM orders WHERE id=?");
        $stmt->bind_param("i", $order_id);
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Order deleted successfully.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to delete order.']);
        }
        $stmt->close();
    } else {
        // Customer can only cancel their own order if not shipped/delivered
        $stmt = $conn->prepare("SELECT status FROM orders WHERE id=? AND user_id=?");
        $stmt->bind_param("ii", $order_id, $user_id);
        $stmt->execute();
        $stmt->bind_result($status);
        if ($stmt->fetch()) {
            if (in_array($status, ['shipped', 'delivered'])) {
                echo json_encode(['success' => false, 'message' => 'Cannot cancel shipped or delivered orders.']);
            } else {
                $stmt->close();
                $stmt2 = $conn->prepare("UPDATE orders SET status='cancelled' WHERE id=? AND user_id=?");
                $stmt2->bind_param("ii", $order_id, $user_id);
                if ($stmt2->execute()) {
                    echo json_encode(['success' => true, 'message' => 'Order cancelled successfully.']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Failed to cancel order.']);
                }
                $stmt2->close();
                $conn->close();
                exit();
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Order not found or not yours.']);
        }
        $stmt->close();
    }
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?> 