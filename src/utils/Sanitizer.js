/**
 * Sanitization utilities to prevent XSS attacks
 */
class Sanitizer {
  /**
   * Sanitizes HTML string to prevent XSS
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  static sanitizeHTML(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Sanitizes CSS value
   * @param {string} value - CSS value to sanitize
   * @returns {string} Sanitized value
   */
  static sanitizeCSS(value) {
    if (!value) return "";
    // Remove potentially dangerous CSS
    const dangerous = ["javascript:", "expression\\(", "import", "@import", "url\\(javascript"];
    let sanitized = value;
    dangerous.forEach((pattern) => {
      sanitized = sanitized.replace(new RegExp(pattern, "gi"), "");
    });
    return sanitized;
  }

  /**
   * Sanitizes URL
   * @param {string} url - URL to sanitize
   * @returns {string} Sanitized URL
   */
  static sanitizeURL(url) {
    if (!url) return "";
    // Only allow http, https, and data URLs
    const allowedProtocols = /^(https?:|data:)/i;
    if (!allowedProtocols.test(url)) {
      return "";
    }
    return url;
  }
}

// For Node.js testing environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Sanitizer };
}
