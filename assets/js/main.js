console.log("🚀 main.js loaded!");

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM Ready!");

  // ============= LOAD MEALS FROM LOCALSTORAGE =============
  function loadMealsFromStorage() {
    const savedMeals = localStorage.getItem("restaurantMeals");
    if (savedMeals) {
      const meals = JSON.parse(savedMeals);
      renderMeals(meals);
      console.log(`📦 Loaded ${meals.length} meals from localStorage`);
    }
  }

  // ============= RENDER MEALS =============
  function renderMeals(meals) {
    const menuContainer = document.querySelector(".menuContnts .row");
    if (!menuContainer) return;

    // Clear existing meals
    menuContainer.innerHTML = "";

    // Add all meals from localStorage
    meals.forEach((meal) => {
      const mealCard = `
        <div class="col menu-item" data-category="${meal.category}" data-id="${meal.id}">
          <div class="card h-100 bg-dark">
            <div class="cardImage">
              <img src="${meal.image}" class="card-img-top" alt="${meal.name}">
            </div>
            <div class="card-body bg-dark text-white py-3">
              <h5 class="card-title py-2">${meal.name}</h5>
              <p class="card-text">${meal.description}</p>
              <div class="cardFooter py-3">
                <h6>$${meal.price}</h6>
                <button type="button" class="cardIcon add-to-cart-btn">
                  <i class="fa-solid fa-cart-shopping text-white mx-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      menuContainer.insertAdjacentHTML("beforeend", mealCard);
    });
    
    // No need to re-attach listeners with Event Delegation!
    attachFilterListeners();
  }

  // ============= MENU FILTER =============
  function attachFilterListeners() {
    const categoryButtons = document.querySelectorAll(".category");

    categoryButtons.forEach((button) => {
      button.addEventListener("click", function () {
        categoryButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        const filter = this.getAttribute("data-filter");
        const menuItems = document.querySelectorAll(".menu-item");

        menuItems.forEach((item) => {
          if (
            filter === "all" ||
            item.getAttribute("data-category") === filter
          ) {
            item.style.display = "block";
          } else {
            item.style.display = "none";
          }
        });
      });
    });
  }

  // Initial filter setup
  attachFilterListeners();

  // ============= REVIEWS SYSTEM =============
  const openBtn = document.getElementById("openBtn");
  const doneBtn = document.getElementById("doneReview");
  const textArea = document.getElementById("messageBox");
  const showingText = document.getElementById("showingText");

  if (showingText) showingText.style.display = "none";

  if (openBtn) {
    openBtn.addEventListener("click", () => {
      showingText.style.display =
        showingText.style.display === "none" ? "block" : "none";
    });
  }

  if (doneBtn) {
    doneBtn.addEventListener("click", () => {
      const reviewText = textArea.value.trim();
      if (!reviewText) {
        alert("Please write your review!");
        return;
      }

      const carouselInner = document.querySelector(
        "#carouselExampleIndicators .carousel-inner"
      );
      const newItem = document.createElement("div");
      newItem.classList.add("carousel-item", "active");
      newItem.innerHTML = `
        <div class="row justify-content-center">
          <div class="col-md-5 mb-3">
            <div class="card bg-dark text-white">
              <div class="card-body">
                <p class="card-text">${reviewText
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")}</p>
                <h6>Anonymous</h6>
                <p class="card-text">New Review</p>
              </div>
            </div>
          </div>
        </div>
      `;

      const activeItem = carouselInner.querySelector(".active");
      if (activeItem) activeItem.classList.remove("active");

      carouselInner.appendChild(newItem);
      textArea.value = "";
      showingText.style.display = "none";
    });
  }

  // ============= CART SYSTEM =============
  console.log("🛒 Loading cart system...");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function addToCart(itemData) {
    console.log("➕ Adding to cart:", itemData);

    const existingItem = cart.find((item) => item.id == itemData.id);

    if (existingItem) {
      existingItem.quantity += 1;
      showNotification("✅ Quantity increased!");
    } else {
      cart.push({
        id: itemData.id,
        name: itemData.name,
        price: itemData.price,
        image: itemData.image,
        description: itemData.description,
        category: itemData.category,
        quantity: 1,
      });
      showNotification("🛒 Added to cart!");
    }

    try {
        localStorage.setItem("cart", JSON.stringify(cart));
        console.log("💾 Cart saved:", cart);
        updateCartCount();
    } catch (e) {
        if (e.name === "QuotaExceededError") {
            alert("⚠️ Cannot add more items! LocalStorage is full (likely due to large images). Try clearing your cart.");
            // Rollback
            if (!existingItem) cart.pop();
            else existingItem.quantity -= 1;
        } else {
             console.error("Storage error:", e);
        }
    }
  }

  function showNotification(message) {
    // Remove old notification if exists
    const oldNotification = document.querySelector(".cart-notification");
    if (oldNotification) oldNotification.remove();

    const notification = document.createElement("div");
    notification.className = "cart-notification";
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
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
    }, 2000);
  }

  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartIcon = document.querySelector(".fa-cart-shopping");

    if (!cartIcon) return;

    let badge = cartIcon.parentElement.querySelector(".cart-badge");

    if (totalItems > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "cart-badge";
        badge.style.cssText = `
          position: absolute;
          top: -8px;
          right: -8px;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
        `;
        cartIcon.parentElement.style.position = "relative";
        cartIcon.parentElement.appendChild(badge);
      }
      badge.textContent = totalItems;
    } else if (badge) {
      badge.remove();
    }
  }

  // ============= EVENT DELEGATION FOR CART BUTTONS =============
  // This ensures clicks work for BOTH static and dynamically added items
  document.addEventListener("click", function(e) {
    const btn = e.target.closest(".add-to-cart-btn");
    
    if (btn) {
        e.preventDefault();
        console.log(`🖱️ Cart button clicked`);

        const menuItem = btn.closest(".menu-item");
        if (!menuItem) {
          console.error("❌ Menu item not found!");
          return;
        }

        const card = menuItem.querySelector(".card");
        const mealId = menuItem.dataset.id;

        // Get meal data from localStorage to ensure we have the correct image
        const savedMeals = localStorage.getItem("restaurantMeals");
        let mealData = null;

        if (savedMeals) {
          const meals = JSON.parse(savedMeals);
          mealData = meals.find((meal) => meal.id == mealId);
        }

        // Use meal data from localStorage if available, otherwise get from DOM
        const itemData = {
          id: mealId,
          name: mealData
            ? mealData.name
            : card.querySelector(".card-title").textContent.trim(),
          price: mealData
            ? mealData.price
            : parseFloat(
                card
                  .querySelector(".cardFooter h6")
                  .textContent.replace("$", "")
                  .trim()
              ),
          image: mealData ? null : card.querySelector(".card-img-top").src,
          description: mealData
            ? mealData.description
            : card.querySelector(".card-text").textContent.trim(),
          category: mealData ? mealData.category : menuItem.dataset.category,
        };

        console.log("📦 Adding item to cart:", itemData);
        addToCart(itemData);

        // Visual feedback
        btn.style.transform = "scale(0.9)";
        setTimeout(() => {
          btn.style.transform = "scale(1)";
        }, 150);
    }
  });


  // Initialize cart count
  updateCartCount();

  // Load meals from localStorage
  loadMealsFromStorage();

  // Add animations CSS
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    .cardIcon {
      transition: transform 0.2s ease;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // ============= DISCOUNT SYSTEM =============
  const discountBtns = document.querySelectorAll(".discount .btn");
  discountBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const name = this.dataset.name;
      const price = parseFloat(this.dataset.price);
      const discount = parseFloat(this.dataset.discount);
      
      if (!name || isNaN(price)) return;

      const finalPrice = price - (price * discount) / 100;

      const itemData = {
        id: this.dataset.id,
        name: name,
        price: parseFloat(finalPrice.toFixed(2)),
        image: this.dataset.image,
        description: `Special Deal: ${discount}% Off!`,
        category: "offer",
      };

      addToCart(itemData);

      // Button feedback
      const originalText = this.innerHTML;
      this.textContent = "Added!";
      setTimeout(() => {
        this.innerHTML = originalText;
      }, 1000);
    });
  });

  console.log("✅ Cart system ready!");
  console.log("✅ Meals loading system ready!");
});
