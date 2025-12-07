document.addEventListener("DOMContentLoaded", () => {
    console.log("💳 Checkout page loaded");

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const summaryList = document.getElementById("orderSummaryList");
    const totalElement = document.getElementById("checkoutTotal");

    // Redirect if cart is empty
    if (cart.length === 0) {
        alert("Your cart is empty!");
        window.location.href = "menu.html";
        return;
    }

    // Render Order Summary
    let subtotal = 0;
    
    if (summaryList) {
        summaryList.innerHTML = "";
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between lh-sm bg-dark text-white border-secondary";
            li.innerHTML = `
                <div>
                    <h6 class="my-0">${item.name}</h6>
                    <small class="text-muted">x${item.quantity}</small>
                </div>
                <span class="text-muted">$${itemTotal.toFixed(2)}</span>
            `;
            summaryList.appendChild(li);
        });
    }

    // Calculate Finals
    const tax = subtotal * 0.17;
    const delivery = subtotal > 200 ? 0 : 15;
    const total = subtotal + tax + delivery;

    if (totalElement) {
        totalElement.textContent = `$${total.toFixed(2)}`;
    }

    // Handle Submit
    const form = document.getElementById("checkoutForm");
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Collect data (simulate processing)
            const name = document.getElementById("fullName").value;
            const phone = document.getElementById("phone").value;
            const address = document.getElementById("address").value;
            const notes = document.getElementById("orderNotes").value;
            console.log(`📦 Processing order for ${name} (${phone}) at: ${address}. Notes: ${notes}`);
            
            // --- SAVE ORDER TO HISTORY ---
            const newOrder = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                customer: { name, phone, address, notes },
                items: cart, // Save the entire cart
                total: total
            };

            const existingOrders = JSON.parse(localStorage.getItem("restaurantOrders") || "[]");
            existingOrders.push(newOrder);
            localStorage.setItem("restaurantOrders", JSON.stringify(existingOrders));
            
            // --- LOYALTY POINTS SYSTEM ---
            let pointsEarned = 0;
            if (total >= 20 && total < 40) {
                pointsEarned = 5;
            } else if (total >= 40) {
                pointsEarned = 10;
            }

            if (pointsEarned > 0) {
                // Load current loyalty data
                const loyaltyData = JSON.parse(localStorage.getItem("loyaltyPoints") || '{"totalPoints": 0, "history": []}');
                
                // Add points
                loyaltyData.totalPoints += pointsEarned;
                loyaltyData.history.push({
                    date: new Date().toISOString().split('T')[0],
                    orderId: newOrder.id,
                    orderTotal: total,
                    pointsEarned: pointsEarned,
                    type: "earned"
                });

                // Save updated loyalty data
                localStorage.setItem("loyaltyPoints", JSON.stringify(loyaltyData));
            }
            
            // Clear Cart
            localStorage.removeItem("cart");
            
            // Show Success
            let successMessage = `✅ Order Placed Successfully!\n\nThank you, ${name}.\nYour total paid: $${total.toFixed(2)}`;
            if (pointsEarned > 0) {
                const loyaltyData = JSON.parse(localStorage.getItem("loyaltyPoints") || '{"totalPoints": 0}');
                successMessage += `\n\n🎁 You earned ${pointsEarned} loyalty points!\n💎 Total Points: ${loyaltyData.totalPoints}`;
                if (loyaltyData.totalPoints >= 80) {
                    successMessage += `\n\n🎉 You can redeem a FREE meal!`;
                }
            }
            if (notes) {
                successMessage += `\n\nNotes: ${notes}`;
            }
            alert(successMessage);
            
            // Redirect Home
            window.location.href = "index.html";
        });
    }
});
