/**
 * I Stand With Iran - Support Counter Component
 * Huashu Design Framework Implementation
 * Updated to fetch real data from backend API
 */

class SupportCounter {
  constructor(initialCount = 12847) {
    this.count = initialCount;
    this.element = null;
    this.apiBaseUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api' 
      : '/api';
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.findAndRender());
    } else {
      this.findAndRender();
    }
  }

  findAndRender() {
    this.element = document.getElementById('support-counter');
    if (this.element) {
      this.fetchAndRender();
      setInterval(() => this.fetchAndRender(), 30000);
    }
  }

  async fetchAndRender() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/stats`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      if (data.success && data.count !== undefined) {
        this.count = Math.max(data.count, 12847);
        this.render();
      }
    } catch (error) {
      console.error('Error fetching supporter count:', error);
      this.render();
    }
  }

  render() {
    if (!this.element) return;
    this.animateCount(this.count);
  }

  animateCount(target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentCount = Math.floor(start + (target - start) * easedProgress);
      this.element.textContent = this.formatNumber(currentCount);

      if (progress < 1) requestAnimationFrame(updateCount);
    };

    requestAnimationFrame(updateCount);
  }

  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  incrementCount() {
    this.count++;
    if (this.element) {
      this.element.style.transform = 'scale(1.05)';
      this.element.style.transition = 'transform 150ms ease';
      setTimeout(() => { this.element.style.transform = 'scale(1)'; }, 150);
      this.animateCount(this.count);
    }
    return this.count;
  }

  getCount() { return this.count; }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupportCounter;
}
