<?php
require_once 'config.php';

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
        echo "username exists";
        $row = $result->fetch_assoc();
        $hashedPassword = $row["password"];

        if (password_verify($password, $hashedPassword))
        {
            echo "upass exists";

            if ($row["role"] == "admin")
            {
                header("location: ../admin.html");
                exit();
            }
            else {
                echo "it should  exists";

                header("location: ../index.html");
                exit();
            }

        }


    }

}

?>