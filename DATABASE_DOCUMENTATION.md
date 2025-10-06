# Rock Vintage E-Commerce Platform - Database Documentation

## Overview
This document describes the comprehensive database structure implemented for the Rock Vintage E-Commerce platform. The database includes proper relationships, constraints, and data integrity features for products, customers, profiles, and orders.

## Database Schema

### 1. Users Table (`users`)
Stores customer and admin user information with enhanced profile fields.

**Fields:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(100), NOT NULL)
- `email` (VARCHAR(150), UNIQUE, NOT NULL)
- `password` (VARCHAR(255), NOT NULL) - Hashed passwords
- `role` (ENUM: 'customer', 'admin', DEFAULT: 'customer')
- `avatar` (VARCHAR(255)) - Profile picture path
- `phone` (VARCHAR(20)) - Contact number
- `address` (TEXT) - Street address
- `city` (VARCHAR(50))
- `state` (VARCHAR(50))
- `zip_code` (VARCHAR(10))
- `country` (VARCHAR(50), DEFAULT: 'USA')
- `created_at` (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, AUTO UPDATE)
- `is_active` (BOOLEAN, DEFAULT: TRUE)

**Indexes:**
- `idx_email` on email
- `idx_role` on role
- `idx_created_at` on created_at

### 2. Products Table (`products`)
Enhanced product catalog with detailed information and inventory tracking.

**Fields:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(200), NOT NULL)
- `description` (TEXT)
- `price` (DECIMAL(10,2), NOT NULL, CHECK: >= 0)
- `image` (VARCHAR(255)) - Product image path
- `category` (VARCHAR(100), DEFAULT: 'General')
- `brand` (VARCHAR(100))
- `size` (VARCHAR(20))
- `color` (VARCHAR(50))
- `material` (VARCHAR(100))
- `stock_quantity` (INT, DEFAULT: 0, CHECK: >= 0)
- `sku` (VARCHAR(100), UNIQUE) - Stock Keeping Unit
- `weight` (DECIMAL(8,2)) - Product weight
- `dimensions` (VARCHAR(100)) - Product dimensions
- `is_featured` (BOOLEAN, DEFAULT: FALSE)
- `is_active` (BOOLEAN, DEFAULT: TRUE)
- `created_at` (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, AUTO UPDATE)

**Indexes:**
- `idx_category` on category
- `idx_brand` on brand
- `idx_price` on price
- `idx_stock` on stock_quantity
- `idx_featured` on is_featured
- `idx_active` on is_active
- `idx_created_at` on created_at

### 3. Orders Table (`orders`)
Main order information with comprehensive tracking.

