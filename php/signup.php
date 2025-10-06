<?php
header('Content-Type: application/json');
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Normalize input: prefer $_POST, but fall back to raw body (urlencoded or JSON)
    $input = $_POST;
    if ((!isset($input['name']) && !isset($input['signup-name'])) || !isset($input['email']) || !isset($input['password'])) {
        $raw = file_get_contents('php://input');
        if ($raw) {
            // Try JSON first
            $maybeJson = json_decode($raw, true);
            if (is_array($maybeJson)) {
                $input = array_merge($input, $maybeJson);
            } else {
                // Try URL-encoded parsing
                $parsed = [];
                parse_str($raw, $parsed);
                if (is_array($parsed)) {
                    $input = array_merge($input, $parsed);
                }
            }
        }
    }

    // Accept both homepage modal and standalone signup field names
    $name = trim($input['name'] ?? ($input['signup-name'] ?? ''));
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';

    if (!$name || !$email || !$password) {
        $missing = [];
        if (!$name) $missing[] = 'name';
        if (!$email) $missing[] = 'email';
        if (!$password) $missing[] = 'password';
        echo json_encode([
            'success' => false,
            'message' => 'Name, email and password are required.',
            'missing' => $missing
        ]);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
        exit;
    }

    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already registered.']);
        exit;
    }
    $stmt->close();

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $role = 'customer';

    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Database error. Please try again later.']);
        exit;
    }
    $stmt->bind_param("ssss", $name, $email, $hashed_password, $role);
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registration successful!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed.']);
    }
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?>