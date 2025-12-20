<?php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    if (!isset($_SESSION['id']) || $_SESSION['id'] == null) {
        echo json_encode(["status" => "error", "message" => "You have to login first"]);
        exit;
    }

    if (!isset($_POST['rating']) || empty($_POST['rating'])) {
        echo json_encode(["status" => "error", "message" => "Rating is required"]);
        exit;
    }

    $user_id = $_SESSION['id'];
    $rating = intval($_POST['rating']);

    // Validate rating (1-5)
    if ($rating < 1 || $rating > 5) {
        echo json_encode(["status" => "error", "message" => "Invalid rating value"]);
        exit;
    }

    $sql = "INSERT INTO ratings (user_id, rating, created_at) VALUES (?, ?, NOW())";
    $stmt = $conn->prepare($sql);

    if ($stmt) {
        $stmt->bind_param("ii", $user_id, $rating);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Rating added successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to save rating"]);
        }

        $stmt->close();
    } else {
        echo json_encode(["status" => "error", "message" => "Database error"]);
    }

    $conn->close();
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid request method"]);
?>