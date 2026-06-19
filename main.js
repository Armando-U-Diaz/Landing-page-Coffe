/* =========================================================
   JK Foodies Café & Bakery — main.js
   Funcionalidades: Nav scroll, parallax, reveal, forms,
   guests selector, year footer, mobile menu.
   ========================================================= */

'use strict';

/* ─── Utility ─────────────────────────────────────────────── */
const $ = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => [...ctx.querySelectorAll(selector)];

function debounce(fn, ms = 100) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/* ─── 1. Footer year ──────────────────────────────────────── */
const yearEl = $('#footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ─── 2. Navbar: scroll state + mobile toggle ─────────────── */
(function initNav() {
  const header  = $('#nav-header');
  const toggle  = $('#nav-toggle');
  const menu    = $('#nav-menu');
  const links   = $$('.nav-link', menu);

  if (!header || !toggle || !menu) return;

  // Scroll state
  const onScroll = debounce(() => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, 80);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    menu.querySelector('.nav-link')?.focus();
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    toggle.focus();
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (menu.classList.contains('is-open')) closeMenu();
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') &&
        !menu.contains(e.target) &&
        !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });

  // Trap focus inside mobile menu
  menu.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !menu.classList.contains('is-open')) return;
    const focusable = $$('a, button', menu).filter(el => !el.hasAttribute('disabled'));
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });
})();

/* ─── 3. Parallax hero ────────────────────────────────────── */
(function initParallax() {
  const bg = $('#hero-bg');
  if (!bg) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const onScroll = () => {
    const scrollY = window.scrollY;
    const windowH = window.innerHeight;
    if (scrollY > windowH) return;
    const progress = scrollY / windowH;
    bg.style.transform = `translateY(${progress * 14}%)`;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ─── 4. Intersection Observer — reveal & menu cards ─────── */
(function initReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Generic [data-reveal] elements
  const revealEls = $$('[data-reveal]');
  if (revealEls.length === 0) return;

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
    $$('.menu-card').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObs.observe(el));

  // Menu cards stagger
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        cardObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.menu-card').forEach(card => cardObs.observe(card));
})();

/* ─── 5. Active nav link on scroll ───────────────────────── */
(function initActiveLink() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link[href^="#"]');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => obs.observe(s));
})();

/* ─── 6. Guests counter ───────────────────────────────────── */
(function initGuests() {
  const input   = $('#res-guests');
  const btnMinus = $('#guests-minus');
  const btnPlus  = $('#guests-plus');

  if (!input || !btnMinus || !btnPlus) return;

  function updateGuests(delta) {
    const current = parseInt(input.value, 10);
    const next    = Math.max(1, Math.min(12, current + delta));
    input.value   = next;
    btnMinus.disabled = next <= 1;
    btnPlus.disabled  = next >= 12;
  }

  btnMinus.addEventListener('click', () => updateGuests(-1));
  btnPlus.addEventListener('click',  () => updateGuests(+1));

  // Keyboard on input
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp')   { e.preventDefault(); updateGuests(+1); }
    if (e.key === 'ArrowDown') { e.preventDefault(); updateGuests(-1); }
  });

  updateGuests(0); // set initial disabled state
})();

/* ─── 7. Set minimum date to today ───────────────────────── */
(function initDateMin() {
  const dateInput = $('#res-date');
  if (!dateInput) return;
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
})();

/* ─── 8. Form validation & submission ─────────────────────── */
function validateField(field) {
  const errorEl = field.closest('.form-group')?.querySelector('.form-error');
  let message   = '';

  if (field.required && !field.value.trim()) {
    message = 'Este campo es obligatorio.';
  } else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
    message = 'Ingresa un correo electrónico válido.';
  } else if (field.type === 'tel' && field.value && !/^[\d\s\+\-\(\)]{7,}$/.test(field.value)) {
    message = 'Ingresa un número de teléfono válido.';
  } else if (field.tagName === 'SELECT' && field.required && !field.value) {
    message = 'Por favor selecciona una opción.';
  }

  if (errorEl) errorEl.textContent = message;
  field.classList.toggle('is-invalid', !!message);

  return !message;
}

