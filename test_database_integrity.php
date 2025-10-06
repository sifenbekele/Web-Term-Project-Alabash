<?php
/**
 * Database Integrity Test Script
 * 
 * This script tests the database structure and verifies that all
 * relationships and constraints are working correctly.
 */

require 'php/db.php';

echo "<h2>Rock Vintage Database Integrity Test</h2>";

$tests_passed = 0;
$tests_failed = 0;

function runTest($test_name, $test_function) {
    global $tests_passed, $tests_failed;
    
    echo "<h3>$test_name</h3>";
    try {
        $result = $test_function();
        if ($result) {
            echo "<p style='color: green;'>✓ PASSED</p>";
            $tests_passed++;
        } else {
            echo "<p style='color: red;'>✗ FAILED</p>";
            $tests_failed++;
        }
    } catch (Exception $e) {
        echo "<p style='color: red;'>✗ ERROR: " . $e->getMessage() . "</p>";
        $tests_failed++;
    }
}

// Test 1: Check if all required tables exist
runTest("Table Existence Check", function() use ($conn) {
    $required_tables = ['users', 'products', 'orders', 'order_items', 'cart', 'contact_messages'];
    foreach ($required_tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if (!$result || $result->num_rows === 0) {
            echo "<p style='color: red;'>Missing table: $table</p>";
            return false;
        }
    }
    return true;
});

