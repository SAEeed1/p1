/**
 * I Stand With Iran - Language Switcher Component
 * Huashu Design Framework Implementation
 */

class LanguageSwitcher {
  constructor(translations, defaultLang = 'en') {
    this.translations = translations;
    this.currentLang = localStorage.getItem('iwwi_lang') || defaultLang;
    this.supportedLangs = ['en', 'ar', 'es', 'fr', 'zh'];
    this.langNames = {
      en: 'EN',
      ar: 'عربي',
      es: 'ES',
      fr: 'FR',
      zh: '中文'
    };
    
    this.init();
  }

  init() {
    this.validateLang();
    this.applyLanguage();
    this.renderSwitcher();
    this.bindEvents();
  }

  validateLang() {
    if (!this.supportedLangs.includes(this.currentLang)) {
      this.currentLang = 'en';
    }
  }

  getTranslation(key) {
    return this.translations[this.currentLang]?.[key] || 
           this.translations['en']?.[key] || 
           key;
  }

  applyLanguage() {
    // Set lang attribute
    document.documentElement.lang = this.currentLang;
    
    // Set direction for RTL languages
    if (this.currentLang === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.removeAttribute('dir');
    }
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.getTranslation(key);
      
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    });
    
    // Update title if needed
    const titleEl = document.querySelector('[data-i18n-title]');
    if (titleEl) {
      document.title = this.getTranslation(titleEl.getAttribute('data-i18n-title'));
    }
    
    // Save preference
    localStorage.setItem('iwwi_lang', this.currentLang);
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { lang: this.currentLang } 
    }));
  }

  renderSwitcher() {
    const switcher = document.getElementById('lang-switcher');
    if (!switcher) return;

    switcher.innerHTML = '';
    
    this.supportedLangs.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = `lang-btn ${lang === this.currentLang ? 'active' : ''}`;
      btn.textContent = this.langNames[lang];
      btn.dataset.lang = lang;
      btn.setAttribute('aria-label', `Switch to ${this.translations[lang]?.lang_name || lang}`);
      btn.setAttribute('type', 'button');
      
      switcher.appendChild(btn);
    });
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('lang-btn')) {
        const newLang = e.target.dataset.lang;
        this.setLanguage(newLang);
      }
    });
  }

  setLanguage(lang) {
    if (this.supportedLangs.includes(lang) && lang !== this.currentLang) {
      this.currentLang = lang;
      this.applyLanguage();
      this.renderSwitcher();
    }
  }

  getCurrentLang() {
    return this.currentLang;
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LanguageSwitcher;
}
