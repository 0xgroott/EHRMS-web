import { expect, test } from "@playwright/test"

test("LGA dashboard ward filter sits in the header and works on mobile", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  await page.setViewportSize({ width: 1440, height: 819 })
  await page.goto("/lga/sign-in")
  await page.getByRole("button", { name: "Use assigned account" }).click()
  await expect(page).toHaveURL(/\/lga\/dashboard$/)
  const header = page.locator('[data-slot="page-header"]')
  const ward = header.getByRole("combobox", { name: "Ward", exact: true })
  await expect(ward).toBeVisible()
  const headerBounds = (await header.boundingBox())!
  const wardBounds = (await ward.boundingBox())!
  expect(wardBounds.width).toBe(160)
  expect(
    Math.abs(
      wardBounds.x + wardBounds.width - headerBounds.x - headerBounds.width
    )
  ).toBeLessThan(2)
  expect(wardBounds.y).toBeGreaterThanOrEqual(headerBounds.y)
  expect(wardBounds.y + wardBounds.height).toBeLessThanOrEqual(
    headerBounds.y + headerBounds.height + 1
  )
  const registered = page
    .getByRole("region", { name: "Council overview" })
    .getByRole("link", { name: /Registered premises/ })
  await expect(registered).toContainText("10")
  await ward.click()
  await page.getByRole("option", { name: "Diobu", exact: true }).click()
  await expect(registered).toContainText("2")
  await header.getByRole("button", { name: "Clear filters" }).click()
  await expect(registered).toContainText("10")
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(ward).toBeVisible()
  const title = (await header
    .getByRole("heading", { name: "Dashboard", exact: true })
    .boundingBox())!
  expect((await ward.boundingBox())!.y).toBeGreaterThan(title.y + title.height)
  await ward.click()
  await page.getByRole("option", { name: "Diobu", exact: true }).click()
  await expect(registered).toContainText("2")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  expect(errors).toEqual([])
})
