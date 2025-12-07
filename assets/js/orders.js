console.log("📜 Orders page loaded!");

document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ DOM Ready - Orders Page!");

    const ordersContainer = document.getElementById("ordersContainer");
    const emptyState = document.getElementById("emptyState");

    // Load orders from localStorage
    function loadOrders() {
        const orders = JSON.parse(localStorage.getItem("restaurantOrders") || "[]");
        return orders.sort((a, b) => b.id - a.id); // Most recent first
    }

    // Show notification
    function showNotification(message) {
        alert(message);
    }

    // Re-order functionality
    function reorder(orderId) {
        const orders = loadOrders();
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            showNotification("❌ Order not found!");
            return;
        }

        // Get current cart
        let cart = JSON.parse(localStorage.getItem("cart") || "[]");

        // Add all items from the order to cart
        order.items.forEach(item => {
            const existingItem = cart.find(cartItem => cartItem.id === item.id);
            
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                cart.push({...item});
            }
        });

        // Save updated cart
        localStorage.setItem("cart", JSON.stringify(cart));
        
        showNotification(`✅ ${order.items.length} item(s) added to cart!`);
        
        // Optionally redirect to cart
        const goToCart = confirm("Go to cart now?");
        if (goToCart) {
            window.location.href = "cart.html";
        }
    }

    // Render orders
    function renderOrders() {
        const orders = loadOrders();

        if (orders.length === 0) {
            ordersContainer.style.display = "none";
            emptyState.style.display = "block";
            return;
        }

        ordersContainer.style.display = "block";
        emptyState.style.display = "none";
        ordersContainer.innerHTML = "";

        orders.forEach((order, index) => {
            const orderDate = new Date(order.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Calculate sequential order number (total orders - current index)
            const orderNumber = orders.length - index;

            const orderCard = document.createElement("div");
            orderCard.className = "card mb-4 shadow-sm";
            orderCard.innerHTML = `
                <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-0">Order #${orderNumber}</h5>
                        <small>${orderDate}</small>
                    </div>
                    <div class="text-end">
                        <h4 class="mb-0 text-warning">$${order.total.toFixed(2)}</h4>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h6 class="text-muted mb-3">Items Ordered:</h6>
                            <ul class="list-unstyled">
                                ${order.items.map(item => `
                                    <li class="mb-2">
                                        <strong>${item.name}</strong> 
                                        <span class="text-muted">x${item.quantity}</span>
                                        <span class="text-success ms-2">$${(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="col-md-4">
                            <h6 class="text-muted mb-3">Delivery Info:</h6>
                            <p class="mb-1"><strong>${order.customer.name}</strong></p>
                            <p class="mb-1 text-muted"><i class="fa-solid fa-phone me-2"></i>${order.customer.phone}</p>
                            <p class="mb-1 text-muted"><i class="fa-solid fa-location-dot me-2"></i>${order.customer.address}</p>
                            ${order.customer.notes ? `<p class="mb-1 text-muted"><i class="fa-solid fa-note-sticky me-2"></i>${order.customer.notes}</p>` : ''}
                        </div>
                    </div>
                    <div class="mt-3 text-end">
                        <button class="btn btn-warning text-white rounded-pill px-4" onclick="window.reorderFunction(${order.id})">
                            <i class="fa-solid fa-rotate-right me-2"></i>Re-order
                        </button>
                    </div>
                </div>
            `;

            ordersContainer.appendChild(orderCard);
        });
    }

    // Expose reorder function globally
    window.reorderFunction = reorder;

    // Initial render
    renderOrders();

    console.log("✅ Orders system ready!");
});
