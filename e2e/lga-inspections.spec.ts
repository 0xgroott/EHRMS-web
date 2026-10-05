import { expect, test } from "@playwright/test"

for (const width of [1440, 390]) {
  test(`LGA inspections keep filters and show ward and overdue visits at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/lga/sign-in")
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true })
    ).toBeVisible()
    await page.goto("/lga/inspections")
    await expect(page.getByRole("status")).toHaveText("10 inspections")
    await page.getByRole("combobox", { name: "Status", exact: true }).click()
    await page.getByRole("option", { name: "Scheduled", exact: true }).click()
    await expect(page.getByRole("status")).toHaveText("5 inspections")
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click()
    await expect(
      page.getByRole("combobox", { name: "Status", exact: true })
    ).toContainText("All statuses")
    await page.getByRole("combobox", { name: "Status", exact: true }).click()
    await page.getByRole("option", { name: "Overdue", exact: true }).click()
    await page
      .getByRole("searchbox", {
        name: "Search premises or inspection reference",
      })
      .fill(" INS-2 ")
    await expect(page.getByRole("status")).toHaveText("1 inspection")
    const result = page
      .getByRole(width === 390 ? "listitem" : "row")
      .filter({ hasText: "Trans-Amadi Food Court" })
    await expect(
      result.getByRole("img", {
        name: "Trans-Amadi Food Court premises",
        exact: true,
      })
    ).toBeVisible()
    await expect(result).toContainText(/22 Sept? 2026/)
    await expect(result).toContainText("Overdue")
    if (width === 1440)
      await expect(
        page.getByRole("columnheader", { name: "Ward", exact: true })
      ).toBeVisible()
    else await expect(result).toContainText("Ward")
    await result.getByRole("link", { name: "View", exact: true }).click()
    await expect(
      page.getByRole("heading", { name: "Trans-Amadi Food Court", exact: true })
    ).toBeVisible()
    await expect(
      page.getByText("Open findings at premises", { exact: true })
    ).toBeVisible()
    await page
      .getByRole("link", { name: "Back to inspections", exact: true })
      .click()
    await expect(page.getByRole("status")).toHaveText("1 inspection")
    await page.reload()
    await expect(page.getByRole("searchbox")).toHaveValue(" INS-2 ")
    await expect(
      page.getByRole("combobox", { name: "Status", exact: true })
    ).toContainText("Overdue")
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click()
    await page.getByLabel("Scheduled from", { exact: true }).fill("2027-01-01")
    await expect(
      page.getByRole("heading", { name: "No inspections match these filters" })
    ).toBeVisible()
    await page
      .getByRole("button", { name: "Clear filters", exact: true })
      .click()
    await expect(page.getByRole("status")).toHaveText("10 inspections")
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    expect(errors).toEqual([])
  })
}
