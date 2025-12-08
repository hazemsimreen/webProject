console.log("🚀 Admin Panel Loaded!");

document.addEventListener("DOMContentLoaded", () => {
    // Initialize meals
    let meals = loadMeals();
    displayMeals();
    
    // Initialize other sections
    initOffersHooks(meals);
    initGalleryHooks();
    initDashboard();

    // --- OFFERS MANAGEMENT EXPOSED ---
    let updateOfferMealsDropdown = null;

    function initOffersHooks(currentMeals) {
        // We only want to init logic ONCE, but we need a way to update the dropdown when meals change.
        // So we splits initOffers into init (once) and update (many times).
        if (!updateOfferMealsDropdown) {
             updateOfferMealsDropdown = initOffers(currentMeals); 
        } else {
             updateOfferMealsDropdown(currentMeals);
        }
    }
    
    // Make sure we have the update function available for other parts
    // We can't easily export it from inside DOMContentLoaded without global scope or better structure
    // But since everything is inside this closure, we can just hoist the variable `updateOfferMealsDropdown` 
    // defined above and assign it the result of initOffers.

    // ... But wait, initOffers returns the update function? Let's check initOffers implementation below.
    // We will refactor initOffers to return the update function.

    // Add meal form submission
    const addMealForm = document.getElementById("addMealForm");
    if (addMealForm) {
        addMealForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const nameInput = document.getElementById("mealName");
            const priceInput = document.getElementById("mealPrice");
            const categoryInput = document.getElementById("mealCategory");
            const descInput = document.getElementById("mealDescription");
            const imageInput = document.getElementById("mealImage");

            if (!nameInput || !priceInput || !categoryInput || !descInput || !imageInput) {
                console.error("Missing form elements");
                return;
            }

            const name = nameInput.value;
            const price = priceInput.value;
            const category = categoryInput.value;
            const description = descInput.value;
            const imageFile = imageInput.files[0];

            if (imageFile) {
                // Check size (2MB limit check loosely)
                if (imageFile.size > 2 * 1024 * 1024) {
                    alert("⚠️ Image is too large (over 2MB). Please use a smaller image to avoid storage issues.");
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    const newMeal = {
                        id: Date.now(),
                        name: name,
                        price: parseFloat(price),
                        category: category,
                        image: e.target.result,
                        description: description,
                    };

                    try {
                        meals.push(newMeal);
                        saveMeals(meals); // Save to localStorage
                        
                        displayMeals();
                        
                        // Update offers dropdown
                        if (updateOfferMealsDropdown) updateOfferMealsDropdown(meals);

                        // Reset form
                        addMealForm.reset();
                        const preview = document.getElementById("imagePreview");
                        if (preview) preview.style.display = "none";

                        // Show success message
                        showNotification("✅ Meal added successfully!");
                        console.log("✅ Meal added:", newMeal);
                    } catch (err) {
                        console.error("Storage Error:", err);
                        if (err.name === "QuotaExceededError" || err.message.includes("quota")) {
                            alert("❌ Storage Full! Cannot save this meal. The image might be too large. Try a smaller image or delete old items.");
                            // Rollback
                            meals.pop(); 
                        } else {
                            alert("❌ Error saving meal: " + err.message);
                        }
                    }
                };
                reader.onerror = function() {
                    alert("Error reading file");
                };
                reader.readAsDataURL(imageFile);
            } else {
                alert("Please select an image for the meal.");
            }
        });
    }
    
    // --- Helper Functions in Scope ---

    // Load meals from localStorage or use default meals
    function loadMeals() {
        try {
            const savedMeals = localStorage.getItem("restaurantMeals");
            if (savedMeals) {
                return JSON.parse(savedMeals);
            }
        } catch (error) {
            console.error("Error parsing meals from localStorage:", error);
            // Reset if corrupted
            localStorage.removeItem("restaurantMeals");
        }

        // Default meals
        const defaultMeals = [
            {
                id: 1,
                name: "Delicious Pizza",
                price: 20,
                category: "pizza",
                image: "./assets/image/f1.png",
                description: "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
            },
            {
                id: 2,
                name: "Delicious Burger",
                price: 20,
                category: "burger",
                image: "./assets/image/f2.png",
                description: "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
            },
            {
                id: 3,
                name: "Delicious Pizza",
                price: 20,
                category: "pizza",
                image: "./assets/image/f3.png",
                description: "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
            },
            {
                id: 4,
                name: "Delicious Pasta",
                price: 20,
                category: "pasta",
                image: "./assets/image/f4.png",
                description: "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
            },
            {
                id: 5,
                name: "Delicious Fries",
                price: 20,
                category: "fries",
                image: "./assets/image/f5.png",
                description: "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
            },
        ];
        saveMeals(defaultMeals);
        return defaultMeals;
    }

    // Save meals to localStorage
    function saveMeals(data) {
        // This logic is now wrapped in try/catch in the caller, but good to have here too optionally.
        // Letting caller handle it allows for rollback logic.
        localStorage.setItem("restaurantMeals", JSON.stringify(data));
        console.log("💾 Meals saved to localStorage");
    }

    // Display all meals
    function displayMeals() {
        const mealsList = document.getElementById("mealsList");
        if (!mealsList) return;

        if (meals.length === 0) {
            mealsList.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="fa-solid fa-utensils"></i>
                    <h3>No meals available</h3>
                    <p>Start by adding new meals from above</p>
                </div>
            `;
            return;
        }

        mealsList.innerHTML = meals.map(meal => `
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
        
        console.log(`📋 Displaying ${meals.length} meals`);
    }

    // Delete meal function
    function deleteMeal(id) {
        if (confirm("Are you sure you want to delete this meal?")) {
            meals = meals.filter(meal => meal.id !== id);
            saveMeals(meals); // Save to localStorage
            displayMeals();
            // Also update offers dropdown 
            if (updateOfferMealsDropdown) updateOfferMealsDropdown(meals); 
            showNotification("🗑️ Meal deleted successfully!");
            console.log(`🗑️ Meal ${id} deleted`);
        }
    }

    // --- OFFERS MANAGEMENT ---
    function initOffersHooks(currentMeals) {
        initOffers(currentMeals);
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

        // 1. Define the update function
        function updateMealsDropdown(currentMeals) {
            console.log("🔄 updating meals dropdown with", currentMeals.length, "meals");
            if (mealSelect) {
                if (!currentMeals || currentMeals.length === 0) {
                    mealSelect.innerHTML = "<option value=''>No meals available</option>";
                } else {
                    // Start with default option
                    let options = "<option value=''>Choose a meal...</option>";
                    // Append meal options
                    options += currentMeals.map(meal => `<option value="${meal.id}">${meal.name} ($${meal.price})</option>`).join("");
                    mealSelect.innerHTML = options;
                }
            }
            // Also refresh internal reference if needed, but currentMeals are passed by value/ref so strict reliance is better
            mealsData = currentMeals; 
        }

        // Initialize Dropdown Immediately
        updateMealsDropdown(mealsData);

        // 2. Render Selected List
        function renderSelectedList() {
            if (!selectedList) return;
            selectedList.innerHTML = "";
            
            tempSelectedMealIds.forEach(id => {
                // Find from latest mealsData
                const meal = mealsData.find(m => m.id === id);
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

        // 3. Load & Render Offers
        function loadOffers() {
            try {
                const savedOffers = localStorage.getItem("restaurantOffers");
                return savedOffers ? JSON.parse(savedOffers) : [];
            } catch (e) {
                console.error("Error loading offers:", e);
                return [];
            }
        }

        function saveOffers(offers) {
            localStorage.setItem("restaurantOffers", JSON.stringify(offers));
        }

        function renderExistingOffers() {
            const offersList = document.getElementById("offersList");
            if (!offersList) return;
            
            const currentOffers = loadOffers();
            
            if (currentOffers.length === 0) {
                 offersList.innerHTML = '<p class="text-muted text-center col-12">No active offers.</p>';
                 return;
            }

            offersList.innerHTML = currentOffers.map(offer => `
                <div class="col-md-6 mb-3">
                    <div class="card p-2 h-100 shadow-sm">
                        <div class="d-flex align-items-center">
                            <img src="${offer.image}" alt="${offer.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" class="me-3">
                            <div class="flex-grow-1">
                                <h5 class="mb-1">${offer.title}</h5>
                                <small class="text-muted d-block">${offer.discount}</small>
                                <small class="text-danger d-block">Ends: ${offer.deadline || 'No deadline'}</small>
                            </div>
                            <button class="btn btn-outline-danger btn-sm delete-offer-btn" data-id="${offer.id}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join("");

            // Attach event listeners for delete buttons
            document.querySelectorAll(".delete-offer-btn").forEach(btn => {
                btn.addEventListener("click", function() {
                    const offerId = parseInt(this.dataset.id);
                    if (confirm("Are you sure you want to delete this offer?")) {
                        let offers = loadOffers();
                        offers = offers.filter(o => o.id !== offerId);
                        saveOffers(offers);
                        renderExistingOffers();
                        showNotification("🗑️ Offer deleted successfully");
                    }
                });
            });
        }

        renderExistingOffers();

        // 4. Attach Static Listeners (ONLY ONCE)
        
        // Add Meal to Offer Button
        if (addMealBtn && mealSelect) {
            // Use onclick to ensure we don't stack listeners if init is called again (though we designed around that)
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

        // Submit Button
        if (offerForm) {
            offerForm.onsubmit = function(e) {
                e.preventDefault();
            };
        }

        if (submitBtn) {
            submitBtn.onclick = function(e) {
                e.preventDefault();
                
                try {
                    const title = document.getElementById("offerTitle").value;
                    const discount = document.getElementById("offerDiscount").value;
                    const deadline = document.getElementById("offerDeadline").value;
                    
                    if (!title || !discount || !deadline) {
                        alert("Please fill in all offer details");
                        return;
                    }

                    const imageInput = document.getElementById("offerImage");
                    if (!imageInput.files || !imageInput.files[0]) {
                        alert("Please select an offer image.");
                        return;
                    }
                    const imageFile = imageInput.files[0];

                    if (tempSelectedMealIds.length === 0) {
                        alert("Please select at least one meal for this offer.");
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const newOffer = {
                            id: Date.now(),
                            title: title,
                            discount: discount,
                            deadline: deadline,
                            mealIds: tempSelectedMealIds,
                            image: e.target.result
                        };

                        try {
                            const currentOffers = loadOffers();
                            currentOffers.push(newOffer);
                            saveOffers(currentOffers);

                            // Reset
                            if (offerForm) offerForm.reset();
                            tempSelectedMealIds = []; 
                            renderSelectedList();
                            renderExistingOffers();
                            
                            const preview = document.getElementById("offerImagePreview");
                            if(preview) preview.style.display = "none";
                            
                            showNotification("✅ Offer added successfully!");
                        } catch (err) {
                             if (err.name === "QuotaExceededError" || err.message.includes("quota")) {
                                 alert("❌ Storage Full! Offer image might be too large. Try a smaller image or delete old items.");
                                 // Rollback
                                 currentOffers.pop();
                             } else {
                                 console.error(err);
                                 alert("❌ Error saving offer: " + err.message);
                             }
                        }
                    };
                    reader.readAsDataURL(imageFile);
                } catch (err) {
                    console.error("❌ Add Offer Error:", err);
                    alert("An error occurred. Check console.");
                }
            };
        }

        // Return the update function so we can call it from outside
        return updateMealsDropdown;
    }

// --- GALLERY MANAGEMENT ---
function initGalleryHooks() {
    initGalleryManager();
}

function initGalleryManager() {
    const galleryList = document.getElementById("galleryList");
    const deletedGalleryList = document.getElementById("deletedGalleryList");

    // Load active photos
    function loadGallery() {
        try {
            return JSON.parse(localStorage.getItem("customerPhotos") || "[]");
        } catch (e) {
            console.error("Error loading gallery:", e);
            return [];
        }
    }

    // Load deleted photos
    function loadDeletedGallery() {
        try {
            return JSON.parse(localStorage.getItem("deletedCustomerPhotos") || "[]");
        } catch (e) {
            console.error("Error loading deleted gallery:", e);
            return [];
        }
    }

    // Save active photos
    function saveGallery(photos) {
        localStorage.setItem("customerPhotos", JSON.stringify(photos));
    }

    // Save deleted photos
    function saveDeletedGallery(photos) {
        localStorage.setItem("deletedCustomerPhotos", JSON.stringify(photos));
    }

    // Render Active Photos
    function renderGalleryAdmin() {
        if (!galleryList) return;
        const photos = loadGallery();

        if (photos.length === 0) {
            galleryList.innerHTML = '<p class="text-muted text-center col-12">No photos in gallery.</p>';
            return;
        }

        galleryList.innerHTML = photos.map(photo => `
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm">
                    <img src="${photo.image}" class="card-img-top" style="height: 150px; object-fit: cover;">
                    <div class="card-body p-2">
                        <small class="text-muted d-block mb-1">By: ${photo.uploadedBy}</small>
                        <p class="card-text small mb-2 text-truncate" title="${photo.caption || ''}">
                            ${photo.caption || '<em>No caption</em>'}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-secondary"><i class="fa-solid fa-heart"></i> ${photo.likes}</span>
                            <button class="btn btn-sm btn-danger delete-photo-btn" data-id="${photo.id}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");

        // Attach listeners
        galleryList.querySelectorAll(".delete-photo-btn").forEach(btn => {
            btn.addEventListener("click", function() {
                const id = parseInt(this.dataset.id);
                deletePhoto(id);
            });
        });
    }

    // Render Deleted Photos History
    function renderDeletedGalleryAdmin() {
        if (!deletedGalleryList) return;
        const photos = loadDeletedGallery();

        if (photos.length === 0) {
            deletedGalleryList.innerHTML = '<p class="text-muted text-center col-12">No deleted photos history.</p>';
            return;
        }

        // Sort by deleted date descending
        photos.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

        deletedGalleryList.innerHTML = photos.map(photo => `
            <div class="col-md-3 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm border-danger" style="opacity: 0.8;">
                    <img src="${photo.image}" class="card-img-top" style="height: 150px; object-fit: cover; filter: grayscale(100%);">
                    <div class="card-body p-2">
                         <span class="badge bg-danger mb-2">Deleted</span>
                        <p class="card-text small mb-1 text-danger fw-bold">Note: ${photo.deleteReason}</p>
                        <small class="text-muted d-block">Original Caption: ${photo.caption || 'None'}</small>
                        <small class="text-muted d-block" style="font-size: 10px;">Deleted on: ${new Date(photo.deletedAt).toLocaleString()}</small>
                    </div>
                </div>
            </div>
        `).join("");
    }

    // Delete Photo Logic
    function deletePhoto(id) {
        // 1. Prompt for reason
        const reason = prompt("⚠️ Why are you deleting this photo? (This note will be saved)");
        if (reason === null) return; // Cancelled
        const finalReason = reason.trim() || "No reason provided";

        // 2. Move from active to deleted
        const activePhotos = loadGallery();
        const photoIndex = activePhotos.findIndex(p => p.id === id);
        
        if (photoIndex === -1) {
            showNotification("❌ Photo not found!");
            return;
        }

        const photoToDelete = activePhotos[photoIndex];
        
        // Add metadata
        photoToDelete.deletedAt = new Date().toISOString();
        photoToDelete.deleteReason = finalReason;

        // Save to deleted list
        const deletedPhotos = loadDeletedGallery();
        deletedPhotos.push(photoToDelete);
        saveDeletedGallery(deletedPhotos);

        // Remove from active list
        activePhotos.splice(photoIndex, 1);
        saveGallery(activePhotos);

        // 3. Refresh UI
        renderGalleryAdmin();
        renderDeletedGalleryAdmin();
        showNotification("🗑️ Photo deleted & archived.");
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
function initDashboard() {
    const dashboardContainer = document.getElementById("analyticsDashboard");
    if (!dashboardContainer) return;

    try {
        const bookings = JSON.parse(localStorage.getItem("restaurantBookings") || "[]");
        // ... (Charts logic kept similar but wrapped)
        
        // Simplified for brevity in this rewrite, assuming Chart.js works
        // The original logic was fine, just need to be inside DOMContentLoaded
        renderCharts(bookings);
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