// Test 2: Check foreign key constraints
runTest("Foreign Key Constraints", function() use ($conn) {
    $result = $conn->query("
        SELECT 
            TABLE_NAME,
            COLUMN_NAME,
            CONSTRAINT_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE REFERENCED_TABLE_SCHEMA = 'rockvintage_db'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    
    $expected_fks = [
        ['orders', 'user_id', 'users', 'id'],
        ['order_items', 'order_id', 'orders', 'id'],
        ['order_items', 'product_id', 'products', 'id'],
        ['cart', 'user_id', 'users', 'id'],
        ['cart', 'product_id', 'products', 'id']
    ];
    
    $found_fks = [];
    while ($row = $result->fetch_assoc()) {
        $found_fks[] = [$row['TABLE_NAME'], $row['COLUMN_NAME'], $row['REFERENCED_TABLE_NAME'], $row['REFERENCED_COLUMN_NAME']];
    }
    
    foreach ($expected_fks as $expected) {
        $found = false;
        foreach ($found_fks as $found_fk) {
            if ($found_fk[0] === $expected[0] && $found_fk[1] === $expected[1] && 
                $found_fk[2] === $expected[2] && $found_fk[3] === $expected[3]) {
                $found = true;
                break;
            }
        }
        if (!$found) {
            echo "<p style='color: red;'>Missing FK: {$expected[0]}.{$expected[1]} → {$expected[2]}.{$expected[3]}</p>";
            return false;
        }
    }
    return true;
});

// Test 3: Check indexes
runTest("Index Check", function() use ($conn) {
    $result = $conn->query("
        SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = 'rockvintage_db'
        AND INDEX_NAME != 'PRIMARY'
        ORDER BY TABLE_NAME, INDEX_NAME
    ");
    
    $indexes = [];
    while ($row = $result->fetch_assoc()) {
        $indexes[] = $row;
    }
    
    $expected_indexes = [
        ['users', 'idx_email'],
        ['users', 'idx_role'],
        ['products', 'idx_category'],
        ['products', 'idx_brand'],
        ['products', 'idx_price'],
        ['orders', 'idx_user_id'],
        ['orders', 'idx_order_number'],
        ['orders', 'idx_status']
    ];
    
    foreach ($expected_indexes as $expected) {
        $found = false;
        foreach ($indexes as $index) {
            if ($index['TABLE_NAME'] === $expected[0] && $index['INDEX_NAME'] === $expected[1]) {
                $found = true;
                break;
            }
        }
        if (!$found) {
            echo "<p style='color: red;'>Missing index: {$expected[0]}.{$expected[1]}</p>";
            return false;
        }
    }
    return true;
});

// Test 4: Test data insertion and relationships
runTest("Data Integrity Test", function() use ($conn) {
    $conn->begin_transaction();
    
    try {
        // Insert test user
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
        $test_email = 'test@example.com';
        $test_password = password_hash('test123', PASSWORD_DEFAULT);
        $stmt->bind_param("ssss", $test_name, $test_email, $test_password, $test_role);
        $test_name = 'Test User';
        $test_role = 'customer';
        $stmt->execute();
        $user_id = $conn->insert_id;
        $stmt->close();
        
        // Insert test product
        $stmt = $conn->prepare("INSERT INTO products (name, price, stock_quantity) VALUES (?, ?, ?)");
        $test_product_name = 'Test Product';
        $test_price = 29.99;
        $test_stock = 10;
        $stmt->bind_param("sdi", $test_product_name, $test_price, $test_stock);
        $stmt->execute();
        $product_id = $conn->insert_id;
        $stmt->close();
        
        // Insert test order
        $stmt = $conn->prepare("INSERT INTO orders (user_id, shipping_address, status) VALUES (?, ?, ?)");
        $test_address = '123 Test St, Test City, TC 12345';
        $test_status = 'pending';
        $stmt->bind_param("iss", $user_id, $test_address, $test_status);
        $stmt->execute();
        $order_id = $conn->insert_id;
        $stmt->close();
        
        // Insert test order item
        $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
        $test_quantity = 2;
        $stmt->bind_param("iiid", $order_id, $product_id, $test_quantity, $test_price);
        $stmt->execute();
        $stmt->close();
        
        // Test cart insertion
        $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $cart_quantity = 1;
        $stmt->bind_param("iii", $user_id, $product_id, $cart_quantity);
        $stmt->execute();
        $stmt->close();
        
        // Verify order total was calculated correctly
        $result = $conn->query("SELECT total_amount FROM orders WHERE id = $order_id");
        $row = $result->fetch_assoc();
        $expected_total = $test_quantity * $test_price;
        if ($row['total_amount'] != $expected_total) {
            throw new Exception("Order total calculation failed. Expected: $expected_total, Got: {$row['total_amount']}");
        }
        
        $conn->rollback(); // Clean up test data
        return true;
        
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
});

// Test 5: Check triggers
runTest("Trigger Check", function() use ($conn) {
    $result = $conn->query("
        SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE
        FROM information_schema.TRIGGERS 
        WHERE TRIGGER_SCHEMA = 'rockvintage_db'
    ");
    
    $triggers = [];
    while ($row = $result->fetch_assoc()) {
        $triggers[] = $row;
    }
    
    $expected_triggers = [
        ['generate_order_number', 'INSERT', 'orders'],
        ['calculate_order_item_total', 'INSERT', 'order_items'],
        ['update_order_total_after_insert', 'INSERT', 'order_items'],
        ['update_order_total_after_update', 'UPDATE', 'order_items'],
        ['update_order_total_after_delete', 'DELETE', 'order_items']
    ];
    
    foreach ($expected_triggers as $expected) {
        $found = false;
        foreach ($triggers as $trigger) {
            if ($trigger['TRIGGER_NAME'] === $expected[0] && 
                $trigger['EVENT_MANIPULATION'] === $expected[1] && 
                $trigger['EVENT_OBJECT_TABLE'] === $expected[2]) {
                $found = true;
                break;
            }
        }
        if (!$found) {
            echo "<p style='color: red;'>Missing trigger: {$expected[0]} on {$expected[2]} {$expected[1]}</p>";
            return false;
        }
    }
    return true;
});

// Test 6: Check views
runTest("View Check", function() use ($conn) {
    $result = $conn->query("
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'rockvintage_db' 
        AND TABLE_TYPE = 'VIEW'
    ");
    
    $views = [];
    while ($row = $result->fetch_assoc()) {
        $views[] = $row['TABLE_NAME'];
    }
    
    $expected_views = ['order_details', 'product_sales_summary'];
    
    foreach ($expected_views as $expected_view) {
        if (!in_array($expected_view, $views)) {
            echo "<p style='color: red;'>Missing view: $expected_view</p>";
            return false;
        }
    }
    return true;
});

// Test 7: Sample data check
runTest("Sample Data Check", function() use ($conn) {
    // Check if admin user exists
    $result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    $row = $result->fetch_assoc();
    if ($row['count'] == 0) {
        echo "<p style='color: red;'>No admin users found</p>";
        return false;
    }
    
    // Check if sample products exist
    $result = $conn->query("SELECT COUNT(*) as count FROM products");
    $row = $result->fetch_assoc();
    if ($row['count'] == 0) {
        echo "<p style='color: red;'>No products found</p>";
        return false;
    }
    
    // Check if sample categories exist
    $result = $conn->query("SELECT COUNT(*) as count FROM categories");
    $row = $result->fetch_assoc();
    if ($row['count'] == 0) {
        echo "<p style='color: red;'>No categories found</p>";
        return false;
    }
    
    return true;
});

echo "<hr>";
echo "<h2>Test Summary</h2>";
echo "<p><strong>Tests Passed:</strong> $tests_passed</p>";
echo "<p><strong>Tests Failed:</strong> $tests_failed</p>";

if ($tests_failed === 0) {
    echo "<p style='color: green; font-weight: bold; font-size: 18px;'>✓ All tests passed! Database integrity is verified.</p>";
} else {
    echo "<p style='color: red; font-weight: bold; font-size: 18px;'>⚠ Some tests failed. Please check the issues above.</p>";
}

$conn->close();
?>

<style>
body {
    font-family: Arial, sans-serif;
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
}
h2, h3 {
    color: #333;
}
hr {
    margin: 20px 0;
    border: none;
    border-top: 1px solid #ddd;
}
</style>
