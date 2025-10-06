<?php
header('Content-Type: application/json');
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if (!$name || !$email || !$message) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
        exit();
    }

    // Persist to correct table per schema: contact_messages
    $stmt = $conn->prepare("INSERT INTO contact_messages (name, email, message, created_at) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("sss", $name, $email, $message);
    $dbSuccess = $stmt->execute();
    $stmt->close();
    $conn->close();

    // Send email to site owner (best-effort)
    $to = 'rockvintage2@gmail.com';
    $subject = 'New Contact Message from ' . $name;
    $body = "Name: $name\nEmail: $email\nMessage:\n$message";
    $headers = "From: $email\r\nReply-To: $email\r\n";
    $mailSuccess = @mail($to, $subject, $body, $headers);

    if ($dbSuccess && $mailSuccess) {
        echo json_encode(['success' => true, 'message' => 'Message sent successfully.']);
    } elseif ($dbSuccess) {
        echo json_encode(['success' => true, 'message' => 'Message saved, but email could not be sent.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to send message.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request.']);
}
?> 