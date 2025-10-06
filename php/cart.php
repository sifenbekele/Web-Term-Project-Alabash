<?php
header('Content-Type: application/json');
session_start();
require 'db.php';

// Only allow logged-in users to manage cart
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in.']);
    exit();
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user's cart items
    $sql = "SELECT c.id, c.product_id, c.quantity, c.created_at, p.name, p.price, p.image, p.stock_quantity 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = ? 
            ORDER BY c.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $cart_items = [];
    while ($row = $result->fetch_assoc()) {
        $cart_items[] = $row;
    }
    
    $stmt->close();
    $conn->close();
    echo json_encode(['success' => true, 'cart_items' => $cart_items]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $product_id = $_POST['product_id'] ?? null;
    $quantity = $_POST['quantity'] ?? 1;
    
    if (!$product_id) {
        echo json_encode(['success' => false, 'message' => 'Product ID is required.']);
        exit();
    }
    
    try {
        $conn->begin_transaction();
        
        switch ($action) {
            case 'add':
                // Check if product exists and is in stock
                $stmt = $conn->prepare("SELECT stock_quantity FROM products WHERE id = ? AND is_active = 1");
                $stmt->bind_param("i", $product_id);
                $stmt->execute();
                $stmt->bind_result($stock_quantity);
                if (!$stmt->fetch()) {
                    $stmt->close();
                    throw new Exception('Product not found or not available');
                }
                $stmt->close();
                
                if ($stock_quantity < $quantity) {
                    throw new Exception('Insufficient stock');
                }
                
                // Check if item already exists in cart
                $stmt = $conn->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
                $stmt->bind_param("ii", $user_id, $product_id);
                $stmt->execute();
                $stmt->bind_result($cart_id, $existing_quantity);
                
                if ($stmt->fetch()) {
                    // Update existing cart item
                    $new_quantity = $existing_quantity + $quantity;
                    if ($new_quantity > $stock_quantity) {
                        $stmt->close();
                        throw new Exception('Insufficient stock for requested quantity');
                    }
                    
                    $stmt->close();
                    $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
                    $stmt->bind_param("ii", $new_quantity, $cart_id);
                    $stmt->execute();
                    $stmt->close();
                } else {
                    // Add new cart item
                    $stmt->close();
                    $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
                    $stmt->bind_param("iii", $user_id, $product_id, $quantity);
                    $stmt->execute();
                    $stmt->close();
                }
                
                echo json_encode(['success' => true, 'message' => 'Item added to cart successfully.']);
                break;
                
            case 'update':
                if ($quantity <= 0) {
                    throw new Exception('Quantity must be greater than 0');
                }
                
                // Check stock availability
                $stmt = $conn->prepare("SELECT stock_quantity FROM products WHERE id = ? AND is_active = 1");
                $stmt->bind_param("i", $product_id);
                $stmt->execute();
                $stmt->bind_result($stock_quantity);
                if (!$stmt->fetch()) {
                    $stmt->close();
                    throw new Exception('Product not found or not available');
                }
                $stmt->close();
                
                if ($stock_quantity < $quantity) {
                    throw new Exception('Insufficient stock');
                }
                
                $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
                $stmt->bind_param("iii", $quantity, $user_id, $product_id);
                $stmt->execute();
                $stmt->close();
                
                echo json_encode(['success' => true, 'message' => 'Cart updated successfully.']);
                break;
                
            case 'remove':
                $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
                $stmt->bind_param("ii", $user_id, $product_id);
                $stmt->execute();
                $stmt->close();
                
                echo json_encode(['success' => true, 'message' => 'Item removed from cart successfully.']);
                break;
                
            case 'clear':
                $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
                $stmt->bind_param("i", $user_id);
                $stmt->execute();
                $stmt->close();
                
                echo json_encode(['success' => true, 'message' => 'Cart cleared successfully.']);
                break;
                
            default:
                throw new Exception('Invalid action');
        }
        
        $conn->commit();
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
}
?>
