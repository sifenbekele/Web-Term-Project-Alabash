<?php
$servername = "localhost";
$username = "root";
$password = ""; 
$dbname = "rockvintage_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die('Database connection failed.');
}

// Ensure proper charset for connections handling emojis and multi-byte chars
$conn->set_charset('utf8mb4');
?>
