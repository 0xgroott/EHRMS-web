import { expect, test } from "@playwright/test"

test("certificates page is a focused three-card overview", async ({ page }) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/business/sign-in")
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })

  await page.goto("/business/certificates")
  const overview = page.getByRole("region", { name: "Certificate overview" })
  await expect(overview.locator('[data-slot="card"]')).toHaveCount(3)
  await expect(
    overview.getByRole("region", { name: "Fitness Certificate" })
  ).toBeVisible()
  await expect(
    overview.getByRole("region", { name: "Fumigation Certificate" })
  ).toBeVisible()
  await expect(
    overview.getByRole("region", { name: "Health Approval" })
  ).toBeVisible()
  const fitnessCard = overview.getByRole("region", {
    name: "Fitness Certificate",
  })
  await expect(fitnessCard.getByText("Not issued")).toBeVisible()
  await expect(fitnessCard.getByRole("link")).toHaveCount(0)
  const fumigationCard = overview.getByRole("region", {
    name: "Fumigation Certificate",
  })
  await expect(fumigationCard.getByText("Not issued")).toBeVisible()
  await expect(fumigationCard.getByRole("link")).toHaveCount(0)
  await page.getByRole("button", { name: "View checklist" }).click()
  const checklist = page.getByRole("dialog", {
    name: "Health Approval checklist",
  })
  await expect(checklist.getByRole("listitem")).toHaveCount(4)
  await checklist.getByRole("button", { name: "Close" }).click()
  await expect(
    page.getByRole("heading", { name: /Previous .* certificates/ })
  ).toHaveCount(0)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(overview).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
