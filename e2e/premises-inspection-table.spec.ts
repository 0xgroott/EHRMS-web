import { expect, test } from "@playwright/test"

for (const portal of ["moh", "lga", "operations"]) {
  test(`${portal} premises inspection history uses the shared table on desktop and mobile`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    if (portal !== "operations") {
      await page.goto(`/${portal}/sign-in`)
      await page.getByRole("button", { name: "Use assigned account" }).click()
      await expect(page).toHaveURL(
        portal === "moh" ? /\/moh\/health-approvals$/ : /\/lga\/dashboard$/
      )
    }
    await page.goto(
      portal === "operations"
        ? "/premises/PR-015"
        : portal === "moh"
          ? "/moh/businesses/PR-015"
          : "/lga/premises/PR-015"
    )
    await page
      .getByRole("tab", {
        name: portal === "operations" ? "Inspections" : /Inspection history/,
      })
      .click()
    const table = page.getByRole("table", { name: "Inspection history" })
    await expect(table.getByRole("columnheader")).toHaveText([
      "Date of inspection",
      "Field officer",
      "Inspection type",
      "Reference",
      "Status",
    ])
    await expect(
      table.getByRole("cell", { name: "INS-15", exact: true })
    ).toBeVisible()
    await expect(
      table.getByRole("cell", { name: "Tamuno George", exact: true })
    ).toBeVisible()
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 844 })
      await expect(table).toBeVisible()
      if (portal === "operations") {
        // The legacy header extends beyond the mobile viewport independently
        // of this table; assert the changed premises content stays contained.
        expect(
          await table.evaluate((element) => {
            const main = element.closest("main")!
            return main.scrollWidth <= innerWidth
          })
        ).toBe(true)
      } else {
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth
          )
        ).toBe(true)
      }
      await table.scrollIntoViewIfNeeded()
      const container = table.locator("..")
      await container.evaluate((element) => {
        element.scrollLeft = element.scrollWidth
      })
      await expect(
        table.getByRole("cell", { name: "Completed", exact: true })
      ).toBeInViewport()
    }
    expect(errors).toEqual([])
  })
}
