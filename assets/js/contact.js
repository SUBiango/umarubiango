/* Contact page: nav + form validation and Netlify Forms submission. */
document.addEventListener('DOMContentLoaded', function() {
  initNav();

  var form = document.getElementById('contact-form');
  var success = document.getElementById('contact-success');
  var nameInput = document.getElementById('name');
  var emailInput = document.getElementById('email');
  var messageInput = document.getElementById('message');

  if (!form) return;

  // Validation helper
  function validateField(field) {
    var errorEl = document.getElementById(field.id + '-error');
    var isValid = true;

    if (field.type === 'email') {
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = field.value.trim() !== '' && emailPattern.test(field.value);
    } else {
      isValid = field.value.trim() !== '';
    }

    if (isValid) {
      field.classList.remove('is-invalid');
      field.classList.add('is-valid');
      if (errorEl) errorEl.classList.remove('is-visible');
    } else {
      field.classList.remove('is-valid');
      field.classList.add('is-invalid');
      if (errorEl) errorEl.classList.add('is-visible');
    }

    return isValid;
  }

  // Real-time validation on blur
  [nameInput, emailInput, messageInput].forEach(function(field) {
    field.addEventListener('blur', function() {
      validateField(field);
    });

    // Remove error on input
    field.addEventListener('input', function() {
      if (field.classList.contains('is-invalid')) {
        field.classList.remove('is-invalid');
        var errorEl = document.getElementById(field.id + '-error');
        if (errorEl) errorEl.classList.remove('is-visible');
      }
    });
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validate all fields
    var nameValid = validateField(nameInput);
    var emailValid = validateField(emailInput);
    var messageValid = validateField(messageInput);

    if (!nameValid || !emailValid || !messageValid) {
      return;
    }

    var data = new FormData(form);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    })
      .then(function(response) {
        if (response.ok) {
          form.style.display = 'none';
          success.style.display = 'block';
          success.focus();
        } else {
          // Show error in terminal block style
          var errorMsg = document.createElement('div');
          errorMsg.className = 'terminal-block';
          errorMsg.style.marginTop = 'var(--space-4)';
          errorMsg.innerHTML = '<span class="t-out" style="color: var(--color-error);">Something went wrong. Please try again or email hello@umarubiango.com directly.</span>';
          form.appendChild(errorMsg);
          setTimeout(function() { errorMsg.remove(); }, 5000);
        }
      })
      .catch(function() {
        // Show error in terminal block style
        var errorMsg = document.createElement('div');
        errorMsg.className = 'terminal-block';
        errorMsg.style.marginTop = 'var(--space-4)';
        errorMsg.innerHTML = '<span class="t-out" style="color: var(--color-error);">Could not send. Please email hello@umarubiango.com directly.</span>';
        form.appendChild(errorMsg);
        setTimeout(function() { errorMsg.remove(); }, 5000);
      });
  });
});
