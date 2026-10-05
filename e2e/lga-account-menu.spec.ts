import { expect, test } from "@playwright/test"

test("LGA account matches the Business sidebar profile on desktop and mobile", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  await page.setViewportSize({ width: 1440, height: 819 })
  await page.goto("/lga/sign-in")
  await page.getByRole("button", { name: "Use assigned account" }).click()
  await expect(page).toHaveURL(/\/lga\/dashboard$/)
  const account = page
    .locator('[data-slot="sidebar-footer"]')
    .getByRole("button", { name: "LGA account", exact: true })
  await expect(account).toBeVisible()
  await expect(account).toContainText("Nimi Douglas")
  await expect(
    page.getByRole("banner").getByRole("button", { name: "LGA account" })
  ).toHaveCount(0)
  await expect(account).toHaveCSS("border-radius", "14px")
  await expect(account.locator('[data-slot="avatar"]')).toHaveCSS(
    "width",
    "40px"
  )
  const bounds = (await account.boundingBox())!
  expect(bounds.y).toBeGreaterThan(700)
  expect(bounds.height).toBeGreaterThanOrEqual(64)
  await account.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible()
  expect((await page.getByRole("menu").boundingBox())!.y).toBeLessThan(bounds.y)
  await page.keyboard.press("Escape")
  await expect(account).toBeFocused()
  await page.getByRole("button", { name: "Toggle LGA navigation" }).click()
  await expect(account.locator('[data-slot="avatar"]')).toHaveCSS(
    "width",
    "32px"
  )
  await account.click()
  const collapsed = (await account.boundingBox())!
  await expect
    .poll(async () => (await page.getByRole("menu").boundingBox())!.x)
    .toBeGreaterThanOrEqual(collapsed.x + collapsed.width)
  await page.getByRole("menuitemradio", { name: "Dark", exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("button", { name: "Open LGA navigation" }).click()
  await expect(account).toContainText("Nimi Douglas")
  await expect(account.locator('[data-slot="avatar"]')).toHaveCSS(
    "width",
    "40px"
  )
  await account.click()
  const menu = (await page.getByRole("menu").boundingBox())!
  expect(menu.x).toBeGreaterThanOrEqual(0)
  expect(menu.x + menu.width).toBeLessThanOrEqual(390)
  expect(menu.y).toBeGreaterThanOrEqual(0)
  expect(menu.y + menu.height).toBeLessThanOrEqual(844)
  await page.getByRole("menuitemradio", { name: "Light", exact: true }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
  await account.click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/\/$/)
  expect(
    await page.evaluate(() => localStorage.getItem("ehrcms:lga:session:v1"))
  ).toBeNull()
  expect(errors).toEqual([])
})
