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

console.log("✅ Admin Panel Ready!");
