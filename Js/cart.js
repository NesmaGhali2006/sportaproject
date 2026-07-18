// ============================================================
// SPORTA  —  cart.js   (self-contained, no external deps)
// Loaded at the bottom of cart.html so the DOM is ready.
// ============================================================

const CART_KEY    = 'sporta_cart';
const PROMO_CODES = { 'SPORTA10': 10, 'ATHLETE20': 20 };
let appliedDiscount = 0;

// ── helpers ────────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ── update header badge ────────────────────────────────────
function updateBadge() {
  const count = getCart().reduce(function(s, i){ return s + (i.qty || 1); }, 0);
  var el = document.getElementById('cartCount');
  if (el) el.textContent = count;
}

// ── show / hide sections ───────────────────────────────────
function syncUI() {
  var cart     = getCart();
  var layout   = document.getElementById('cartLayout');
  var emptyEl  = document.getElementById('emptyCart');
  var related  = document.getElementById('relatedSection');
  var countEl  = document.getElementById('itemCountLabel');

  if (cart.length === 0) {
    layout.style.display   = 'none';
    emptyEl.style.display  = 'flex';
    related.style.display  = 'none';
    countEl.textContent    = '0 Items';
  } else {
    layout.style.display   = '';
    emptyEl.style.display  = 'none';
    related.style.display  = '';
    countEl.textContent    = cart.length + (cart.length === 1 ? ' Item' : ' Items');
  }
  updateBadge();
  recalculate();
}

// ── recalculate order totals ───────────────────────────────
function recalculate() {
  var cart           = getCart();
  var subtotal       = cart.reduce(function(s, i){ return s + (i.price * (i.qty || 1)); }, 0);
  var discountAmount = (subtotal * appliedDiscount) / 100;
  var finalTotal     = subtotal - discountAmount;
  document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('total').textContent    = '$' + finalTotal.toFixed(2);
  // Persist pricing snapshot so checkout & confirmation pages stay consistent
  localStorage.setItem('sporta_pricing', JSON.stringify({
    subtotal       : subtotal.toFixed(2),
    discountPct    : appliedDiscount,
    discountAmount : discountAmount.toFixed(2),
    finalTotal     : finalTotal.toFixed(2)
  }));
}

// ── build one cart card ────────────────────────────────────
function buildCard(item) {
  var card = document.createElement('div');
  card.className   = 'cart-card';
  card.dataset.id  = item.id;

  card.innerHTML =
    '<div class="cart-card-img">' +
      '<img src="' + (item.image || '') + '" alt="' + item.name + '" />' +
    '</div>' +
    '<div class="cart-card-info">' +
      '<p class="cart-card-tag">'   + (item.tag     || '')  + '</p>' +
      '<h3 class="cart-card-name">' + item.name             + '</h3>' +
      '<p class="cart-card-variant">' + (item.variant || '') + '</p>' +
      '<p class="cart-card-price" data-unit="' + item.price + '">' +
        '$' + (item.price * (item.qty || 1)).toFixed(2) +
      '</p>' +
    '</div>' +
    '<div class="cart-card-actions">' +
      '<div class="qty-control">' +
        '<button class="qty-btn minus">\u2212</button>' +
        '<span class="qty-value">' + (item.qty || 1) + '</span>' +
        '<button class="qty-btn plus">+</button>' +
      '</div>' +
      '<button class="remove-btn" title="Remove">\uD83D\uDDD1\uFE0F</button>' +
    '</div>';

  wireCard(card, item.id);
  return card;
}

