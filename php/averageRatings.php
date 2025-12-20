<?php
// ملف: get-average-rating.php
session_start();
require_once 'config.php';

header('Content-Type: application/json');

// استعلام لحساب المعدل من جدول ratings
$sql = "SELECT 
            COUNT(*) as total_ratings,
            AVG(rating) as average_rating
        FROM ratings";

$result = $conn->query($sql);

if ($result && $row = $result->fetch_assoc()) {
    $average = $row['average_rating'] ? round($row['average_rating'], 1) : 0;
    $total = $row['total_ratings'];

    echo json_encode([
        'status' => 'success',
        'average_rating' => $average,  // مثلاً: 4.3
        'total_ratings' => $total      // مثلاً: 150
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'average_rating' => 0,
        'total_ratings' => 0
    ]);
}

$conn->close();
?>