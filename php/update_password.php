<?php
require_once 'config.php';

$username = 'admin';
$password = 'ahmad23';
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password = ? WHERE username = ?");
$stmt->bind_param("ss", $hashed_password, $username);

if ($stmt->execute()) {
    echo "Password updated successfully for user: " . $username;
} else {
    echo "Error updating password: " . $conn->error;
}

$stmt->close();
$conn->close();
?>