// ── attach events to a card ────────────────────────────────
function wireCard(card, itemId) {
  var minus     = card.querySelector('.qty-btn.minus');
  var plus      = card.querySelector('.qty-btn.plus');
  var qtyEl     = card.querySelector('.qty-value');
  var priceEl   = card.querySelector('.cart-card-price');
  var removeBtn = card.querySelector('.remove-btn');

  minus.addEventListener('click', function() {
    var cart = getCart();
    var item = null;
    for (var i = 0; i < cart.length; i++) { if (cart[i].id === itemId) { item = cart[i]; break; } }
    if (!item || item.qty <= 1) return;
    item.qty--;
    saveCart(cart);
    qtyEl.textContent   = item.qty;
    priceEl.textContent = '$' + (item.price * item.qty).toFixed(2);
    recalculate();
    updateBadge();
  });

  plus.addEventListener('click', function() {
    var cart = getCart();
    var item = null;
    for (var i = 0; i < cart.length; i++) { if (cart[i].id === itemId) { item = cart[i]; break; } }
    if (!item) return;
    item.qty++;
    saveCart(cart);
    qtyEl.textContent   = item.qty;
    priceEl.textContent = '$' + (item.price * item.qty).toFixed(2);
    recalculate();
    updateBadge();
  });

  removeBtn.addEventListener('click', function() {
    var cart = getCart().filter(function(i){ return i.id !== itemId; });
    saveCart(cart);
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    card.style.opacity    = '0';
    card.style.transform  = 'translateX(40px)';
    setTimeout(function() {
      card.remove();
      syncUI();
    }, 320);
  });
}

// ── render all items ───────────────────────────────────────
function renderCart() {
  var container = document.getElementById('cartItems');
  container.innerHTML = '';
  var cart = getCart();
  for (var i = 0; i < cart.length; i++) {
    container.appendChild(buildCard(cart[i]));
  }
  syncUI();
}

// ── "You Might Also Like" quick-add ───────────────────────
function initQuickAdd() {
  var cards = document.querySelectorAll('#relatedSection .card');
  for (var i = 0; i < cards.length; i++) {
    (function(card) {
      var btn    = card.querySelector('.quick-add-btn');
      var h4     = card.querySelector('h4');
      var priceP = card.querySelector('.card-price');
      var img    = card.querySelector('img');
      if (!btn || !h4 || !priceP) return;

      var name  = h4.textContent.trim();
      var price = parseFloat(priceP.textContent.replace(/[^0-9.]/g, '')) || 0;
      var id    = 'related_' + name.toLowerCase().replace(/\s+/g, '_');

      btn.onclick = function(e) {
        e.stopPropagation();
        var cart     = getCart();
        var existing = null;
        for (var j = 0; j < cart.length; j++) { if (cart[j].id === id) { existing = cart[j]; break; } }
        if (existing) {
          existing.qty = (existing.qty || 1) + 1;
        } else {
          cart.push({
            id: id, name: name, tag: 'Related', variant: '',
            price: price, qty: 1, image: img ? img.src : ''
          });
        }
        saveCart(cart);
        renderCart();
        btn.textContent = '\u2705 Added!';
        setTimeout(function(){ btn.textContent = '+ Add to Cart'; }, 1800);
      };
    })(cards[i]);
  }
}

// ── promo code ─────────────────────────────────────────────
document.getElementById('promoBtn').addEventListener('click', function() {
  var code  = document.getElementById('promoInput').value.trim().toUpperCase();
  var msgEl = document.getElementById('promoMsg');
  if (PROMO_CODES[code]) {
    appliedDiscount = PROMO_CODES[code];
    msgEl.textContent = '\u2705 Code applied! ' + appliedDiscount + '% off.';
    msgEl.className   = 'promo-msg success';
  } else {
    appliedDiscount   = 0;
    msgEl.textContent = '\u274C Invalid promo code.';
    msgEl.className   = 'promo-msg error';
  }
  recalculate();
});
document.getElementById('promoInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('promoBtn').click();
});

// ── checkout ───────────────────────────────────────────────
document.querySelector('.btn-checkout').addEventListener('click', function() {
  var total = document.getElementById('total').textContent;
  alert('\uD83D\uDED2 Proceeding to checkout!\nTotal: ' + total);
  window.location.href = './checkout.html';
});

// ── bottom nav ─────────────────────────────────────────────
function setActiveNav(btn) {
  document.querySelectorAll('.bottom-nav button').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
}

// ── BOOT: runs immediately since script is at end of <body> ──
renderCart();
initQuickAdd();