**Fields:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, NOT NULL, FOREIGN KEY → users.id)
- `order_number` (VARCHAR(50), UNIQUE, NOT NULL) - Auto-generated
- `status` (ENUM: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', DEFAULT: 'pending')
- `total_amount` (DECIMAL(10,2), NOT NULL, DEFAULT: 0.00)
- `shipping_address` (TEXT, NOT NULL)
- `billing_address` (TEXT)
- `shipping_method` (VARCHAR(100), DEFAULT: 'Standard')
- `shipping_cost` (DECIMAL(8,2), DEFAULT: 0.00)
- `tax_amount` (DECIMAL(8,2), DEFAULT: 0.00)
- `discount_amount` (DECIMAL(8,2), DEFAULT: 0.00)
- `payment_method` (VARCHAR(50), DEFAULT: 'Credit Card')
- `payment_status` (ENUM: 'pending', 'paid', 'failed', 'refunded', DEFAULT: 'pending')
- `notes` (TEXT)
- `created_at` (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, AUTO UPDATE)

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_user_id` on user_id
- `idx_order_number` on order_number
- `idx_status` on status
- `idx_payment_status` on payment_status
- `idx_created_at` on created_at

### 4. Order Items Table (`order_items`)
Individual items within each order.

**Fields:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `order_id` (INT, NOT NULL, FOREIGN KEY → orders.id)
- `product_id` (INT, NOT NULL, FOREIGN KEY → products.id)
- `quantity` (INT, NOT NULL, CHECK: > 0)
- `unit_price` (DECIMAL(10,2), NOT NULL, CHECK: >= 0)
- `total_price` (DECIMAL(10,2), NOT NULL, CHECK: >= 0) - Auto-calculated
- `created_at` (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)

**Foreign Keys:**
- `order_id` → `orders.id` (ON DELETE CASCADE)
- `product_id` → `products.id` (ON DELETE RESTRICT)

**Indexes:**
- `idx_order_id` on order_id
- `idx_product_id` on product_id

### 5. Cart Table (`cart`)
Shopping cart functionality with persistent storage.

**Fields:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `user_id` (INT, NOT NULL, FOREIGN KEY → users.id)
- `product_id` (INT, NOT NULL, FOREIGN KEY → products.id)
- `quantity` (INT, NOT NULL, CHECK: > 0)
- `created_at` (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, AUTO UPDATE)

**Constraints:**
- UNIQUE KEY `unique_user_product` (user_id, product_id) - Prevents duplicate cart items

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `product_id` → `products.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_user_id` on user_id
- `idx_product_id` on product_id

### 6. Contact Messages Table (`contact_messages`)
Contact form submissions.

**Fields:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(100), NOT NULL)
- `email` (VARCHAR(150), NOT NULL)
- `subject` (VARCHAR(200))
- `message` (TEXT, NOT NULL)
- `status` (ENUM: 'new', 'read', 'replied', 'closed', DEFAULT: 'new')
- `created_at` (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, AUTO UPDATE)

**Indexes:**
- `idx_email` on email
- `idx_status` on status
- `idx_created_at` on created_at

### 7. Product Reviews Table (`product_reviews`)
Customer product reviews and ratings.

**Fields:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `product_id` (INT, NOT NULL, FOREIGN KEY → products.id)
- `user_id` (INT, NOT NULL, FOREIGN KEY → users.id)
- `rating` (INT, NOT NULL, CHECK: 1-5)
- `title` (VARCHAR(200))
- `review_text` (TEXT)
- `is_approved` (BOOLEAN, DEFAULT: FALSE)
- `created_at` (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, AUTO UPDATE)

**Constraints:**
- UNIQUE KEY `unique_user_product_review` (user_id, product_id) - One review per user per product

**Foreign Keys:**
- `product_id` → `products.id` (ON DELETE CASCADE)
- `user_id` → `users.id` (ON DELETE CASCADE)

**Indexes:**
- `idx_product_id` on product_id
- `idx_user_id` on user_id
- `idx_rating` on rating
- `idx_approved` on is_approved

### 8. Categories Table (`categories`)
Product categories with hierarchical support.

**Fields:**
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(100), NOT NULL, UNIQUE)
- `description` (TEXT)
- `parent_id` (INT, FOREIGN KEY → categories.id) - For subcategories
- `is_active` (BOOLEAN, DEFAULT: TRUE)
- `sort_order` (INT, DEFAULT: 0)
- `created_at` (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, AUTO UPDATE)

**Foreign Keys:**
- `parent_id` → `categories.id` (ON DELETE SET NULL)

**Indexes:**
- `idx_parent_id` on parent_id
- `idx_active` on is_active
- `idx_sort_order` on sort_order

## Database Triggers

### 1. Order Number Generation
Automatically generates unique order numbers in format: `ORD-YYYYMMDD-XXXXXX`

### 2. Order Item Total Calculation
Automatically calculates `total_price` as `quantity * unit_price`

### 3. Order Total Updates
Automatically updates order `total_amount` when items are added, updated, or deleted

## Views

### 1. Order Details View (`order_details`)
Combines order, user, and product information for comprehensive order reporting.

### 2. Product Sales Summary View (`product_sales_summary`)
Provides sales analytics including total sold, revenue, and remaining stock.

## Stored Procedures

### 1. CreateCompleteOrder
Creates a complete order with items and clears the user's cart in a single transaction.

## Setup Instructions

### 1. Database Setup
1. Run the `setup_database.php` script in your web browser
2. Or manually execute the `database_schema.sql` file in MySQL
3. Update `php/db.php` with your database credentials

### 2. Default Admin Account
- **Email:** admin@rockvintage.com
- **Password:** admin123
- **Role:** admin

### 3. Sample Data
The schema includes sample products and categories for testing.

## API Endpoints

### New/Enhanced Endpoints

#### Cart Management (`php/cart.php`)
- `GET` - Retrieve user's cart items
- `POST` with `action=add` - Add item to cart
- `POST` with `action=update` - Update cart item quantity
- `POST` with `action=remove` - Remove item from cart
- `POST` with `action=clear` - Clear entire cart

#### Order Details (`php/get_order_details.php`)
- `GET` with `order_id` parameter - Get detailed order information

#### Enhanced Product Filtering (`php/get_products.php`)
- `GET` with optional parameters:
  - `category` - Filter by category
  - `brand` - Filter by brand
  - `min_price` - Minimum price filter
  - `max_price` - Maximum price filter
  - `featured` - Show only featured products
  - `search` - Search in name, description, brand

## Data Integrity Features

1. **Foreign Key Constraints** - Maintain referential integrity
2. **Check Constraints** - Validate data ranges and formats
3. **Unique Constraints** - Prevent duplicate data
4. **Triggers** - Automatically maintain calculated fields
5. **Transactions** - Ensure data consistency during complex operations
6. **Indexes** - Optimize query performance

## Security Features

1. **Password Hashing** - All passwords are hashed using PHP's `password_hash()`
2. **SQL Injection Prevention** - All queries use prepared statements
3. **Session Management** - Proper session handling for authentication
4. **Role-Based Access** - Admin and customer role separation
5. **Input Validation** - Server-side validation for all inputs

## Performance Optimizations

1. **Strategic Indexing** - Indexes on frequently queried columns
2. **Efficient Queries** - Optimized JOIN operations
3. **Pagination Support** - Ready for implementing pagination
4. **Caching Ready** - Structure supports caching implementations

## Migration from Old Schema

The new schema is designed to be backward compatible with the existing PHP code. Key changes:

1. **Orders Structure** - Changed from single table to orders + order_items
2. **Enhanced Products** - Added more product attributes
3. **User Profiles** - Added address and contact information
4. **Cart Persistence** - Added dedicated cart table

## Maintenance

### Regular Tasks
1. **Backup Database** - Regular backups recommended
2. **Monitor Performance** - Check slow query logs
3. **Update Indexes** - Analyze query patterns and adjust indexes
4. **Clean Old Data** - Archive old orders and inactive users

### Monitoring Queries
```sql
-- Check database size
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'rockvintage_db'
GROUP BY table_schema;

-- Check table sizes
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'rockvintage_db'
ORDER BY (data_length + index_length) DESC;
```

This comprehensive database structure provides a solid foundation for the Rock Vintage E-Commerce platform with proper data integrity, performance optimization, and scalability features.
