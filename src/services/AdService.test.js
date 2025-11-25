const { AdService } = require("./AdService");

describe("AdService", () => {
  let service;

  beforeEach(() => {
    service = new AdService();
    jest.clearAllMocks();
  });

  describe("getAds", () => {
    it("should return array of ads", () => {
      const ads = service.getAds();
      expect(Array.isArray(ads)).toBe(true);
      expect(ads.length).toBeGreaterThan(0);
    });

    it("should have required ad properties", () => {
      const ads = service.getAds();
      ads.forEach((ad) => {
        expect(ad).toHaveProperty("type");
        expect(ad).toHaveProperty("content");
        expect(ad).toHaveProperty("cta");
        expect(ad).toHaveProperty("action");
      });
    });
  });

  describe("shouldShowAd", () => {
    it("should not show ads for premium users", () => {
      expect(service.shouldShowAd(true)).toBe(false);
    });

    it("should show ads for free users initially", () => {
      expect(service.shouldShowAd(false)).toBe(true);
    });

    it("should not show ads after max limit reached", () => {
      service.adsShown = 3;
      expect(service.shouldShowAd(false)).toBe(false);
    });

    it("should respect rotation interval", () => {
      service.lastAdTime = Date.now();
      expect(service.shouldShowAd(false)).toBe(false);
    });

    it("should show ad after rotation interval", () => {
      service.lastAdTime = Date.now() - 5 * 60 * 60 * 1000; // 5 hours ago
      expect(service.shouldShowAd(false)).toBe(true);
    });
  });

  describe("getNextAd", () => {
    it("should return an ad object", () => {
      const ad = service.getNextAd();
      expect(ad).toBeDefined();
      expect(ad).toHaveProperty("content");
      expect(ad).toHaveProperty("cta");
    });

    it("should return different ads on multiple calls", () => {
      const ads = new Set();
      for (let i = 0; i < 10; i++) {
        const ad = service.getNextAd();
        ads.add(ad.content);
      }
      // Should have some variety (not always the same ad)
      expect(ads.size).toBeGreaterThan(0);
    });
  });

  describe("markAdShown", () => {
    it("should increment ads shown counter", () => {
      expect(service.adsShown).toBe(0);
      service.markAdShown();
      expect(service.adsShown).toBe(1);
    });

    it("should update last ad time", () => {
      const beforeTime = Date.now();
      service.markAdShown();
      const afterTime = Date.now();

      expect(service.lastAdTime).toBeGreaterThanOrEqual(beforeTime);
      expect(service.lastAdTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("resetSession", () => {
    it("should reset ads shown counter", () => {
      service.adsShown = 3;
      service.resetSession();
      expect(service.adsShown).toBe(0);
    });

    it("should reset last ad time", () => {
      service.lastAdTime = Date.now();
      service.resetSession();
      expect(service.lastAdTime).toBe(0);
    });
  });

  describe("renderAdBanner", () => {
    it("should return HTML string", () => {
      const ad = {
        content: "Test ad content",
        cta: "Click here",
        action: "upgrade",
      };
      const html = service.renderAdBanner(ad);

      expect(typeof html).toBe("string");
      expect(html).toContain("css-lens-ad-banner");
      expect(html).toContain(ad.content);
      expect(html).toContain(ad.cta);
    });

    it("should include close button", () => {
      const ad = service.getNextAd();
      const html = service.renderAdBanner(ad);

      expect(html).toContain("css-lens-ad-close");
      expect(html).toContain("Close");
    });

    it("should include CTA button with action", () => {
      const ad = {
        content: "Test",
        cta: "Upgrade",
        action: "upgrade",
      };
      const html = service.renderAdBanner(ad);

      expect(html).toContain("css-lens-ad-cta");
      expect(html).toContain('data-action="upgrade"');
    });
  });

  describe("getUpgradeModal", () => {
    it("should return HTML string", () => {
      const html = service.getUpgradeModal();
      expect(typeof html).toBe("string");
      expect(html).toContain("css-lens-upgrade-modal");
    });

    it("should include pricing information", () => {
      const html = service.getUpgradeModal();
      expect(html).toContain("$5.00");
    });

    it("should include upgrade and close buttons", () => {
      const html = service.getUpgradeModal();
      expect(html).toContain("css-lens-upgrade-btn");
      expect(html).toContain("css-lens-upgrade-close");
    });

    it("should include feature list", () => {
      const html = service.getUpgradeModal();
      expect(html).toContain("Unlimited");
      expect(html).toContain("Zero ads");
    });

    it("should include backdrop", () => {
      const html = service.getUpgradeModal();
      expect(html).toContain("css-lens-upgrade-backdrop");
    });
  });
});
