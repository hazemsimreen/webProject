console.log("🛒 Cart page loaded!");

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

console.log("📦 Cart items:", cart);

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

  // Load restaurantMeals *once* before loop
  const restaurantMeals = JSON.parse(localStorage.getItem("restaurantMeals")) || [];

  const itemsHTML = cart
    .map((item) => {
      console.log("🍕 Rendering item:", item);
      
      // Make sure image exists
      let imageSrc = item.image;
      if (!imageSrc) {
        const meal = restaurantMeals.find((m) => m.id == item.id);
        if (meal) imageSrc = meal.image;
      }
      if (!imageSrc) imageSrc = './assets/image/placeholder.png';
      
      return `
        <div class="cart-item" data-id="${item.id}" data-price="${item.price}">
          <img src="${imageSrc}" alt="${item.name}" class="item-image" onerror="this.src='./assets/image/placeholder.png'">
          <div class="item-details">
            <div class="item-name">${item.name}</div>
            <div class="item-description">${item.description || 'No description'}</div>
            <div class="item-extras">Category: ${item.category}</div>
            <div class="quantity-control">
              <button class="quantity-btn" onclick="changeQuantity('${item.id}', -1)">-</button>
              <span class="quantity-value" id="qty-${item.id}">${item.quantity}</span>
              <button class="quantity-btn" onclick="changeQuantity('${item.id}', 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
          </div>
          <div class="item-price">
            <div class="current-price" id="price-${item.id}">$${(item.price * item.quantity).toFixed(2)}</div>
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
  localStorage.setItem("cart", JSON.stringify(cart));

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
    localStorage.setItem("cart", JSON.stringify(cart));
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

  const total = document.getElementById("total").textContent;
  alert(`Thank you for your order!\nTotal Amount: ${total}\nWe will contact you soon.`);

  // Clear cart
  cart = [];
  localStorage.removeItem("cart");
  renderCart();
}

// Function to continue shopping
function continueShopping() {
  window.location.href = "index.html";
}

// Initialize cart on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Initializing cart page...");
  renderCart();
});

console.log("✅ Cart script loaded!");