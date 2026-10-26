/**
 * SaqyFly — main.js
 * Handles Navigation, Year, and Enquiry Form Submission (Netlify Forms native handling)
 */

// Optional: If you also wish to mirror enquiries to Google Sheets via Google Apps Script:
const GOOGLE_APPS_SCRIPT_URL = '';

document.addEventListener('DOMContentLoaded', () => {
  // Update year
  document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Mobile menu toggle
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const navClose = document.getElementById('navClose');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  window.closeMobileNav = function() {
    if (mobileNav) {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  if (navClose) {
    navClose.addEventListener('click', window.closeMobileNav);
  }

  // Handle Enquiry Form Submission via Google Apps Script
  const form = document.getElementById('enquiryForm');
  const formStatus = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    // Check pre-selected service from URL query params (e.g., ?service=spraying)
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const serviceSelect = document.getElementById('service_requested');
    if (serviceSelect && serviceParam) {
      if (serviceParam.toLowerCase().includes('spray')) {
        serviceSelect.value = 'Crop Spraying Service';
      } else if (serviceParam.toLowerCase().includes('monitor')) {
        serviceSelect.value = 'Aerial Field Monitoring';
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic client-side validation
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();

      if (!name || !email || !message) {
        showStatus('error', '⚠️ Please complete all required fields.');
        return;
      }

      showStatus('loading', '⏳ Sending your enquiry...');
      if (submitBtn) submitBtn.disabled = true;

      // Prepare payload with form-name for Netlify Forms
      const formData = new FormData(form);
      if (!formData.get('form-name')) {
        formData.append('form-name', 'contact');
      }

      const targetEndpoint = (GOOGLE_APPS_SCRIPT_URL && GOOGLE_APPS_SCRIPT_URL.trim() !== '')
        ? GOOGLE_APPS_SCRIPT_URL
        : '/';

      try {
        const response = await fetch(targetEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams(formData).toString()
        });

        if (response.ok) {
          showStatus('success', '✅ Thank you! Your enquiry has been received. We will get back to you within 2–3 business days.');
          form.reset();
        } else {
          showStatus('error', '❌ Submission error. Please try again or email us directly at s.emeskn@gmail.com.');
        }
      } catch (err) {
        console.error('Submission error:', err);
        showStatus('error', '❌ Connection error. Please try again or email us directly at s.emeskn@gmail.com.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  function showStatus(type, message) {
    if (!formStatus) return;
    formStatus.className = `form__status ${type}`;
    formStatus.textContent = message;
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
