import { expect, test } from "@playwright/test"

test("MOH moves between Health Approvals, Inspections, and Premises", async ({
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
  await expect(
    page.getByRole("heading", { level: 1, name: "Health Approvals" })
  ).toBeVisible()
  await page.getByRole("link", { name: "Inspections" }).click()

  await expect(page).toHaveURL(/\/moh\/inspections$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Inspections" })
  ).toBeVisible()
  await expect(
    page.getByRole("tab", { name: "Awaiting assignment 4" })
  ).toBeVisible()
  await expect(
    page.getByRole("tab", { name: "Scheduled & in progress 3" })
  ).toBeVisible()
  await expect(page.getByRole("tab", { name: /Decisions/ })).toHaveCount(0)

  const eligibleRow = page
    .getByRole("table", { name: "Inspection cases" })
    .getByRole("row")
    .filter({ hasText: "Abonnema Wharf Canteen" })
  await eligibleRow.getByRole("link", { name: "Check eligibility" }).click()

  await expect(page).toHaveURL(/\/moh\/inspections\/HA-WORK-001$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Abonnema Wharf Canteen" })
  ).toBeVisible()
  await expect(page.getByText("FIT-2026-321")).toBeVisible()
  await expect(page.getByText("FUM-2026-901")).toBeVisible()

  await page
    .getByRole("button", { name: "Schedule approval inspection" })
    .click()
  const dialog = page.getByRole("dialog", {
    name: "Schedule approval inspection",
  })
  await dialog
    .getByRole("combobox", { name: "Environmental Health Officer" })
    .click()
  await page.getByRole("option", { name: "Ngozi Nwankwo" }).click()
  await dialog.getByLabel("Inspection date").fill("2026-10-06")
  await dialog
    .getByRole("button", { name: "Confirm inspection schedule" })
    .click()

  await expect(page.getByText("Approval inspection scheduled.")).toBeVisible()
  await expect(page.getByText("Inspection assigned")).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Inspection progress" })
  ).toBeVisible()
  await expect(
    page.getByLabel("Health Approval next action").getByText("Ngozi Nwankwo")
  ).toBeVisible()

  await page.getByRole("button", { name: "Inspections" }).click()
  await page.getByRole("tab", { name: "Scheduled & in progress 4" }).click()
  await expect(
    page
      .getByRole("table", { name: "Inspection cases" })
      .getByRole("row")
      .filter({ hasText: "Abonnema Wharf Canteen" })
  ).toContainText("Ngozi Nwankwo")

  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await expect(page.getByText("Abonnema Wharf Canteen").last()).toBeVisible()

  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.getByRole("link", { name: "Health approvals" }).click()
  await page
    .locator('a[href="/moh/health-approvals/HA-REV-001"]:visible')
    .click()
  await expect(page).toHaveURL(/\/moh\/health-approvals\/HA-REV-001$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Riverside Kitchen & Foods" })
  ).toBeVisible()

  await page.getByRole("link", { name: "Premises" }).click()
  await expect(page).toHaveURL(/\/moh\/businesses$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Premises" })
  ).toBeVisible()
  await expect(page.getByText("Expiring soon").first()).toBeVisible()
  expect(browserErrors).toEqual([])
})
