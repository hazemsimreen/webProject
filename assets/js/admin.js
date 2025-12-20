console.log("🚀 Admin Panel Loaded!");

document.addEventListener("DOMContentLoaded", () => {
    let meals = [];

    loadMealsFromDB();
    initGalleryHooks();
    initDashboard();


    const addMealForm = document.getElementById("addMealForm");
    if (addMealForm) {
        addMealForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const nameInput = document.getElementById("mealName");
            const priceInput = document.getElementById("mealPrice");
            const categoryInput = document.getElementById("mealCategory");
            const descInput = document.getElementById("mealDescription");
            const imageInput = document.getElementById("mealImage");

            const imageFile = imageInput.files[0];
            if (!imageFile) {
                alert("Please select an image for the meal.");
                return;
            }

            if (imageFile.size > 2 * 1024 * 1024) {
                alert("⚠️ Image is too large (over 2MB). Please use a smaller image.");
                return;
            }

            const formData = new FormData();
            formData.append("mealName", nameInput.value);
            formData.append("mealPrice", priceInput.value);
            formData.append("mealCategory", categoryInput.value);
            formData.append("mealDescription", descInput.value);
            formData.append("mealImage", imageFile);

            fetch("php/Meals.php", {
                method: "POST",
                body: formData
            })
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                    showNotification("✅ Meal added successfully!");
                    addMealForm.reset();
                    const preview = document.getElementById("imagePreview");

                    if (preview) preview.style.display = "none";
                    loadMealsFromDB()

                })
                .catch(err => {
                    console.error("Error:", err);
                    alert("❌ Failed to add meal. Check console for details.");
                });
        });
    }
    function loadMealsFromDB() {
        fetch("php/Meals.php?getMeals=1")
            .then(res => res.json())
            .then(data => {
                meals = data;
                displayMeals(meals);

                // Initialize offers with loaded meals
                initOffers(meals);
            })
            .catch(err => {
                console.error("Failed to load meals:", err);
            });
    }



    // Display all meals
    function displayMeals(mealsArray) {
        const mealsList = document.getElementById("mealsList");
        if (!mealsList) return;

        if (mealsArray.length === 0) {
            mealsList.innerHTML = `
            <div class="col-12 empty-state">
                <i class="fa-solid fa-utensils"></i>
                <h3>No meals available</h3>
                <p>Start by adding new meals from above</p>
            </div>
        `;
            return;
        }

        mealsList.innerHTML = mealsArray.map(meal => `
        <div class="col-md-4">
            <div class="meal-card">
     
        <img src="${meal.image}" alt="${meal.name}" class="meal-image">

                <div class="meal-content">
                    <span class="meal-category">${meal.category}</span>
                    <h3 class="meal-title">${meal.name}</h3>
                    <p class="text-muted small">${meal.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="meal-price">$${meal.price}</div>
                        <button class="btn-delete" data-id="${meal.id}">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join("");

        // Attach delete listeners directly
        mealsList.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", function() {
                const id = parseInt(this.getAttribute("data-id"));
                deleteMeal(id);
            });
        });

        console.log(`📋 Displaying ${mealsArray.length} meals`);
    }


    function deleteMeal(id) {
        if (!confirm("Are you sure you want to delete this meal?")) return;

        // Call PHP to delete from database
        fetch("php/Meals.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "deleteMealId=" + encodeURIComponent(id)
        })
            .then(response => response.text())
            .then(data => {
                console.log(data); // debug output from PHP
                showNotification("🗑️ Meal deleted successfully!");
                // Reload the meals list or page
                window.location.reload();
            })
            .catch(err => {
                console.error("Error deleting meal:", err);
                alert("❌ Failed to delete meal. Check console.");
            });
    }




});

// Show notification (Global helper)
function showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #28a745;
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 9999;
        font-size: 18px;
        font-weight: bold;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = "slideUp 0.3s ease";
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

    // --- OFFERS LOGIC ---
// --- OFFERS LOGIC (DATABASE VERSION) ---
function initOffers(mealsData) {
    console.log("🎨 initOffers called with initial meals:", mealsData ? mealsData.length : 0);
    const mealSelect = document.getElementById("offerMealSelect");
    const addMealBtn = document.getElementById("addMealToOfferBtn");
    const selectedList = document.getElementById("selectedMealsList");
    const offerImageInput = document.getElementById("offerImage");
    const offerForm = document.getElementById("addOfferForm");
    const submitBtn = document.getElementById("btnSubmitOffer");

    // Internal state for selected logic
    let tempSelectedMealIds = [];

    // 1. Update meals dropdown
    function updateMealsDropdown(currentMeals) {
        console.log("🔄 updating meals dropdown with", currentMeals.length, "meals");
        if (mealSelect) {
            if (!currentMeals || currentMeals.length === 0) {
                mealSelect.innerHTML = "<option value=''>No meals available</option>";
            } else {
                let options = "<option value=''>Choose a meal...</option>";
                options += currentMeals.map(meal => `<option value="${meal.id}">${meal.name} ($${meal.price})</option>`).join("");
                mealSelect.innerHTML = options;
            }
        }
        mealsData = currentMeals;
    }

    // Initialize Dropdown Immediately
    updateMealsDropdown(mealsData);

    // 2. Render Selected List
    function renderSelectedList() {
        if (!selectedList) return;
        selectedList.innerHTML = "";

        tempSelectedMealIds.forEach(id => {
            const meal = mealsData.find(m => parseInt(m.id) === parseInt(id));
            if (meal) {
                const li = document.createElement("li");
                li.className = "list-group-item d-flex justify-content-between align-items-center";
                li.innerHTML = `
                    ${meal.name}
                    <button type="button" class="btn btn-sm btn-danger remove-meal-btn" data-id="${id}">
                        <i class="fa-solid fa-times"></i>
                    </button>
                `;
                selectedList.appendChild(li);
            }
        });

        // Attach remove listeners
        document.querySelectorAll(".remove-meal-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const idToRemove = parseInt(this.dataset.id);
                tempSelectedMealIds = tempSelectedMealIds.filter(id => id !== idToRemove);
                renderSelectedList();
            });
        });
    }

    // 3. Load & Render Offers from Database
    // 3. Load & Render Offers from Database
    function loadAndRenderOffers() {
        // Add showAll=1 parameter for admin panel
        fetch("php/Offers.php?getOffers=1&showAll=1")
            .then(res => res.json())
            .then(offers => {
                console.log("📦 Loaded offers:", offers); // Debug log
                renderExistingOffers(offers);
            })
            .catch(err => {
                console.error("Failed to load offers:", err);
                const offersList = document.getElementById("offersList");
                if (offersList) {
                    offersList.innerHTML = '<p class="text-danger text-center col-12">Failed to load offers.</p>';
                }
            });
    }

    function renderExistingOffers(offers) {
        const offersList = document.getElementById("offersList");
        if (!offersList) return;

        if (offers.length === 0) {
            offersList.innerHTML = '<p class="text-muted text-center col-12">No active offers.</p>';
            return;
        }

        offersList.innerHTML = offers.map(offer => `
            <div class="col-md-6 mb-3">
                <div class="card p-2 h-100 shadow-sm">
                    <div class="d-flex align-items-center">
                        <img src="${offer.image}" alt="${offer.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" class="me-3">
                        <div class="flex-grow-1">
                            <h5 class="mb-1">${offer.title}</h5>
                            <small class="text-muted d-block">${offer.discount}</small>
                            <small class="text-danger d-block">Ends: ${offer.deadline || 'No deadline'}</small>
                            <small class="text-info d-block">Meals: ${offer.mealIds.length}</small>
                        </div>
                        <button class="btn btn-outline-danger btn-sm delete-offer-btn" data-id="${offer.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join("");

        // Attach delete listeners
        document.querySelectorAll(".delete-offer-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const offerId = parseInt(this.dataset.id);
                deleteOffer(offerId);
            });
        });
    }

    // Delete offer from database
    function deleteOffer(offerId) {
        if (!confirm("Are you sure you want to delete this offer?")) return;

        fetch("php/Offers.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "deleteOfferId=" + encodeURIComponent(offerId)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification("🗑️ Offer deleted successfully!");
                    loadAndRenderOffers(); // Reload offers
                } else {
                    alert("❌ Failed to delete offer: " + data.message);
                }
            })
            .catch(err => {
                console.error("Error deleting offer:", err);
                alert("❌ Failed to delete offer. Check console.");
            });
    }

    // Initial load
    loadAndRenderOffers();

    // 4. Attach Event Listeners

    // Add Meal to Offer Button
    if (addMealBtn && mealSelect) {
        addMealBtn.onclick = function() {
            const selectedId = parseInt(mealSelect.value);
            if (!selectedId) return;

            if (tempSelectedMealIds.includes(selectedId)) {
                alert("Meal already added to this offer!");
                return;
            }

            tempSelectedMealIds.push(selectedId);
            renderSelectedList();
            mealSelect.value = "";
        };
    }

    // Image Preview
    if (offerImageInput) {
        offerImageInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById("offerImagePreview");
                    if(preview) {
                        preview.src = e.target.result;
                        preview.style.display = "block";
                    }
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // Prevent default form submission
    if (offerForm) {
        offerForm.onsubmit = function(e) {
            e.preventDefault();
        };
    }

    // Submit Button
    if (submitBtn) {
        submitBtn.onclick = function(e) {
            e.preventDefault();

            const title = document.getElementById("offerTitle").value.trim();
            const discount = document.getElementById("offerDiscount").value.trim();
            const deadline = document.getElementById("offerDeadline").value.trim();

            if (!title || !discount || !deadline) {
                alert("Please fill in all offer details");
                return;
            }

            const imageInput = document.getElementById("offerImage");
            if (!imageInput.files || !imageInput.files[0]) {
                alert("Please select an offer image.");
                return;
            }

            if (tempSelectedMealIds.length === 0) {
                alert("Please select at least one meal for this offer.");
                return;
            }

            const imageFile = imageInput.files[0];

            // Check image size
            if (imageFile.size > 2 * 1024 * 1024) {
                alert("⚠️ Image is too large (over 2MB). Please use a smaller image.");
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append("offerTitle", title);
            formData.append("offerDiscount", discount);
            formData.append("offerDeadline", deadline);
            formData.append("offerMealIds", JSON.stringify(tempSelectedMealIds));
            formData.append("offerImage", imageFile);

            // Submit to server
            fetch("php/Offers.php", {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showNotification("✅ Offer added successfully!");

                        // Reset form
                        if (offerForm) offerForm.reset();
                        tempSelectedMealIds = [];
                        renderSelectedList();
                        loadAndRenderOffers(); // Reload offers

                        const preview = document.getElementById("offerImagePreview");
                        if(preview) preview.style.display = "none";
                    } else {
                        alert("❌ Failed to add offer: " + data.message);
                    }
                })
                .catch(err => {
                    console.error("Error adding offer:", err);
                    alert("❌ Failed to add offer. Check console for details.");
                });
        };
    }

    // Return the update function
    return updateMealsDropdown;
}

