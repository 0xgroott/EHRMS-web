import { defineConfig, devices } from "@playwright/test"

const baseURL = "http://127.0.0.1:3100"

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  outputDir: "./test-results",
  reporter: "list",
  workers: 1,
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    headless: true,
    screenshot: "off",
    video: "off",
    trace: "off",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 3100 --strictPort",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
