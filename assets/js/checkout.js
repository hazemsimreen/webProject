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

            // Collect data
            const name = document.getElementById("fullName").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const address = document.getElementById("address").value.trim();
            const notes = document.getElementById("orderNotes").value.trim();
            const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';

            console.log(`📦 Processing order for ${name} (${phone}) at: ${address}. Notes: ${notes}`);

            // Disable submit button to prevent double submission
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
            }

            // Prepare form data
            const formData = new FormData();
            formData.append("createOrder", "1");
            formData.append("fullName", name);
            formData.append("phone", phone);
            formData.append("address", address);
            formData.append("orderNotes", notes);
            formData.append("paymentMethod", paymentMethod);
            formData.append("total", total.toFixed(2));
            formData.append("items", JSON.stringify(cart));

            // Submit order to database
            fetch("php/Orders.php", {
                method: "POST",
                body: formData
            })
                .then(response => response.text()) // Get as text first to see errors
                .then(text => {
                    console.log("📝 Server Response:", text);

                    // Try to parse as JSON
                    let data;
                    try {
                        data = JSON.parse(text);
                    } catch (e) {
                        console.error("❌ Server returned non-JSON response:", text);
                        throw new Error("Server error: " + text.substring(0, 200));
                    }

                    if (data.success) {
                        console.log("✅ Order saved to database, ID:", data.orderId);

                        // --- LOYALTY POINTS SYSTEM ---
                        let pointsEarned = 0;
                        if (total >= 20 && total < 40) {
                            pointsEarned = 5;
                        } else if (total >= 40) {
                            pointsEarned = 10;
                        }

                        if (pointsEarned > 0) {
                            const loyaltyData = JSON.parse(localStorage.getItem("loyaltyPoints") || '{"totalPoints": 0, "history": []}');
                            loyaltyData.totalPoints += pointsEarned;
                            loyaltyData.history.push({
                                date: new Date().toISOString().split('T')[0],
                                orderId: data.orderId,
                                orderTotal: total,
                                pointsEarned: pointsEarned,
                                type: "earned"
                            });
                            localStorage.setItem("loyaltyPoints", JSON.stringify(loyaltyData));
                        }

                        // Clear Cart
                        localStorage.removeItem("cart");

                        // Show Success
                        let successMessage = `✅ Order Placed Successfully!\n\nOrder ID: #${data.orderId}\nThank you, ${name}.\nYour total paid: $${total.toFixed(2)}`;
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

                        // Redirect to Orders page
                        window.location.href = "orders.html";
                    } else {
                        alert("❌ Failed to place order: " + data.message);

                        // Re-enable button
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Place Order';
                        }
                    }
                })
                .catch(err => {
                    console.error("Error placing order:", err);
                    alert("❌ Failed to place order: " + err.message);

                    // Re-enable button
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = 'Place Order';
                    }
                });
        });
    }
});