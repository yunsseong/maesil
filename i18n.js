// i18n - Lightweight internationalization module
const i18n = {
  translations: {},
  currentLang: 'ko',
  supportedLangs: ['ko', 'en'],

  async init() {
    // Detect browser language first, use saved only if manually changed
    const browserLang = navigator.language.split('-')[0];
    const savedLang = localStorage.getItem('lang');
    const manuallyChanged = localStorage.getItem('langManuallySet') === 'true';

    // Priority: manual selection > browser language > default (ko)
    if (manuallyChanged && savedLang) {
      this.currentLang = savedLang;
    } else if (this.supportedLangs.includes(browserLang)) {
      this.currentLang = browserLang;
    } else {
      this.currentLang = 'ko';
    }

    await this.loadTranslations(this.currentLang);
    this.applyTranslations();
    this.updateHtmlLang();
  },

  async loadTranslations(lang) {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      this.translations = await response.json();
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to Korean if loading fails
      if (lang !== 'ko') {
        await this.loadTranslations('ko');
      }
    }
  },

  get(key) {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return value;
  },

  applyTranslations() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.get(key);

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else if (el.tagName === 'OPTION') {
        el.textContent = translation;
      } else {
        el.innerHTML = translation;
      }
    });

    // Update elements with data-i18n-attr for attributes
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const attrs = el.getAttribute('data-i18n-attr').split(',');
      attrs.forEach(attr => {
        const [attrName, key] = attr.split(':');
        el.setAttribute(attrName.trim(), this.get(key.trim()));
      });
    });

    // Update page title
    document.title = this.get('meta.title');

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', this.get('meta.description'));
    }

    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', this.get('meta.title'));
    }

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', this.get('meta.description'));
    }
  },

  updateHtmlLang() {
    document.documentElement.lang = this.currentLang;
  },

  async switchLang(lang) {
    if (!this.supportedLangs.includes(lang)) return;

    this.currentLang = lang;
    localStorage.setItem('lang', lang);
    localStorage.setItem('langManuallySet', 'true');

    await this.loadTranslations(lang);
    this.applyTranslations();
    this.updateHtmlLang();

    // Update language switch button
    const langSwitch = document.querySelector('.lang-switch');
    if (langSwitch) {
      langSwitch.textContent = this.get('langSwitch.label');
    }
  },

  toggle() {
    const nextLang = this.currentLang === 'ko' ? 'en' : 'ko';
    this.switchLang(nextLang);
  }
};

export default i18n;
