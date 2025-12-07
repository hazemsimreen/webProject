console.log("📸 Gallery page loaded!");

document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ DOM Ready - Gallery Page!");

    const photoUpload = document.getElementById("photoUpload");
    const photoGallery = document.getElementById("photoGallery");
    const emptyGallery = document.getElementById("emptyGallery");
    const winnerAnnouncement = document.getElementById("winnerAnnouncement");
    const winnerText = document.getElementById("winnerText");

    // Load photos from localStorage
    function getPhotos() {
        return JSON.parse(localStorage.getItem("customerPhotos") || "[]");
    }

    // Save photos to localStorage
    function savePhotos(photos) {
        localStorage.setItem("customerPhotos", JSON.stringify(photos));
    }

    // Handle photo upload
    photoUpload.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (max 2MB to avoid localStorage issues)
        if (file.size > 2000000) {
            alert("⚠️ Photo is too large! Please choose a photo under 2MB.");
            return;
        }

        // Ask for caption
        const caption = prompt("Add a caption for your photo (optional):", "");

        const reader = new FileReader();
        reader.onload = function(event) {
            const photoData = {
                id: Date.now(),
                image: event.target.result,
                caption: caption || "",
                uploadedBy: "Customer", // Could be username if login system exists
                uploadDate: new Date().toISOString(),
                likes: 0,
                likedBy: [] // Track who liked it
            };

            const photos = getPhotos();
            photos.push(photoData);
            savePhotos(photos);

            alert("✅ Photo uploaded successfully!");
            renderGallery();
            photoUpload.value = ""; // Reset input
        };

        reader.readAsDataURL(file);
    });

    // Toggle like on a photo
    function toggleLike(photoId) {
        const photos = getPhotos();
        const photo = photos.find(p => p.id === photoId);
        
        if (!photo) return;

        // Simple like toggle (in real app, would track by user ID)
        const userId = "currentUser"; // Placeholder
        const likedIndex = photo.likedBy.indexOf(userId);

        if (likedIndex > -1) {
            // Unlike
            photo.likedBy.splice(likedIndex, 1);
            photo.likes--;
        } else {
            // Like
            photo.likedBy.push(userId);
            photo.likes++;
        }

        savePhotos(photos);
        renderGallery();
        checkForWinner();
    }

    // Check if there's a winner (most likes)
    function checkForWinner() {
        const photos = getPhotos();
        if (photos.length === 0) return;

        // Find photo with most likes
        const sortedPhotos = [...photos].sort((a, b) => b.likes - a.likes);
        const topPhoto = sortedPhotos[0];

        // Only award if photo has at least 5 likes
        if (topPhoto.likes >= 5 && !topPhoto.awarded) {
            // Award 20 loyalty points
            const loyaltyData = JSON.parse(localStorage.getItem("loyaltyPoints") || '{"totalPoints": 0, "history": []}');
            
            loyaltyData.totalPoints += 20;
            loyaltyData.history.push({
                date: new Date().toISOString().split('T')[0],
                photoId: topPhoto.id,
                pointsEarned: 20,
                type: "photo_winner"
            });

            localStorage.setItem("loyaltyPoints", JSON.stringify(loyaltyData));

            // Mark as awarded
            topPhoto.awarded = true;
            savePhotos(photos);

            // Show winner announcement
            winnerText.textContent = `🎉 Photo with ${topPhoto.likes} likes won 20 loyalty points!`;
            winnerAnnouncement.style.display = "block";

            setTimeout(() => {
                winnerAnnouncement.style.display = "none";
            }, 5000);
        }
    }

    // Render gallery
    function renderGallery() {
        const photos = getPhotos();

        if (photos.length === 0) {
            photoGallery.style.display = "none";
            emptyGallery.style.display = "block";
            return;
        }

        photoGallery.style.display = "grid";
        emptyGallery.style.display = "none";
        photoGallery.innerHTML = "";

        // Sort by likes (most liked first)
        const sortedPhotos = [...photos].sort((a, b) => b.likes - a.likes);
        const topPhotoId = sortedPhotos[0]?.id;

        sortedPhotos.forEach(photo => {
            const uploadDate = new Date(photo.uploadDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            const isLiked = photo.likedBy.includes("currentUser");
            const isWinner = photo.id === topPhotoId && photo.likes >= 5;

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
                                <strong>${photo.likes}</strong> ${photo.likes === 1 ? 'like' : 'likes'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            photoGallery.appendChild(photoCard);
        });
    }

    // Expose toggle function globally
    window.togglePhotoLike = toggleLike;

    // Initial render
    renderGallery();
    checkForWinner();

    console.log("✅ Gallery system ready!");
});
