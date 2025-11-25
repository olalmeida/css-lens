const { PremiumService } = require("./PremiumService");

// Mock chrome.storage
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};

describe("PremiumService", () => {
  let service;

  beforeEach(() => {
    service = new PremiumService();
    jest.clearAllMocks();
    
    // Reset chrome.storage mocks
    chrome.storage.sync.get.mockResolvedValue({});
    chrome.storage.sync.set.mockResolvedValue();
  });

  describe("init", () => {
    it("should initialize with default values", async () => {
      await service.init();
      expect(service.isPremium).toBe(false);
      expect(service.editCount).toBe(0);
    });

    it("should load premium status from storage", async () => {
      chrome.storage.sync.get.mockResolvedValue({
        isPremium: true,
        editCount: 3,
        sessionStart: Date.now(),
      });

      await service.init();
      expect(service.isPremium).toBe(true);
      expect(service.editCount).toBe(3);
    });

    it("should reset edit count for old sessions", async () => {
      const oldSessionStart = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      chrome.storage.sync.get.mockResolvedValue({
        isPremium: false,
        editCount: 5,
        sessionStart: oldSessionStart,
      });

      await service.init();
      expect(service.editCount).toBe(0);
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({ editCount: 0 })
      );
    });
  });

  describe("canEdit", () => {
    it("should allow edits for premium users", () => {
      service.isPremium = true;
      service.editCount = 100;
      expect(service.canEdit()).toBe(true);
    });

    it("should allow edits under limit for free users", () => {
      service.isPremium = false;
      service.editCount = 3;
      expect(service.canEdit()).toBe(true);
    });

    it("should block edits at limit for free users", () => {
      service.isPremium = false;
      service.editCount = 5;
      expect(service.canEdit()).toBe(false);
    });

    it("should block edits over limit for free users", () => {
      service.isPremium = false;
      service.editCount = 6;
      expect(service.canEdit()).toBe(false);
    });
  });

  describe("incrementEditCount", () => {
    it("should increment edit count for free users", async () => {
      service.isPremium = false;
      service.editCount = 2;

      await service.incrementEditCount();
      expect(service.editCount).toBe(3);
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ editCount: 3 });
    });

    it("should not increment for premium users", async () => {
      service.isPremium = true;
      service.editCount = 0;

      await service.incrementEditCount();
      expect(service.editCount).toBe(0);
      expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    });

    it("should handle storage errors gracefully", async () => {
      service.isPremium = false;
      chrome.storage.sync.set.mockRejectedValue(new Error("Storage error"));

      await expect(service.incrementEditCount()).resolves.not.toThrow();
    });
  });

  describe("getRemainingEdits", () => {
    it("should return Infinity for premium users", () => {
      service.isPremium = true;
      expect(service.getRemainingEdits()).toBe(Infinity);
    });

    it("should return correct count for free users", () => {
      service.isPremium = false;
      service.editCount = 2;
      expect(service.getRemainingEdits()).toBe(3);
    });

    it("should return 0 when limit reached", () => {
      service.isPremium = false;
      service.editCount = 5;
      expect(service.getRemainingEdits()).toBe(0);
    });

    it("should not return negative values", () => {
      service.isPremium = false;
      service.editCount = 10;
      expect(service.getRemainingEdits()).toBe(0);
    });
  });

  describe("resetEditCount", () => {
    it("should reset edit count", async () => {
      service.editCount = 5;
      await service.resetEditCount();

      expect(service.editCount).toBe(0);
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({ editCount: 0 })
      );
    });

    it("should update session start time", async () => {
      const beforeTime = Date.now();
      await service.resetEditCount();
      const afterTime = Date.now();

      expect(service.sessionStartTime).toBeGreaterThanOrEqual(beforeTime);
      expect(service.sessionStartTime).toBeLessThanOrEqual(afterTime);
    });
  });

  describe("activatePremium", () => {
    it("should activate premium status", async () => {
      service.isPremium = false;
      await service.activatePremium();

      expect(service.isPremium).toBe(true);
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ isPremium: true });
    });
  });

  describe("getIsPremium", () => {
    it("should return premium status", () => {
      service.isPremium = true;
      expect(service.getIsPremium()).toBe(true);

      service.isPremium = false;
      expect(service.getIsPremium()).toBe(false);
    });
  });
});
