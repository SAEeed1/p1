/**
 * I Stand With Iran - Sign-up Form Component
 * Huashu Design Framework Implementation
 */

class SignupForm {
  constructor(onSubmit) {
    this.form = null;
    this.onSubmit = onSubmit || this.defaultSubmit;
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.findAndBind());
    } else {
      this.findAndBind();
    }
  }

  findAndBind() {
    this.form = document.getElementById('signup-form');
    if (this.form) {
      this.bindEvents();
    }
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Real-time validation
    const inputs = this.form.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name')?.trim(),
      country: formData.get('country')?.trim(),
      timestamp: new Date().toISOString()
    };

    // Validate
    const errors = [];
    if (!data.name || data.name.length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }
    if (!data.country || data.country.length < 2) {
      errors.push({ field: 'country', message: 'Please enter your country' });
    }

    if (errors.length > 0) {
      this.showErrors(errors);
      return;
    }

    // Submit
    this.onSubmit(data, this.form);
  }

  defaultSubmit(data, formElement) {
    // Default behavior: save to localStorage and show success
    const submissions = JSON.parse(localStorage.getItem('iwwi_submissions') || '[]');
    submissions.push(data);
    localStorage.setItem('iwwi_submissions', JSON.stringify(submissions));
    
    // Show success state
    this.showSuccess(formElement);
    
    // Dispatch event for counter
    window.dispatchEvent(new CustomEvent('supporterAdded', { detail: data }));
    
    // Reset form after delay
    setTimeout(() => {
      formElement.reset();
      this.hideSuccess(formElement);
    }, 3000);
  }

  validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    if (input.name === 'name' && value.length < 2) {
      isValid = false;
      message = 'Name must be at least 2 characters';
    } else if (input.name === 'country' && value.length < 2) {
      isValid = false;
      message = 'Please enter your country';
    }

    if (!isValid) {
      this.showError(input, message);
    }

    return isValid;
  }

  showError(input, message) {
    this.clearError(input);
    
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    
    const errorEl = document.createElement('span');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    errorEl.setAttribute('role', 'alert');
    
    input.parentNode.appendChild(errorEl);
  }

  clearError(input) {
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
    
    const existingError = input.parentNode.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }
  }

  showErrors(errors) {
    errors.forEach(error => {
      const input = this.form.querySelector(`[name="${error.field}"]`);
      if (input) {
        this.showError(input, error.message);
      }
    });
    
    // Focus first error
    const firstError = this.form.querySelector('.error');
    if (firstError) {
      firstError.focus();
    }
  }

  showSuccess(formElement) {
    const submitBtn = formElement.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = '✓ ' + (window.langSwitcher?.getTranslation('form_submit_success') || 'Thank You!');
    submitBtn.disabled = true;
    submitBtn.classList.add('success');
    
    setTimeout(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.classList.remove('success');
    }, 3000);
  }

  hideSuccess(formElement) {
    const submitBtn = formElement.querySelector('.form-submit');
    submitBtn.textContent = window.langSwitcher?.getTranslation('form_submit') || 'Sign the Declaration';
  }

  getSubmissions() {
    return JSON.parse(localStorage.getItem('iwwi_submissions') || '[]');
  }

  getSubmissionCount() {
    return this.getSubmissions().length;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SignupForm;
}
