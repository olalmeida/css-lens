const { Sanitizer } = require("./Sanitizer");

describe("Sanitizer", () => {
  describe("sanitizeHTML", () => {
    it("should escape HTML tags", () => {
      const input = '<script>alert("xss")</script>';
      const output = Sanitizer.sanitizeHTML(input);
      expect(output).not.toContain("<script>");
      expect(output).toContain("&lt;script&gt;");
    });

    it("should handle empty strings", () => {
      expect(Sanitizer.sanitizeHTML("")).toBe("");
      expect(Sanitizer.sanitizeHTML(null)).toBe("");
      expect(Sanitizer.sanitizeHTML(undefined)).toBe("");
    });

    it("should preserve text content", () => {
      const input = "Hello World";
      expect(Sanitizer.sanitizeHTML(input)).toBe("Hello World");
    });

    it("should escape special characters", () => {
      const input = '<img src="x" onerror="alert(1)">';
      const output = Sanitizer.sanitizeHTML(input);
      expect(output).not.toContain("<img");
      // The sanitizer escapes the entire tag, so onerror is preserved as text
      expect(output).toContain("&lt;img");
    });

    it("should handle quotes", () => {
      const input = 'Test "quotes" and \'apostrophes\'';
      const output = Sanitizer.sanitizeHTML(input);
      expect(output).toContain("quotes");
      expect(output).toContain("apostrophes");
    });
  });

  describe("sanitizeCSS", () => {
    it("should remove javascript: protocol", () => {
      const input = "url(javascript:alert(1))";
      const output = Sanitizer.sanitizeCSS(input);
      expect(output).not.toContain("javascript:");
    });

    it("should remove expression()", () => {
      const input = "width: expression(alert(1))";
      const output = Sanitizer.sanitizeCSS(input);
      expect(output).not.toContain("expression(");
    });

    it("should remove @import", () => {
      const input = "@import url('malicious.css')";
      const output = Sanitizer.sanitizeCSS(input);
      expect(output).not.toContain("@import");
    });

    it("should handle empty values", () => {
      expect(Sanitizer.sanitizeCSS("")).toBe("");
      expect(Sanitizer.sanitizeCSS(null)).toBe("");
    });

    it("should preserve safe CSS", () => {
      const input = "color: red; font-size: 16px;";
      const output = Sanitizer.sanitizeCSS(input);
      expect(output).toBe(input);
    });
  });

  describe("sanitizeURL", () => {
    it("should allow https URLs", () => {
      const input = "https://example.com/image.png";
      expect(Sanitizer.sanitizeURL(input)).toBe(input);
    });

    it("should allow http URLs", () => {
      const input = "http://example.com/image.png";
      expect(Sanitizer.sanitizeURL(input)).toBe(input);
    });

    it("should allow data URLs", () => {
      const input = "data:image/png;base64,iVBORw0KGgo=";
      expect(Sanitizer.sanitizeURL(input)).toBe(input);
    });

    it("should block javascript: URLs", () => {
      const input = "javascript:alert(1)";
      expect(Sanitizer.sanitizeURL(input)).toBe("");
    });

    it("should block file: URLs", () => {
      const input = "file:///etc/passwd";
      expect(Sanitizer.sanitizeURL(input)).toBe("");
    });

    it("should handle empty URLs", () => {
      expect(Sanitizer.sanitizeURL("")).toBe("");
      expect(Sanitizer.sanitizeURL(null)).toBe("");
    });
  });
});
