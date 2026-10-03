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
