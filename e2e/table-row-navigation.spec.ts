import { expect, test } from "@playwright/test"

for (const portal of ["moh", "eho", "lga", "operations"]) {
  test(`${portal} single-action rows open their links and preserve keyboard navigation`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    await page.setViewportSize({ width: 1440, height: 819 })
    if (portal !== "operations") {
      await page.goto(`/${portal}/sign-in`)
      await expect(async () => {
        await page.getByRole("button", { name: "Use assigned account" }).click()
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
              : /\/lga\/dashboard$/,
          { timeout: 1000 }
        )
      }).toPass({ timeout: 15000 })
    }
    const directory =
      portal === "operations"
        ? "/premises"
        : portal === "moh"
          ? "/moh/businesses"
          : portal === "eho"
            ? "/eho/premises-search"
            : `/${portal}/premises`
    await page.goto(directory)
    const row = page.locator("tbody tr").first()
    const link = row.locator("a[href]")
    await expect(link).toHaveCount(1)
    const destination = new URL((await link.getAttribute("href"))!, page.url())
      .href
    const documentRequests: string[] = []
    page.on("request", (request) => {
      if (request.isNavigationRequest() && request.frame() === page.mainFrame())
        documentRequests.push(request.url())
    })
    await row.getByRole("cell").nth(1).click()
    await expect(page).toHaveURL(destination)
    await page.goBack()
    await expect(row).toBeVisible()
    await link.focus()
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(destination)
    expect(documentRequests).toEqual([])
    if (portal === "operations") {
      await page.goBack()
      await page.setViewportSize({ width: 390, height: 844 })
      await row.getByRole("cell").nth(1).click()
      await expect(page).toHaveURL(destination)
    }
    expect(errors).toEqual([])
  })
}
