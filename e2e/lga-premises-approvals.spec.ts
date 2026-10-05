import { expect, test } from "@playwright/test"

for (const width of [1440, 390]) {
  test(`Health Approval is consolidated into Premises at ${width}px`, async ({
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
    await expect(
      page.getByRole("link", { name: "Health approvals", exact: true })
    ).toHaveCount(0)
    await page.getByRole("link", { name: /Awaiting decision/ }).click()
    await expect(page).toHaveURL(/\/lga\/premises\?approval=/)
    await page.getByRole("button", { name: /^Filters/ }).click()
    const filter = page.getByRole("combobox", {
      name: "Health Approval",
      exact: true,
    })
    await expect(filter).toContainText("Awaiting decision")
    await expect(
      page
        .getByText("Riverside Kitchen & Foods", { exact: true })
        .filter({ visible: true })
    ).toBeVisible()
    await page.getByRole("button", { name: "Close", exact: true }).click()
    await page.reload()
    await page.getByRole("button", { name: /^Filters/ }).click()
    await expect(filter).toContainText("Awaiting decision")
    await filter.click()
    await page.getByRole("option", { name: "Approved", exact: true }).click()
    await page
      .getByRole("button", { name: "Apply changes", exact: true })
      .click()
    await expect(
      page
        .getByText("Riverside Kitchen & Foods", { exact: true })
        .filter({ visible: true })
    ).toHaveCount(0)
    await page.getByRole("button", { name: /^Filters/ }).click()
    await page.getByRole("button", { name: "Reset", exact: true }).click()
    await expect(filter).toContainText("All approval statuses")
    await page.getByRole("button", { name: "Close", exact: true }).click()
    await expect(page).toHaveURL(/approval=Approved/)
    await page.getByRole("button", { name: /^Filters/ }).click()
    await expect(filter).toContainText("Approved")
    await page.getByRole("button", { name: "Reset", exact: true }).click()
    await page
      .getByRole("button", { name: "Apply changes", exact: true })
      .click()
    await expect(page).toHaveURL(/approval=all/)
    await expect(
      page.getByRole("button", { name: "Filters", exact: true })
    ).toBeFocused()
    await page.goto("/lga/health-approvals")
    await expect(
      page.getByRole("heading", { name: "Premises", exact: true })
    ).toBeVisible()
    await page.goto("/lga/health-approvals/HA-REV-001")
    await expect(page).toHaveURL(/\/lga\/premises\/PR-001/)
    await expect(
      page.getByRole("region", { name: "Health Approval", exact: true })
    ).toContainText("Awaiting decision")
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    expect(errors).toEqual([])
  })
}
