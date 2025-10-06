<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "rockvintage_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

echo "<h2>Rock Vintage Database Setup</h2>";
echo "Connected to database: $dbname<br><br>";

$sqlFile = 'database_schema.sql';

if (file_exists($sqlFile)) {
    $commands = file_get_contents($sqlFile);
    $commands = explode(';', $commands);

    $success = 0;
    $errors = 0;

    foreach ($commands as $command) {
        $trimmed = trim($command);
        if ($trimmed) {
            if ($conn->query($trimmed) === TRUE) {
                $success++;
            } else {
                echo "✗ SQL Error: " . $conn->error . "<br>";
                $errors++;
            }
        }
    }

    echo "<br>✅ Successfully executed: $success statements<br>";
    echo "⚠️ Errors encountered: $errors statements<br>";
} else {
    echo "❌ SQL file not found.";
}

$conn->close();
?>
