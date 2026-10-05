import { expect, test } from "@playwright/test"

// Exercise history restoration with Chromium's Back/Forward cache enabled.
test.use({
  launchOptions: { ignoreDefaultArgs: ["--disable-back-forward-cache"] },
})

for (const width of [1440, 390]) {
  test(`MOH sidebar and premises navigation keep the signed-in session loaded at ${width}px`, async ({
    page,
  }) => {
    const browserErrors: string[] = []
    page.on("pageerror", (error) => browserErrors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text())
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/moh/sign-in")
    await expect(
      page.getByRole("region", { name: "Notifications" })
    ).toBeAttached()
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(
      page.getByRole("heading", { level: 1, name: "Health Approvals" })
    ).toBeVisible()
    const documentRequests: string[] = []
    page.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.resourceType() === "document"
      ) {
        documentRequests.push(new URL(request.url()).pathname)
      }
    })
    for (const item of [
      { label: "Inspections", path: "/moh/inspections" },
      { label: "Premises", path: "/moh/businesses" },
      { label: "Health approvals", path: "/moh/health-approvals" },
      { label: "Premises", path: "/moh/businesses" },
    ]) {
      if (width === 390)
        await page.getByRole("button", { name: "Open MOH navigation" }).click()
      await page.getByRole("link", { name: item.label, exact: true }).click()
      await expect(page).toHaveURL(item.path)
      await expect(
        page.getByRole("heading", { level: 1, name: item.label, exact: false })
      ).toBeVisible()
      if (width !== 390)
        await expect(
          page
            .getByRole("navigation", { name: "MOH navigation" })
            .getByRole("link", { name: item.label, exact: true })
        ).toHaveAttribute("aria-current", "page")
      expect(
        documentRequests,
        "Internal navigation must not restart session hydration"
      ).toEqual([])
      if (width === 390) await expect(page.getByRole("dialog")).toHaveCount(0)
    }
    const view = page
      .getByRole("region", { name: "Premises directory" })
      .getByRole("button", { name: "View", exact: true })
      .first()
    await view.click()
    await expect(page.locator('[data-slot="premises-workspace"]')).toBeVisible()
    expect(documentRequests).toEqual([])
    await page.goBack()
    await expect(page).toHaveURL("/moh/businesses")
    await view.click()
    await expect(page.locator('[data-slot="premises-workspace"]')).toBeVisible()
    await page.getByRole("button", { name: "Back to premises" }).click()
    await expect(page).toHaveURL("/moh/businesses")
    expect(documentRequests).toEqual([])
    expect(browserErrors).toEqual([])
  })

  test(`MOH premises reopen after Back and refresh at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90_000)
    const browserErrors: string[] = []
    page.on("pageerror", (error) => browserErrors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text())
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/moh/sign-in")
    await expect(
      page.getByRole("region", { name: "Notifications" })
    ).toBeAttached()
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(page).toHaveURL("/moh/health-approvals")
    await expect(
      page.getByRole("heading", { level: 1, name: "Health Approvals" })
    ).toBeVisible()
    if (width === 390) {
      await page.getByRole("button", { name: "Open MOH navigation" }).click()
    }
    await page.getByRole("link", { name: "Premises", exact: true }).click()
    const directoryHeading = page.getByRole("heading", {
      level: 1,
      name: "Premises",
      exact: true,
    })
    await expect(directoryHeading).toBeVisible()
    const directory = page.getByRole("region", { name: "Premises directory" })
    const links = await directory
      .getByRole("button", { name: "View", exact: true })
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("href"))
      )
    expect(links).toHaveLength(10)
    for (const href of links) {
      if (!href) throw new Error("Premises link is missing its destination")
      await test.step(`Open, refresh, Back and reopen ${href}`, async () => {
        const view = directory.locator(`a[href="${href}"]:visible`)
        for (let visit = 0; visit < 2; visit += 1) {
          await view.click()
          await expect(page).toHaveURL(href)
          await expect(
            page.locator('[data-slot="premises-workspace"]')
          ).toBeVisible()
          await page.getByRole("tab", { name: /^Certificates/ }).click()
          await expect(
            page.getByRole("tabpanel", { name: /^Certificates/ })
          ).toBeVisible()
          await page.reload()
          await expect(
            page.locator('[data-slot="premises-workspace"]')
          ).toBeVisible()
          await page.goBack()
          await expect(page).toHaveURL("/moh/businesses")
          await expect(directoryHeading).toBeVisible()
        }
      })
    }
    expect(browserErrors).toEqual([])
  })
}
