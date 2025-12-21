<?php
require_once 'config.php';
session_start();

if($_SERVER['REQUEST_METHOD'] == 'POST')
{
    // Validate input
    if(empty($_POST['username']) || empty($_POST['password'])) {
        header("Location: ../login.html?error=empty");
        exit();
    }

    $username = trim($_POST['username']);
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, password, role FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1)
    {
        $row = $result->fetch_assoc();
        $hashedPassword = $row["password"];

        if (password_verify($password, $hashedPassword))
        {
            // Regenerate session ID for security
            session_regenerate_id(true);

            $_SESSION['username'] = $username;
            $_SESSION['role'] = $row['role'];
            $_SESSION['id'] = $row['id'];

            if ($row["role"] == "admin")
            {
                header("Location: ../admin.html");
                exit();
            }
            else {
                header("Location: ../index.html");
                exit();
            }
        }
        else
        {
            // Wrong password
            header("Location: ../login.html?error=invalid");
            exit();
        }
    }
    else
    {
        // User doesn't exist
        header("Location: ../login.html?error=invalid");
        exit();
    }

    $stmt->close();
    $conn->close();
}
else
{
    // Not a POST request - redirect to login
    header("Location: ../login.html");
    exit();
}
?>