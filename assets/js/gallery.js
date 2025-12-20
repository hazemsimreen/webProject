
document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ DOM Ready - Gallery Page!");

    const photoUpload = document.getElementById("photoUpload");
    const photoGallery = document.getElementById("photoGallery");
    const emptyGallery = document.getElementById("emptyGallery");
    const submitPhotoButton = document.getElementById("submitPhoto");
    const photoCaptionInput = document.getElementById("photoCaption");
    const captionModal = new bootstrap.Modal(document.getElementById('captionModal'));
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));

    let selectedFile = null;

    // Helper to show notifications (copied from main.js style)
    function showNotification(message, type = 'success') {
        const oldNotification = document.querySelector(".cart-notification");
        if (oldNotification) oldNotification.remove();

        const notification = document.createElement("div");
        notification.className = "cart-notification";
        const bgColor = type === 'error' ? '#dc3545' : '#28a745';

        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${bgColor};
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 99999;
          font-size: 16px;
          font-weight: bold;
          animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.style.animation = "slideOut 0.3s ease";
          setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Load photos from PHP
    function loadPhotos() {
        fetch('php/Gallery.php?action=getPhotos')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    renderGallery(data.photos);
                } else {
                    console.error("Error loading photos:", data.message);
                }
            })
            .catch(err => console.error("Fetch error:", err));
    }

    // Initial load
    loadPhotos();

    // Check session and trigger upload
    window.handleUploadClick = function() {
        fetch('php/Gallery.php?action=checkSession')
            .then(res => res.json())
            .then(data => {
                if (data.loggedIn) {
                    photoUpload.click();
                } else {
                    loginModal.show();
                }
            })
            .catch(err => {
                console.error("Session check error:", err);
                showNotification("❌ Error checking login status.", "error");
            });
    };

    // Handle photo selection
    photoUpload.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (2MB)
        if (file.size > 2000000) {
            showNotification("⚠️ Photo is too large! Please choose a photo under 2MB.", "error");
            photoUpload.value = "";
            return;
        }

        selectedFile = file;
        captionModal.show();
    });

    // Submit photo with caption
    submitPhotoButton.addEventListener("click", function() {
        if (!selectedFile) return;

        const caption = photoCaptionInput.value.trim();
        const formData = new FormData();
        formData.append('photo', selectedFile);
        formData.append('caption', caption);

        submitPhotoButton.disabled = true;
        submitPhotoButton.textContent = "Uploading...";

        fetch('php/Gallery.php?action=uploadPhoto', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showNotification("✅ Photo uploaded successfully!");
                captionModal.hide();
                photoCaptionInput.value = "";
                photoUpload.value = "";
                loadPhotos();
            } else {
                showNotification("❌ " + data.message, "error");
            }
        })
        .catch(err => {
            console.error("Upload error:", err);
            showNotification("❌ Error uploading photo.", "error");
        })
        .finally(() => {
            submitPhotoButton.disabled = false;
            submitPhotoButton.textContent = "Submit";
        });
    });

    // Toggle like
    window.togglePhotoLike = function(photoId) {
        const formData = new FormData();
        formData.append('photoId', photoId);

        fetch('php/Gallery.php?action=toggleLike', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                loadPhotos();
            } else {
                showNotification("⚠️ " + data.message, "error");
            }
        })
        .catch(err => console.error("Like error:", err));
    };

    // Render gallery
    function renderGallery(photos) {
        if (!photos || photos.length === 0) {
            photoGallery.style.display = "none";
            emptyGallery.style.display = "block";
            return;
        }

        photoGallery.style.display = "grid";
        emptyGallery.style.display = "none";
        photoGallery.innerHTML = "";

        const topPhotoId = photos[0]?.id; // Backend already sorts by likes

        photos.forEach(photo => {
            const uploadDate = new Date(photo.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            const isLiked = photo.isLiked;
            const isWinner = photo.id === topPhotoId && photo.likes_count >= 5;

            const photoCard = document.createElement("div");
            photoCard.className = "photo-card";
            photoCard.style.position = "relative";
            photoCard.innerHTML = `
                ${isWinner ? '<div class="winner-badge">🏆 Top Photo</div>' : ''}
                <img src="${photo.image}" alt="Customer Photo" class="photo-img">
                <div class="photo-info">
                    ${photo.caption ? `<p class="mb-2" style="font-style: italic; color: #555;">"${photo.caption}"</p>` : ''}
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <strong>${photo.uploadedBy}</strong>
                            <br>
                            <small class="text-muted">${uploadDate}</small>
                        </div>
                        <div class="text-end">
                            <button class="like-btn ${isLiked ? 'liked' : ''}" onclick="window.togglePhotoLike(${photo.id})">
                                <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                            </button>
                            <div class="text-muted" style="font-size: 14px;">
                                <strong>${photo.likes_count}</strong> ${photo.likes_count === 1 ? 'like' : 'likes'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            photoGallery.appendChild(photoCard);
        });
    }

    // Add animations styles for notification
    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);

});
