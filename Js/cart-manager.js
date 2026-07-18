// ============================================================
// SPORTA  —  cart-manager.js
// Used ONLY on product pages (prod1, prod2, prod3, yard).
// Saves items to localStorage so cart.js can read them.
// ============================================================

var SPORTA_CART_KEY = 'sporta_cart';

function addToCart(item) {
  var raw  = localStorage.getItem(SPORTA_CART_KEY);
  var cart = [];
  try { cart = JSON.parse(raw) || []; } catch(e) { cart = []; }

  var found = false;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === item.id) {
      cart[i].qty = (cart[i].qty || 1) + 1;
      found = true;
      break;
    }
  }
  if (!found) {
    item.qty = 1;
    cart.push(item);
  }

  localStorage.setItem(SPORTA_CART_KEY, JSON.stringify(cart));
  updateCartHeaderBadge(cart);
}

function updateCartHeaderBadge(cart) {
  if (!cart) {
    var raw = localStorage.getItem(SPORTA_CART_KEY);
    try { cart = JSON.parse(raw) || []; } catch(e) { cart = []; }
  }
  var total = 0;
  for (var i = 0; i < cart.length; i++) { total += (cart[i].qty || 1); }
  var el = document.getElementById('cartCount');
  if (el) el.textContent = total;
}

// Update badge on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartHeaderBadge(null);
});
