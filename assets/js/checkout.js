document.addEventListener("DOMContentLoaded", () => {
    console.log("💳 Checkout page loaded");

    let currentUserId = null;
    let cart = [];

    async function getSessionInfo() {
        try {
            const response = await fetch('php/check_session.php');
            return await response.json();
        } catch (error) {
            console.error('Error fetching session info:', error);
            return { loggedIn: false };
        }
    }

    function getCartKey() {
        return currentUserId ? `cart_${currentUserId}` : "cart_guest";
    }

    async function initCheckout() {
        const session = await getSessionInfo();
        if (session.loggedIn) {
            currentUserId = session.id;
            const cartKey = getCartKey();
            cart = JSON.parse(localStorage.getItem(cartKey)) || [];
            console.log(`📦 Loaded user-specific cart (${cartKey}):`, cart);
        } else {
            alert("Please login to proceed to checkout!");
            window.location.href = "login.html";
            return;
        }

        const summaryList = document.getElementById("orderSummaryList");
        const totalElement = document.getElementById("checkoutTotal");

        // Redirect if cart is empty
        if (cart.length === 0) {
            alert("Your cart is empty!");
            window.location.href = "menu.html";
            return;
        }

        renderCheckout(summaryList, totalElement);
    }

    function renderCheckout(summaryList, totalElement) {
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

        setupFormHandler(total);
    }

    function setupFormHandler(total) {
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
                                const formData = new FormData();
                                formData.append("action", "award");
                                formData.append("points", pointsEarned);

                                fetch("php/Loyalty.php", {
                                    method: "POST",
                                    body: formData
                                })
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.status === "success") {
                                            let successMessage = `✅ Order Placed Successfully!\n\nThank you, ${name}.\nYour total paid: $${total.toFixed(2)}`;
                                            successMessage += `\n\n🎁 You earned ${pointsEarned} loyalty points!`;
                                            alert(successMessage);
                                            
                                            // Clear cart and redirect
                                            localStorage.removeItem(getCartKey());
                                            window.location.href = "index.html";
                                        } else {
                                            console.error("Failed to award points:", data.message);
                                            alert(`✅ Order Placed Successfully!\n\nThank you, ${name}. Total: $${total.toFixed(2)}`);
                                            
                                            localStorage.removeItem(getCartKey());
                                            window.location.href = "index.html";
                                        }
                                    })
                                    .catch(err => {
                                        console.error("Error awarding points:", err);
                                        alert(`✅ Order Placed Successfully!\n\nThank you, ${name}. Total: $${total.toFixed(2)}`);
                                        
                                        localStorage.removeItem(getCartKey());
                                        window.location.href = "index.html";
                                    });
                            } else {
                                alert(`✅ Order Placed Successfully!\n\nThank you, ${name}.\nYour total paid: $${total.toFixed(2)}`);
                                
                                localStorage.removeItem(getCartKey());
                                window.location.href = "index.html";
                            }
                        }
                    })
                    .catch(error => {
                        console.error("❌ Error submitting order:", error);
                        alert("Failed to place order. Please try again.");

                        // Re-enable submit button
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = 'Complete Order';
                        }
                    });
            });
        }
    }

    initCheckout();
});