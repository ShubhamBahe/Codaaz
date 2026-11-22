/* Edit these values to change the page. */
const CONFIG = {
  brand: 'Codaaz',
  whatsapp: '808071058',   /* your WhatsApp number with country code, no + or spaces */
  price: "connect with us",                /* price including the included tags */
  included: 2,                /* QR tags included in the price */
  extraTag: 300,              /* price per extra tag */
  restaurantsToday: 57        /* demo number for the notice, replace or remove */
};

const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const $ = id => document.getElementById(id);

document.querySelectorAll('[data-fill="included"]').forEach(e => e.textContent = CONFIG.included);
document.querySelectorAll('[data-fill="extra"]').forEach(e => e.textContent = inr(CONFIG.extraTag));
$('yr').textContent = '© ' + new Date().getFullYear() + ' Codaaz Software';

/* Illustrative QR (decorative, not scannable) */
(function () {
  const n = 25; let s = 20261121;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const fin = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  let out = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fin(x, y) && rnd() > 0.5) out += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>';
  [[0, 0], [n - 7, 0], [0, n - 7]].forEach(([x, y]) => {
    out += '<rect x="' + (x + .5) + '" y="' + (y + .5) + '" width="6" height="6" fill="none" stroke="#2a1f18" stroke-width="1"/>';
    out += '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>';
  });
  $('qr').innerHTML = out;
})();

/* ---------- Demo ---------- */
const MENU = [
  { id: 1, name: 'Paneer Tikka', veg: true, price: 240, emoji: '🍢', desc: 'Smoky paneer cubes grilled in the tandoor with mint chutney.', img: 'images/paneer-tikka.jpg' },
  { id: 2, name: 'Masala Dosa', veg: true, price: 140, emoji: '🌯', desc: 'Crisp rice crepe filled with spiced potato, served with sambar.', img: 'images/masala-dosa.jpg' },
  { id: 3, name: 'Chicken 65', veg: false, price: 280, emoji: '🍗', desc: 'Spicy fried chicken tossed with curry leaves and green chilli.', img: 'images/chicken-65.jpg' },
  { id: 4, name: 'Butter Chicken', veg: false, price: 360, emoji: '🍛', desc: 'Tender chicken in a rich tomato and butter gravy.', img: 'images/butter-chicken.jpg' },
  { id: 5, name: 'Masala Chai', veg: true, price: 40, emoji: '☕', desc: 'Fresh milk tea brewed with ginger and cardamom.', img: 'images/masala-chai.jpg' },
  { id: 6, name: 'Gulab Jamun', veg: true, price: 90, emoji: '🍮', desc: 'Soft milk dumplings soaked in warm saffron syrup.', img: 'images/gulab-jamun.jpg' }
];
const STATUS = ['Preparing', 'Ready', 'Delivered'];
const NEXT = ['Mark ready', 'Mark delivered', 'Done'];
const TILT = [-1.5, 1, -.5, 1.5];

let filter = 'all';
let state = { cart: {}, nextId: 1043, mine: null, orders: [] };
const cartCount = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
const cartTotal = () => MENU.reduce((t, m) => t + (state.cart[m.id] || 0) * m.price, 0);

