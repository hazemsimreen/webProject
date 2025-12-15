<?php
require_once 'config.php';

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Redirect back with error
        header('Location: ../SignUp.html?error=invalid_email');
        exit;
    }

    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Email already exists - redirect back with error
        header('Location: ../SignUp.html?error=email_exists');
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Find smallest available ID
    $idQuery = $conn->query("SELECT MIN(t1.id + 1) as next_id 
                             FROM users t1 
                             LEFT JOIN users t2 ON t1.id + 1 = t2.id 
                             WHERE t2.id IS NULL");
    $idRow = $idQuery->fetch_assoc();
    $nextId = $idRow['next_id'];

    if ($nextId === null) {
        $checkEmpty = $conn->query("SELECT COUNT(*) as count FROM users");
        $countRow = $checkEmpty->fetch_assoc();
        $nextId = ($countRow['count'] == 0) ? 1 : null;
    }

    if ($nextId !== null) {
        $stmt = $conn->prepare("INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("isss", $nextId, $username, $email, $hashedPassword);
    } else {
        $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $email, $hashedPassword);
    }
    $stmt->execute();

    $stmt->close();
    $conn->close();

    header('Location: ../index.html');
    exit;
}
?>