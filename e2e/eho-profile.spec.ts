import { expect, test } from "@playwright/test"

test("EHO can review sync data and profile separately without losing saved work", async ({
  page,
  context,
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

  expect(
    await page.evaluate(
      () =>
        JSON.parse(
          localStorage.getItem("ehrcms:eho:fieldwork:v1:EHO-001") ?? "{}"
        )["EIN-103"]?.status
    )
  ).toBeUndefined()

  await page.evaluate(() => {
    const key = "ehrcms:eho:fieldwork:v1:EHO-001"
    const stored = JSON.parse(localStorage.getItem(key) ?? "{}")
    stored["EIN-103"] = {
      assignmentId: "EIN-103",
      status: "draft",
      answers: { "food-storage": "Satisfactory" },
      notes: {},
      issues: [],
      attendingOfficers: ["Ebi Briggs"],
    }
    stored["EIN-104"] = {
      assignmentId: "EIN-104",
      status: "queued",
      answers: {
        "food-storage": "Satisfactory",
        "waste-control": "Satisfactory",
        "water-supply": "Satisfactory",
      },
      notes: {},
      issues: [],
      attendingOfficers: ["Ebi Briggs"],
      submittedAt: "2026-09-19T12:00:00.000Z",
    }
    localStorage.setItem(key, JSON.stringify(stored))
  })
  await page.reload()
  const sidebar = page.locator("aside")
  await expect(sidebar.getByText("Assigned work for Ebi Briggs")).toHaveCount(0)
  await expect(sidebar.getByText("Ebi Briggs", { exact: true })).toBeVisible()
  await expect(sidebar.getByText("EHO", { exact: true })).toBeVisible()
  await expect(sidebar.getByRole("button", { name: "Logout" })).toBeVisible()
  await sidebar.getByRole("link", { name: "Sync Data" }).click()
  await expect(
    page.getByRole("heading", { level: 1, name: "Sync Data" })
  ).toBeVisible()
  await expect(
    page.locator("main").getByRole("link", { name: "My Work", exact: true })
  ).toHaveCount(0)
  await expect(page.getByText("Last sync: None recorded")).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Waiting to sync" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: /Inspection EIN-104/ })
  ).toBeVisible()
  await page.getByRole("button", { name: "Sync now" }).click()
  await expect(page.getByRole("alert")).toContainText(
    "Unable to sync right now"
  )
  await expect(
    page.getByRole("link", { name: /Inspection EIN-104/ })
  ).toBeVisible()
  await context.setOffline(true)
  await expect(page.getByText("Device offline")).toBeVisible()
  await page.getByRole("button", { name: "Sync now" }).click()
  await expect(page.getByRole("alert")).toContainText("You’re offline")
  await context.setOffline(false)
  await expect(page.getByText("Device online")).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.getByRole("button", { name: "Open EHO navigation" }).click()
  await expect(sidebar.getByText("Ebi Briggs", { exact: true })).toBeVisible()
  await expect(sidebar.getByText("EHO", { exact: true })).toBeVisible()
  await expect(sidebar.getByRole("button", { name: "Logout" })).toBeVisible()
  await sidebar
    .getByRole("button", { name: "EHO account — Ebi Briggs" })
    .click()
  await page.getByRole("menuitem", { name: "View profile" }).click()
  await expect(
    page.getByRole("heading", { level: 1, name: "Profile" })
  ).toBeVisible()
  await expect(page.getByText("Last sync: None recorded")).toHaveCount(0)
  await expect(
    page.locator("main").getByText("Ebi Briggs", { exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "Sign out", exact: true }).click()
  await expect(
    page.getByText(/Saved records stay on this device after sign-out/)
  ).toBeVisible()
  await page.getByRole("button", { name: "Stay signed in" }).click()
  await expect(page).toHaveURL(/\/eho\/profile$/)
  await page.getByRole("button", { name: "Sign out", exact: true }).click()
  await page.getByRole("button", { name: "Sign out anyway" }).click()
  await expect(page).toHaveURL(/\/$/)
  await page
    .getByRole("radio", { name: "Environmental Health Officer" })
    .check()
  await page.getByRole("button", { name: "Continue to sign in" }).click()
  await expect(page).toHaveURL(/\/eho\/sign-in$/)
  await expect(async () => {
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(
      page.getByRole("textbox", { name: "Staff ID or email" })
    ).toHaveValue("EHO-001", { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/eho\/my-work$/)
  await page.goto("/eho/sync-data")
  await expect(
    page.getByRole("link", { name: /Inspection EIN-104/ })
  ).toBeVisible()
  expect(browserErrors).toEqual([])
})
