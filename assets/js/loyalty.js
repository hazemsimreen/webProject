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

    // Load loyalty data
    function getLoyaltyData() {
        return JSON.parse(localStorage.getItem("loyaltyPoints") || '{"totalPoints": 0, "history": []}');
    }

    // Save loyalty data
    function saveLoyaltyData(data) {
        localStorage.setItem("loyaltyPoints", JSON.stringify(data));
    }

    // Update display
    function updateDisplay() {
        const loyaltyData = getLoyaltyData();
        const points = loyaltyData.totalPoints;

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
        }

        // Render history
        renderHistory(loyaltyData.history);
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

        // Sort by date (most recent first)
        const sortedHistory = [...history].reverse();

        sortedHistory.forEach(entry => {
            const date = new Date(entry.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const card = document.createElement("div");
            card.className = "card mb-3";
            
            if (entry.type === "redeemed") {
                card.innerHTML = `
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1"><i class="fa-solid fa-gift text-success me-2"></i>Free Meal Redeemed</h6>
                            <small class="text-muted">${date}</small>
                        </div>
                        <div class="text-end">
                            <h5 class="text-danger mb-0">-80 points</h5>
                        </div>
                    </div>
                `;
            } else {
                card.innerHTML = `
                    <div class="card-body d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1"><i class="fa-solid fa-shopping-cart text-warning me-2"></i>Order #${entry.orderId}</h6>
                            <small class="text-muted">${date} • Total: $${entry.orderTotal.toFixed(2)}</small>
                        </div>
                        <div class="text-end">
                            <h5 class="text-success mb-0">+${entry.pointsEarned} points</h5>
                        </div>
                    </div>
                `;
            }

            historyContainer.appendChild(card);
        });
    }

    // Redeem free meal
    redeemBtn.addEventListener("click", function() {
        const loyaltyData = getLoyaltyData();
        
        if (loyaltyData.totalPoints < 80) {
            alert("❌ You need 80 points to redeem a free meal!");
            return;
        }

        // Confirm redemption
        const confirm = window.confirm("🎁 Redeem 80 points for a FREE meal ($35 or less)?\n\nYou'll be redirected to the menu to choose your free meal.");
        
        if (confirm) {
            // Deduct points
            loyaltyData.totalPoints -= 80;
            loyaltyData.history.push({
                date: new Date().toISOString().split('T')[0],
                type: "redeemed"
            });

            saveLoyaltyData(loyaltyData);

            // Set redemption flag
            localStorage.setItem("freeMealRedemption", "true");

            // Redirect to menu
            alert("✅ Redemption activated! Choose any meal $35 or less from the menu.\n\nIt will be FREE with FREE delivery!");
            window.location.href = "menu.html";
        }
    });

    // Initial render
    updateDisplay();

    console.log("✅ Loyalty system ready!");
});
