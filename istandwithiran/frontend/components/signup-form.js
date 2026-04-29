/**
 * I Stand With Iran - Sign-up Form Component
 * Huashu Design Framework Implementation
 * Updated to send data to backend API
 */

class SignupForm {
  constructor(onSubmit) {
    this.form = null;
    this.apiBaseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api' 
      : '/api';
    this.onSubmit = onSubmit || this.defaultSubmit.bind(this);
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.findAndBind());
    } else {
      this.findAndBind();
    }
  }

  findAndBind() {
    this.form = document.getElementById('signup-form');
    if (this.form) this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    const inputs = this.form.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearError(input));
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name')?.trim(),
      country: formData.get('country')?.trim()
    };

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

    const submitBtn = this.form.querySelector('.form-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      await this.onSubmit(data, this.form);
    } catch (error) {
      console.error('Submission error:', error);
      this.showApiError(error.message || 'Failed to submit. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  async defaultSubmit(data, formElement) {
    const response = await fetch(`${this.apiBaseUrl}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.error) throw new Error(result.error);
      if (result.errors && Array.isArray(result.errors)) {
        this.showErrors(result.errors.map(err => ({
          field: err.path || 'general',
          message: err.msg
        })));
        return;
      }
      throw new Error('Submission failed. Please try again.');
    }

    this.showSuccess(formElement);
    window.dispatchEvent(new CustomEvent('supporterAdded', { detail: data }));

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

    if (!isValid) this.showError(input, message);
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
    if (existingError) existingError.remove();
  }

  showErrors(errors) {
    errors.forEach(error => {
      const input = this.form.querySelector(`[name="${error.field}"]`);
      if (input) this.showError(input, error.message);
    });
    const firstError = this.form.querySelector('.error');
    if (firstError) firstError.focus();
  }

  showApiError(message) {
    const existingGeneralError = this.form.querySelector('.form-general-error');
    if (existingGeneralError) existingGeneralError.remove();

    const errorEl = document.createElement('div');
    errorEl.className = 'form-general-error';
    errorEl.style.cssText = 'color: #ef4444; margin-bottom: 1rem; text-align: center;';
    errorEl.textContent = message;
    errorEl.setAttribute('role', 'alert');

    const submitBtn = this.form.querySelector('.form-submit');
    submitBtn.parentNode.insertBefore(errorEl, submitBtn);
    setTimeout(() => errorEl.remove(), 5000);
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
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SignupForm;
}
