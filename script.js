/* ==========================================================================
   LED SOLUTIONS — COMMERCIAL LIGHTING LEAD GENERATION LANDING PAGE
   script.js
   --------------------------------------------------------------------------
   CONTENTS
   01. Configuration (FORM INTEGRATION + ANALYTICS INTEGRATION)
   02. Analytics event layer
   03. CTA click tracking
   04. Before / after comparison slider
   05. Lead form: validation, submission, states
   ========================================================================== */
(function () {
  'use strict';

  /* ========================================================================
     01. CONFIGURATION
     ======================================================================== */

  /* FORM INTEGRATION ------------------------------------------------------
     Paste the production endpoint here. It can be:
       · a WordPress/Elementor form handler or admin-ajax URL
       · a CRM webhook (HubSpot, Zoho, Pipedrive, etc.)
       · a serverless function that emails the sales team
     While this is an empty string the form runs in DEMO MODE: it validates,
     shows the loading state and shows the success state, but sends nothing.
     ----------------------------------------------------------------------- */
  var FORM_ENDPOINT = '';

  /* Set to 'json' if the endpoint expects application/json instead of
     multipart/form-data. Multipart is required for the file upload field. */
  var FORM_ENCODING = 'multipart';

  /* ANALYTICS INTEGRATION -------------------------------------------------
     Events are pushed to window.dataLayer so GTM or GA4 can pick them up.
     Add the GA4/GTM snippet in index.html <head>, then create triggers for:
       cta_click · form_start · form_submit · generate_lead · form_error
     ----------------------------------------------------------------------- */
  window.dataLayer = window.dataLayer || [];


  /* ========================================================================
     02. ANALYTICS EVENT LAYER
     ======================================================================== */
  function track(eventName, payload) {
    var data = payload || {};
    data.event = eventName;
    window.dataLayer.push(data);

    // Also forward to gtag() if GA4 is loaded directly rather than via GTM.
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, payload || {});
    }
  }


  /* ========================================================================
     03. CTA CLICK TRACKING
     Any element with data-cta="..." fires a cta_click event.
     ======================================================================== */
  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-cta]');
    if (!trigger) return;

    track('cta_click', {
      cta_id: trigger.getAttribute('data-cta'),
      cta_text: (trigger.textContent || '').trim().slice(0, 80)
    });
  });


  /* ========================================================================
     04. BEFORE / AFTER COMPARISON SLIDER
     Layout does not depend on this script: without JS the panes still show
     at the default 50% split, and below 760px they simply stack.
     ======================================================================== */
  (function initBeforeAfter() {
    var range  = document.getElementById('ba-range');
    var stage  = document.getElementById('ba-stage');
    var handle = document.getElementById('ba-handle');
    if (!range || !stage || !handle) return;

    function apply(value) {
      // Set as a custom property so the mobile stacked layout can override it.
      stage.style.setProperty('--ba-clip', (100 - value) + '%');
      handle.style.left  = value + '%';
      range.setAttribute('aria-valuetext',
        Math.round(value) + '% before, ' + Math.round(100 - value) + '% after');
    }

    range.addEventListener('input', function () { apply(this.value); });
    apply(range.value);
  })();


  /* ========================================================================
     05. LEAD FORM
     ======================================================================== */
  (function initLeadForm() {
    var form = document.getElementById('lead-form');
    if (!form) return;

    var submitBtn   = document.getElementById('lead-submit');
    var successBox  = document.getElementById('form-success');
    var formError   = document.getElementById('form-error');
    var formStarted = false;

    /* --- Validation rules ------------------------------------------------
       Add a field here and give the input `required` in the HTML.
       --------------------------------------------------------------------- */
    var rules = {
      name:   { message: 'Please enter your name.' },
      email:  {
        message: 'Please enter a valid email address.',
        test: function (value) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value); }
      },
      phone:  {
        message: 'Please enter a contact phone number.',
        test: function (value) { return value.replace(/[^\d]/g, '').length >= 8; }
      },
      suburb: { message: 'Please tell us the suburb or property.' }
    };

    function fieldWrapper(input) { return input.closest('.field'); }

    function showError(input, message) {
      var wrapper = fieldWrapper(input);
      if (!wrapper) return;
      wrapper.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      var errorEl = wrapper.querySelector('.error');
      if (errorEl) errorEl.textContent = message;
    }

    function clearError(input) {
      var wrapper = fieldWrapper(input);
      if (!wrapper) return;
      wrapper.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
      var errorEl = wrapper.querySelector('.error');
      if (errorEl) errorEl.textContent = '';
    }

    function validateField(input) {
      var rule  = rules[input.name];
      if (!rule) return true;
      var value = (input.value || '').trim();

      if (!value) { showError(input, rule.message); return false; }
      if (rule.test && !rule.test(value)) { showError(input, rule.message); return false; }

      clearError(input);
      return true;
    }

    /* --- Live feedback --------------------------------------------------- */
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener('blur', function () { validateField(input); });
      input.addEventListener('input', function () {
        if (fieldWrapper(input) && fieldWrapper(input).classList.contains('has-error')) {
          validateField(input);
        }
      });
    });

    /* --- form_start: fired once, on first interaction -------------------- */
    form.addEventListener('input', function () {
      if (formStarted) return;
      formStarted = true;
      track('form_start', { form_id: 'lead-form', form_name: 'Lighting savings estimate' });
    }, { once: false });

    /* --- Submission ------------------------------------------------------ */
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      formError.classList.remove('is-visible');

      // Honeypot: silently succeed for bots, send nothing.
      if (form.elements.website && form.elements.website.value) return;

      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var input = form.elements[name];
        if (input && !validateField(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        formError.textContent = 'Please check the highlighted fields and try again.';
        formError.classList.add('is-visible');
        firstInvalid.focus();
        track('form_error', { form_id: 'lead-form', field: firstInvalid.name });
        return;
      }

      setSubmitting(true);
      track('form_submit', { form_id: 'lead-form' });

      sendLead()
        .then(function () {
          showSuccess();
          track('generate_lead', {
            form_id: 'lead-form',
            form_name: 'Lighting savings estimate',
            lead_type: 'commercial_lighting'
          });
        })
        .catch(function () {
          setSubmitting(false);
          formError.textContent =
            'We could not send your enquiry just now. Please try again, or call 1300 763 122.';
          formError.classList.add('is-visible');
          formError.scrollIntoView({ block: 'center' });
          track('form_error', { form_id: 'lead-form', field: 'network' });
        });
    });

    function setSubmitting(isSubmitting) {
      form.classList.toggle('is-submitting', isSubmitting);
      submitBtn.disabled = isSubmitting;
      submitBtn.querySelector('.btn-label').textContent =
        isSubmitting ? 'Sending your enquiry…' : 'Get my free lighting savings estimate';
    }

    function sendLead() {
      var formData = new FormData(form);
      formData.delete('website');

      // DEMO MODE — no endpoint configured. Nothing is transmitted.
      if (!FORM_ENDPOINT) {
        return new Promise(function (resolve) {
          setTimeout(resolve, 900);
        });
      }

      var options = { method: 'POST' };

      if (FORM_ENCODING === 'json') {
        var payload = {};
        formData.forEach(function (value, key) {
          if (!(value instanceof File)) payload[key] = value;
        });
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(payload);
      } else {
        options.body = formData; // multipart — keeps the file upload field
      }

      return fetch(FORM_ENDPOINT, options).then(function (response) {
        if (!response.ok) throw new Error('Request failed: ' + response.status);
        return response;
      });
    }

    function showSuccess() {
      form.hidden = true;
      successBox.hidden = false;
      successBox.focus();
    }
  })();

})();
