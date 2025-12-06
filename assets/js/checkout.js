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
            console.log(`📦 Processing order for ${name} (${phone}) at: ${address}`);
            
            // Clear Cart
            localStorage.removeItem("cart");
            
            // Show Success
            alert(`✅ Order Placed Successfully!\n\nThank you, ${name}.\nYour total paid: $${total.toFixed(2)}`);
            
            // Redirect Home
            window.location.href = "index.html";
        });
    }
});
