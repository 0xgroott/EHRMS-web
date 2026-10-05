import { expect, test } from "@playwright/test"
import type { Request } from "@playwright/test"

test("EHO opens prior inspection history from a visit and sees saved outcomes", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  await page.goto("/eho/sign-in")
  await expect(async () => {
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(page.getByLabel("Staff ID or email")).toHaveValue("EHO-001", {
      timeout: 1_000,
    })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/eho\/my-work$/)

  await page.goto("/eho/inspections/EIN-104")
  await page
    .getByRole("button", { name: /Inspection history ·/ })
    .click({ timeout: 3_000 })
  await expect(page).toHaveURL(
    /\/eho\/premises\/PR-004\?inspection=EIN-104&tab=history$/
  )
  await expect(
    page.getByRole("tab", { name: /Inspection history ·/ })
  ).toHaveAttribute("aria-selected", "true")
  const history = page.getByRole("region", { name: "Inspection history" })
  await expect(history.getByText("EIN-104")).toBeVisible()
  await expect(history.getByText("1 finding recorded")).toBeVisible()
  const documents: string[] = []
  const recordDocument = (request: Request) => {
    if (request.isNavigationRequest() && request.resourceType() === "document")
      documents.push(request.url())
  }
  page.on("request", recordDocument)
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 844 })
    for (let repeat = 0; repeat < 3; repeat++) {
      const result = history.getByRole("link", { name: "View EIN-104 result" })
      await result.focus()
      await result.press("Enter")
      await expect(page).toHaveURL(/\/eho\/inspections\/EIN-104\/result$/)
      await page.goBack()
      await expect(result).toBeVisible()
      await history
        .getByRole("row")
        .filter({ hasText: "EIN-104" })
        .getByRole("cell")
        .nth(1)
        .click()
      await expect(page).toHaveURL(/\/eho\/inspections\/EIN-104\/result$/)
      await page.goBack()
      await expect(result).toBeVisible()
    }
  }
  expect(documents).toEqual([])
  page.off("request", recordDocument)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/eho/premises/PR-001?source=search&tab=history")
  await expect(history.getByText("INS-1", { exact: false })).toBeVisible()
  await page.getByRole("tab", { name: /Documents ·/ }).click()
  await expect(page).toHaveURL(/tab=documents$/)
  await page.reload()
  await expect(page.getByRole("tab", { name: /Documents ·/ })).toHaveAttribute(
    "aria-selected",
    "true"
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
