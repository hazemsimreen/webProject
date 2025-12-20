console.log("📜 Orders page loaded!");

document.addEventListener("DOMContentLoaded", function() {
    console.log("✅ DOM Ready - Orders Page!");

    const ordersContainer = document.getElementById("ordersContainer");
    const emptyState = document.getElementById("emptyState");

    let currentUserId = null;

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

    async function initOrdersPage() {
        const session = await getSessionInfo();
        if (session.loggedIn) {
            currentUserId = session.id;
        }
        loadOrders();
    }

    // Load orders from database
    function loadOrders() {
        fetch(`php/Orders.php?getOrders=1`)
            .then(res => {
                if (res.status === 401) {
                    // Not logged in
                    alert("Please login to view your orders!");
                    window.location.href = "login.html";
                    return null;
                }
                if (!res.ok) throw new Error('Failed to fetch orders');
                return res.json();
            })
            .then(orders => {
                if (!orders) return; // Handle 401 redirect case
                renderOrders(orders);
            })
            .catch(err => {
                console.error("❌ Failed to load orders:", err);
                if (ordersContainer) {
                    ordersContainer.innerHTML = '<p class="text-danger text-center">Failed to load orders. Please try again later.</p>';
                }
            });
    }

    // Show notification
    function showNotification(message) {
        alert(message);
    }

    // Re-order functionality
    function reorder(orderId, orders) {
        const order = orders.find(o => o.id === orderId);

        if (!order) {
            showNotification("❌ Order not found!");
            return;
        }

        // Get current cart
        let cart = JSON.parse(localStorage.getItem(getCartKey()) || "[]");

        // Add all items from the order to cart
        order.items.forEach(item => {
            const existingItem = cart.find(cartItem => cartItem.id == item.id);

            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                cart.push({...item});
            }
        });

        // Save updated cart
        localStorage.setItem(getCartKey(), JSON.stringify(cart));

        showNotification(`✅ ${order.items.length} item(s) added to cart!`);

        // Optionally redirect to cart
        const goToCart = confirm("Go to cart now?");
        if (goToCart) {
            window.location.href = "cart.html";
        }
    }

    // Render orders
    function renderOrders(orders) {
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
                        <span class="badge bg-${order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'secondary'} me-2">
                            ${order.status.toUpperCase()}
                        </span>
                        <h4 class="mb-0 text-warning d-inline">$${order.total.toFixed(2)}</h4>
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

        // Store orders for reorder function
        window.currentOrders = orders;
    }

    // Expose reorder function globally
    window.reorderFunction = function(orderId) {
        reorder(orderId, window.currentOrders || []);
    };

    // Initial load
    initOrdersPage();

    console.log("✅ Orders system ready!");
});