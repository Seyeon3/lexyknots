/* ==============================================
   LEXYKNOTS — app.js
   ============================================== */

/* ---------- Cart State ---------- */
let cart = [];

/* ---------- Cart Count ---------- */
function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) cartCountEl.textContent = total;
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
      <div class="cart-item-row" style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f3e8ff;">
        <span>${item.name} x${item.qty}</span>
        <span>₱${item.price * item.qty}</span>
      </div>
    `).join('');
  }

  if (totalEl) totalEl.textContent = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  openModal('cart-modal');
}

/* ---------- Open Checkout Form Modal ---------- */
function openCheckout() {
  if (cart.length === 0) {
    showToast('🛺 Your cart is empty!');
    return;
  }
  closeModal('cart-modal'); 
  openModal('checkout-modal'); 
}

/* ---------- Open Custom Order Modal ---------- */
function openCustomModal() {
  openModal('custom-modal');
}

/* ---------- Modal Helpers ---------- */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
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
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

/* ---------- Close modal on overlay click ---------- */
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

/* ---------- Final Checkout Logic via EmailJS Form ---------- */
function checkout() {
  if (cart.length === 0) {
    alert('🛺 Your cart is empty!');
    return;
  }

  // 1. Kuhanin ang values mula sa custom modal inputs
  const customerName = document.getElementById('checkout-name').value.trim();
  const customerContact = document.getElementById('checkout-contact').value.trim();
  const customerEmail = document.getElementById('checkout-email').value.trim();
  const customerAddress = document.getElementById('checkout-address').value.trim();
  const customerNotes = document.getElementById('checkout-notes').value.trim() || "No notes provided.";

  // Validation para sa required fields
  if (!customerName || !customerContact || !customerEmail || !customerAddress) {
    alert("⚠️ Please fill in all required fields (*) before placing your order!");
    return;
  }

  // 2. Generate Random Order ID
  const randomId = "LK-" + Math.floor(1000 + Math.random() * 9000);

  // 3. I-compute at i-format ang listahan ng order
  let orderList = "";
  let totalComputed = 0;
  
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.qty;
    totalComputed += itemTotal;
    orderList += `${index + 1}. ${item.name} (Qty: ${item.qty}) - ₱${itemTotal}\n`;
  });
  
  orderList += `\nTOTAL AMOUNT TO PAY: ₱${totalComputed}`;
  orderList += `\nDELIVERY ADDRESS: ${customerAddress}`;
  orderList += `\nCUSTOMER NOTES: ${customerNotes}`;

  // 4. Loading State Animation sa Button
  const checkoutBtn = document.getElementById("checkout-submit-btn");
  const originalText = checkoutBtn ? checkoutBtn.textContent : "Place Order 💕";
  
  if (checkoutBtn) {
    checkoutBtn.textContent = "Processing Order... ⏳";
    checkoutBtn.disabled = true;
  }

  // 5. MAPALAD NA TUGMA SA EMAILJS SETTINGS MO (Ginawang 'email' para tugma sa {{email}} field mo)
  const templateParams = {
    order_id: randomId,
    from_name: customerName,
    contact_info: customerContact,
    email: customerEmail,        // TUGMA NA SA {{email}} NG EMAILJS DASHBOARD MO!
    reply_to: customerEmail,
    order_items: orderList
  };

  // 6. Ipadala na kay EmailJS gamit ang iyong template_pzgesnm
  emailjs.send('service_i3abqz7', 'template_pzgesnm', templateParams)
    .then(function(response) {
       closeModal('checkout-modal');
       
       const idEl = document.getElementById('success-order-id');
       if (idEl) idEl.textContent = randomId;
       
       openModal('success-modal');

       // Reset cart & form
       cart = [];
       updateCartCount();
       document.getElementById('checkout-form').reset();

       if (checkoutBtn) {
         checkoutBtn.textContent = originalText;
         checkoutBtn.disabled = false;
       }
    })
    .catch(function(error) {
       alert("❌ EMAILJS ERROR: " + JSON.stringify(error));
       if (checkoutBtn) {
         checkoutBtn.textContent = originalText;
         checkoutBtn.disabled = false;
       }
    });
}