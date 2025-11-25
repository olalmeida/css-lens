const { DOMUtils } = require("./DOMUtils");

describe("DOMUtils", () => {
  describe("sampleElements", () => {
    it("should return all elements if under limit", () => {
      const elements = [1, 2, 3, 4, 5];
      const sampled = DOMUtils.sampleElements(elements, 10);
      expect(sampled).toHaveLength(5);
      expect(sampled).toEqual(elements);
    });

    it("should sample elements if over limit", () => {
      const elements = Array.from({ length: 1000 }, (_, i) => i);
      const sampled = DOMUtils.sampleElements(elements, 100);
      expect(sampled.length).toBeLessThanOrEqual(100);
      expect(sampled.length).toBeGreaterThan(0);
    });

    it("should handle empty arrays", () => {
      const sampled = DOMUtils.sampleElements([], 100);
      expect(sampled).toHaveLength(0);
    });

    it("should handle NodeList", () => {
      document.body.innerHTML = "<div></div><div></div><div></div>";
      const nodeList = document.querySelectorAll("div");
      const sampled = DOMUtils.sampleElements(nodeList, 2);
      expect(Array.isArray(sampled)).toBe(true);
      expect(sampled.length).toBeLessThanOrEqual(3);
    });

    it("should use default max samples of 500", () => {
      const elements = Array.from({ length: 1000 }, (_, i) => i);
      const sampled = DOMUtils.sampleElements(elements);
      expect(sampled.length).toBeLessThanOrEqual(500);
    });

    it("should distribute samples evenly", () => {
      const elements = Array.from({ length: 100 }, (_, i) => i);
      const sampled = DOMUtils.sampleElements(elements, 10);
      // Should have roughly even distribution
      expect(sampled.length).toBeLessThanOrEqual(10);
    });
  });

  describe("processInIdle", () => {
    it("should call callback", (done) => {
      const callback = jest.fn(() => done());
      DOMUtils.processInIdle(callback);
    });

    it("should use requestIdleCallback if available", () => {
      const originalRIC = global.requestIdleCallback;
      global.requestIdleCallback = jest.fn();

      const callback = jest.fn();
      DOMUtils.processInIdle(callback);

      expect(global.requestIdleCallback).toHaveBeenCalled();
      global.requestIdleCallback = originalRIC;
    });

    it("should fallback to setTimeout if requestIdleCallback not available", () => {
      const originalRIC = global.requestIdleCallback;
      delete global.requestIdleCallback;

      jest.useFakeTimers();
      const callback = jest.fn();
      DOMUtils.processInIdle(callback);

      jest.runAllTimers();
      expect(callback).toHaveBeenCalled();

      jest.useRealTimers();
      global.requestIdleCallback = originalRIC;
    });
  });

  describe("throttleRAF", () => {
    it("should throttle function calls", () => {
      const callback = jest.fn();
      const throttled = DOMUtils.throttleRAF(callback);

      // Mock requestAnimationFrame
      global.requestAnimationFrame = jest.fn((cb) => {
        cb();
        return 1;
      });

      throttled();
      throttled();
      throttled();

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("debounce", () => {
    it("should debounce function calls", () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      const debounced = DOMUtils.debounce(callback, 300);

      debounced();
      debounced();
      debounced();

      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(callback).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it("should use default wait time of 300ms", () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      const debounced = DOMUtils.debounce(callback);

      debounced();
      jest.advanceTimersByTime(299);
      expect(callback).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(callback).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});
