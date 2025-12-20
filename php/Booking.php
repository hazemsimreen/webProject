<?php

require_once 'config.php';
// session_start(); // Removed: Already started in config.php

header('Content-Type: application/json');

// --- HANDLE POST: SUBMIT NEW BOOKING ---
if($_SERVER["REQUEST_METHOD"] == "POST")
{
    if (isset($_SESSION['id']) && $_SESSION['id'] != null) {
        $user_id = $_SESSION['id'];
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $tableSize = $_POST['tableSize'] ?? '';
        $datetime = $_POST['date'] ?? '';

        if (empty($name) || empty($email) || empty($phone) || empty($tableSize) || empty($datetime)) {
             echo json_encode(["status" => "error", "message" => "All fields are required!"]);
             exit;
        }

        try {
            $dateTimeObj = DateTime::createFromFormat('Y-m-d\TH:i', $datetime);
            if (!$dateTimeObj) {
                 throw new Exception("Invalid date format");
            }
            $bookingDate = $dateTimeObj->format('Y-m-d');
            $bookingTime = $dateTimeObj->format('H:i');

            $stmt = $conn->prepare("INSERT INTO bookings (user_id,name,email,phone,party_size,booking_date,time_slot) VALUES (?,?, ?, ?, ?,?,?)");
            $stmt->bind_param("isssiss",$user_id , $name, $email, $phone, $tableSize, $bookingDate, $bookingTime);
            
            if ($stmt->execute())
            {
                echo json_encode(["status" => "success", "message" => "Booking submitted successfully!"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Database error: " . $stmt->error]);
            }

            $stmt->close();
        } catch (Exception $e) {
             echo json_encode(["status" => "error", "message" => "Error processing booking: " . $e->getMessage()]);
        }
        exit;

    } else {
        echo json_encode(["status" => "error", "message" => "You have to login first"]);
        exit;
    }
}

// --- HANDLE GET: FETCH ALL BOOKINGS (ADMIN ONLY) ---
if($_SERVER["REQUEST_METHOD"] == "GET" && isset($_GET['action']) && $_GET['action'] == 'getAllBookings')
{
    // Admin Check
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["status" => "error", "message" => "Unauthorized access."]);
        exit;
    }

    try {
        $sql = "SELECT * FROM bookings ORDER BY booking_date DESC, time_slot DESC";
        $result = $conn->query($sql);
        $bookings = [];

        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $bookings[] = $row;
            }
        }

        echo json_encode(["status" => "success", "data" => $bookings]);
    } catch (Exception $e) {
        echo json_encode(["status" => "error", "message" => "Error fetching bookings: " . $e->getMessage()]);
    }
    exit;
}

$conn->close();
?>