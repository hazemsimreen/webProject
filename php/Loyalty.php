<?php
// php/Loyalty.php
require_once 'config.php';

header('Content-Type: application/json');

if (!isset($_SESSION['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['id'];

// GET: Fetch points and history
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get points
    $stmt = $conn->prepare("SELECT loyalty_points FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $points = $user ? (int)$user['loyalty_points'] : 0;
    $stmt->close();

    // Get history
    $stmt = $conn->prepare("SELECT points_change, type, created_at FROM loyalty_history WHERE user_id = ? ORDER BY id DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $historyResult = $stmt->get_result();
    $history = [];
    while ($row = $historyResult->fetch_assoc()) {
        $history[] = $row;
    }
    $stmt->close();

    echo json_encode([
        'status' => 'success',
        'points' => $points,
        'history' => $history
    ]);
    exit;
}

// POST: Redeem points
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = isset($_POST['action']) ? $_POST['action'] : '';

    if ($action === 'redeem') {
        // Check current points
        $stmt = $conn->prepare("SELECT loyalty_points FROM users WHERE id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $points = $user ? (int)$user['loyalty_points'] : 0;
        $stmt->close();

        if ($points < 80) {
            echo json_encode(['status' => 'error', 'message' => 'Insufficient points. You need 80 points.']);
            exit;
        }

        // Deduct points
        $newPoints = $points - 80;
        $conn->begin_transaction();
        try {
            $stmt = $conn->prepare("UPDATE users SET loyalty_points = ? WHERE id = ?");
            $stmt->bind_param("ii", $newPoints, $user_id);
            $stmt->execute();
            $stmt->close();

            // Record history (assuming loyalty_history table structure)
            $type = 'redeemed';
            $points_change = -80;
            $stmt = $conn->prepare("INSERT INTO loyalty_history (user_id, points_change, type) VALUES (?, ?, ?)");
            $stmt->bind_param("iis", $user_id, $points_change, $type);
            $stmt->execute();
            $stmt->close();

            // Select a random meal <= $35
            $mealResult = $conn->query("SELECT * FROM meals WHERE price <= 35 ORDER BY RAND() LIMIT 1");
            $meal = $mealResult->fetch_assoc();

            if (!$meal) {
                throw new Exception("No eligible meals found for redemption.");
            }

            $conn->commit();
            echo json_encode([
                'status' => 'success',
                'message' => 'Points redeemed successfully!',
                'meal' => $meal,
                'new_points' => $newPoints
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(['status' => 'error', 'message' => 'Transaction failed: ' . $e->getMessage()]);
        }
    } else if ($action === 'award') {
        $points_to_add = isset($_POST['points']) ? (int)$_POST['points'] : 0;
        
        if ($points_to_add <= 0) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid points amount']);
            exit;
        }

        $conn->begin_transaction();
        try {
            // Update user points
            $stmt = $conn->prepare("UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?");
            $stmt->bind_param("ii", $points_to_add, $user_id);
            $stmt->execute();
            $stmt->close();

            // Record history
            $type = 'earned';
            $stmt = $conn->prepare("INSERT INTO loyalty_history (user_id, points_change, type) VALUES (?, ?, ?)");
            $stmt->bind_param("iis", $user_id, $points_to_add, $type);
            $stmt->execute();
            $stmt->close();

            $conn->commit();
            echo json_encode(['status' => 'success', 'message' => 'Points awarded successfully!']);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(['status' => 'error', 'message' => 'Transaction failed: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
    }
    exit;
}

$conn->close();
?>
