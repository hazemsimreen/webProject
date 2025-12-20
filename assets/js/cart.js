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

async function initCartPage() {
  console.log("🚀 Initializing cart page...");
  const session = await getSessionInfo();
  
  if (session.loggedIn) {
    currentUserId = session.id;
    const cartKey = getCartKey();
    cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    console.log(`📦 Loaded user-specific cart (${cartKey}):`, cart);
  } else {
    currentUserId = null;
    cart = [];
    console.log("📦 User not logged in, showing empty cart");
  }
  
  renderCart();
}

// Function to render cart items
function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div style="text-align: center; padding: 50px;">
        <h3>🛒 Your Cart is Empty</h3>
        <p>You haven't added any items yet</p>
        <button class="checkout-btn" onclick="continueShopping()" style="margin-top: 20px;">
          Start Shopping Now
        </button>
      </div>
    `;
    updateSummary();
    return;
  }

  // Load data *once* before loop
  const restaurantMeals = JSON.parse(localStorage.getItem("restaurantMeals")) || [];
  const restaurantOffers = JSON.parse(localStorage.getItem("restaurantOffers")) || [];

  const itemsHTML = cart
    .map((item) => {
      console.log("🍕 Rendering item:", item);
      
      // Make sure image exists
      let imageSrc = item.image;
      
      if (!imageSrc) {
          if (item.type === 'offer') {
               // Try to find offer by stored ID or parsed ID
               const offerId = item.offerId || parseInt(item.id.replace('offer-', ''));
               const offer = restaurantOffers.find(o => o.id === offerId);
               if (offer) imageSrc = offer.image;
          } else {
               const meal = restaurantMeals.find(m => m.id == item.id);
               if (meal) imageSrc = meal.image;
          }
      }

      if (!imageSrc) imageSrc = './assets/image/placeholder.png';
      
      const isOffer = item.type === 'offer';
      
      return `
        <div class="cart-item" data-id="${item.id}" data-price="${item.price}" style="${isOffer ? 'border-left: 4px solid #ffbe33; background: #fff8e1;' : ''}">
          <img src="${imageSrc}" alt="${item.name}" class="item-image" onerror="this.src='./assets/image/placeholder.png'">
          <div class="item-details">
            <div class="item-name">
                ${item.name} 
                ${isOffer ? `<span class="badge bg-warning text-dark ms-2">${item.discount || 'Special Offer'}</span>` : ''}
            </div>
            <div class="item-description" style="${isOffer ? 'font-size: 0.85em; color: #666;' : ''}">
                ${item.description || 'No description'}
            </div>
            <div class="item-extras">${isOffer ? 'Bundle Deal' : 'Category: ' + item.category}</div>
            <div class="quantity-control">
              <button class="quantity-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
              <span class="quantity-value" id="qty-${item.id}">${item.quantity}</span>
              <button class="quantity-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
          </div>
          <div class="item-price d-flex flex-column align-items-end">
            ${isOffer && item.originalPrice ? `
                <span class="text-muted text-decoration-line-through" style="font-size: 0.9rem;">$${(item.originalPrice * item.quantity).toFixed(2)}</span>
            ` : ''}
            <span class="current-price fw-bold" id="price-${item.id}" style="font-size: 1.1rem; color: ${isOffer ? '#d32f2f' : '#222'};">
                $${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      `;
    })
    .join("");

  cartItemsContainer.innerHTML = `
    <h2>Your Orders (${cart.length} items)</h2>
    ${itemsHTML}
  `;

  updateSummary();
  console.log("✅ Cart rendered successfully");
}

// Function to change quantity
function changeQuantity(itemId, change) {
  console.log(`📝 Changing quantity for item ${itemId} by ${change}`);
  
  const item = cart.find((i) => i.id == itemId);
  if (!item) {
    console.error("❌ Item not found:", itemId);
    return;
  }

  item.quantity += change;

  if (item.quantity <= 0) {
    removeItem(itemId);
    return;
  }

  // Update localStorage
  localStorage.setItem(getCartKey(), JSON.stringify(cart));

  // Update UI
  const qtyElement = document.getElementById(`qty-${itemId}`);
  const priceElement = document.getElementById(`price-${itemId}`);
  
  if (qtyElement) {
    qtyElement.textContent = item.quantity;
  }
  
  if (priceElement) {
    priceElement.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
  }

  updateSummary();
  console.log("✅ Quantity updated");
}

// Function to remove item
function removeItem(itemId) {
  if (confirm("Are you sure you want to remove this item?")) {
    console.log(`🗑️ Removing item ${itemId}`);
    cart = cart.filter((item) => item.id != itemId);
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    renderCart();
  }
}

// Function to update order summary
function updateSummary() {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const delivery = subtotal > 200 ? 0 : 15;
  const tax = subtotal * 0.17;
  const total = subtotal + delivery + tax;

  const subtotalElement = document.getElementById("subtotal");
  const deliveryElement = document.getElementById("delivery");
  const taxElement = document.getElementById("tax");
  const totalElement = document.getElementById("total");

  if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  if (deliveryElement) deliveryElement.textContent = delivery === 0 ? "Free" : `$${delivery.toFixed(2)}`;
  if (taxElement) taxElement.textContent = `$${tax.toFixed(2)}`;
  if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
}

// Function to checkout
function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty! Add items first.");
    return;
  }

  // Redirect to Checkout Page
  window.location.href = "checkout.html";
}

// Function to continue shopping
function continueShopping() {
  window.location.href = "index.html";
}

// Initialize cart on page load
document.addEventListener("DOMContentLoaded", () => {
  initCartPage();
});

console.log("✅ Cart script loaded!");