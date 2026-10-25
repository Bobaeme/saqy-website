/**
 * SaqyFly — main.js
 * Handles Navigation, Year, and Google Apps Script Form Submission (with CORS / redirect handling)
 */

// Configure your Google Apps Script Web App URL here
// Example: 'https://script.google.com/macros/s/AKfycbx.../exec'
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

      // Guard: Check if Google Apps Script URL has been configured
      if (!GOOGLE_APPS_SCRIPT_URL || GOOGLE_APPS_SCRIPT_URL.trim() === '') {
        showStatus('error', '⚠️ Backend email service is not yet configured. Please follow the Google Apps Script setup guide or reach out via email directly.');
        return;
      }

      // Basic client-side validation
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();

      if (!name || !email || !message) {
        showStatus('error', '⚠️ Please complete all required fields.');
        return;
      }

      // Prepare payload
      const formData = new FormData(form);
      const payload = {
        enquiry_type: formData.get('enquiry_type') || '',
        name: formData.get('name') || '',
        organisation: formData.get('organisation') || '',
        email: formData.get('email') || '',
        service_requested: formData.get('service_requested') || '',
        location: formData.get('location') || '',
        message: formData.get('message') || '',
        submission_date: new Date().toISOString()
      };

      showStatus('loading', '⏳ Sending your enquiry securely...');
      if (submitBtn) submitBtn.disabled = true;

      try {
        /**
         * Note regarding Google Apps Script CORS:
         * Standard fetch with 'application/json' will trigger an OPTIONS preflight that GAS does not support.
         * Using URLSearchParams or FormData with mode 'no-cors' or POST to GAS allows redirection handling.
         * For reliable JSON parsing in GAS, URLSearchParams or FormData works best.
         */
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(payload)) {
          params.append(key, value);
        }

        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          body: params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        // Parse result
        const result = await response.json().catch(() => null);

        if (result && result.status === 'success') {
          showStatus('success', '✅ Thank you! Your enquiry has been received and emailed to our team. We will get back to you within 2–3 business days.');
          form.reset();
        } else if (result && result.message) {
          showStatus('error', `❌ Unable to process: ${result.message}`);
        } else {
          // Fallback check if response was ok
          if (response.ok) {
            showStatus('success', '✅ Thank you! Your enquiry has been successfully delivered.');
            form.reset();
          } else {
            showStatus('error', '❌ Submission error. Please verify the backend URL or email us directly.');
          }
        }
      } catch (err) {
        console.error('Submission error:', err);
        showStatus('error', '❌ Connection error. Please check your internet connection or email us directly.');
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
