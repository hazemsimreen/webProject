<?php
// php/Reviews.php
require_once 'config.php';

header('Content-Type: application/json');

// Get all reviews
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT r.id, r.review_text, u.username 
            FROM reviews r 
            JOIN users u ON r.user_id = u.id 
            ORDER BY r.id DESC";
    
    $result = $conn->query($sql);
    $reviews = [];
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
    }
    
    echo json_encode($reviews);
    exit;
}

// Add a new review
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'You must be logged in to add a review.']);
        exit;
    }

    $user_id = $_SESSION['id'];
    $review_text = isset($_POST['review_text']) ? trim($_POST['review_text']) : '';

    if (empty($review_text)) {
        echo json_encode(['status' => 'error', 'message' => 'Review text cannot be empty.']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO reviews (user_id, review_text) VALUES (?, ?)");
    $stmt->bind_param("is", $user_id, $review_text);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Review added successfully!']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add review: ' . $conn->error]);
    }

    $stmt->close();
    exit;
}

$conn->close();
?>
