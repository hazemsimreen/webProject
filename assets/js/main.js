console.log("🚀 main.js loaded!");

document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM Ready!");

    let allMeals = [];
    let filtersAttached = false;

    // ============= LOAD MEALS FROM DATABASE =============
    function loadMealsFromDB() {
        // Skip rendering on index.html - looping-slider.js handles it
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            console.log('📍 On index page - looping-slider.js will handle meal rendering');
            return;
        }

        // Fetch meals from database
        fetch("php/Meals.php?getMeals=1")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch meals');
                }
                return res.json();
            })
            .then(data => {
                if (data.length === 0) {
                    console.log("⚠️ No meals found in database");
                    const menuContainer = document.querySelector(".menuContnts .row");
                    if (menuContainer) {
                        menuContainer.innerHTML = `
                        <div class="col-12 text-center text-white py-5">
                            <i class="fa-solid fa-utensils fa-3x mb-3"></i>
                            <h3>No meals available</h3>
                            <p>Check back soon for delicious meals!</p>
                        </div>
                    `;
                    }
                    return;
                }

                allMeals = data; // Store meals globally
                renderMeals(data);

                // Only attach filters once
                if (!filtersAttached) {
                    attachFilterListeners();
                    filtersAttached = true;
                }

                console.log(`📦 Loaded ${data.length} meals from database`);
            })
            .catch(err => {
                console.error("❌ Failed to load meals:", err);
                const menuContainer = document.querySelector(".menuContnts .row");
                if (menuContainer) {
                    menuContainer.innerHTML = `
                    <div class="col-12 text-center text-white py-5">
                        <i class="fa-solid fa-exclamation-triangle fa-3x mb-3"></i>
                        <h3>Failed to load meals</h3>
                        <p>Please try again later.</p>
                    </div>
                `;
                }
            });
    }

    // ============= RENDER MEALS =============
    function renderMeals(meals) {
        const menuContainer = document.querySelector(".menuContnts .row");
        if (!menuContainer) return;

        // Clear existing meals
        menuContainer.innerHTML = "";

        if (meals.length === 0) {
            menuContainer.innerHTML = `
                <div class="col-12 text-center text-white py-5">
                    <i class="fa-solid fa-search fa-3x mb-3"></i>
                    <h3>No meals found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
            return;
        }

        // Add all meals from database
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
    }

    function attachFilterListeners() {
        const categoryButtons = document.querySelectorAll(".category");
        const searchInput = document.getElementById("menuSearch");
        const priceFilter = document.getElementById("priceFilter");

        console.log("🔘 Attaching filters to", categoryButtons.length, "category buttons");

        function applyFilters() {
            const activeCategoryBtn = document.querySelector(".category.active");
            const category = activeCategoryBtn ? activeCategoryBtn.getAttribute("data-filter") : "all";

            const searchText = searchInput ? searchInput.value.toLowerCase().trim() : "";
            const maxPrice = priceFilter ? parseFloat(priceFilter.value) : 10000;

            console.log("🔍 Filtering - Category:", category, "Search:", searchText, "Max Price:", maxPrice);

            // Filter from allMeals array instead of DOM manipulation
            let filteredMeals = allMeals;

            // Apply category filter
            if (category !== "all") {
                filteredMeals = filteredMeals.filter(meal => meal.category === category);
            }

            // Apply search filter
            if (searchText) {
                filteredMeals = filteredMeals.filter(meal =>
                    meal.name.toLowerCase().includes(searchText)
                );
            }

            // Apply price filter
            if (maxPrice < 10000) {
                filteredMeals = filteredMeals.filter(meal => parseFloat(meal.price) <= maxPrice);
            }

            // Re-render with filtered meals
            renderMeals(filteredMeals);

            console.log(`✅ Filtered: ${filteredMeals.length} of ${allMeals.length} meals`);
        }

        // 1. Category Click
        categoryButtons.forEach((button) => {
            button.addEventListener("click", function () {
                console.log("📂 Category clicked:", this.getAttribute("data-filter"));
                categoryButtons.forEach((btn) => btn.classList.remove("active"));
                this.classList.add("active");
                applyFilters();
            });
        });

        // 2. Search Input
        if (searchInput) {
            searchInput.addEventListener("input", applyFilters);
        }

        // 3. Price Filter
        if (priceFilter) {
            priceFilter.addEventListener("change", applyFilters);
        }
    }

    // START: Load meals from database
    loadMealsFromDB();






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
        ...itemData,
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
  loadMealsFromDB();

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

  // ============= OFFERS SYSTEM =============
    // Load offers from database
    // ============= OFFERS SYSTEM =============
// Load offers from database
    function loadOffers() {
        const container = document.getElementById("offersContainer");
        if (!container) return;

        // Fetch offers from database (only active offers for customers)
        fetch("php/Offers.php?getOffers=1")
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch offers');
                return res.json();
            })
            .then(offers => {
                container.innerHTML = "";

                if (offers.length === 0) {
                    container.innerHTML = "<p class='text-center text-white'>No special offers at the moment.</p>";
                    return;
                }

                offers.forEach(offer => {
                    const card = `
          <div class="col-md-6 mb-4">
              <div class="card bg-dark p-3 h-100" style="max-width: 540px; margin: 0 auto; border: 2px solid #ffbe33; border-radius: 15px; overflow: hidden;">
                  <div class="row g-0 h-100 align-items-center">
                      <div class="col-md-5 d-flex justify-content-center">
                          <div style="width: 130px; height: 130px; border-radius: 50%; border: 4px solid #ffbe33; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #222;">
                            <img src="${offer.image}" class="img-fluid" style="width: 100%; height: 100%; object-fit: cover;" alt="${offer.title}">
                          </div>
                      </div>
                      <div class="col-md-7">
                          <div class="card-body text-white">
                              <h5 class="card-title" style="font-family: 'Dancing Script', cursive; font-size: 2rem;">${offer.title}</h5>
                              <h6 class="offer mb-3"><span class="display-6 fw-bold" style="color: #fff;">${offer.discount}</span></h6>
                              <button class="btn btn-warning text-white rounded-pill px-4 py-2 add-offer-btn"
                                  type="button"
                                  data-id="${offer.id}"
                                  data-title="${offer.title}"
                                  data-discount="${offer.discount}"
                                  data-meal-ids="${offer.mealIds.join(',') || ''}">
                                  Order Now <i class="fa-solid fa-cart-shopping text-white mx-1"></i>
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        `;
                    container.insertAdjacentHTML("beforeend", card);
                });

                // Attach listeners to offer buttons
                attachOfferListeners();

                console.log(`✅ Loaded ${offers.length} offers from database`);
            })
            .catch(err => {
                console.error("❌ Failed to load offers:", err);
                container.innerHTML = "<p class='text-center text-white'>Failed to load offers. Please try again later.</p>";
            });
    }


    function attachOfferListeners() {
        const offerBtns = document.querySelectorAll(".add-offer-btn");

        offerBtns.forEach(btn => {
            btn.addEventListener("click", async function() {
                const mealIds = this.dataset.mealIds.split(',').map(Number);
                const offerId = this.dataset.id;
                const offerTitle = this.dataset.title;
                const offerDiscountStr = this.dataset.discount;

                // Fetch all meals to get details
                try {
                    const response = await fetch("php/Meals.php?getMeals=1");
                    const allMeals = await response.json();

                    const includedMeals = [];
                    let originalTotalPrice = 0;

                    mealIds.forEach(id => {
                        const meal = allMeals.find(m => parseInt(m.id) === id);
                        if (meal) {
                            includedMeals.push(meal);
                            originalTotalPrice += parseFloat(meal.price);
                        }
                    });

                    if (includedMeals.length === 0) {
                        alert("Sorry, the meals in this offer are no longer available.");
                        return;
                    }

                    // Calculate Discount
                    let discountPercent = 0;
                    const discountMatch = offerDiscountStr.match(/(\d+)%/);
                    if (discountMatch) {
                        discountPercent = parseInt(discountMatch[1]);
                    }

                    const finalPrice = originalTotalPrice * (1 - discountPercent / 100);

                    // Create Offer Cart Item
                    const offerItem = {
                        id: `offer-${offerId}`,
                        offerId: parseInt(offerId),
                        name: offerTitle,
                        price: parseFloat(finalPrice.toFixed(2)),
                        description: `Includes: ${includedMeals.map(m => m.name).join(", ")}`,
                        category: "offer",
                        type: "offer",
                        originalPrice: originalTotalPrice,
                        discount: offerDiscountStr
                    };

                    addToCart(offerItem);

                    // Visual feedback
                    const originalText = this.innerHTML;
                    this.textContent = `Added!`;
                    this.classList.replace("btn-warning", "btn-success");
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.classList.replace("btn-success", "btn-warning");
                    }, 2000);
                } catch (error) {
                    console.error("Error adding offer to cart:", error);
                    alert("Failed to add offer to cart. Please try again.");
                }
            });
        });
    }

// Call loadOffers when page loads
    loadOffers();

  // ============= RATING SYSTEM =============
  function initRatingSystem() {
      const ratingKey = "restaurantRatings";
      
      // Load Data or Default (mock data for initial impression)
      let ratings = JSON.parse(localStorage.getItem(ratingKey));
      
      if (!ratings) {
          ratings = [5, 4, 5, 5, 4]; // Default mock data
          localStorage.setItem(ratingKey, JSON.stringify(ratings));
      }
      
      // Calculate Average
      function getStats() {
          if (ratings.length === 0) return { average: 0, count: 0 };
          const sum = ratings.reduce((a, b) => a + b, 0);
          return {
              average: (sum / ratings.length).toFixed(1),
              count: ratings.length
          };
      }
      
      // Render UI
      function renderUI() {
          const stats = getStats();
          const overallRatingEl = document.getElementById("overallRating");
          const totalRatingsEl = document.getElementById("totalRatings");
          const averageStarsEl = document.getElementById("averageStars");
          
          if (overallRatingEl) overallRatingEl.textContent = stats.average;
          if (totalRatingsEl) totalRatingsEl.textContent = stats.count;
          
          // Render average stars
          if (averageStarsEl) {
              let starsHtml = "";
              const fullStars = Math.floor(stats.average);
              const hasHalf = stats.average % 1 >= 0.5;
              
              for (let i = 1; i <= 5; i++) {
                  if (i <= fullStars) {
                      starsHtml += '<i class="fa-solid fa-star"></i>';
                  } else if (i === fullStars + 1 && hasHalf) {
                      starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
                  } else {
                      starsHtml += '<i class="fa-regular fa-star"></i>';
                  }
              }
              averageStarsEl.innerHTML = starsHtml;
          }
      }
      
      // Interactive Stars
      const userStars = document.querySelectorAll(".user-rating-stars i");
      const starContainer = document.querySelector(".user-rating-stars");
      
      if (starContainer) {
          userStars.forEach(star => {
              // Hover Effect
              star.addEventListener("mouseover", function() {
                  const val = this.dataset.value;
                  highlightStars(val);
              });
              
              // Click to Submit
              star.addEventListener("click", function() {
                  const val = parseInt(this.dataset.value);
                  ratings.push(val);
                  localStorage.setItem(ratingKey, JSON.stringify(ratings));
                  renderUI();
                  showNotification(`Thanks! You rated us ${val} stars ★`);
                  
                  // Reset aesthetics
                  setTimeout(() => {
                        highlightStars(0); 
                  }, 1000);
              });
          });
          
          starContainer.addEventListener("mouseout", function() {
              // Reset to empty
              highlightStars(0);
          });
      }
      
      function highlightStars(count) {
          userStars.forEach(s => {
              const val = parseInt(s.dataset.value);
              if (val <= count) {
                  s.classList.remove("fa-regular");
                  s.classList.add("fa-solid");
                  s.style.color = "#ffbe33";
              } else {
                  s.classList.remove("fa-solid");
                  s.classList.add("fa-regular");
                  s.style.color = "#dcdcdc";
              }
          });
      }

      // Initial Render
      renderUI();
  }

  // Initialize Rating System
  initRatingSystem();

  // ============= BOOKING SYSTEM =============
  function initBookingSystem() {
      // Constraints: 12 tables for each size (2, 3, 4, 5)
      // TEST MODE: Limit 2-person tables to 1
      const TABLE_LIMITS = {
          2: 1, 
          3: 12,
          4: 12,
          5: 12
      };
      
      const bookingForm = document.getElementById("bookingForm"); //to php
      
      if (!bookingForm) return;

      // Load bookings
      function getBookings()
      {
          return JSON.parse(localStorage.getItem("restaurantBookings") || "[]");
      }

      function saveBookings(bookings) {
          localStorage.setItem("restaurantBookings", JSON.stringify(bookings));
      }

      // Check availability count for a specific date, time, and size
      function getBookingCount(date, time, size) {
          const bookings = getBookings();
          return bookings.filter(b => b.date === date && b.time === time && parseInt(b.size) === parseInt(size)).length;
      }

      // Find next available date for the SAME time
      function findNextAvailableDate(startDate, time, size) {
          let checkDate = new Date(startDate);
          // Look ahead up to 30 days
          for (let i = 1; i <= 30; i++) {
              checkDate.setDate(checkDate.getDate() + 1);
              const dateStr = checkDate.toISOString().split('T')[0];
              const count = getBookingCount(dateStr, time, size);
              if (count < TABLE_LIMITS[size]) {
                  return dateStr;
              }
          }
          return null; 
      }

      bookingForm.addEventListener("submit", function(e) {
          e.preventDefault();
          
          const name = document.getElementById("bookName").value;
          const phone = document.getElementById("bookPhone").value;
          const email = document.getElementById("bookEmail").value;
          const persons = parseInt(document.getElementById("bookPersons").value);
          const date = document.getElementById("bookDate").value;
          const time = document.getElementById("bookTime").value;

          if (!persons || !date || !time) {
              alert("Please select date, time, and number of persons.");
              return;
          }

          // Check Availability for specific slot
          const limit = TABLE_LIMITS[persons];
          const currentCount = getBookingCount(date, time, persons);

          if (currentCount >= limit) {
              // Table not available for this time slot
              const nextDate = findNextAvailableDate(date, time, persons);
              let msg = `Sorry, no tables for ${persons} people available at ${time} on ${date}.`;
              if (nextDate) {
                  msg += `\nThe next available ${time} slot is on ${nextDate}.`;
              } else {
                  msg += `\nWe are fully booked at this time for the next month.`;
              }
              alert(msg);
          } else {
              // Available -> Book it
              const bookings = getBookings();
              bookings.push({
                  id: Date.now(),
                  name: name,
                  phone: phone,
                  email: email,
                  size: persons,
                  date: date,
                  time: time
              });
              saveBookings(bookings);
              
              showNotification(`✅ Table booked for ${date} at ${time}!`);
              bookingForm.reset();
          }
      });
  }

  initBookingSystem();

  // Toggle Rating Section
  const toggleRatingBtn = document.getElementById("toggleRatingBtn");
  const ratingContent = document.getElementById("ratingContent");
  
  if (toggleRatingBtn && ratingContent) {
    toggleRatingBtn.addEventListener("click", function() {
      if (ratingContent.style.display === "none") {
        ratingContent.style.display = "block";
        this.innerHTML = '<i class="fa-solid fa-times me-2"></i>Close';
      } else {
        ratingContent.style.display = "none";
        this.innerHTML = '<i class="fa-solid fa-star me-2"></i>Add Rates';
      }
    });
  }

  console.log("✅ Cart system ready!");
  console.log("✅ Meals loading system ready!");
  console.log("✅ Booking system ready!");
});
