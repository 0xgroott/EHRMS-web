import { expect, test } from "@playwright/test"

test("business user can open the dashboard from the sign-in page", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/business/sign-in")
  await expect(
    page.getByRole("button", { name: "Sign in as Riverside Kitchen" })
  ).toBeVisible()
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, {
      timeout: 1_000,
    })
  }).toPass({ timeout: 15_000 })
  await expect(
    page.getByRole("heading", { level: 1, name: "Business dashboard" })
  ).toBeVisible()
  expect(browserErrors).toEqual([])
})

test("field officer can sign in with the assigned demo account", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/eho/sign-in")
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in as an EHO" })
  ).toBeVisible()
  await expect(async () => {
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(
      page.getByRole("textbox", { name: "Staff ID or email" })
    ).toHaveValue("EHO-001", { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/eho\/my-work$/)
  await expect(page.getByRole("heading", { name: /My Work/ })).toBeVisible()
  expect(browserErrors).toEqual([])
})

test("EHO dashboard separates inspections and follow-ups into tabs", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/eho/sign-in")
  await expect(async () => {
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(
      page.getByRole("textbox", { name: "Staff ID or email" })
    ).toHaveValue("EHO-001", { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await expect(async () => {
    await page.getByRole("button", { name: "Sign in", exact: true }).click()
    await expect(page).toHaveURL(/\/eho\/my-work$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })

  const inspections = page.getByRole("tab", { name: "Assigned inspections" })
  const followUps = page.getByRole("tab", { name: "Follow-up visits" })
  await expect(inspections).toHaveAttribute("aria-selected", "true")
  await expect(
    page.getByRole("heading", { name: "Garden City Cold Stores" })
  ).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(followUps).toBeVisible()
  await followUps.click()
  await expect(followUps).toHaveAttribute("aria-selected", "true")
  await expect(
    page.getByRole("heading", { name: "Creek View Bakery" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Garden City Cold Stores" })
  ).toBeHidden()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)

  await page.getByRole("button", { name: "Open follow-up" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-104\/follow-up$/)
  await expect(
    page.getByRole("heading", { name: "Follow-up verification" })
  ).toBeVisible()
  expect(browserErrors).toEqual([])
})
