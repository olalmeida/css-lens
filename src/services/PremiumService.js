/**
 * Manages premium status and feature access
 */
class PremiumService {
  constructor() {
    this.isPremium = false;
    this.editCount = 0;
    this.FREE_EDIT_LIMIT = 5;
    this.sessionStartTime = Date.now();
  }

  /**
   * Initialize premium status from storage
   */
  async init() {
    try {
      const data = await chrome.storage.sync.get(["isPremium", "editCount", "sessionStart"]);
      this.isPremium = data.isPremium || false;
      
      // Reset edit count if new session (24 hours)
      const sessionStart = data.sessionStart || 0;
      const hoursSinceSession = (Date.now() - sessionStart) / (1000 * 60 * 60);
      
      if (hoursSinceSession > 24) {
        this.editCount = 0;
        this.sessionStartTime = Date.now();
        await chrome.storage.sync.set({ 
          editCount: 0, 
          sessionStart: this.sessionStartTime 
        });
      } else {
        this.editCount = data.editCount || 0;
        this.sessionStartTime = sessionStart;
      }
    } catch (error) {
      console.error("PremiumService init error:", error);
    }
  }

  /**
   * Check if user can edit (premium or under limit)
   * @returns {boolean}
   */
  canEdit() {
    if (this.isPremium) return true;
    return this.editCount < this.FREE_EDIT_LIMIT;
  }

  /**
   * Increment edit count
   */
  async incrementEditCount() {
    if (this.isPremium) return;
    this.editCount++;
    try {
      await chrome.storage.sync.set({ editCount: this.editCount });
    } catch (error) {
      console.error("Error incrementing edit count:", error);
    }
  }

  /**
   * Get remaining edits for free users
   * @returns {number}
   */
  getRemainingEdits() {
    if (this.isPremium) return Infinity;
    return Math.max(0, this.FREE_EDIT_LIMIT - this.editCount);
  }

  /**
   * Reset edit count (new session)
   */
  async resetEditCount() {
    this.editCount = 0;
    this.sessionStartTime = Date.now();
    try {
      await chrome.storage.sync.set({ 
        editCount: 0,
        sessionStart: this.sessionStartTime
      });
    } catch (error) {
      console.error("Error resetting edit count:", error);
    }
  }

  /**
   * Activate premium
   */
  async activatePremium() {
    this.isPremium = true;
    try {
      await chrome.storage.sync.set({ isPremium: true });
    } catch (error) {
      console.error("Error activating premium:", error);
    }
  }

  /**
   * Check premium status
   * @returns {boolean}
   */
  getIsPremium() {
    return this.isPremium;
  }
}

// For Node.js testing environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PremiumService };
}
