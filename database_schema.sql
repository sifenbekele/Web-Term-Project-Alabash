
CREATE DATABASE IF NOT EXISTS rockvintage_db;
USE rockvintage_db;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer','admin') DEFAULT 'customer',
    avatar VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    city VARCHAR(50) DEFAULT NULL,
    state VARCHAR(50) DEFAULT NULL,
    zip_code VARCHAR(10) DEFAULT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 2. PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT NULL,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255) DEFAULT NULL,
    category VARCHAR(100) DEFAULT 'General',
    brand VARCHAR(100) DEFAULT NULL,
    size VARCHAR(20) DEFAULT NULL,
    color VARCHAR(50) DEFAULT NULL,
    material VARCHAR(100) DEFAULT NULL,
    stock_quantity INT DEFAULT 0,
    sku VARCHAR(100) UNIQUE DEFAULT NULL,
    weight DECIMAL(8,2) DEFAULT NULL,
    dimensions VARCHAR(100) DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE DEFAULT NULL,
    status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping_address TEXT NOT NULL,
    billing_address TEXT DEFAULT NULL,
    shipping_method VARCHAR(100) DEFAULT 'Standard',
    shipping_cost DECIMAL(8,2) DEFAULT 0.00,
    tax_amount DECIMAL(8,2) DEFAULT 0.00,
    discount_amount DECIMAL(8,2) DEFAULT 0.00,
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
    notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- 4. ORDER_ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- =====================================================
-- 5. CART TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- =====================================================
-- 6. CONTACT_MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) DEFAULT NULL,
    message TEXT NOT NULL,
    status ENUM('new','read','replied','closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. PRODUCT_REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL,
    title VARCHAR(200) DEFAULT NULL,
    review_text TEXT DEFAULT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product_review (user_id, product_id)
);

-- =====================================================
-- 8. CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    parent_id INT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- =====================================================
-- 9. ORDER_DETAILS VIEW
-- =====================================================
CREATE OR REPLACE VIEW order_details AS
SELECT 
  o.id AS order_id,
  o.order_number,
  o.user_id,
  u.email AS customer_email,
  o.total_amount,
  o.created_at AS order_date,
  oi.product_id,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price,
  oi.total_price
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
JOIN users u ON o.user_id = u.id;

-- =====================================================
-- 10. TRIGGER: generate_order_number
-- =====================================================
DELIMITER //
CREATE TRIGGER generate_order_number
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        SET NEW.order_number = CONCAT('ORD', DATE_FORMAT(NOW(), '%y%m%d%H%i%s'));
    END IF;
END//
DELIMITER ;

-- =====================================================
-- 11. SAMPLE DATA
-- =====================================================
INSERT INTO users (name,email,password,role) VALUES
('Admin User','admin@rockvintage.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO categories (name,description,is_active,sort_order) VALUES
('T-Shirts','Vintage and band t-shirts',TRUE,1),
('Jeans','Classic denim jeans',TRUE,2),
('Jackets','Leather and denim jackets',TRUE,3),
('Accessories','Belts, watches, and other accessories',TRUE,4),
('Shoes','Boots and footwear',TRUE,5)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO products (name,description,price,image,category,brand,stock_quantity,is_featured) VALUES
('AC/DC Vintage T-Shirt','Classic AC/DC band t-shirt in vintage style',29.99,'acdc.jpg','T-Shirts','AC/DC',50,TRUE),
('Classic Denim Jeans','High-quality denim jeans with vintage wash',79.99,'Classic Denim Jeans.jpg','Jeans','Levi\'s',30,TRUE),
('Leather Jacket','Premium leather jacket with vintage styling',199.99,'leatherjacket.png','Jackets','Vintage',15,TRUE),
('Studded Belt','Metal studded belt for rock style',24.99,'studded_belt.jpeg','Accessories','Rock Style',25,FALSE),
('Leather Boots','Classic leather ankle boots',149.99,'Leather Ankle Boots.jpg','Shoes','Vintage',20,TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);
