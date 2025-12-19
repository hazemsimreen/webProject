<?php
require 'config.php';

// Handle fetching offers
// Handle fetching offers
if (isset($_GET['getOffers'])) {
    // Check if we want all offers (for admin) or just active ones (for customers)
    $showAll = isset($_GET['showAll']) && $_GET['showAll'] === '1';

    if ($showAll) {
        // Admin view - show all offers
        $sql = "SELECT id, title, discount, image, deadline, created_at 
                FROM offers 
                ORDER BY created_at DESC";
    } else {
        // Customer view - show only active offers
        $sql = "SELECT id, title, discount, image, deadline, created_at 
                FROM offers 
                WHERE deadline >= CURDATE() OR deadline IS NULL
                ORDER BY created_at DESC";
    }

    $result = $conn->query($sql);
    $offers = [];

    while ($row = $result->fetch_assoc()) {
        // Get meal IDs for this offer
        $offerId = $row['id'];
        $mealSql = "SELECT meal_id FROM offer_meals WHERE offer_id = ?";
        $stmt = $conn->prepare($mealSql);
        $stmt->bind_param("i", $offerId);
        $stmt->execute();
        $mealResult = $stmt->get_result();

        $mealIds = [];
        while ($mealRow = $mealResult->fetch_assoc()) {
            $mealIds[] = intval($mealRow['meal_id']);
        }
        $stmt->close();

        // Add image path
        $row['image'] = 'assets/image/' . $row['image'];
        $row['mealIds'] = $mealIds;
        $offers[] = $row;
    }

    header('Content-Type: application/json');
    echo json_encode($offers);
    exit();
}

// Handle deleting an offer
if (isset($_POST['deleteOfferId'])) {
    $offerId = intval($_POST['deleteOfferId']);

    // Delete offer image from server
    $stmtImg = $conn->prepare("SELECT image FROM offers WHERE id = ?");
    $stmtImg->bind_param("i", $offerId);
    $stmtImg->execute();
    $resultImg = $stmtImg->get_result();

    if ($resultImg->num_rows > 0) {
        $row = $resultImg->fetch_assoc();
        $imageFile = '../assets/image/' . $row['image'];
        if (file_exists($imageFile)) unlink($imageFile);
    }
    $stmtImg->close();

    // Delete from offer_meals first (foreign key constraint)
    $stmtMeals = $conn->prepare("DELETE FROM offer_meals WHERE offer_id = ?");
    $stmtMeals->bind_param("i", $offerId);
    $stmtMeals->execute();
    $stmtMeals->close();

    // Delete offer record
    $stmtDel = $conn->prepare("DELETE FROM offers WHERE id = ?");
    $stmtDel->bind_param("i", $offerId);

    if ($stmtDel->execute()) {
        echo json_encode(['success' => true, 'message' => 'Offer deleted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => $stmtDel->error]);
    }
    $stmtDel->close();
    exit();
}

// Handle adding an offer
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !isset($_POST['deleteOfferId'])) {

    $offerTitle = trim($_POST['offerTitle']);
    $offerDiscount = trim($_POST['offerDiscount']);
    $offerDeadline = trim($_POST['offerDeadline']);
    $offerMealIds = isset($_POST['offerMealIds']) ? json_decode($_POST['offerMealIds'], true) : [];

    // Validate required fields
    if (empty($offerTitle) || empty($offerDiscount) || empty($offerDeadline)) {
        echo json_encode(['success' => false, 'message' => "All fields are required."]);
        exit();
    }

    if (empty($offerMealIds)) {
        echo json_encode(['success' => false, 'message' => "Please select at least one meal for the offer."]);
        exit();
    }

    // Handle image upload
    if (isset($_FILES['offerImage']) && $_FILES['offerImage']['error'] === 0) {
        $uploadDir = '../assets/image/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $fileName = time() . '_' . basename($_FILES['offerImage']['name']);
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['offerImage']['tmp_name'], $targetFile)) {
            // Insert offer into DB
            $stmt = $conn->prepare("INSERT INTO offers (title, discount, image, deadline, created_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->bind_param("ssss", $offerTitle, $offerDiscount, $fileName, $offerDeadline);

            if ($stmt->execute()) {
                $offerId = $conn->insert_id;

                // Insert meal associations
                $stmtMeal = $conn->prepare("INSERT INTO offer_meals (offer_id, meal_id) VALUES (?, ?)");
                foreach ($offerMealIds as $mealId) {
                    $stmtMeal->bind_param("ii", $offerId, $mealId);
                    $stmtMeal->execute();
                }
                $stmtMeal->close();

                echo json_encode([
                    'success' => true,
                    'message' => "Offer added successfully!",
                    'image' => 'assets/image/' . $fileName
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => $stmt->error]);
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'message' => "Failed to upload image."]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => "Offer image is required."]);
    }

    exit();
}

$conn->close();
?>
