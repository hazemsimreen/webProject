// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Function to render cart items
function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h3>🛒 السلة فارغة</h3>
                <p>لم تقم بإضافة أي منتجات بعد</p>
                <button class="checkout-btn" onclick="continueShopping()" style="margin-top: 20px;">
                    ابدأ التسوق الآن
                </button>
            </div>
        `;
    updateSummary();
    return;
  }

  const itemsHTML = cart
    .map(
      (item) => `
        <div class="cart-item" data-id="${item.id}" data-price="${item.price}">
            <img src="${item.image}" alt="${item.name}" class="item-image">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description}</div>
                <div class="item-extras">Category: ${item.category}</div>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="changeQuantity('${
                      item.id
                    }', -1)">-</button>
                    <span class="quantity-value" id="qty-${item.id}">${
        item.quantity
      }</span>
                    <button class="quantity-btn" onclick="changeQuantity('${
                      item.id
                    }', 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeItem('${
                  item.id
                }')">Remove</button>
            </div>
            <div class="item-price">
                <div class="current-price" id="price-${item.id}">$${(
        item.price * item.quantity
      ).toFixed(2)}</div>
            </div>
        </div>
    `
    )
    .join("");

  cartItemsContainer.innerHTML = `
        <h2>Your Orders (${cart.length} items)</h2>
        ${itemsHTML}
    `;

  updateSummary();
}

// Function to change quantity
function changeQuantity(itemId, change) {
  const item = cart.find((i) => i.id === itemId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeItem(itemId);
    return;
  }

  // Update localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Update UI
  document.getElementById(`qty-${itemId}`).textContent = item.quantity;
  document.getElementById(`price-${itemId}`).textContent = `$${(
    item.price * item.quantity
  ).toFixed(2)}`;

  updateSummary();
}

// Function to remove item
function removeItem(itemId) {
  if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
    cart = cart.filter((item) => item.id !== itemId);
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

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("delivery").textContent =
    delivery === 0 ? "Free" : `$${delivery.toFixed(2)}`;
  document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("total").textContent = `$${total.toFixed(2)}`;
}

// Function to checkout
function checkout() {
  if (cart.length === 0) {
    alert("السلة فارغة! أضف منتجات أولاً.");
    return;
  }

  const total = document.getElementById("total").textContent;
  alert(`شكراً لطلبك!\nالمبلغ الإجمالي: ${total}\nسيتم التواصل معك قريباً.`);

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
  renderCart();
});
