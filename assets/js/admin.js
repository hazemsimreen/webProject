console.log("🚀 Admin Panel Loaded!");

// Load meals from localStorage or use default meals
function loadMeals() {
  const savedMeals = localStorage.getItem("restaurantMeals");

  if (savedMeals) {
    return JSON.parse(savedMeals);
  } else {
    // Default meals
    const defaultMeals = [
      {
        id: 1,
        name: "Delicious Pizza",
        price: 20,
        category: "pizza",
        image: "./assets/image/f1.png",
        description:
          "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
      },
      {
        id: 2,
        name: "Delicious Burger",
        price: 20,
        category: "burger",
        image: "./assets/image/f2.png",
        description:
          "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
      },
      {
        id: 3,
        name: "Delicious Pizza",
        price: 20,
        category: "pizza",
        image: "./assets/image/f3.png",
        description:
          "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
      },
      {
        id: 4,
        name: "Delicious Pasta",
        price: 20,
        category: "pasta",
        image: "./assets/image/f4.png",
        description:
          "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
      },
      {
        id: 5,
        name: "Delicious Fries",
        price: 20,
        category: "fries",
        image: "./assets/image/f5.png",
        description:
          "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
      },
      {
        id: 6,
        name: "Delicious Pizza",
        price: 20,
        category: "pizza",
        image: "./assets/image/f6.png",
        description:
          "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
      },
      {
        id: 7,
        name: "Tasty burger",
        price: 20,
        category: "burger",
        image: "./assets/image/f7.png",
        description:
          "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
      },
      {
        id: 8,
        name: "Delicious Burger",
        price: 20,
        category: "burger",
        image: "./assets/image/f8.png",
        description:
          "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
      },
      {
        id: 9,
        name: "Delicious Pasta",
        price: 20,
        category: "pasta",
        image: "./assets/image/f9.png",
        description:
          "Veniam debitis quaerat officiis quasi cupiditate quo, quisquam velit, magnam voluptatem repellendus sed eaque",
      },
    ];
    localStorage.setItem("restaurantMeals", JSON.stringify(defaultMeals));
    return defaultMeals;
  }
}

// Save meals to localStorage
function saveMeals(meals) {
  localStorage.setItem("restaurantMeals", JSON.stringify(meals));
  console.log("💾 Meals saved to localStorage");
}

// Initialize meals
let meals = loadMeals();

// Image preview functionality
document.getElementById("mealImage").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById("imagePreview");
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

// Add meal form submission
document.getElementById("addMealForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("mealName").value;
  const price = document.getElementById("mealPrice").value;
  const category = document.getElementById("mealCategory").value;
  const description = document.getElementById("mealDescription").value;
  const imageFile = document.getElementById("mealImage").files[0];

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
      document.getElementById("addMealForm").reset();
      document.getElementById("imagePreview").style.display = "none";

      // Show success message
      showNotification(
        "✅ Meal added successfully! It will appear on the main page."
      );

      console.log("✅ Meal added:", newMeal);
    };
    reader.readAsDataURL(imageFile);
  }
});

