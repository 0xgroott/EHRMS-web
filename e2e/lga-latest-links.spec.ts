import { expect, test } from "@playwright/test"

for (const width of [1440, 390]) {
  test(`all new payment and inspection links stay responsive without reloads at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(120_000)
    const errors: string[] = []
    const documents: string[] = []
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
    await page.evaluate(() =>
      Reflect.set(window, "__navigationCheck", "same-document")
    )
    page.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.resourceType() === "document"
      )
        documents.push(request.url())
    })
    for (const [section, prefix, back] of [
      ["Finance", "/lga/finance/", "Back to finance"],
      ["Inspections", "/lga/inspections/", "Back to inspections"],
    ]) {
      if (width === 390)
        await page.getByRole("button", { name: "Open LGA navigation" }).click()
      await page
        .getByRole("navigation", { name: "LGA navigation" })
        .getByRole("link", { name: section, exact: true })
        .click()
      await expect(
        page.getByRole("heading", { name: section, exact: true })
      ).toBeVisible()
      const links = page.locator(`main a[href^="${prefix}"]:visible`)
      const hrefs = await links.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("href")!)
      )
      expect(hrefs.length).toBeGreaterThan(0)
      for (const href of hrefs) {
        const link = page
          .locator("main a:visible")
          .and(page.locator(`a[href="${href}"]`))
        await link.click()
        await expect(
          page.getByRole("link", { name: back, exact: true })
        ).toBeVisible()
        await page
          .getByRole("link", { name: "View premises", exact: true })
          .click()
        await expect(
          page.locator('[data-slot="premises-workspace"]')
        ).toBeVisible()
        await page.goBack()
        await expect(
          page.getByRole("link", { name: back, exact: true })
        ).toBeVisible()
        await page.getByRole("link", { name: back, exact: true }).click()
        await expect(
          page.getByRole("heading", { name: section, exact: true })
        ).toBeVisible()
      }
      for (let repeat = 0; repeat < 3; repeat++) {
        const first = links.first()
        await first.focus()
        await first.press("Enter")
        await expect(
          page.getByRole("link", { name: back, exact: true })
        ).toBeVisible()
        await page.goBack()
        await expect(first).toBeVisible()
        await page.goForward()
        await expect(
          page.getByRole("link", { name: back, exact: true })
        ).toBeVisible()
        await page.getByRole("link", { name: back, exact: true }).click()
        if (section === "Finance" || width === 1440) {
          await page
            .getByRole("table")
            .locator("tbody tr")
            .first()
            .getByRole("cell")
            .nth(1)
            .click()
        } else {
          await first.click()
        }
        await expect(
          page.getByRole("link", { name: back, exact: true })
        ).toBeVisible()
        await page.getByRole("link", { name: back, exact: true }).click()
      }
      expect(
        await page.evaluate(() => Reflect.get(window, "__navigationCheck"))
      ).toBe("same-document")
      expect(documents).toEqual([])
    }
    expect(errors).toEqual([])
  })
}
