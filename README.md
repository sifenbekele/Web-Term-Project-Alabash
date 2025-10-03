# Alabash E-Commerce Platform

## Overview
Alabash is a full-stack e-commerce web application for clothing and accessories. It features user authentication, product catalog, shopping cart, order management, admin dashboard, and user profile management.

- **Frontend:** HTML, CSS, JavaScript (modular, page-specific JS)
- **Backend:** PHP (REST-like API), MySQL database

---

## Monorepo Structure

> **Note:** This project uses a **monorepo** structure. All frontend (HTML, CSS, JS) and backend (PHP) code is contained in this single repository. There are no separate repos for frontend or backend.

---

## How the Code Works

### 1. **Frontend (HTML/CSS/JS)**
- Each page (`pages/`) has a corresponding HTML file and a JS file in `js/`.
- JS files handle all dynamic actions: form submissions, data fetching, UI updates, and navigation.
- All forms are submitted via JavaScript using the fetch API (no direct form actions to PHP).
- CSS files in `css/` provide styling and responsive design.

### 2. **Backend (PHP/MySQL)**
- All backend logic is in the `php/` directory.
- Each PHP file acts as an API endpoint, handling a specific action (login, signup, CRUD for products/orders, etc.).
- PHP scripts return JSON responses for all requests.
- Database connection is managed in `php/db.php`.

### 3. **AJAX/API Mapping**

| Page/JS File                | PHP Endpoint(s)                | Purpose                          |
|-----------------------------|--------------------------------|-----------------------------------|
| Login.html, Login.js        | php/login.php                  | User login                        |
| Signup.html, Signup.js      | php/signup.php                 | User registration                 |
| Shop.html, Shop.js          | php/get_products.php           | List products                     |
| Cart.html, Cart.js          | php/create_order.php           | Place order                       |
| CP.html, CP.js              | php/get_profile.php, php/update_profile.php, php/get_user_orders.php | User profile, update, order history |
| AD Product Management.html, AD Product Management.js | php/get_products.php, php/add_product.php, php/edit_product.php, php/delete_product.php, php/upload_product_image.php | Admin product CRUD |
| AD Order Management.html, AD Order Management.js | php/get_orders.php, php/update_order.php, php/delete_order.php | Admin order management |
| Contact.html, Contact Us.js | php/contact.php                | Contact form                      |
| All pages                   | php/logout.php, php/session_info.php | Logout, session/role info         |

---

## Setup Instructions

1. **Clone the repository**
   ```
   git clone <repo-url>
   ```
2. **Set up the database**
   - Import the provided SQL schema (if available) into MySQL.
   - Update `php/db.php` with your DB credentials.
3. **Run with XAMPP/LAMP**
   - Place the project in your web server's root directory (e.g., `htdocs` for XAMPP).
   - Start Apache and MySQL.
   - Access the app at `http://localhost/Alabash/index.html`.
4. **Dependencies**
   - PHP 7.x or newer
   - MySQL
   - Modern web browser

---

## Notes & Best Practices
- All client-server communication is via AJAX (fetch API).
- All PHP endpoints return JSON; JS expects and handles JSON responses.
- Admin features are protected by session/role checks in PHP.
- For production, secure your PHP (disable error display, use HTTPS, sanitize input, etc.).

---

## What's Missing / To Improve
- Add product/order detail views for regular users
- Implement password reset and email verification
- Enhance mobile responsiveness and accessibility
- Add CSRF protection and rate limiting
- Add user activity analytics

---

## Ensuring PHP & Full-Stack Functionality

Follow this checklist to make sure your PHP backend and the entire application work as intended:

### 1. Environment Setup
- Use XAMPP, MAMP, LAMP, or similar with Apache and PHP 7.x+.
- Place the project folder (e.g., `alabash`) inside your web server's root directory (`htdocs` for XAMPP).
- Ensure the web server user has read/write permissions for all files and folders (especially for uploads).

### 2. Database Configuration
- Import your SQL schema into MySQL (tables for users, products, orders, etc.).
- Update `php/db.php` with your actual database credentials.
- Test the connection with a simple PHP script if needed.

### 3. PHP Configuration
- Make sure PHP sessions are enabled (default).
- For file uploads, ensure `php.ini` allows uploads and the upload directory is writable.
- Enable error reporting for development; disable `display_errors` for production.

### 4. Frontend-Backend Integration
- All JS fetches (login, signup, product CRUD, etc.) must point to the correct PHP endpoints (e.g., `php/login.php`).
- If using different domains/ports, configure CORS headers in PHP (not needed for monorepo/localhost).
- All user/admin actions in PHP should check for a valid session and user role.

### 5. Testing Each Feature
- Register a new user and check the database for the new entry.
- Log in and out, and verify session behavior.
- Add, edit, and delete products as admin; verify changes in the database and UI.
- Add items to cart, checkout, and verify orders are created in the database.
- Change user info and password; verify updates.
- Submit a contact form and check for DB entry/email.
- Log in as different users and verify they only see their own orders/profile.
- Log in as admin and verify access to all products/orders.

### 6. Security & Validation
- Sanitize and validate all user input in PHP.
- Use `password_hash` and `password_verify` for passwords.
- Regenerate session IDs on login, and destroy sessions on logout.
- Validate file types and sizes for uploads.
- Return JSON errors for AJAX calls and handle them in JS.

### 7. Final Checklist
- [ ] Database is set up and connected.
- [ ] All PHP files are accessible and return JSON as expected.
- [ ] All JS fetches point to the correct PHP endpoints.
- [ ] Sessions and user roles are enforced in PHP.
- [ ] All forms and actions work as intended (test each one).
- [ ] File uploads work and are saved in the correct location.
- [ ] No PHP errors or warnings are shown to users.
- [ ] Security best practices are followed.

### 8. Debugging Tips
- Use browser dev tools (Network tab) to inspect AJAX requests and responses.
- Check PHP error logs if something fails silently.
- Use `console.log` in JS and `error_log` or `var_dump` in PHP for debugging.
- Test with multiple user accounts (admin and regular users).

---
