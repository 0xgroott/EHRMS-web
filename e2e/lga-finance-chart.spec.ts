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
  const summary = page.getByRole("region", { name: "Revenue summary" })
  const filters = page.getByRole("region", { name: "Filters", exact: true })
  const payments = page.getByRole("region", { name: "Payment records" })
  await expect(
    summary.getByText("Net collections", { exact: true })
  ).toBeVisible()
  await expect(
    summary.getByText("Awaiting payout", { exact: true })
  ).toBeVisible()
  await expect(summary.getByText("Paid to LGA", { exact: true })).toBeVisible()
  for (const label of ["Ward", "Service"]) {
    await expect(
      filters.locator("label").filter({ hasText: new RegExp(`^${label}$`) })
    ).not.toHaveClass(/sr-only/)
  }
  const summaryBounds = (await summary.boundingBox())!
  const chartBounds = (await chart.boundingBox())!
  const filterBounds = (await filters.boundingBox())!
  expect(filterBounds.y + filterBounds.height).toBeLessThan(summaryBounds.y)
  expect(chartBounds.y).toBe(summaryBounds.y)
  expect(chartBounds.width).toBeLessThan(summaryBounds.width)
  expect(chartBounds.height).toBeLessThan(240)
  expect((await payments.boundingBox())!.y).toBeLessThan(600)
  await expect(
    page.getByRole("columnheader", { name: "Net collected", exact: true })
  ).toHaveCSS("text-align", "right")
  await expect(payments.getByText("20 payments", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "LGA account", exact: true }).click()
  await page.getByRole("menuitemradio", { name: "Dark", exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(chart.locator('[data-slot="collection-bar"]').first()).toHaveCSS(
    "height",
    "8px"
  )
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
  const mobileSummary = (await summary.boundingBox())!
  expect((await chart.boundingBox())!.y).toBeGreaterThan(
    mobileSummary.y + mobileSummary.height
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
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
