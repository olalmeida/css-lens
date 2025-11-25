/**
 * Manages ad display for free tier users
 */
class AdService {
  constructor() {
    this.adsShown = 0;
    this.MAX_ADS_PER_SESSION = 3;
    this.AD_ROTATION_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
    this.lastAdTime = 0;
    this.inactivityThreshold = 3000; // 3 seconds
    this.inactivityTimer = null;
  }

  /**
   * Ads content pool
   */
  getAds() {
    return [
      {
        type: "upsell",
        content: "✨ Upgrade to Premium for unlimited edits + no ads! Only $5.00",
        cta: "Upgrade Now",
        action: "upgrade",
      },
      {
        type: "upsell",
        content: "💎 Premium: Unlimited edits, templates, and export features",
        cta: "Go Premium",
        action: "upgrade",
      },
      {
        type: "upsell",
        content: "🚀 Unlock full power of CSS Lens - Premium for just $5",
        cta: "Learn More",
        action: "upgrade",
      },
    ];
  }

  /**
   * Check if ad should be shown
   * @param {boolean} isPremium
   * @returns {boolean}
   */
  shouldShowAd(isPremium) {
    if (isPremium) return false;
    if (this.adsShown >= this.MAX_ADS_PER_SESSION) return false;

    const now = Date.now();
    if (now - this.lastAdTime < this.AD_ROTATION_INTERVAL) return false;

    return true;
  }

  /**
   * Get next ad to display
   * @returns {Object|null}
   */
  getNextAd() {
    const ads = this.getAds();
    // Prioritize upsell ads (100% for now since all are upsell)
    return ads[Math.floor(Math.random() * ads.length)];
  }

  /**
   * Mark ad as shown
   */
  markAdShown() {
    this.adsShown++;
    this.lastAdTime = Date.now();
  }

  /**
   * Reset ad counter for new session
   */
  resetSession() {
    this.adsShown = 0;
    this.lastAdTime = 0;
  }

  /**
   * Render ad banner HTML
   * @param {Object} ad
   * @returns {string}
   */
  renderAdBanner(ad) {
    return `
      <div id="css-lens-ad-banner" style="
        margin-top: 10px;
        padding: 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 6px;
        text-align: center;
        font-size: 12px;
        color: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      ">
        <p style="margin: 0 0 8px 0; font-weight: 500; line-height: 1.4;">${ad.content}</p>
        <div style="display: flex; gap: 8px; justify-content: center;">
          <button id="css-lens-ad-cta" data-action="${ad.action}" style="
            background: white;
            color: #667eea;
            border: none;
            padding: 6px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            font-size: 11px;
            transition: transform 0.2s;
          ">${ad.cta}</button>
          <button id="css-lens-ad-close" style="
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            cursor: pointer;
            font-size: 10px;
            padding: 6px 12px;
            border-radius: 4px;
            transition: background 0.2s;
          ">Close</button>
        </div>
      </div>
    `;
  }

  /**
   * Get upgrade modal HTML
   * @returns {string}
   */
  getUpgradeModal() {
    return `
      <div id="css-lens-upgrade-modal" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000001;
        max-width: 400px;
        color: #333;
      ">
        <h3 style="margin: 0 0 16px 0; color: #667eea; font-size: 20px;">✨ Upgrade to Premium</h3>
        <p style="margin: 0 0 16px 0; line-height: 1.6; font-size: 14px;">
          You've reached the free tier limit of 5 edits per session. Upgrade to Premium for:
        </p>
        <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
          <li>🚀 <strong>Unlimited</strong> CSS edits</li>
          <li>🎨 Advanced templates and snippets</li>
          <li>📤 Export to multiple formats</li>
          <li>🚫 <strong>Zero ads</strong></li>
          <li>⚡ Priority support</li>
        </ul>
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="font-size: 32px; font-weight: bold; color: #667eea;">$5.00</div>
          <div style="font-size: 12px; color: #666;">One-time payment • No subscription</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="css-lens-upgrade-btn" style="
            flex: 1;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
          ">Upgrade Now</button>
          <button id="css-lens-upgrade-close" style="
            background: #f0f0f0;
            color: #666;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">Maybe Later</button>
        </div>
      </div>
      <div id="css-lens-upgrade-backdrop" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 10000000;
      "></div>
    `;
  }
}

// For Node.js testing environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = { AdService };
}
