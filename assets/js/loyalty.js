console.log("🎁 Loyalty page loaded!");

document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ DOM Ready - Loyalty Page!");

    const totalPointsEl = document.getElementById("totalPoints");
    const progressBar = document.getElementById("progressBar");
    const progressText = document.getElementById("progressText");
    const statusText = document.getElementById("statusText");
    const redeemBtn = document.getElementById("redeemBtn");
    const historyContainer = document.getElementById("historyContainer");
    const emptyHistory = document.getElementById("emptyHistory");
    const pointsBadge = document.getElementById("pointsBadge");

  // Migration: Clear local storage as requested
  localStorage.removeItem("loyaltyPoints");

  // Load loyalty data from database
  function loadLoyaltyData() {
    fetch("php/Loyalty.php")
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          updateDisplay(data);
        } else {
          console.error("Failed to load loyalty data:", data.message);
          if (data.message.includes("logged in")) {
             // Optional: handle logged out state
          }
        }
      })
      .catch(err => console.error("Error loading loyalty data:", err));
  }

  // Update display
  function updateDisplay(data) {
    const points = data.points;
    const history = data.history;

    // Update points display
    totalPointsEl.textContent = points;
    if (pointsBadge) pointsBadge.textContent = `${points} pts`;

    // Update progress bar
    const progress = Math.min((points / 80) * 100, 100);
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${points}/80`;

    // Update status text and button
    if (points >= 80) {
      statusText.textContent = "🎉 You can redeem a FREE meal!";
      redeemBtn.disabled = false;
      redeemBtn.classList.add("btn-success");
      redeemBtn.classList.remove("btn-light");
    } else {
      const remaining = 80 - points;
      statusText.textContent = `Earn ${remaining} more points to get a FREE meal!`;
      redeemBtn.disabled = true;
      redeemBtn.classList.remove("btn-success");
      redeemBtn.classList.add("btn-light");
    }

    // Render history
    renderHistory(history);
  }

  // Render points history
  function renderHistory(history) {
    if (!history || history.length === 0) {
      historyContainer.style.display = "none";
      emptyHistory.style.display = "block";
      return;
    }

    historyContainer.style.display = "block";
    emptyHistory.style.display = "none";
    historyContainer.innerHTML = "";

    history.forEach(entry => {
      const date = new Date(entry.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      const card = document.createElement("div");
      card.className = "card mb-3 border-0 shadow-sm";

      if (entry.type === "redeemed") {
        card.innerHTML = `
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1"><i class="fa-solid fa-gift text-danger me-2"></i>Free Meal Redeemed</h6>
              <small class="text-muted">${date}</small>
            </div>
            <div class="text-end">
              <h5 class="text-danger mb-0">${entry.points_change} points</h5>
            </div>
          </div>
        `;
      } else {
        card.innerHTML = `
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1"><i class="fa-solid fa-shopping-cart text-success me-2"></i>Order Reward</h6>
              <small class="text-muted">${date}</small>
            </div>
            <div class="text-end">
              <h5 class="text-success mb-0">+${entry.points_change} points</h5>
            </div>
          </div>
        `;
      }

      historyContainer.appendChild(card);
    });
  }

  // Redeem free meal
  redeemBtn.addEventListener("click", function () {
    const confirmRedeem = window.confirm("🎁 Redeem 80 points for a random FREE meal (under $35)?");

    if (confirmRedeem) {
      const formData = new FormData();
      formData.append("action", "redeem");

      fetch("php/Loyalty.php", {
        method: "POST",
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          // Add the free meal to cart
          const meal = data.meal;
          const freeMeal = {
            id: meal.id,
            name: `🎁 FREE: ${meal.name}`,
            price: 0,
            image: meal.image,
            description: "Redeemed with loyalty points!",
            category: meal.category
          };

          if (typeof addToCart === "function") {
            addToCart(freeMeal);
            showNotification(`✅ Added ${meal.name} to your cart for FREE!`, "success");
          } else {
            console.error("addToCart function not found!");
            alert(`✅ Points redeemed! ${meal.name} added to your cart.`);
          }

          loadLoyaltyData(); // Refresh display
        } else {
          showNotification(data.message, "error");
        }
      })
      .catch(err => {
        console.error("Error redeeming points:", err);
        showNotification("Failed to redeem points. Please try again.", "error");
      });
    }
  });

  // Initial load
  loadLoyaltyData();

    console.log("✅ Loyalty system ready!");
});
