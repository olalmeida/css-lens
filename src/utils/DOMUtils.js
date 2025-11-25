/**
 * DOM utility functions for efficient element processing
 */
class DOMUtils {
  /**
   * Sample elements from a collection to avoid processing too many
   * @param {NodeList|Array} elements - Elements to sample
   * @param {number} maxSamples - Maximum number of samples
   * @returns {Array} Sampled elements
   */
  static sampleElements(elements, maxSamples = 500) {
    const elementsArray = Array.from(elements);
    if (elementsArray.length <= maxSamples) {
      return elementsArray;
    }

    const step = Math.floor(elementsArray.length / maxSamples);
    return elementsArray.filter((_, index) => index % step === 0);
  }

  /**
   * Process elements in idle time to avoid blocking
   * @param {Function} callback - Function to execute
   * @param {Object} options - Options for idle callback
   */
  static processInIdle(callback, options = { timeout: 2000 }) {
    if ("requestIdleCallback" in window) {
      requestIdleCallback(callback, options);
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(callback, 0);
    }
  }

  /**
   * Throttle function using requestAnimationFrame
   * @param {Function} callback - Function to throttle
   * @returns {Function} Throttled function
   */
  static throttleRAF(callback) {
    let rafId = null;
    return function (...args) {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        callback.apply(this, args);
        rafId = null;
      });
    };
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, wait = 300) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }
}

// For Node.js testing environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DOMUtils };
}
