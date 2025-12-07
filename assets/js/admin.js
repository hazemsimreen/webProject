console.log("🚀 Admin Panel Loaded!");

document.addEventListener("DOMContentLoaded", () => {
    // Initialize meals
    let meals = loadMeals();
    displayMeals();
    initOffersHooks(meals); // Pass meals to offers logic
    initDashboard();

    // Image preview functionality
    const mealImageInput = document.getElementById("mealImage");
    if (mealImageInput) {
        mealImageInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const preview = document.getElementById("imagePreview");
                    if (preview) {
                        preview.src = e.target.result;
                        preview.style.display = "block";
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

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

                    meals.push(newMeal);
                    saveMeals(meals); // Save to localStorage
                    displayMeals();

                    // Reset form
                    addMealForm.reset();
                    const preview = document.getElementById("imagePreview");
                    if (preview) preview.style.display = "none";

                    // Show success message
                    showNotification("✅ Meal added successfully!");
                    console.log("✅ Meal added:", newMeal);
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
            // Also update offers dropdown if needed by re-initializing or filtering
            initOffersHooks(meals); 
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
    const mealSelect = document.getElementById("offerMealSelect");
    const addMealBtn = document.getElementById("addMealToOfferBtn");
    const selectedList = document.getElementById("selectedMealsList");
    const offerImageInput = document.getElementById("offerImage");
    
    // Internal state for selected logic
    let tempSelectedMealIds = [];

    // Populate Meal Dropdown
    if (mealSelect) {
        if (!mealsData || mealsData.length === 0) {
            mealSelect.innerHTML = "<option value=''>No meals available</option>";
        } else {
            mealSelect.innerHTML = "<option value=''>Choose a meal...</option>" + 
                mealsData.map(meal => `<option value="${meal.id}">${meal.name} ($${meal.price})</option>`).join("");
        }
    }

    // Function to render the selected list
    function renderSelectedList() {
        if (!selectedList) return;
        selectedList.innerHTML = "";
        
        tempSelectedMealIds.forEach(id => {
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

    // Function to load and render existing offers
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

    // Initialize list
    renderExistingOffers();

    // Remove old listeners if any by cloning (simple trick) or just rely on fresh init if script reloads?
    // Since we are in an event listener, we should be careful about duplicate listeners if this function is called multiple times.
    // Ideally, we handle the button click listener carefully.
    
    // Handle "Add Meal to Offer" button click
    // To prevent duplicate listeners, we can use a flag or just replace the node locally, but simpler to just ensure this run once.
    // We will assume initOffers is called once per page load.
    
    if (addMealBtn && mealSelect) {
        // Remove old listener if exists (not easy without reference), but assuming fresh load:
        addMealBtn.onclick = function() { // use onclick to overwrite
            const selectedId = parseInt(mealSelect.value);
            if (!selectedId) return;

            if (tempSelectedMealIds.includes(selectedId)) {
                alert("Meal already added to this offer!");
                return;
            }

            tempSelectedMealIds.push(selectedId);
            renderSelectedList();
            mealSelect.value = ""; // Reset dropdown
        };
    }

    // Offer Image Preview
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

    // Handle Offer Submit
    const offerForm = document.getElementById("addOfferForm");
    if (offerForm) {
        offerForm.onsubmit = function(e) {
            e.preventDefault();
            
            const title = document.getElementById("offerTitle").value;
            const discount = document.getElementById("offerDiscount").value;
            const deadline = document.getElementById("offerDeadline").value;
            const imageFile = document.getElementById("offerImage").files[0];

            if (tempSelectedMealIds.length === 0) {
                alert("Please select at least one meal for this offer.");
                return;
            }

            if (imageFile) {
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

                    const currentOffers = loadOffers();
                    currentOffers.push(newOffer);
                    saveOffers(currentOffers);

                    // Reset
                    offerForm.reset();
                    tempSelectedMealIds = []; 
                    renderSelectedList();
                    renderExistingOffers();
                    const preview = document.getElementById("offerImagePreview");
                    if(preview) preview.style.display = "none";
                    showNotification("✅ Offer added successfully!");
                };
                reader.readAsDataURL(imageFile);
            }
        };
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
     // 1. Prepare Data for Trends (Bookings per Day)
    const bookingsByDate = {};
    bookings.forEach(b => {
        bookingsByDate[b.date] = (bookingsByDate[b.date] || 0) + 1;
    });

    const sortedDates = Object.keys(bookingsByDate).sort();
    const trendData = sortedDates.map(date => bookingsByDate[date]);

    // 2. Prepare Data for Party Size
    const bookingsBySize = { '2': 0, '3': 0, '4': 0, '5': 0 };
    bookings.forEach(b => {
        if (bookingsBySize[b.size] !== undefined) {
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
                maintainAspectRatio: false
            }
        });
    }

    // 3. Prepare Data for Top Selling Meals (Mock logic from before)
     const ordersRaw = localStorage.getItem("restaurantOrders");
     const orders = ordersRaw ? JSON.parse(ordersRaw) : [];
    
    // ... logic for top selling ...
    const mealSales = {};
    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const itemName = item.name; 
                mealSales[itemName] = (mealSales[itemName] || 0) + item.quantity;
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
                }
            }
        });
    }
}
