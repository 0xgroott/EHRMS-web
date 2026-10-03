import { expect, test } from "@playwright/test"

test("business settings uses a responsive profile summary and editable public links", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/business/sign-in")
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.goto("/business/settings")

  const overview = page.getByRole("complementary", {
    name: "Business overview",
  })
  const panel = page.locator('[data-slot="business-settings-panel"]')
  const tabs = page.getByRole("tablist")
  await expect(overview).toBeVisible()
  await expect(
    overview.getByRole("heading", { name: "Riverside Kitchen & Foods" })
  ).toBeVisible()
  await expect(overview.getByRole("link", { name: "Website" })).toHaveAttribute(
    "href",
    "https://riverside.example.com"
  )
  await expect(
    overview.getByRole("button", { name: "Edit business logo" })
  ).toBeVisible()
  await expect(
    panel.getByRole("button", { name: "Edit business logo" })
  ).toHaveCount(0)
  const fileChooserPromise = page.waitForEvent("filechooser")
  await overview.getByRole("button", { name: "Edit business logo" }).click()
  const fileChooser = await fileChooserPromise
  expect(fileChooser.isMultiple()).toBe(false)
  expect(
    await panel.evaluate((element) => getComputedStyle(element).borderTopWidth)
  ).toBe("1px")
  await expect(panel).toHaveCSS("min-height", "504px")
  await expect(tabs).toHaveAttribute("data-variant", "default")
  expect(await panel.locator('[role="tablist"]').count()).toBe(0)

  const desktopTabs = await tabs.boundingBox()
  const desktopPanelTop = await panel.boundingBox()
  const activeTab = await page
    .getByRole("tab", { name: "Business profile" })
    .boundingBox()
  const inactiveTab = await page
    .getByRole("tab", { name: "Account" })
    .boundingBox()
  expect(desktopTabs).not.toBeNull()
  expect(desktopPanelTop).not.toBeNull()
  expect(activeTab).not.toBeNull()
  expect(inactiveTab).not.toBeNull()
  expect(desktopTabs!.height).toBe(44)
  expect(activeTab!.height).toBe(inactiveTab!.height)
  expect(activeTab!.y).toBeGreaterThan(desktopTabs!.y)
  expect(activeTab!.y + activeTab!.height).toBeLessThan(
    desktopTabs!.y + desktopTabs!.height
  )
  expect(desktopTabs!.y + desktopTabs!.height).toBeLessThan(desktopPanelTop!.y)

  const desktopOverview = await overview.boundingBox()
  const desktopPanel = await panel.boundingBox()
  expect(desktopOverview).not.toBeNull()
  expect(desktopPanel).not.toBeNull()
  expect(desktopPanel!.x - (desktopOverview!.x + desktopOverview!.width)).toBe(
    40
  )

  await page.getByRole("tab", { name: "Account" }).click()
  await expect(
    page.getByRole("heading", { name: "Owner account" })
  ).toBeVisible()
  expect((await panel.boundingBox())?.height).toBe(504)
  await page.getByRole("tab", { name: "Business profile" }).click()

  await page.evaluate(() => window.scrollTo(0, 400))
  const stickyOverview = await overview.boundingBox()
  expect(stickyOverview).not.toBeNull()
  expect(stickyOverview!.y).toBeGreaterThanOrEqual(90)
  expect(stickyOverview!.y).toBeLessThanOrEqual(102)
  await page.evaluate(() => window.scrollTo(0, 0))

  const website = page.getByRole("textbox", { name: "Website" })
  await website.fill("https://riversidefoods.example.com")
  await page.getByRole("button", { name: "Save changes" }).click()
  await expect(overview.getByRole("link", { name: "Website" })).toHaveAttribute(
    "href",
    "https://riversidefoods.example.com"
  )

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(panel).toHaveCSS("min-height", "320px")
  const mobileOverview = await overview.boundingBox()
  const mobileTabs = await tabs.boundingBox()
  expect(mobileOverview).not.toBeNull()
  expect(mobileTabs).not.toBeNull()
  expect(mobileOverview!.y).toBeLessThan(mobileTabs!.y)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