// --- GALLERY MANAGEMENT ---
function initGalleryHooks() {
    initGalleryManager();
}

function initGalleryManager() {
    const galleryList = document.getElementById("galleryList");
    const deletedGalleryList = document.getElementById("deletedGalleryList");
    
    // Modal elements
    const deleteModalEl = document.getElementById('deletePhotoModal');
    let deletePhotoModal = null;
    if (deleteModalEl) {
        deletePhotoModal = new bootstrap.Modal(deleteModalEl, {
            keyboard: false
        });
    }

    const confirmDeleteBtn = document.getElementById('confirmDeletePhotoBtn');
    const deleteReasonInput = document.getElementById('deleteReason');
    let currentPhotoIdToDelete = null;

    // Render Active Photos from DB
    async function renderGalleryAdmin() {
        if (!galleryList) return;
        
        try {
            const response = await fetch("php/Gallery.php?action=getPhotos");
            const data = await response.json();
            
            if (data.status !== 'success') {
                galleryList.innerHTML = `<p class="text-danger text-center col-12">Error: ${data.message}</p>`;
                return;
            }

            const photos = data.photos || [];

            if (photos.length === 0) {
                galleryList.innerHTML = '<p class="text-muted text-center col-12">No photos in gallery.</p>';
                return;
            }

            galleryList.innerHTML = photos.map(photo => `
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${photo.image}" class="card-img-top" style="height: 150px; object-fit: cover;">
                        <div class="card-body p-2">
                            <small class="text-muted d-block mb-1">By: ${photo.uploadedBy || 'Unknown'}</small>
                            <p class="card-text small mb-2 text-truncate" title="${photo.caption || ''}">
                                ${photo.caption || '<em>No caption</em>'}
                            </p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-secondary"><i class="fa-solid fa-heart"></i> ${photo.likes_count || 0}</span>
                                <button class="btn btn-sm btn-danger delete-photo-btn" data-id="${photo.id}">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join("");

        } catch (error) {
            console.error("Error rendering gallery:", error);
            galleryList.innerHTML = '<p class="text-danger text-center col-12">Failed to load gallery.</p>';
        }
    }

    // Render Deleted Photos History from DB
    async function renderDeletedGalleryAdmin() {
        if (!deletedGalleryList) return;

        try {
            const response = await fetch("php/Gallery.php?action=getDeletedPhotos");
            const data = await response.json();

            if (data.status !== 'success') {
                deletedGalleryList.innerHTML = `<p class="text-danger text-center col-12">Error: ${data.message}</p>`;
                return;
            }

            const photos = data.photos || [];

            if (photos.length === 0) {
                deletedGalleryList.innerHTML = '<p class="text-muted text-center col-12">No deleted photos history.</p>';
                return;
            }

            deletedGalleryList.innerHTML = photos.map(photo => `
                <div class="col-md-3 col-sm-6 mb-4">
                    <div class="card h-100 shadow-sm border-danger" style="opacity: 0.8;">
                        <img src="${photo.image}" class="card-img-top" style="height: 150px; object-fit: cover; filter: grayscale(100%);">
                        <div class="card-body p-2">
                             <span class="badge bg-danger mb-2">Deleted</span>
                            <p class="card-text small mb-1 text-danger fw-bold">Note: ${photo.delete_reason || 'No reason provided'}</p>
                            <small class="text-muted d-block">Original Caption: ${photo.caption || 'None'}</small>
                            <small class="text-muted d-block" style="font-size: 10px;">Deleted on: ${photo.deleted_at ? new Date(photo.deleted_at).toLocaleString() : 'Date unknown'}</small>
                        </div>
                    </div>
                </div>
            `).join("");
        } catch (error) {
            console.error("Error rendering deleted gallery:", error);
            deletedGalleryList.innerHTML = '<p class="text-danger text-center col-12">Failed to load deleted history.</p>';
        }
    }

    // Use Event Delegation for Delete Buttons
    if (galleryList) {
        galleryList.addEventListener('click', function(e) {
            const btn = e.target.closest('.delete-photo-btn');
            if (btn) {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                console.log("🗑️ Delete requested for ID:", id);
                if (id) {
                    currentPhotoIdToDelete = id;
                    if (deleteReasonInput) deleteReasonInput.value = "";
                    if (deletePhotoModal) deletePhotoModal.show();
                }
            }
        });
    }

    // Confirm Delete Action
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async function() {
            if (!currentPhotoIdToDelete) return;

            const reason = deleteReasonInput ? deleteReasonInput.value.trim() : "No reason provided";
            console.log("Confirming delete for ID:", currentPhotoIdToDelete, "Reason:", reason);

            try {
                const formData = new FormData();
                formData.append("photoId", currentPhotoIdToDelete);
                formData.append("reason", reason);

                const response = await fetch("php/Gallery.php?action=deletePhoto", {
                    method: "POST",
                    body: formData
                });
                const data = await response.json();

                if (data.status === 'success') {
                    if (deletePhotoModal) deletePhotoModal.hide();
                    showNotification("🗑️ Photo deleted & archived.");
                    renderGalleryAdmin();
                    renderDeletedGalleryAdmin();
                } else {
                    alert("❌ Error deleting photo: " + data.message);
                }
            } catch (error) {
                console.error("Error deleting photo:", error);
                alert("❌ Failed to delete photo. Check console.");
            }
        });
    }

    // Initial render
    renderGalleryAdmin();
    renderDeletedGalleryAdmin();

    // Listen for tab switches
    const galleryTabs = document.getElementById('galleryTabs');
    if (galleryTabs) {
        galleryTabs.addEventListener('click', function(e) {
            if(e.target.id === 'deleted-photos-tab') {
                renderDeletedGalleryAdmin();
            } else if (e.target.id === 'active-photos-tab') {
                renderGalleryAdmin();
            }
        });
    }
}

// --- ANALYTICS DASHBOARD ---
async function initDashboard() {
    const dashboardContainer = document.getElementById("analyticsDashboard");
    if (!dashboardContainer) return;

    console.log("📊 Initializing Dashboard Analytics...");

    try {
        // Fetch bookings from database instead of localStorage
        const response = await fetch("php/Booking.php?action=getAllBookings");
        const result = await response.json();

        if (result.status === 'success') {
            const bookings = result.data || [];
            console.log(`📈 Received ${bookings.length} bookings from DB`);
            
            // Map DB fields to what renderCharts expects (if different)
            // DB has: booking_date, party_size
            // Mapping for consistency with existing renderCharts logic
            const mappedBookings = bookings.map(b => ({
                date: b.booking_date,
                size: b.party_size.toString()
            }));

            renderCharts(mappedBookings);
        } else {
            console.error("❌ Failed to fetch bookings for analytics:", result.message);
            dashboardContainer.innerHTML += `<div class="alert alert-danger mx-3">Error loading booking data: ${result.message}</div>`;
        }
    } catch (e) {
        console.error("Dashboard error", e);
    }
}

function renderCharts(bookings) {
     if (!bookings) bookings = [];

     // 1. Prepare Data for Trends (Bookings per Day)
    const bookingsByDate = {};
    bookings.forEach(b => {
        if (b.date) {
            bookingsByDate[b.date] = (bookingsByDate[b.date] || 0) + 1;
        }
    });

    const sortedDates = Object.keys(bookingsByDate).sort();
    const trendData = sortedDates.map(date => bookingsByDate[date]);

    // 2. Prepare Data for Party Size
    const bookingsBySize = { '2': 0, '3': 0, '4': 0, '5': 0 };
    bookings.forEach(b => {
        if (b.size && bookingsBySize[b.size] !== undefined) {
            bookingsBySize[b.size]++;
        }
    });

    // --- Render Trends Chart ---
    const ctxTrends = document.getElementById('bookingTrendsChart');
    if (ctxTrends && typeof Chart !== 'undefined') {
        new Chart(ctxTrends, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: 'Number of Bookings',
                    data: trendData,
                    borderColor: '#ffbe33',
                    backgroundColor: 'rgba(255, 190, 51, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    title: {
                        display: trendData.length === 0,
                        text: 'No bookings data available'
                    }
                }
            }
        });
    }

    // --- Render Party Size Chart ---
    const ctxSize = document.getElementById('partySizeChart');
    if (ctxSize && typeof Chart !== 'undefined') {
        new Chart(ctxSize, {
            type: 'doughnut',
            data: {
                labels: ['2 People', '3 People', '4 People', '5 People'],
                datasets: [{
                    data: [
                        bookingsBySize['2'],
                        bookingsBySize['3'],
                        bookingsBySize['4'],
                        bookingsBySize['5']
                    ],
                    backgroundColor: [
                        '#ffbe33',
                        '#222831',
                        '#dc3545',
                        '#28a745'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                         display: bookings.length === 0,
                         text: 'No data'
                    }
                }
            }
        });
    }

    // 3. Prepare Data for Top Selling Meals
    let orders = [];
    try {
        const ordersRaw = localStorage.getItem("restaurantOrders");
        if (ordersRaw) orders = JSON.parse(ordersRaw);
    } catch (e) {
        console.error("Error loading orders for stats:", e);
    }
    
    const mealSales = {};
    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const itemName = item.name; 
                if (itemName) {
                    mealSales[itemName] = (mealSales[itemName] || 0) + (item.quantity || 1);
                }
            });
        }
    });
    
    const sortedMeals = Object.entries(mealSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topMealLabels = sortedMeals.map(entry => entry[0]);
    const topMealData = sortedMeals.map(entry => entry[1]);

    const ctxTop = document.getElementById('topSellingChart');
    if (ctxTop && typeof Chart !== 'undefined') {
        new Chart(ctxTop, {
            type: 'bar',
            data: {
                labels: topMealLabels,
                datasets: [{
                    label: 'Units Sold',
                    data: topMealData,
                    backgroundColor: '#17a2b8',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    title: {
                        display: topMealData.length === 0,
                        text: 'No sales data available'
                    }
                }
            }
        });
    }
}
