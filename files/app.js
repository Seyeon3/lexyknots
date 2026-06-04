/* ==============================================
   LEXYKNOTS — app.js
   ============================================== */

/* ---------- Cart State ---------- */
let cart = [];

/* ---------- Cart Count ---------- */
function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-count').textContent = total;
}

/* ---------- Add to Cart ---------- */
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartCount();
  showToast('🛒 Added: ' + name);
}

/* ---------- Open Cart Modal ---------- */
function openCart() {
  const itemsEl = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p style="color:#aaa; text-align:center; padding:1rem 0;">Your cart is empty 🧺</p>';
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item-row">
        <span>${item.name} x${item.qty}</span>
        <span>₱${item.price * item.qty}</span>
      </div>
    `).join('');
  }

  totalEl.textContent = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  openModal('cart-modal');
}

/* ---------- Open Custom Order Modal ---------- */
function openCustomModal() {
  openModal('custom-modal');
}

/* ---------- Modal Helpers ---------- */
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

/* ---------- Submit Regular Order ---------- */
function submitOrder() {
  const name = document.getElementById('order-name').value.trim();
  if (!name) {
    showToast('⚠️ Please enter your name');
    return;
  }
  closeModal('order-modal');
  showToast('✅ Order received! We\'ll contact you soon 💕');
}

/* ---------- Submit Custom Order ---------- */
function submitCustom() {
  const name = document.getElementById('custom-name').value.trim();
  if (!name) {
    showToast('⚠️ Please enter your name');
    return;
  }
  closeModal('custom-modal');
  showToast('✅ Custom request sent! Expect a DM soon 🎨');
}

/* ---------- Checkout ---------- */
function checkout() {
  if (cart.length === 0) {
    showToast('🛺 Your cart is empty!');
    return;
  }
  closeModal('cart-modal');
  showToast('💌 Redirecting to DM @LexyKnots!');
  setTimeout(() => {
    window.open('https://www.facebook.com/LexyKnots', '_blank');
  }, 1000);
}

/* ---------- Category Filter ---------- */
function filterCat(cat, el) {
  document.querySelectorAll('.cat-pill').forEach(pill => pill.classList.remove('active'));
  el.classList.add('active');

  document.querySelectorAll('.card').forEach(card => {
    const cardCats = card.dataset.cat || '';
    card.style.display = (cat === 'all' || cardCats.includes(cat)) ? '' : 'none';
  });
}

/* ---------- Toast Notification ---------- */
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---------- Close modal on overlay click ---------- */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});
