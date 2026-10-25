/* ============================================================
   SAQY — main.js
   Handles: Nav scroll, mobile menu, form submission, year
   ============================================================ */

// ── Year ──
document.querySelectorAll('#year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// ── Mobile Nav ──
const hamburger   = document.getElementById('hamburger');
const mobileNav   = document.getElementById('mobileNav');
const navClose    = document.getElementById('navClose');

function openMobileNav() {
  mobileNav?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  mobileNav?.classList.remove('open');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', openMobileNav);
navClose?.addEventListener('click', closeMobileNav);

// ── Nav scroll shadow ──
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav?.classList.add('scrolled');
  } else {
    nav?.classList.remove('scrolled');
  }
}, { passive: true });

// ── Active nav link (single-page anchors) ──
const navLinks = document.querySelectorAll('.nav__links a');
function setActiveLink() {
  const path = window.location.pathname;
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (path === '/' && href === '/#about') return;
    if (href && href.startsWith('/') && !href.includes('#')) {
      if (path.startsWith(href) && href !== '/') {
        link.classList.add('active');
      }
    }
  });
}
setActiveLink();

// ── Contact Form ──
const form       = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

/*
  TO ACTIVATE FORM SUBMISSIONS:
  1. Sign up at https://formspree.io (free tier allows 50 submissions/month)
  2. Create a new form and copy your form endpoint, e.g.:
     https://formspree.io/f/xabc1234
  3. Replace FORM_ENDPOINT below with your actual endpoint.
  4. Delete the "not yet configured" notice in the HTML.
*/
const FORM_ENDPOINT = ''; // ← Paste your Formspree endpoint here

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!FORM_ENDPOINT) {
    showStatus('error', '⚠️ Contact form is not yet configured. Please email us directly at s.emeskn@gmail.com.');
    return;
  }

  const submitBtn = form.querySelector('.form__submit');
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  const data = new FormData(form);

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    });

    if (res.ok) {
      showStatus('success', '✅ Message sent! We'll be in touch within 2–3 business days.');
      form.reset();
    } else {
      const json = await res.json().catch(() => ({}));
      const msg = json?.errors?.map(e => e.message).join(', ') || 'Unknown error.';
      showStatus('error', `❌ Send failed: ${msg}`);
    }
  } catch {
    showStatus('error', '❌ Network error. Please try again or email us directly.');
  } finally {
    submitBtn.textContent = 'Send Message';
    submitBtn.disabled = false;
  }
});

function showStatus(type, message) {
  if (!formStatus) return;
  formStatus.className = `form__status ${type}`;
  formStatus.textContent = message;
  formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="/#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').replace('/#', '');
    if (window.location.pathname === '/') {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        closeMobileNav();
      }
    }
  });
});

// ── Intersection observer for nav active state on scroll ──
const sections = document.querySelectorAll('section[id], div[id]');
if (sections.length && window.location.pathname === '/') {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `/#${entry.target.id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}