// Display all meals
function displayMeals() {
  const mealsList = document.getElementById("mealsList");

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

  mealsList.innerHTML = meals
    .map(
      (meal) => `
        <div class="col-md-4">
            <div class="meal-card">
                <img src="${meal.image}" alt="${meal.name}" class="meal-image">
                <div class="meal-content">
                    <span class="meal-category">${meal.category}</span>
                    <h3 class="meal-title">${meal.name}</h3>
                    <p class="text-muted small">${meal.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="meal-price">$${meal.price}</div>
                        <button class="btn-delete" onclick="deleteMeal(${meal.id})">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  console.log(`📋 Displaying ${meals.length} meals`);
}

// Delete meal function
function deleteMeal(id) {
  if (confirm("Are you sure you want to delete this meal?")) {
    meals = meals.filter((meal) => meal.id !== id);
    saveMeals(meals); // Save to localStorage
    displayMeals();
    showNotification("🗑️ Meal deleted successfully!");
    console.log(`🗑️ Meal ${id} deleted`);
  }
}

// Show notification
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

// Initialize the page
displayMeals();
initOffers();

console.log("✅ Admin Panel Ready!");

// --- OFFERS MANAGEMENT ---

function loadOffers() {
    const savedOffers = localStorage.getItem("restaurantOffers");
    return savedOffers ? JSON.parse(savedOffers) : [];
}

function saveOffers(offers) {
    localStorage.setItem("restaurantOffers", JSON.stringify(offers));
    console.log("💾 Offers saved to localStorage");
}

function initOffers() {
    const offers = loadOffers();
    const mealSelect = document.getElementById("offerMealSelect");
    const addMealBtn = document.getElementById("addMealToOfferBtn");
    const selectedList = document.getElementById("selectedMealsList");
    const offerImageInput = document.getElementById("offerImage");
    
    // Internal state for selected logic
    let tempSelectedMealIds = [];

    // Populate Meal Dropdown
    if (mealSelect) {
        if (meals.length === 0) {
            mealSelect.innerHTML = "<option value=''>No meals available</option>";
        } else {
            mealSelect.innerHTML = "<option value=''>Choose a meal...</option>" + 
                meals.map(meal => `<option value="${meal.id}">${meal.name} ($${meal.price})</option>`).join("");
        }
    }

    // Function to render the selected list
    function renderSelectedList() {
        if (!selectedList) return;
        selectedList.innerHTML = "";
        
        tempSelectedMealIds.forEach(id => {
            const meal = meals.find(m => m.id === id);
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

    // Function to render existing offers
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
                    deleteOffer(offerId);
                }
            });
        });
    }

    // Function to delete an offer
    function deleteOffer(id) {
        let currentOffers = loadOffers();
        currentOffers = currentOffers.filter(offer => offer.id !== id);
        saveOffers(currentOffers);
        renderExistingOffers();
        showNotification("🗑️ Offer deleted successfully");
    }

    // Initialize list
    renderExistingOffers();

    // Handle "Add" button click
    if (addMealBtn && mealSelect) {
        addMealBtn.addEventListener("click", function() {
            const selectedId = parseInt(mealSelect.value);
            if (!selectedId) return;

            if (tempSelectedMealIds.includes(selectedId)) {
                alert("Meal already added to this offer!");
                return;
            }

            tempSelectedMealIds.push(selectedId);
            renderSelectedList();
            mealSelect.value = ""; // Reset dropdown
        });
    }

    // Offer Image Preview
    if (offerImageInput) {
        offerImageInput.addEventListener("change", function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById("offerImagePreview");
                    preview.src = e.target.result;
                    preview.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle Offer Submit
    const offerForm = document.getElementById("addOfferForm");
    if (offerForm) {
        offerForm.addEventListener("submit", function(e) {
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
                        mealIds: tempSelectedMealIds, // Use the temp array
                        image: e.target.result
                    };

                    const currentOffers = loadOffers();
                    currentOffers.push(newOffer);
                    saveOffers(currentOffers);

                    // Reset
                    offerForm.reset();
                    tempSelectedMealIds = []; // Clear selected list
                    renderSelectedList();
                    renderExistingOffers(); // Update the list
                    document.getElementById("offerImagePreview").style.display = "none";
                    showNotification("✅ Offer added successfully!");
                    console.log("✅ Offer added:", newOffer);
                };
                reader.readAsDataURL(imageFile);
            }
        });
    }
}
// --- ANALYTICS DASHBOARD ---
function initDashboard() {
    const dashboardContainer = document.getElementById("analyticsDashboard");
    if (!dashboardContainer) return;

    // Load bookings
    const bookings = JSON.parse(localStorage.getItem("restaurantBookings") || "[]");

    // 1. Prepare Data for Trends (Bookings per Day)
    const bookingsByDate = {};
    bookings.forEach(b => {
        bookingsByDate[b.date] = (bookingsByDate[b.date] || 0) + 1;
    });

    // Sort dates
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
    if (ctxTrends) {
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
    if (ctxSize) {
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

    // 3. Prepare Data for Top Selling Meals
    const orders = JSON.parse(localStorage.getItem("restaurantOrders") || "[]");
    const mealSales = {};

    orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                // If it's a bundled offer, we could treat it as a single item "Offer: Name"
                // or break it down. Let's treat it by the item name.
                const itemName = item.name; 
                mealSales[itemName] = (mealSales[itemName] || 0) + item.quantity;
            });
        }
    });

    // Sort by sales count
    const sortedMeals = Object.entries(mealSales)
        .sort((a, b) => b[1] - a[1]) // Descending
        .slice(0, 5); // Top 5

    const topMealLabels = sortedMeals.map(entry => entry[0]);
    const topMealData = sortedMeals.map(entry => entry[1]);

    // --- Render Top Selling Chart ---
    const ctxTop = document.getElementById('topSellingChart');
    if (ctxTop) {
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

// Initializers
document.addEventListener("DOMContentLoaded", () => {
    initOffers();
    initDashboard();
});
