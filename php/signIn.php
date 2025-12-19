<?php
require_once 'config.php';
session_start();
if($_SERVER['REQUEST_METHOD'] == 'POST')
{
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id,password,role FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();


    if ($result->num_rows == 1)
    {
        $row = $result->fetch_assoc();
        $hashedPassword = $row["password"];

        if (password_verify($password, $hashedPassword))
        {
            $_SESSION['username'] = $username;
            $_SESSION['role'] = $row['role'];
            $_SESSION['id'] = $row['id'];

            if ($row["role"] == "admin")
            {
                header("location: ../admin.html");
                exit();
            }
            else {
                header("location: ../index.html");
                exit();
            }

        }


    }

}

?>