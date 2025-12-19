<?php
require 'config.php';

// Handle fetching meals
if (isset($_GET['getMeals'])) {
    $sql = "SELECT m.id, m.name, m.price, c.slug AS category, m.description, m.image
            FROM meals m
            JOIN categories c ON m.category_id = c.id
            ORDER BY m.created_at DESC";
    $result = $conn->query($sql);
    $meals = [];
    while ($row = $result->fetch_assoc()) {
        // Relative path from admin.html location
        $row['image'] = 'assets/image/' . $row['image'];
        $meals[] = $row;
    }
    header('Content-Type: application/json');
    echo json_encode($meals);
    exit();
}

// Handle deleting a meal
if (isset($_POST['deleteMealId'])) {
    $mealId = intval($_POST['deleteMealId']);

    // Delete meal image from server
    $stmtImg = $conn->prepare("SELECT image FROM meals WHERE id = ?");
    $stmtImg->bind_param("i", $mealId);
    $stmtImg->execute();
    $resultImg = $stmtImg->get_result();
    if ($resultImg->num_rows > 0) {
        $row = $resultImg->fetch_assoc();
        // Go up one level from php/ folder to project root
        $imageFile = '../assets/image/' . $row['image'];
        if (file_exists($imageFile)) unlink($imageFile);
    }
    $stmtImg->close();

    // Delete meal record
    $stmtDel = $conn->prepare("DELETE FROM meals WHERE id = ?");
    $stmtDel->bind_param("i", $mealId);
    if ($stmtDel->execute()) {
        echo json_encode(['success' => true, 'message' => 'Meal deleted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => $stmtDel->error]);
    }
    $stmtDel->close();
    exit();
}

// Handle adding a meal
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['deleteMealId'])) {

    $mealName = trim($_POST['mealName']);
    $mealPrice = trim($_POST['mealPrice']);
    $mealCategorySlug = trim($_POST['mealCategory']);
    $mealDescription = trim($_POST['mealDescription']);

    // Validate required fields
    if (empty($mealName) || empty($mealPrice) || empty($mealCategorySlug) || empty($mealDescription)) {
        echo json_encode(['success' => false, 'message' => "All fields are required."]);
        exit();
    }

    // Get category ID
    $stmtCat = $conn->prepare("SELECT id FROM categories WHERE slug = ?");
    $stmtCat->bind_param("s", $mealCategorySlug);
    $stmtCat->execute();
    $resultCat = $stmtCat->get_result();

    if ($resultCat->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => "Invalid category selected."]);
        exit();
    }

    $categoryRow = $resultCat->fetch_assoc();
    $mealCategoryId = $categoryRow['id'];
    $stmtCat->close();

    // Handle image upload
    if (isset($_FILES['mealImage']) && $_FILES['mealImage']['error'] === 0) {
        // Go up one level from php/ folder to reach project root
        $uploadDir = '../assets/image/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        // Only file name, no path here
        $fileName = time() . '_' . basename($_FILES['mealImage']['name']);
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['mealImage']['tmp_name'], $targetFile)) {
            // Insert meal into DB
            $stmt = $conn->prepare("INSERT INTO meals (name, price, category_id, description, image, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
            $stmt->bind_param("sdiss", $mealName, $mealPrice, $mealCategoryId, $mealDescription, $fileName);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => "Meal added successfully!", 'image' => 'assets/image/' . $fileName]);
            } else {
                echo json_encode(['success' => false, 'message' => $stmt->error]);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => "Failed to upload image."]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => "Meal image is required."]);
    }

    exit();
}

$conn->close();
?>