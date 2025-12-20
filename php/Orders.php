<?php
require 'config.php';


// Check if user is logged in
function getUserId() {
    if (!isset($_SESSION['id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Not logged in']);
        exit();
    }
    return $_SESSION['id'];
}

// Handle fetching orders for logged-in user
if (isset($_GET['getOrders'])) {
    $userId = getUserId();

    $sql = "SELECT id, user_id, full_name, phone, address, order_notes, 
                   payment_method, total, status, created_at 
            FROM orders 
            WHERE user_id = ?
            ORDER BY created_at DESC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];

    while ($row = $result->fetch_assoc()) {
        $orderId = $row['id'];

        // Get order items
        $itemsSql = "SELECT oi.meal_id, oi.offer_id, oi.name, oi.quantity, oi.price
                     FROM order_items oi
                     WHERE oi.order_id = ?";
        $itemsStmt = $conn->prepare($itemsSql);
        $itemsStmt->bind_param("i", $orderId);
        $itemsStmt->execute();
        $itemsResult = $itemsStmt->get_result();

        $items = [];
        while ($itemRow = $itemsResult->fetch_assoc()) {
            $items[] = [
                'id' => $itemRow['meal_id'] ?: 'offer-' . $itemRow['offer_id'],
                'name' => $itemRow['name'],
                'quantity' => intval($itemRow['quantity']),
                'price' => floatval($itemRow['price'])
            ];
        }
        $itemsStmt->close();

        // Format order for frontend
        $orders[] = [
            'id' => intval($row['id']),
            'date' => $row['created_at'],
            'total' => floatval($row['total']),
            'status' => $row['status'],
            'customer' => [
                'name' => $row['full_name'],
                'phone' => $row['phone'],
                'address' => $row['address'],
                'notes' => $row['order_notes']
            ],
            'items' => $items
        ];
    }

    $stmt->close();

    header('Content-Type: application/json');
    echo json_encode($orders);
    exit();
}

// Handle creating a new order
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['createOrder'])) {

    $userId = getUserId();
    $fullName = trim($_POST['fullName']);
    $phone = trim($_POST['phone']);
    $address = trim($_POST['address']);
    $orderNotes = trim($_POST['orderNotes'] ?? '');
    $paymentMethod = trim($_POST['paymentMethod']);
    $total = floatval($_POST['total']);
    $items = json_decode($_POST['items'], true);

    // Validate
    if (empty($fullName) || empty($phone) || empty($address) || empty($paymentMethod) || empty($items)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required.']);
        exit();
    }

    // Insert order
    $stmt = $conn->prepare("INSERT INTO orders (user_id, full_name, phone, address, order_notes, payment_method, total, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())");
    $stmt->bind_param("isssssd", $userId, $fullName, $phone, $address, $orderNotes, $paymentMethod, $total);

    if ($stmt->execute()) {
        $orderId = $conn->insert_id;

        // Insert order items
        $itemStmt = $conn->prepare("INSERT INTO order_items (order_id, meal_id, offer_id, name, quantity, price) VALUES (?, ?, ?, ?, ?, ?)");

        foreach ($items as $item) {
            $mealId = null;
            $offerId = null;

            // Determine if it's a meal or offer
            if (isset($item['type']) && $item['type'] === 'offer') {
                $offerId = isset($item['offerId']) ? intval($item['offerId']) : null;
            } else {
                $mealId = is_numeric($item['id']) ? intval($item['id']) : null;
            }

            $itemName = $item['name'];
            $quantity = intval($item['quantity']);
            $price = floatval($item['price']);

            $itemStmt->bind_param("iiisid", $orderId, $mealId, $offerId, $itemName, $quantity, $price);
            $itemStmt->execute();
        }

        $itemStmt->close();

        echo json_encode([
            'success' => true,
            'message' => 'Order placed successfully!',
            'orderId' => $orderId
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }

    $stmt->close();
    exit();
}

// Handle deleting an order (admin only)
if (isset($_POST['deleteOrderId'])) {
    // Check if admin
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit();
    }

    $orderId = intval($_POST['deleteOrderId']);

    // Delete order items first (foreign key constraint)
    $stmtItems = $conn->prepare("DELETE FROM order_items WHERE order_id = ?");
    $stmtItems->bind_param("i", $orderId);
    $stmtItems->execute();
    $stmtItems->close();

    // Delete order
    $stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
    $stmt->bind_param("i", $orderId);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Order deleted successfully!']);
    } else {
        echo json_encode(['success' => false, 'message' => $stmt->error]);
    }

    $stmt->close();
    exit();
}

$conn->close();
?>