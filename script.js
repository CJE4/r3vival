// ============================================================
// R3VIVAL — shared script (loader, nav, animation, forms)
// ============================================================

// ── LOADER ──
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('out');
    setTimeout(() => loader.style.display = 'none', 700);
  }, 900);
});

// ── NAV ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
}
function closeMobile() {
  if (hamburger) hamburger.classList.remove('open');
  if (mobileMenu) mobileMenu.classList.remove('open');
}

// ── SCROLL PROGRESS ──
window.addEventListener('scroll', () => {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  bar.style.width = pct + '%';
});

// ── COUNTER ANIMATION ──
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = Date.now();
  function update() {
    const progress = Math.min((Date.now() - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(ease * target);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  update();
}

// ── PARTICLES (hero background) ──
(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() {
    W = canvas.width = canvas.parentElement.offsetWidth;
    H = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.4 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -Math.random() * 0.35 - 0.08;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = Math.random() > 0.7 ? '#d4af6a' : '#ff4fa3';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      this.alpha -= 0.0007;
      if (this.y < -10 || this.alpha <= 0) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  for (let i = 0; i < 70; i++) particles.push(new Particle());
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ── ACTIVE NAV HIGHLIGHTING (tab-based) ──
function setActiveNavLink(tab) {
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tab);
  });
}

// ── TAB SWITCHING ──
let countersFired = false;
function switchTab(tab) {
  const panels = document.querySelectorAll('.tab-panel');
  const target = document.getElementById('tab-' + tab);
  if (!target) return;

  panels.forEach(p => p.classList.remove('active'));
  target.classList.add('active');
  setActiveNavLink(tab);
  window.scrollTo({ top: 0, behavior: 'auto' });
  history.replaceState(null, '', '#' + tab);

  // Reveal fade-up / card content within the newly shown panel
  const revealEls = target.querySelectorAll('.fade-up, .feature-card, .product-card');
  revealEls.forEach((el, i) => {
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('visible'), 30 + i * 70);
  });

  // Fire hero counters once, the first time the Home tab is shown
  if (tab === 'home' && !countersFired) {
    countersFired = true;
    document.querySelectorAll('.stats-bar [data-target]').forEach(animateCounter);
  }

  // Re-run shop filtering in case the Shop tab was just revealed
  if (tab === 'shop' && typeof updateShopProducts === 'function') {
    updateShopProducts();
  }
}

// Initialize on load: read hash, default to home
document.addEventListener('DOMContentLoaded', () => {
  const validTabs = ['home', 'about', 'shop', 'prices', 'community', 'contact'];
  const hash = window.location.hash.replace('#', '');
  switchTab(validTabs.includes(hash) ? hash : 'home');
});

// ── CONTACT FORM (Formspree) ──
function submitContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.form-submit');
  const originalText = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;

  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  }).then(res => {
    if (res.ok) {
      btn.textContent = '✓ Message Sent!';
      form.reset();
    } else {
      btn.textContent = 'Something went wrong — try again';
    }
  }).catch(() => {
    btn.textContent = 'Something went wrong — try again';
  }).finally(() => {
    setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 3000);
  });
}

// ── NOTIFY FORM (Formspree) ──
function submitNotifyForm(e) {
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('notifyMessage');
  const btn = form.querySelector('button');
  btn.disabled = true;

  fetch(form.action, {
    method: 'POST',
    body: new FormData(form),
    headers: { 'Accept': 'application/json' }
  }).then(res => {
    msg.textContent = res.ok
      ? "✓ You're on the list — we'll email you when the next drop lands."
      : 'Something went wrong — please try again.';
    if (res.ok) form.reset();
  }).catch(() => {
    msg.textContent = 'Something went wrong — please try again.';
  }).finally(() => {
    btn.disabled = false;
  });
}

// ============================================================
// SHOP — search & filter
// ============================================================
(function () {
  const searchBar = document.getElementById('searchBar');
  if (!searchBar) return; // not on this page

  function updateProducts() {
    const searchValue = searchBar.value.toLowerCase();
    const activeFilter = document.querySelector('.g-filter.active');
    const filter = activeFilter ? activeFilter.dataset.filter : 'all';
    let count = 0;

    document.querySelectorAll('.product-card').forEach(card => {
      const title = card.querySelector('.product-title').textContent.toLowerCase();
      const category = card.dataset.category || '';
      const matchesSearch = title.includes(searchValue);
      const matchesFilter = filter === 'all' || category.includes(filter);

      if (matchesSearch && matchesFilter) {
        card.style.display = 'block';
        count++;
      } else {
        card.style.display = 'none';
      }
    });

    const resultCount = document.getElementById('resultCount');
    if (resultCount) resultCount.textContent = count;
  }

  window.updateShopProducts = updateProducts;

  searchBar.addEventListener('input', updateProducts);
  document.querySelectorAll('.g-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.g-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateProducts();
    });
  });

  updateProducts();
})();