<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    // Action dispatcher
    $action = $_GET['action'] ?? '';

switch ($action) {
    case 'getPhotos':
        getPhotos($conn);
        break;
    case 'uploadPhoto':
        uploadPhoto($conn);
        break;
    case 'toggleLike':
        toggleLike($conn);
        break;
    case 'deletePhoto':
        deletePhoto($conn);
        break;
    case 'getDeletedPhotos':
        getDeletedPhotos($conn);
        break;
    case 'checkSession':
        checkSession();
        break;
    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    exit();
}

function checkSession() {
    if (isset($_SESSION['id'])) {
        echo json_encode(['status' => 'success', 'loggedIn' => true, 'username' => $_SESSION['username']]);
    } else {
        echo json_encode(['status' => 'success', 'loggedIn' => false]);
    }
    exit();
}

function getPhotos($conn) {
    $currentUserId = $_SESSION['id'] ?? 0;
    
    // Fetch photos that are not deleted, joined with user info
    $sql = "SELECT p.*, u.username as uploadedBy, 
            (SELECT COUNT(*) FROM gallery_likes WHERE photo_id = p.id AND user_id = ?) as isLiked
            FROM gallery_photos p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.is_deleted = 0
            ORDER BY p.likes_count DESC, p.created_at DESC";
            
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $currentUserId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $photos = [];
    while ($row = $result->fetch_assoc()) {
        $row['image'] = 'assets/image/gallery/' . $row['image'];
        $row['isLiked'] = $row['isLiked'] > 0;
        $photos[] = $row;
    }
    
    echo json_encode(['status' => 'success', 'photos' => $photos]);
    exit();
}

function uploadPhoto($conn) {
    if (!isset($_SESSION['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'You must be logged in to upload photos.']);
        exit();
    }

    $userId = $_SESSION['id'];
    $caption = $_POST['caption'] ?? '';

    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === 0) {
        $uploadDir = '../assets/image/gallery/';
        
        // Ensure upload directory exists
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Generate unique filename
        $fileInfo = pathinfo($_FILES['photo']['name']);
        $fileName = time() . '_' . uniqid() . '.' . $fileInfo['extension'];
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['photo']['tmp_name'], $targetFile)) {
            $stmt = $conn->prepare("INSERT INTO gallery_photos (user_id, image, caption) VALUES (?, ?, ?)");
            $stmt->bind_param("iss", $userId, $fileName, $caption);

            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Photo uploaded successfully!']);
            } else {
                // Remove file if database insert fails
                if (file_exists($targetFile)) unlink($targetFile);
                echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $stmt->error]);
            }
            $stmt->close();
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file.']);
        }
    } else {
        $errorMsg = (isset($_FILES['photo']) && $_FILES['photo']['error'] !== 0) 
                    ? 'Upload error code: ' . $_FILES['photo']['error'] 
                    : 'No file uploaded.';
        echo json_encode(['status' => 'error', 'message' => $errorMsg]);
    }
    exit();
}

function toggleLike($conn) {
    if (!isset($_SESSION['id'])) {
        echo json_encode(['status' => 'error', 'message' => 'You must be logged in to like photos.']);
        exit();
    }

    $userId = $_SESSION['id'];
    $photoId = $_POST['photoId'] ?? 0;

    if (!$photoId) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid photo ID.']);
        exit();
    }

    // Check if already liked
    $stmt = $conn->prepare("SELECT * FROM gallery_likes WHERE photo_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $photoId, $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Unlike: Remove from likes table and decrement count
        $stmt = $conn->prepare("DELETE FROM gallery_likes WHERE photo_id = ? AND user_id = ?");
        $stmt->bind_param("ii", $photoId, $userId);
        $stmt->execute();
        
        $stmt = $conn->prepare("UPDATE gallery_photos SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ?");
        $stmt->bind_param("i", $photoId);
        $stmt->execute();

        echo json_encode(['status' => 'success', 'action' => 'unliked']);
    } else {
        // Like: Add to likes table and increment count
        $stmt = $conn->prepare("INSERT INTO gallery_likes (photo_id, user_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $photoId, $userId);
        $stmt->execute();
        
        $stmt = $conn->prepare("UPDATE gallery_photos SET likes_count = likes_count + 1 WHERE id = ?");
        $stmt->bind_param("i", $photoId);
        $stmt->execute();

        echo json_encode(['status' => 'success', 'action' => 'liked']);
    }
    exit();
}

function deletePhoto($conn) {
    if (!isset($_SESSION['id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized.']);
        exit();
    }

    $photoId = $_POST['photoId'] ?? 0;
    $reason = $_POST['reason'] ?? 'No reason provided';

    if (!$photoId) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid photo ID.']);
        exit();
    }

    $stmt = $conn->prepare("UPDATE gallery_photos SET is_deleted = 1, delete_reason = ?, deleted_at = NOW() WHERE id = ?");
    $stmt->bind_param("si", $reason, $photoId);

    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success', 
            'message' => 'Photo deleted successfully.',
            'deleted_at' => date('Y-m-d H:i:s')
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $stmt->error]);
    }
    $stmt->close();
    exit();
}

function getDeletedPhotos($conn) {
    if (!isset($_SESSION['id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized.']);
        exit();
    }

    $sql = "SELECT p.*, u.username as uploadedBy 
            FROM gallery_photos p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.is_deleted = 1 
            ORDER BY p.deleted_at DESC";
            
    $result = $conn->query($sql);
    
    $photos = [];
    while ($row = $result->fetch_assoc()) {
        $row['image'] = 'assets/image/gallery/' . $row['image'];
        $photos[] = $row;
    }
    
    echo json_encode(['status' => 'success', 'photos' => $photos]);
    exit();
}
?>
