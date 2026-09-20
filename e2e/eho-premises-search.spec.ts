import { expect, test } from "@playwright/test"

test("EHO searches council premises and reopens a recent record", async ({
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

  await page.getByRole("link", { name: "Premises Search" }).click()
  await expect(
    page.getByRole("heading", { level: 1, name: "Premises Search" })
  ).toBeVisible()
  await page.getByRole("textbox", { name: "Search premises" }).fill("Riverside")
  await expect(
    page
      .getByRole("region", { name: "Search results" })
      .getByRole("heading", { name: "Riverside Kitchen & Foods" })
  ).toBeVisible()
  await page.getByRole("button", { name: "Open premises" }).click()
  await expect(page).toHaveURL(/\/eho\/premises\/PR-001\?source=search$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Riverside Kitchen & Foods" })
  ).toBeVisible()
  await page.getByRole("button", { name: "Back to search" }).click()
  await expect(
    page
      .getByRole("region", { name: "Recent premises" })
      .getByRole("heading", { name: "Riverside Kitchen & Foods" })
  ).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("textbox", { name: "Search premises" }).fill("PR-005")
  await expect(
    page.getByText("This reference belongs to another council.")
  ).toBeVisible()
  await page.getByRole("button", { name: "Retry search" }).click()
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
      .getByRole("region", { name: "Search results" })
      .getByRole("heading", { name: "Creek View Bakery" })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
