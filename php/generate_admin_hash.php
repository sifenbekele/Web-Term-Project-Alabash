<?php
// Usage: Access this file in your browser and set the password below
$password = '0973531873'; // Change this to your desired admin password
$hash = password_hash($password, PASSWORD_DEFAULT);
echo "<b>Password:</b> $password<br><b>Hash:</b> $hash";
?> 