function renderMenu() {
  $('menuList').innerHTML = MENU.filter(m => filter === 'all' || (filter === 'veg') === m.veg).map(m => {
    const q = state.cart[m.id] || 0;
    const ctl = q
      ? '<span class="step"><button type="button" data-a="dec" data-id="' + m.id + '" aria-label="Remove one ' + m.name + '">&minus;</button><output>' + q + '</output><button type="button" data-a="inc" data-id="' + m.id + '" aria-label="Add one ' + m.name + '">+</button></span>'
      : '<button type="button" class="add" data-a="inc" data-id="' + m.id + '">Add</button>';
    return '<div class="item"><div class="item-line"><span class="vm' + (m.veg ? '' : ' nv') + '" role="img" aria-label="' + (m.veg ? 'Veg' : 'Non-veg') + '"></span><b>' + m.name + '</b><span class="dots"></span><span class="p">' + inr(m.price) + '</span></div>' + ctl + '</div>';
  }).join('');
}
function renderCart() {
  const c = cartCount();
  $('cartSum').innerHTML = c ? '<b>' + c + (c === 1 ? ' item' : ' items') + '</b> · ' + inr(cartTotal()) : 'Cart is empty';
  $('placeBtn').disabled = !c;
  if ($('cartCount')) $('cartCount').textContent = c;
}
function renderGuestStatus() {
  const el = $('gStatus'), o = state.orders.find(x => x.id === state.mine);
  if (!o) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = '<span class="pill s' + o.status + '">' + STATUS[o.status] + '</span><span>Order #' + o.id + (o.status === 2 ? ' · Enjoy your meal' : '') + '</span>';
}
function renderBoard() {
  if (!state.orders.length) { $('orderList').innerHTML = '<p class="rail-empty">No tickets yet.<br>Place an order on the phone.</p>'; return; }
  $('orderList').innerHTML = state.orders.map((o, i) => {
    const lines = o.items.map(it => '<li>' + it.qty + ' × ' + it.name + '</li>').join('');
    const btn = o.status < 2
      ? '<button type="button" class="btn btn-sm" data-a="adv" data-oid="' + o.id + '">' + NEXT[o.status] + '</button>'
      : '<a class="btn btn-sm" target="_blank" rel="noopener" href="' + invoiceLink(o) + '">Send invoice</a>';
    return '<article class="ticket" style="--tilt:' + TILT[i % TILT.length] + 'deg"><header><b>#' + o.id + ' · T' + o.table + '</b><span class="pill s' + o.status + '">' + STATUS[o.status] + '</span></header><ul>' + lines + '</ul><div class="tot"><span>Total</span><span>' + inr(o.total) + '</span></div>' + btn + '</article>';
  }).join('');
}
function renderAll() { renderMenu(); renderCart(); renderGuestStatus(); renderBoard(); }

$('menuList').addEventListener('click', e => {
  const b = e.target.closest('button[data-a]'); if (!b) return;
  const id = Number(b.dataset.id), q = state.cart[id] || 0;
  if (b.dataset.a === 'inc') state.cart[id] = q + 1;
  else if (q <= 1) delete state.cart[id]; else state.cart[id] = q - 1;
  renderMenu(); renderCart();
});
$('placeBtn').addEventListener('click', () => {
  if (!cartCount()) return;
  const items = MENU.filter(m => state.cart[m.id]).map(m => ({ name: m.name, qty: state.cart[m.id] }));
  const order = { id: state.nextId++, table: 4, status: 0, items: items, total: cartTotal() };
  state.orders.unshift(order); state.mine = order.id; state.cart = {};
  renderAll();
});
$('orderList').addEventListener('click', e => {
  const b = e.target.closest('button[data-a="adv"]'); if (!b) return;
  const o = state.orders.find(x => x.id === Number(b.dataset.oid));
  if (o && o.status < 2) { o.status++; renderGuestStatus(); renderBoard(); }
});
$('resetBtn').addEventListener('click', () => { state = { cart: {}, nextId: 1043, mine: null, orders: [] }; renderAll(); });
renderAll();

/* ---------- Bill ---------- */
function tags() {
  let n = parseInt($('tagCount').value, 10);
  if (!Number.isFinite(n)) n = CONFIG.included;
  return Math.min(200, Math.max(CONFIG.included, n));
}
function orderText() {
  const n = tags(), extra = n - CONFIG.included, v = id => $(id).value.trim() || '-';
  return ['Hi ' + CONFIG.brand + ', I want to order the QR Menu.', 'Restaurant: ' + v('fRest'), 'Phone: ' + v('fPhone'),
    'QR tags: ' + n + ' (' + extra + ' extra)', 'Total: ' + inr(CONFIG.price + extra * CONFIG.extraTag)].join('\n');
}
function renderOrder() {
  const n = tags(), extra = n - CONFIG.included, cost = extra * CONFIG.extraTag;
  $('lnBase').textContent = 'Menu + ' + CONFIG.included + ' tags';
  $('lnBaseV').textContent = inr(CONFIG.price);
  $('lnExtra').textContent = extra + ' extra × ' + inr(CONFIG.extraTag);
  $('lnExtraV').textContent = inr(cost);
  $('lnTotal').textContent = inr(CONFIG.price + cost);
  $('waLink').href = 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(orderText());
}
$('tagMinus').addEventListener('click', () => { $('tagCount').value = Math.max(CONFIG.included, tags() - 1); renderOrder(); });
$('tagPlus').addEventListener('click', () => { $('tagCount').value = Math.min(200, tags() + 1); renderOrder(); });
$('tagCount').addEventListener('input', renderOrder);
$('tagCount').addEventListener('change', () => { $('tagCount').value = tags(); renderOrder(); });
['fRest', 'fPhone'].forEach(id => $(id).addEventListener('input', renderOrder));
renderOrder();

