import { expect, test } from "@playwright/test"

test("LGA collections chart responds to finance filters on desktop and mobile", async ({
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
  await page.getByRole("link", { name: "Finance", exact: true }).click()
  const chart = page.getByRole("region", { name: "Collections by service" })
  await expect(
    chart.getByRole("heading", { name: "Collections by service" })
  ).toBeVisible()
  await expect(chart.locator('[data-slot="collection-bar"]')).toHaveCount(2)
  const before = await chart.locator("dd").allTextContents()
  await page.getByRole("combobox", { name: "Service", exact: true }).click()
  await page.getByRole("option", { name: "Fitness", exact: true }).click()
  await expect(chart.locator("dd").nth(0)).toHaveText(before[0])
  await expect(chart.locator("dd").nth(1)).toHaveText("₦0")
  await expect(chart.locator('[data-slot="collection-bar"]').nth(1)).toHaveCSS(
    "width",
    "0px"
  )
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(chart).toBeVisible()
  const bounds = (await chart.boundingBox())!
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390)
  await page.getByRole("combobox", { name: "Ward", exact: true }).click()
  await page.getByRole("option", { name: "Diobu", exact: true }).click()
  await expect(chart.locator("dd").nth(0)).not.toHaveText(before[0])
  await page.getByLabel("From", { exact: true }).fill("2099-01-01")
  await expect(
    chart.getByText("No collections match these filters.")
  ).toBeVisible()
  await page.getByRole("button", { name: "Clear filters" }).click()
  await expect(chart.locator("dd")).toHaveText(before)
  expect(errors).toEqual([])
})
