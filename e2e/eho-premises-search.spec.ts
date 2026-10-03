import { expect, test } from "@playwright/test"

test("EHO searches, filters and opens the council premises directory", async ({
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
    await expect(
      page.getByRole("textbox", { name: "Staff ID or email" })
    ).toHaveValue("EHO-001", { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await expect(async () => {
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(page).toHaveURL(/\/eho\/my-work$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })

  await page.getByRole("link", { name: "All Premises" }).click()
  await expect(
    page.getByRole("heading", { level: 1, name: "All Premises" })
  ).toBeVisible()
  await expect(page.locator('[data-slot="page-header"]')).toHaveCSS(
    "border-bottom-width",
    "0px"
  )
  await expect(page.getByRole("region", { name: "Find premises" })).toHaveCSS(
    "row-gap",
    "24px"
  )
  await expect(
    page.getByRole("region", { name: "Premises directory" })
  ).toHaveCSS("row-gap", "8px")
  await expect(
    page.locator("main").getByRole("link", { name: "Dashboard", exact: true })
  ).toHaveCount(0)
  await expect(page.getByText("10 premises")).toBeVisible()
  await page.getByRole("combobox", { name: "Filter by ward" }).click()
  await page.getByRole("option", { name: "Diobu" }).click()
  await expect(page.getByText("2 premises")).toBeVisible()
  await page.getByRole("button", { name: "Clear filters" }).click()
  await page
    .getByRole("searchbox", { name: "Search premises" })
    .fill("Riverside")
  const directoryTable = page.getByRole("table", {
    name: "Port Harcourt City Council premises",
  })
  await expect(
    directoryTable
      .getByRole("row", { name: /Riverside Kitchen & Foods/ })
      .getByRole("img", { name: "Riverside Kitchen & Foods avatar" })
  ).toBeVisible()
  await expect(
    directoryTable.getByText("Riverside Kitchen & Foods", { exact: true })
  ).toBeVisible()
  await directoryTable
    .getByRole("button", { name: "View", exact: true })
    .click()
  await expect(page).toHaveURL(/\/eho\/premises\/PR-001\?source=search$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Riverside Kitchen & Foods" })
  ).toBeVisible()
  await page.getByRole("button", { name: "Back to search" }).click()
  await expect(page.getByText("10 premises")).toBeVisible()

  await page
    .getByRole("searchbox", { name: "Search premises" })
    .fill("Borokiri Community Clinic")
  await directoryTable
    .getByRole("button", { name: "View", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { level: 1, name: "Borokiri Community Clinic" })
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Back to search" })).toHaveCSS(
    "align-self",
    "flex-start"
  )
  await expect(
    page.getByRole("heading", { name: "Officer actions" })
  ).toHaveCount(0)
  await page.getByRole("tab", { name: /Inspection history ·/ }).click()
  const assignmentCard = page
    .getByRole("heading", { name: "Assign this job" })
    .locator("../..")
  await assignmentCard.getByRole("button", { name: "Assign to me" }).click()
  await expect(
    page.getByRole("heading", { name: "Assigned to you", exact: true })
  ).toBeVisible()
  await page.getByRole("link", { name: "Dashboard" }).click()
  const assignedJob = page.getByRole("row", {
    name: /Borokiri Community Clinic/,
  })
  await expect(assignedJob).toBeVisible()
  await expect(assignedJob.getByText("Premises inspection")).toBeVisible()
  await expect(assignedJob.getByText("Assigned", { exact: true })).toBeVisible()
  await page.getByRole("link", { name: "All Premises" }).click()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("searchbox", { name: "Search premises" }).fill("PR-005")
  await expect(
    page.getByText("This reference belongs to another council.")
  ).toBeVisible()
  await page.getByRole("button", { name: "Clear search" }).click()
  await page.goto("/eho/premises/PR-005")
  await expect(page.getByText("Premises record not found")).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Rumuokoro Fresh Mart" })
  ).toHaveCount(0)
  await page.goto("/eho/premises-search")
  await page.getByRole("button", { name: "Scan code" }).click()
  await page.getByRole("textbox", { name: "Premises code" }).fill("PR-004")
  await page.getByRole("button", { name: "Find premises" }).click()
  await expect(
    page
      .getByRole("region", { name: "Premises directory" })
      .getByRole("heading", { name: "Creek View Bakery" })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