/* ---------- Veg filter, invoice, Excel export, notice ---------- */
$('chips').addEventListener('click', e => {
  const b = e.target.closest('button[data-f]'); if (!b) return;
  filter = b.dataset.f;
  $('chips').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  renderMenu();
});
function invoiceLink(o) {
  const t = ['*Invoice #' + o.id + '* (Table ' + o.table + ')'].concat(o.items.map(i => i.qty + ' x ' + i.name), ['Total: ' + inr(o.total), 'Thank you!']).join('\n');
  return 'https://wa.me/?text=' + encodeURIComponent(t);
}
$('csvBtn').addEventListener('click', () => {
  if (!state.orders.length) { alert('Place an order first, then export it.'); return; }
  const rows = [['Order', 'Table', 'Items', 'Total', 'Status']].concat(state.orders.map(o => [o.id, o.table, o.items.map(i => i.qty + ' x ' + i.name).join('; '), o.total, STATUS[o.status]]));
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'orders.csv'; a.click();
});
setTimeout(() => {
  $('toastTxt').textContent = CONFIG.restaurantsToday + ' restaurants updated their QR menu today.';
  $('toast').hidden = false;
  setTimeout(() => { $('toast').hidden = true; }, 7000);
}, 3500);

/* ---------- Hero dish wheel (put photos in images/ and set img: 'images/x.jpg' in MENU) ---------- */
(function () {
  const ring = $('ring'), stage = $('stage'), n = MENU.length, step = 360 / n;
  let cur = 0, rot = 0;
  const plates = MENU.map((m, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'plate'; b.style.setProperty('--a', (i * step) + 'deg'); b.setAttribute('aria-label', m.name); b.dataset.name = m.name;
    b.innerHTML = m.img ? '<img src="' + m.img + '" alt="">' : '<span aria-hidden="true">' + m.emoji + '</span>';
    b.addEventListener('click', () => go(i));
    ring.appendChild(b); return b;
  });
  function size() { const w = stage.clientWidth; ring.style.setProperty('--r', w * .34 + 'px'); ring.style.setProperty('--p', w * .16 + 'px'); }
  function go(i) {
    cur = (i + n) % n;
    const t = 180 - cur * step; rot = t + 360 * Math.round((rot - t) / 360);
    ring.style.setProperty('--rot', rot + 'deg');
    plates.forEach((p, k) => p.classList.toggle('on', k === cur));
    const m = MENU[cur];
    $('dPrice').textContent = inr(m.price); $('dName').textContent = m.name; $('dDesc').textContent = m.desc;
  }
  $('prevD').addEventListener('click', () => go(cur - 1));
  $('nextD').addEventListener('click', () => go(cur + 1));
  $('dAdd').addEventListener('click', e => {
    const m = MENU[cur]; state.cart[m.id] = (state.cart[m.id] || 0) + 1; renderMenu(); renderCart();
    const b = e.currentTarget; b.textContent = 'Added'; setTimeout(() => { b.textContent = 'Add to cart'; }, 900);
  });
  window.addEventListener('resize', size);
  size(); ring.style.transition = 'none'; plates.forEach(p => p.style.transition = 'none'); go(0);
  requestAnimationFrame(() => requestAnimationFrame(() => { ring.style.transition = ''; plates.forEach(p => p.style.transition = ''); }));
})();
