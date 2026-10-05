import { expect, test } from "@playwright/test"

test("MOH searches, filters and opens a premises overview", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/moh/sign-in")
  await page.getByRole("button", { name: "Use assigned account" }).click()
  await expect(page).toHaveURL(/\/moh\/health-approvals$/)

  await page.getByRole("link", { name: "Premises" }).click()
  await expect(page).toHaveURL(/\/moh\/businesses$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Premises" })
  ).toBeVisible()
  await expect(page.getByText("10 premises")).toBeVisible()

  await page.getByRole("combobox", { name: "Filter by ward" }).click()
  await page.getByRole("option", { name: "Borokiri" }).click()
  await expect(page.getByText("1 premises")).toBeVisible()
  await page.getByRole("button", { name: "Clear filters" }).click()

  await page.getByRole("searchbox", { name: "Search premises" }).fill("PR-015")
  const directory = page.getByRole("region", { name: "Premises directory" })
  const premisesRow = directory.getByRole("row", {
    name: /Borokiri Community Clinic/,
  })
  await expect(premisesRow).toContainText("Clinic")
  await expect(premisesRow).toContainText("Health Approval issued")
  await premisesRow.getByRole("button", { name: "View" }).click()

  await expect(page).toHaveURL(/\/moh\/businesses\/PR-015\?source=search$/)
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Borokiri Community Clinic",
    })
  ).toBeVisible()
  await expect(page.getByRole("tab", { name: "Certificates" })).toBeVisible()
  await expect(
    page.getByRole("tab", { name: "Inspection history" })
  ).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.getByRole("button", { name: "Back to premises" }).click()
  await expect(page).toHaveURL(/\/moh\/businesses$/)
  await expect(page.getByRole("button", { name: "View" }).first()).toBeVisible()
  expect(browserErrors).toEqual([])
})

test("MOH premises summary and sidebar account work on desktop and mobile", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  await page.setViewportSize({ width: 1440, height: 819 })
  await page.goto("/moh/sign-in")
  await page.getByRole("button", { name: "Use assigned account" }).click()
  await expect(page).toHaveURL(/\/moh\/health-approvals$/)
  await page.getByRole("link", { name: "Premises", exact: true }).click()
  const summary = page.getByRole("region", { name: "Premises summary" })
  await expect(summary).toBeVisible()
  const cards = summary.locator('[data-slot="card"]')
  await expect(cards).toHaveCount(4)
  await expect(cards.first()).toContainText("Registered")
  await expect(cards.first()).toContainText("10")
  await expect(summary.locator('[data-slot="card-title"]')).toHaveText([
    "Registered",
    "Action required",
    "Pending",
    "Expiring soon",
  ])
  await expect(cards.first()).toHaveAttribute("data-size", "sm")
  const first = await cards.first().boundingBox()
  const last = await cards.last().boundingBox()
  expect(first!.y).toBe(last!.y)
  const header = await page.locator('[data-slot="page-header"]').boundingBox()
  expect(first!.y).toBeGreaterThanOrEqual(header!.y + header!.height)
  const account = page.getByRole("button", { name: "MOH account", exact: true })
  await expect(
    page
      .locator('[data-slot="sidebar-footer"]')
      .getByRole("button", { name: "MOH account" })
  ).toBeVisible()
  await expect(
    page.getByRole("banner").getByRole("button", { name: "MOH account" })
  ).toHaveCount(0)
  await account.click()
  await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Toggle MOH navigation" }).click()
  await account.click()
  await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible()
  await page.keyboard.press("Escape")
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(summary).toBeVisible()
  const mobileFirst = await cards.nth(0).boundingBox()
  const mobileSecond = await cards.nth(1).boundingBox()
  const mobileThird = await cards.nth(2).boundingBox()
  expect(mobileFirst!.y).toBe(mobileSecond!.y)
  expect(mobileThird!.y).toBeGreaterThan(mobileFirst!.y)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  await page.getByRole("button", { name: "Open MOH navigation" }).click()
  await expect(account).toBeVisible()
  await account.click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/\/$/)
  expect(errors).toEqual([])
})
