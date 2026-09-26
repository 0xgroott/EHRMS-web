import { expect, test } from "@playwright/test"

test("business dashboard presents certificate actions and metrics on desktop and mobile", async ({
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

  const tabs = page.getByRole("tab")
  await expect(tabs).toHaveCount(3)
  await expect(tabs).toHaveText(["Staff", "Certificates", "Activity"])
  await expect(tabs.locator("svg")).toHaveCount(0)
  await expect(page.getByText("Kitchen staff", { exact: true })).toBeVisible()
  await expect(page.getByText("Branches", { exact: true })).toBeVisible()
  await expect(page.getByText("Certificates issued")).toBeVisible()
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
  await page.getByRole("tab", { name: "Account" }).click()
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
