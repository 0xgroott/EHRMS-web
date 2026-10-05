import { expect, test } from "@playwright/test"

test("MOH theme choice persists across pages and reloads", async ({ page }) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/moh/sign-in")
  await page.getByRole("button", { name: "Use assigned account" }).click()
  await expect(page).toHaveURL(/\/moh\/health-approvals$/)
  await page.getByRole("button", { name: "MOH account" }).click()
  await page.getByRole("menuitemradio", { name: "Dark" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect
    .poll(() =>
      page.evaluate(() => {
        const sample = document.createElement("span")
        document.body.append(sample)
        sample.style.color = "var(--primary)"
        const primary = getComputedStyle(sample).color
        sample.style.color = "var(--brand-dark)"
        const brand = getComputedStyle(sample).color
        sample.remove()
        return primary === brand
      })
    )
    .toBe(true)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("ehrcms:theme")))
    .toBe("dark")

  await page.locator('a[href="/moh/businesses"]:visible').click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator("html")).toHaveClass(/dark/)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("button", { name: "Open MOH navigation" }).click()
  await page.getByRole("button", { name: "MOH account" }).click()
  await page.getByRole("menuitemradio", { name: "Light" }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})

test("Business, EHO, and Admin expose theme choices in profile menus", async ({
  page,
}) => {
  await page.goto("/business/sign-in")
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("button", { name: "Business account" }).click()
  await expect(page.getByRole("menuitemradio", { name: "Light" })).toBeVisible()
  await expect(page.getByRole("menuitemradio", { name: "Dark" })).toBeVisible()

  await page.goto("/eho/sign-in")
  await expect(async () => {
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/eho\/my-work$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("button", { name: /EHO account/ }).click()
  await expect(page.getByRole("menuitemradio", { name: "Light" })).toBeVisible()
  await expect(page.getByRole("menuitemradio", { name: "Dark" })).toBeVisible()

  await page.goto("/dashboard")
  await expect(async () => {
    await page.getByRole("button", { name: "Admin account" }).click()
    await expect(
      page.getByRole("menuitemradio", { name: "Light" })
    ).toBeVisible({ timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await expect(page.getByRole("menuitemradio", { name: "Dark" })).toBeVisible()
})
