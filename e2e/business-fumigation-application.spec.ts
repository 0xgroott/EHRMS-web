import { expect, test } from "@playwright/test"

for (const width of [1440, 390]) {
  test(`a business completes the fumigation application flow at ${width}px`, async ({
    page,
  }) => {
    const browserErrors: string[] = []
    page.on("pageerror", (error) => browserErrors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text())
    })

    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
    await page.goto("/business/sign-in")
    await expect(async () => {
      await page
        .getByRole("button", { name: "Sign in as Riverside Kitchen" })
        .click()
      await expect(page).toHaveURL(/\/business\/dashboard$/, {
        timeout: 1_000,
      })
    }).toPass({ timeout: 15_000 })

    await page.evaluate(() => {
      const key = "ehrcms:business:v1"
      const state = JSON.parse(localStorage.getItem(key) ?? "null")
      const primary = state.profile.premises
      state.profile.branches = [
        primary,
        {
          ...primary,
          premisesName: "Riverside Kitchen, Rumuodara",
          address: "8 Rumuodara Road",
          ward: "Rumuodara",
        },
      ]
      localStorage.setItem(key, JSON.stringify(state))
      localStorage.removeItem("ehrcms:fumigation:v1:BUS-001")
    })

    await page.goto("/business/fumigation/apply")
    await expect(
      page.getByRole("heading", { name: "Application details" })
    ).toBeVisible()
    const guide = page.getByRole("complementary", {
      name: "Application progress",
    })
    await expect(guide).toBeVisible()
    await expect(guide.getByText("0 of 4 completed")).toBeVisible()

    await page
      .getByRole("combobox", { name: "Business branch/location" })
      .click()
    await page
      .getByRole("option", { name: /Riverside Kitchen, Rumuodara/ })
      .click()
    await page.getByLabel("Requested service month").fill("2026-10")
    await page
      .getByRole("checkbox", {
        name: "I confirm the selected premises details are correct.",
      })
      .click()
    await page.getByRole("button", { name: "Next" }).click()

    await page
      .getByRole("radio", { name: /Clearfield Environmental Services/ })
      .click()
    await page.getByRole("button", { name: "Next" }).click()
    await expect(page.getByText("Riverside Kitchen, Rumuodara")).toBeVisible()
    await page.getByRole("button", { name: "Continue to payment" }).click()

    await expect(page).toHaveURL(/\/business\/fumigation\/apply$/)
    await expect(
      page.getByRole("heading", { name: "Payment & submission" })
    ).toBeVisible()
    await expect(guide.getByText("3 of 4 completed")).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)

    await page
      .getByRole("button", { name: "Confirm payment and submit" })
      .click()
    await expect(page).toHaveURL(/\/business\/fumigation\/tracker$/)
    await expect(
      page.getByRole("heading", { name: "Application tracker" })
    ).toBeVisible()
    await expect(
      page.getByRole("status", { name: "Fumigation application status" })
    ).toContainText("Awaiting provider report")
    const business = page.getByRole("region", { name: "The business" })
    const progress = page.getByRole("region", {
      name: "Application progress",
    })
    await expect(business).toBeVisible()
    await expect(progress).toBeVisible()
    await expect(
      page.getByRole("region", { name: "Service details" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Confirm provider service" })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: "View payment receipt" })
    ).toHaveAttribute("target", "_blank")
    const businessBox = await business.boundingBox()
    const progressBox = await progress.boundingBox()
    expect(businessBox).not.toBeNull()
    expect(progressBox).not.toBeNull()
    if (businessBox && progressBox) {
      if (width === 1440) {
        expect(Math.abs(businessBox.y - progressBox.y)).toBeLessThan(2)
        expect(progressBox.x).toBeGreaterThan(businessBox.x)
      } else {
        expect(progressBox.y).toBeGreaterThan(businessBox.y)
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
    expect(browserErrors).toEqual([])
  })
}
