import { expect, test } from "@playwright/test"

test("Agentation is available on the development frontend", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/")
  const toolbar = page.locator("[data-agentation-toolbar]")
  await expect(toolbar).toBeVisible()
  await page.goto("/business/sign-in")
  await expect(toolbar).toBeVisible()
  expect(browserErrors).toEqual([])
})
