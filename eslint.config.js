// eslint.config.js - ESLint v9 configuration
export default [
  {
    ignores: ["node_modules/**", "dist/**", "build/**", "coverage/**", "*.min.js"],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        chrome: "readonly",
        document: "readonly",
        window: "readonly",
        console: "readonly",
        requestAnimationFrame: "readonly",
        requestIdleCallback: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        fetch: "readonly",
        navigator: "readonly",
        alert: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
];
