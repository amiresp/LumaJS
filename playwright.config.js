import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.smoke.spec.js",
  use: { baseURL: "http://127.0.0.1:8765", browserName: "chromium" },
  webServer: {
    command: "node tools/serve-static.js",
    url: "http://127.0.0.1:8765/examples/basic/",
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  }
});
