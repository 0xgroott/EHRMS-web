import { expect, test } from "@playwright/test"

for (const portal of ["business", "eho", "moh", "lga", "operations"]) {
  test(`${portal} dashboard displays the favicon logo on desktop and mobile`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    await page.setViewportSize({ width: 1440, height: 819 })
    await page.goto(
      portal === "operations" ? "/dashboard" : `/${portal}/sign-in`
    )
    if (portal !== "operations") {
      await expect(async () => {
        await page
          .getByRole("button", {
            name:
              portal === "business"
                ? "Sign in as Riverside Kitchen"
                : "Use assigned account",
          })
          .click()
        if (portal === "eho") {
          await expect(
            page.getByRole("textbox", { name: "Staff ID or email" })
          ).toHaveValue("EHO-001", { timeout: 1000 })
          await page
            .getByRole("button", { name: "Sign in", exact: true })
            .click()
        }
        await expect(page).toHaveURL(
          portal === "eho"
            ? /\/eho\/my-work$/
            : portal === "moh"
              ? /\/moh\/health-approvals$/
              : new RegExp(`/${portal}/dashboard$`),
          { timeout: 1000 }
        )
      }).toPass({ timeout: 15000 })
    }
    const logo = page.locator('img[src="/favicon/logo-green-48.svg"]')
    await expect(logo).toBeVisible()
    await expect
      .poll(() =>
        logo.evaluate((image) => (image as HTMLImageElement).naturalWidth)
      )
      .toBeGreaterThan(0)
    await page.setViewportSize({ width: 390, height: 844 })
    await page
      .getByRole("button", {
        name:
          portal === "operations"
            ? "Toggle Sidebar"
            : `Open ${portal === "business" ? "business" : portal.toUpperCase()} navigation`,
        exact: true,
      })
      .click()
    await expect(logo).toBeVisible()
    const bounds = await logo.boundingBox()
    expect(bounds!.width).toBeGreaterThanOrEqual(32)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390)
    expect(errors).toEqual([])
  })
}
