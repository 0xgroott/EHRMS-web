import { expect, test } from "@playwright/test"

test("business account actions live in the sidebar footer on desktop and mobile", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  await page.setViewportSize({ width: 1440, height: 819 })
  await page.goto("/business/sign-in")
  await expect(
    page.getByRole("region", { name: "Notifications" })
  ).toBeAttached()
  await page
    .getByRole("button", { name: "Sign in as Riverside Kitchen" })
    .click()
  await expect(
    page.getByRole("heading", { level: 1, name: "Home", exact: true })
  ).toBeVisible()
  const account = page
    .locator('[data-slot="sidebar-footer"]')
    .getByRole("button", { name: "Business account" })
  await expect(account).toBeVisible()
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Business account" })
  ).toHaveCount(0)
  const bounds = await account.boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds!.y).toBeGreaterThan(700)
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(819)
  await account.focus()
  await page.keyboard.press("Enter")
  await expect(
    page.getByRole("menuitem", { name: "Settings", exact: true })
  ).toBeVisible()
  await expect(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(account).toBeFocused()

  await page.getByRole("button", { name: "Toggle business navigation" }).click()
  await expect(
    page.locator('[data-slot="sidebar"][data-state="collapsed"]')
  ).toBeVisible()
  await expect(account).toBeVisible()
  await account.click()
  await page.getByRole("menuitemradio", { name: "Dark", exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await account.click()
  await page.getByRole("menuitem", { name: "Settings", exact: true }).click()
  await expect(page).toHaveURL("/business/settings")

  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("button", { name: "Open business navigation" }).click()
  await expect(account).toBeVisible()
  await account.click()
  const menu = page.getByRole("menu")
  await expect(menu).toBeVisible()
  const menuBounds = await menu.boundingBox()
  expect(menuBounds).not.toBeNull()
  expect(menuBounds!.x).toBeGreaterThanOrEqual(0)
  expect(menuBounds!.x + menuBounds!.width).toBeLessThanOrEqual(390)
  expect(menuBounds!.y).toBeGreaterThanOrEqual(0)
  expect(menuBounds!.y + menuBounds!.height).toBeLessThanOrEqual(844)
  await page.getByRole("menuitemradio", { name: "Light", exact: true }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
  await account.click()
  await page.getByRole("menuitem", { name: "Settings", exact: true }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(
    page.getByRole("heading", { level: 1, name: "Settings", exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  await page.getByRole("button", { name: "Open business navigation" }).click()
  await account.click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()
  await expect(page).toHaveURL("/")
  await expect(
    page.getByRole("heading", { name: "Choose your account type" })
  ).toBeVisible()
  expect(browserErrors).toEqual([])
})

test("business dashboard presents certificate actions and metrics on desktop and mobile", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.setViewportSize({ width: 1440, height: 819 })
  await page.goto("/business/sign-in")
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })

  const tabs = page.getByRole("tab")
  await expect(tabs).toHaveCount(3)
  await expect(tabs).toHaveText(["Staff", "Certificates", "Activity"])
  await expect(tabs.locator("svg")).toHaveCount(0)
  await expect(page.getByText("Kitchen staff", { exact: true })).toBeVisible()
  await expect(
    page.getByText("Affiliated premises", { exact: true })
  ).toBeVisible()
  await expect(page.getByText("Certificates issued")).toBeVisible()
  const metricCards = page
    .getByRole("region", { name: "Business metrics" })
    .locator('[data-slot="card"]')
  await expect(metricCards).toHaveCount(3)
  await expect(
    metricCards.locator('[data-slot="card-action"] svg')
  ).toHaveCount(3)
  const desktopFirst = await metricCards.first().boundingBox()
  const desktopLast = await metricCards.last().boundingBox()
  expect(desktopFirst!.y).toBe(desktopLast!.y)
  expect(desktopFirst!.height).toBe(desktopLast!.height)

  await expect(page.getByRole("region", { name: "Staff" })).toBeVisible()
  await expect(
    page.getByRole("link", { name: "View all staff" })
  ).toHaveAttribute("href", "/business/food-handlers")
  await expect(
    page.getByText("Your path to final Health Approval")
  ).toHaveCount(0)
  await expect(page.getByRole("link", { name: "View profile" })).toBeVisible()
  const businessProfile = page.getByLabel("Business profile")
  await expect(businessProfile.locator('[data-slot="avatar"]')).toBeVisible()
  await expect(
    businessProfile.locator('[data-slot="avatar-fallback"]')
  ).toHaveText("RK")

  await page.getByRole("button", { name: "Get started" }).click()
  const certificateDialog = page.getByRole("dialog", {
    name: "Choose a certificate",
  })
  await expect(certificateDialog.getByRole("link")).toHaveCount(2)
  await expect(
    certificateDialog.getByRole("link", { name: /add kitchen staff/i })
  ).toHaveAttribute("href", "/business/food-handlers")
  await expect(
    certificateDialog.getByRole("link", { name: /begin fumigation/i })
  ).toHaveAttribute("href", "/business/fumigation/apply")
  await certificateDialog.getByRole("button", { name: "Close" }).click()

  await page.getByRole("tab", { name: "Certificates" }).click()
  await expect(page.getByText("No certificates yet")).toBeVisible()

  await page.getByRole("tab", { name: "Activity" }).click()
  await expect(page.getByText("No recent activity")).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  const mobileFirst = await metricCards.first().boundingBox()
  const mobileLast = await metricCards.last().boundingBox()
  expect(mobileLast!.y).toBeGreaterThan(mobileFirst!.y + mobileFirst!.height)
  expect(mobileLast!.x + mobileLast!.width).toBeLessThanOrEqual(390)

  await page.getByRole("tab", { name: "Staff" }).click()
  await expect(page.getByRole("region", { name: "Staff" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible()
  await expect(businessProfile.locator('[data-slot="avatar"]')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)

  await page.goto("/business/settings")
  await page.getByRole("tab", { name: "Advanced" }).click()
  await page.getByRole("button", { name: "Reset application progress" }).click()
  const resetDialog = page.getByRole("alertdialog", {
    name: "Reset application progress?",
  })
  await expect(resetDialog).toContainText(
    "Your business profile and kitchen staff will stay"
  )
  await resetDialog.getByRole("button", { name: "Cancel" }).click()
  expect(browserErrors).toEqual([])
})
