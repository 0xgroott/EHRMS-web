import { expect, test } from "@playwright/test"

test("welcome selection leads to business sign-in and returns after sign-out", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  await page.goto("/")
  await expect(
    page.getByRole("heading", { level: 1, name: "Choose your account type" })
  ).toBeVisible()
  await expect(page.getByRole("radio")).toHaveCount(3)
  await expect(page.getByText("Admin", { exact: true })).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Continue to sign in" })
  ).toBeDisabled()
  await expect(async () => {
    await page.getByRole("radio", { name: "Business" }).check()
    await expect(
      page.getByRole("button", { name: "Continue to sign in" })
    ).toBeEnabled({ timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("button", { name: "Continue to sign in" }).click()
  await expect(page).toHaveURL(/\/business\/sign-in$/)
  await expect(
    page.getByRole("link", { name: "Choose another account type" })
  ).toBeVisible()
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("button", { name: "Business account" }).click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByRole("heading", { name: "Choose your account type" })
  ).toBeVisible()
  await page.goto("/business/dashboard")
  await expect(page).toHaveURL(/\/business\/sign-in$/)
  expect(browserErrors).toEqual([])
})

test("welcome selection supports MOH verification and sign-out", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await expect(async () => {
    await page.getByRole("radio", { name: "Medical Officer of Health" }).check()
    await expect(
      page.getByRole("button", { name: "Continue to sign in" })
    ).toBeEnabled({ timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("button", { name: "Continue to sign in" }).click()
  await expect(page).toHaveURL(/\/moh\/sign-in$/)
  await expect(async () => {
    await page
      .getByRole("textbox", { name: "Staff ID or email" })
      .fill("MOH-001")
    await page.getByLabel("Password").fill("director-demo")
    await page.getByRole("button", { name: "Continue" }).click()
    await expect(
      page.getByRole("heading", { name: "Verify your sign-in" })
    ).toBeVisible({ timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("textbox", { name: "Verification code" }).fill("000000")
  await page.getByRole("button", { name: "Verify and sign in" }).click()
  await expect(page.getByRole("alert")).toContainText("correct six-digit")
  await page.getByRole("textbox", { name: "Verification code" }).fill("246810")
  await page.getByRole("button", { name: "Verify and sign in" }).click()
  await expect(page).toHaveURL(/\/moh\/health-approvals$/)
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Health Approvals",
    })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.getByRole("button", { name: "MOH account" }).click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto("/moh/home")
  await expect(page).toHaveURL(/\/moh\/sign-in$/)
  expect(browserErrors).toEqual([])
})
