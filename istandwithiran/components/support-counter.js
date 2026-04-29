/**
 * I Stand With Iran - Support Counter Component
 * Huashu Design Framework Implementation
 */

class SupportCounter {
  constructor(initialCount = 0) {
    this.count = parseInt(localStorage.getItem('iwwi_support_count')) || initialCount;
    this.element = null;
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.findAndRender());
    } else {
      this.findAndRender();
    }
  }

  findAndRender() {
    this.element = document.getElementById('support-counter');
    if (this.element) {
      this.render();
    }
  }

  render() {
    if (!this.element) return;
    
    // Animate the counter
    this.animateCount(this.count);
  }

  animateCount(target) {
    const duration = 2000; // 2 seconds
    const start = 0;
    const startTime = performance.now();

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      
      const currentCount = Math.floor(start + (target - start) * easedProgress);
      this.element.textContent = this.formatNumber(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }

  formatNumber(num) {
    // Format with commas (e.g., 1,234,567)
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  addSupporter() {
    this.count++;
    localStorage.setItem('iwwi_support_count', this.count.toString());
    
    if (this.element) {
      // Quick pulse animation
      this.element.style.transform = 'scale(1.05)';
      this.element.style.transition = 'transform 150ms ease';
      
      setTimeout(() => {
        this.element.style.transform = 'scale(1)';
      }, 150);
      
      this.animateCount(this.count);
    }
    
    return this.count;
  }

  getCount() {
    return this.count;
  }

  // Simulate existing supporters for demo purposes
  simulateSupporters(baseCount) {
    this.count = baseCount;
    localStorage.setItem('iwwi_support_count', this.count.toString());
    if (this.element) {
      this.render();
    }
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupportCounter;
}
