<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

// Only allow logged-in users to create orders
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Accept cart as JSON in POST body or as form field
    $cart = [];
    $shipping_address = '';
    $billing_address = '';
    
    if (isset($_POST['cart'])) {
        $cart = json_decode($_POST['cart'], true);
        $shipping_address = $_POST['shipping_address'] ?? '';
        $billing_address = $_POST['billing_address'] ?? '';
    } else {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        if (isset($data['cart'])) {
            $cart = $data['cart'];
            $shipping_address = $data['shipping_address'] ?? '';
            $billing_address = $data['billing_address'] ?? '';
        }
    }

    if (!$cart || !is_array($cart) || count($cart) === 0) {
        echo json_encode(['success' => false, 'message' => 'Cart is empty or invalid.']);
        exit();
    }

    if (empty($shipping_address)) {
        echo json_encode(['success' => false, 'message' => 'Shipping address is required.']);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    
    try {
        $conn->begin_transaction();
        
        // Create the main order
        $stmt = $conn->prepare("INSERT INTO orders (user_id, shipping_address, billing_address, status) VALUES (?, ?, ?, 'pending')");
        $stmt->bind_param("iss", $user_id, $shipping_address, $billing_address);
        if (!$stmt->execute()) {
            throw new Exception('Failed to create order');
        }
        $order_id = $conn->insert_id;
        $stmt->close();
        
        // Get the generated order number
        $stmt = $conn->prepare("SELECT order_number FROM orders WHERE id = ?");
        $stmt->bind_param("i", $order_id);
        $stmt->execute();
        $stmt->bind_result($order_number);
        $stmt->fetch();
        $stmt->close();
        
        $total_amount = 0;
        
        // Add order items
        foreach ($cart as $item) {
            $product_id = $item['product_id'] ?? null;
            $quantity = $item['quantity'] ?? 1;
            
            if (!$product_id || $quantity < 1) {
                throw new Exception('Invalid product or quantity');
            }
            
            // Get product price
            $stmt = $conn->prepare("SELECT price FROM products WHERE id = ?");
            $stmt->bind_param("i", $product_id);
            $stmt->execute();
            $stmt->bind_result($unit_price);
            if (!$stmt->fetch()) {
                $stmt->close();
                throw new Exception('Product not found');
            }
            $stmt->close();
            
            // Insert order item with computed total_price to match schema
            $item_total = $quantity * $unit_price;
            $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("iiidd", $order_id, $product_id, $quantity, $unit_price, $item_total);
            if (!$stmt->execute()) {
                $stmt->close();
                throw new Exception('Failed to add product to order');
            }
            $stmt->close();
            
            $total_amount += ($quantity * $unit_price);
        }
        
        // Update order total
        $stmt = $conn->prepare("UPDATE orders SET total_amount = ? WHERE id = ?");
        $stmt->bind_param("di", $total_amount, $order_id);
        $stmt->execute();
        $stmt->close();
        
        // Clear user's cart
        $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->close();
        
        $conn->commit();
        
        echo json_encode([
            'success' => true, 
            'message' => 'Order placed successfully.',
            'order_id' => $order_id,
            'order_number' => $order_number,
            'total_amount' => $total_amount
        ]);
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Order failed: ' . $e->getMessage()]);
    }
    
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?> 