function validateForm(form) {
  const fields = $$('input[required], select[required], textarea[required]', form);
  return fields.map(validateField).every(Boolean);
}

function handleFormSubmit(formId, successId) {
  const form    = $(formId);
  const success = $(successId);
  if (!form || !success) return;

  // Inline validation on blur
  form.addEventListener('focusout', (e) => {
    const field = e.target;
    if (['INPUT','SELECT','TEXTAREA'].includes(field.tagName)) {
      validateField(field);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm(form)) {
      const firstError = form.querySelector('.is-invalid');
      firstError?.focus();
      return;
    }

    const submitBtn   = form.querySelector('[type="submit"]');
    const btnText     = submitBtn?.querySelector('.btn-text');
    const btnSpinner  = submitBtn?.querySelector('.btn-spinner');

    // Loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText)   btnText.textContent = 'Enviando…';
    if (btnSpinner) btnSpinner.hidden = false;

    // Simulate async request
    await new Promise(r => setTimeout(r, 1400));

    // Reset
    if (submitBtn) submitBtn.disabled = false;
    if (btnSpinner) btnSpinner.hidden = true;

    // Success
    const isReserva = formId === '#reservas-form';
    if (btnText) btnText.textContent = isReserva ? 'Confirmar Reserva' : 'Enviar Mensaje';

    form.reset();
    success.hidden = false;
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Hide success after 6 s
    setTimeout(() => { success.hidden = true; }, 6000);
  });
}

handleFormSubmit('#contact-form', '#contact-success');
handleFormSubmit('#reservas-form', '#reservas-success');

/* ─── 9. Smooth scroll for anchor links ───────────────────── */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.getElementById(link.getAttribute('href').slice(1));
  if (!target) return;
  e.preventDefault();
  const navH = $('#nav-header')?.offsetHeight ?? 72;
  const top  = target.getBoundingClientRect().top + window.scrollY - navH;
  window.scrollTo({ top, behavior: 'smooth' });
});

/* ─── 10. Gallery lightbox (minimal) ──────────────────────── */
(function initLightbox() {
  const items = $$('.gallery-item img');
  if (!items.length) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Vista ampliada de imagen');
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Cerrar lightbox">&times;</button>
    <div class="lb-img-wrap">
      <img class="lb-img" src="" alt="" />
    </div>
  `;
  document.body.appendChild(overlay);

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #lightbox-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(27,10,1,.94);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      padding: 20px;
      backdrop-filter: blur(8px);
      animation: lbIn .25s ease;
    }
    #lightbox-overlay.is-open { display: flex; }
    @keyframes lbIn { from { opacity: 0 } to { opacity: 1 } }
    .lb-close {
      position: absolute;
      top: 20px; right: 24px;
      font-size: 2.2rem;
      color: rgba(255,247,237,.8);
      background: none;
      border: none;
      cursor: pointer;
      line-height: 1;
      padding: 8px;
      transition: color .2s;
    }
    .lb-close:hover { color: #fff; }
    .lb-close:focus-visible { outline: 2px solid #FBBF24; border-radius: 4px; }
    .lb-img-wrap {
      max-width: 90vw;
      max-height: 88vh;
      display: flex;
      align-items: center;
    }
    .lb-img {
      max-width: 100%;
      max-height: 88vh;
      border-radius: 10px;
      box-shadow: 0 20px 60px rgba(0,0,0,.5);
      object-fit: contain;
    }
  `;
  document.head.appendChild(style);

  const lbImg  = overlay.querySelector('.lb-img');
  const lbClose = overlay.querySelector('.lb-close');

  function openLightbox(img) {
    lbImg.src = img.src.replace(/w=\d+/, 'w=1400');
    lbImg.alt = img.alt;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  items.forEach(img => {
    const figure = img.closest('figure');
    figure.setAttribute('tabindex', '0');
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', `Ver imagen ampliada: ${img.alt}`);
    figure.addEventListener('click', () => openLightbox(img));
    figure.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img);
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeLightbox();
  });
})();
