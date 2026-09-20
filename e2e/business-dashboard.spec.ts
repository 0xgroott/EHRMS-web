import { expect, test } from "@playwright/test"

test("business dashboard separates status, activity, and records on desktop and mobile", async ({
  page,
}) => {
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

  const tabs = page.getByRole("tab")
  await expect(tabs).toHaveCount(3)
  await expect(tabs.locator("svg")).toHaveCount(0)
  await expect(
    page.getByRole("region", { name: "Certificate status" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Add food handlers" })
  ).toBeVisible()

  await page.getByRole("tab", { name: "Activity" }).click()
  await expect(page.getByText("No active applications")).toBeVisible()
  await expect(page.getByText("No reminders yet")).toBeVisible()

  await page.getByRole("tab", { name: "Records" }).click()
  await expect(page.getByText("No receipts yet")).toBeVisible()
  await expect(page.getByText("No certificates yet")).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("tab", { name: "Overview" }).click()
  await expect(
    page.getByRole("region", { name: "Certificate status" })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
