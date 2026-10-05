import { expect, test } from "@playwright/test"

for (const width of [1440, 390]) {
  test(`LGA report library views and downloads council documents at ${width}px`, async ({
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
    await page.goto("/lga/reports")
    const documents: string[] = []
    page.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.resourceType() === "document"
      )
        documents.push(request.url())
    })
    await expect(
      page.getByRole("searchbox", { name: "Search reports" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Export", exact: true })
    ).toHaveCount(0)
    await expect(
      page.getByRole("region", { name: "Revenue summary" })
    ).toHaveCount(0)
    for (const category of ["Revenue", "Compliance", "Service performance"]) {
      await page.getByRole("tab", { name: category, exact: true }).click()
      const title = `${category} report — September 2026`
      const view = page.getByRole("button", {
        name: `View ${title}`,
        exact: true,
      })
      await expect(view).toBeVisible()
      const record = page
        .getByRole(width === 1440 ? "row" : "listitem")
        .filter({ has: view })
      await expect(record).toContainText("Borokiri")
      await expect(record).toContainText("Dr. Nengi Alabo")
      if (width === 1440) {
        await expect(
          page.getByRole("columnheader", { name: "Ward", exact: true })
        ).toBeVisible()
        await expect(
          page.getByRole("columnheader", {
            name: "Prepared by (MOH)",
            exact: true,
          })
        ).toBeVisible()
      }
      await page
        .getByRole("searchbox", { name: "Search reports" })
        .fill("September")
      await view.click()
      await expect(
        page.getByRole("heading", { name: title, exact: true })
      ).toBeVisible()
      const content = await page
        .getByRole("region", { name: "Report document" })
        .innerText()
      expect(content).toContain("Ward: Borokiri")
      expect(content).toContain("Prepared by: Dr. Nengi Alabo (MOH)")
      const downloading = page.waitForEvent("download")
      await page
        .getByRole("button", { name: `Download ${title}`, exact: true })
        .click()
      const download = await downloading
      expect(download.suggestedFilename()).toMatch(/\.txt$/)
      const stream = await download.createReadStream()
      let file = ""
      for await (const chunk of stream) file += chunk.toString()
      expect(file).toBe(content)
      await page
        .getByRole("button", { name: "Back to reports", exact: true })
        .click()
      await expect(
        page.getByRole("searchbox", { name: "Search reports" })
      ).toHaveValue("September")
      await page.goBack()
      await expect(
        page.getByRole("heading", { name: title, exact: true })
      ).toBeVisible()
      await page.goForward()
      await expect(view).toBeVisible()
      await page.getByRole("searchbox", { name: "Search reports" }).fill("")
    }
    await page
      .getByRole("searchbox", { name: "Search reports" })
      .fill("not a report")
    await expect(
      page.getByRole("heading", { name: "No matching reports" })
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    expect(documents).toEqual([])
    await page.goto("/lga/reports?report=foreign-report")
    await expect(
      page.getByRole("heading", { name: "Report not found" })
    ).toBeVisible()
    await expect(page.getByRole("button", { name: /^Download/ })).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
