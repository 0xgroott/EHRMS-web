import { expect, test } from "@playwright/test"

test("EHO can review a notice before starting an assigned inspection", async ({
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

  await page.goto("/eho/inspections/EIN-102")
  await page.getByRole("button", { name: "View notice" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-102\/notice$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Inspection notice" })
  ).toBeVisible()
  await expect(page.getByText("Awaiting service")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Start inspection" })
  ).toBeDisabled()

  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.getByRole("link", { name: "Inspection overview" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-102$/)
  await page.goto("/eho/inspections/EIN-101")
  await page.getByRole("button", { name: "View notice" }).click()
  await expect(page.getByText("Served 2026-09-17")).toBeVisible()
  await expect(page.getByText("Acknowledged 2026-09-18")).toBeVisible()
  await page.getByRole("button", { name: "Start inspection" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-101\/checklist$/)
  expect(browserErrors).toEqual([])
})
