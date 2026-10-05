import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

async function signIn(page: Page) {
  await page.goto("/lga/sign-in")
  await page.getByRole("button", { name: "Use assigned account" }).click()
  await expect(page).toHaveURL(/\/lga\/dashboard$/)
}

const browserErrors = new WeakMap<Page, string[]>()

test.beforeEach(async ({ page }) => {
  const errors: string[] = []
  browserErrors.set(page, errors)
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
})

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([])
})

test("LGA assigned credentials verify, land on Dashboard, persist and sign out", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("radio", { name: "LGA Council", exact: true }).check()
  await page.getByRole("button", { name: "Continue to sign in" }).click()
  await expect(page).toHaveURL(/\/lga\/sign-in$/)
  await page.getByLabel("Staff ID or email").fill("LGA-001")
  await page.getByLabel("Password", { exact: true }).fill("wrong")
  await page.getByRole("button", { name: "Continue", exact: true }).click()
  await expect(page.getByRole("alert")).toContainText("incorrect")
  await page.getByLabel("Password", { exact: true }).fill("council-access")
  await page.getByRole("button", { name: "Continue", exact: true }).click()
  await page.getByLabel("Verification code", { exact: true }).fill("000000")
  await page.getByRole("button", { name: "Verify and sign in" }).click()
  await expect(page.getByRole("alert")).toContainText("correct six-digit")
  await page.getByLabel("Verification code", { exact: true }).fill("482610")
  await page.getByRole("button", { name: "Verify and sign in" }).click()
  await expect(page).toHaveURL(/\/lga\/dashboard$/)
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true })
  ).toBeVisible()
  const stored = await page.evaluate(() => JSON.stringify(localStorage))
  expect(stored).not.toContain("council-access")
  expect(stored).not.toContain("482610")
  await page.reload()
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "LGA account" }).click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.goto("/lga/premises")
  await expect(page).toHaveURL(/\/lga\/sign-in$/)
})

test("LGA premises reuse filters and details while foreign links fail closed", async ({
  page,
}) => {
  await signIn(page)
  await page.getByRole("link", { name: "Premises", exact: true }).click()
  await page.getByRole("combobox", { name: "Filter by ward" }).click()
  await expect(
    page.getByRole("option", { name: "Rumuokoro", exact: true })
  ).toHaveCount(0)
  await page.getByRole("option", { name: "Diobu", exact: true }).click()
  await expect(page.getByText("2 premises", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Clear filters" }).click()
  await page.getByRole("searchbox", { name: "Search premises" }).fill("PR-001")
  await page
    .getByRole("region", { name: "Premises directory" })
    .getByRole("button", { name: "View", exact: true })
    .first()
    .click()
  await expect(page).toHaveURL(/\/lga\/premises\/PR-001/)
  await expect(
    page.getByRole("heading", {
      name: "Riverside Kitchen & Foods",
      exact: true,
    })
  ).toBeVisible()
  await expect(page.getByRole("tab", { name: /Documents/ })).toHaveCount(0)
  await page.getByRole("tab", { name: /Certificates/ }).click()
  await expect(page.locator('a[href*="/moh/"]')).toHaveCount(0)
  await page.goto("/lga/premises/PR-005")
  await expect(
    page.getByRole("heading", { name: "Premises not found" })
  ).toBeVisible()
  await expect(page.getByText("Rumuokoro Fresh Mart")).toHaveCount(0)
  await page.goto("/lga/health-approvals/foreign-case")
  await expect(
    page.getByRole("heading", { name: "Health Approval not found" })
  ).toBeVisible()
})

test("LGA finance and reports filter and export only local records", async ({
  page,
}) => {
  await signIn(page)
  await page.getByRole("link", { name: "Finance", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Finance", exact: true })
  ).toBeVisible()
  await page.getByRole("combobox", { name: "Service", exact: true }).click()
  await page.getByRole("option", { name: "Fumigation", exact: true }).click()
  await expect(page.getByRole("table", { name: "Payments" })).toContainText(
    "Fumigation"
  )
  await expect(page.getByRole("table", { name: "Payments" })).not.toContainText(
    "Fitness"
  )
  await page.getByLabel("From", { exact: true }).fill("2027-01-01")
  await expect(
    page.getByText("No payments found", { exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "Clear filters", exact: true }).click()
  await page.getByRole("link", { name: "Reports", exact: true }).click()
  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Export", exact: true }).click()
  const download = await downloadPromise
  const stream = await download.createReadStream()
  let csv = ""
  for await (const chunk of stream) csv += chunk.toString()
  expect(csv).toContain("Riverside Kitchen")
  expect(csv).not.toContain("Rumuokoro")
  expect(csv).not.toContain("Bonny")
  await page.getByLabel("From", { exact: true }).fill("2026-10-20")
  await page.getByLabel("To", { exact: true }).fill("2026-10-01")
  await expect(page.getByRole("alert")).toContainText("end date")
  await expect(
    page.getByRole("button", { name: "Export", exact: true })
  ).toBeDisabled()
})

test("LGA overview and lists remain read-only and fit 390px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await signIn(page)
  for (const [path, title] of [
    ["dashboard", "Dashboard"],
    ["finance", "Finance"],
    ["health-approvals", "Health approvals"],
    ["premises", "Premises"],
    ["inspections", "Inspections"],
    ["reports", "Reports"],
  ]) {
    await page.goto(`/lga/${path}`)
    await expect(
      page.getByRole("heading", { name: title, exact: true })
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
    await expect(
      page.getByRole("button", {
        name: /^(Approve|Deny|Issue|Refund|Schedule inspection)$/,
      })
    ).toHaveCount(0)
  }
  await page.getByRole("button", { name: "LGA account" }).click()
  await page.getByRole("menuitemradio", { name: "Dark", exact: true }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await page.getByRole("button", { name: "Open LGA navigation" }).click()
  await page.getByRole("link", { name: "Dashboard", exact: true }).click()
  await expect(page).toHaveURL(/\/lga\/dashboard$/)
  await expect(
    page.getByRole("button", { name: "Open LGA navigation" })
  ).toBeVisible()
})

test("LGA session cannot open the legacy admin workspace by direct link", async ({
  page,
}) => {
  await signIn(page)
  await page.goto("/premises/PR-005")
  await expect(page).toHaveURL(/\/lga\/dashboard$/)
  await expect(page.getByText("Rumuokoro Fresh Mart")).toHaveCount(0)
})

test("LGA reads recorded decisions and switches report types without exposing actions", async ({
  page,
}) => {
  await signIn(page)
  await page.evaluate(() =>
    localStorage.setItem(
      "ehrcms:moh:MOH-001:decisions:v1",
      JSON.stringify({
        "HA-REV-001": {
          outcome: "approved",
          decidedAt: "2026-10-01",
          certificateNumber: "HAC-2026-001",
        },
      })
    )
  )
  await page.goto("/lga/health-approvals/HA-REV-001")
  await expect(
    page.getByRole("heading", {
      name: "Riverside Kitchen & Foods",
      exact: true,
    })
  ).toBeVisible()
  await expect(page.getByText("HAC-2026-001", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("button", { name: /Approve|Deny|Issue|Revoke/ })
  ).toHaveCount(0)
  await page.goto("/lga/inspections/INS-5")
  await expect(
    page.getByRole("heading", { name: "Inspection not found" })
  ).toBeVisible()
  await page.goto("/lga/reports")
  await page.getByRole("tab", { name: "Compliance", exact: true }).click()
  await expect(
    page.getByRole("table", { name: "Compliance", exact: true })
  ).toContainText("Riverside Kitchen")
  await expect(page.getByLabel("From", { exact: true })).toHaveCount(0)
  await page
    .getByRole("tab", { name: "Service performance", exact: true })
    .click()
  await expect(
    page.getByRole("table", { name: "Service performance", exact: true })
  ).toContainText("Completion rate")
  await page.evaluate(() =>
    localStorage.setItem(
      "ehrcms:moh:MOH-001:decisions:v1",
      JSON.stringify({ "HA-REV-001": { outcome: "approved" } })
    )
  )
  await page.reload()
  await expect(page.getByRole("alert")).toContainText("could not be loaded")
  await page
    .getByRole("tab", { name: "Service performance", exact: true })
    .click()
  await expect(
    page.getByRole("button", { name: "Export", exact: true })
  ).toBeDisabled()
})

test("LGA dashboard keeps summaries compact and groups detail in tabs", async ({
  page,
}) => {
  await signIn(page)
  await expect(
    page.getByRole("tablist", { name: "Dashboard sections" })
  ).toBeVisible()
  await expect(
    page.getByRole("tab", { name: "Compliance risks", exact: true })
  ).toHaveAttribute("aria-selected", "true")
  await page
    .getByRole("tab", { name: "Expiring certificates", exact: true })
    .click()
  await expect(
    page.getByRole("tabpanel", { name: "Expiring certificates", exact: true })
  ).toBeVisible()
  await page.getByRole("tab", { name: "Recent activity", exact: true }).click()
  await expect(
    page.getByRole("tabpanel", { name: "Recent activity", exact: true })
  ).toContainText("Council-wide")
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole("tab", { name: "Compliance risks", exact: true }).click()
  await expect(
    page.getByRole("tabpanel", { name: "Compliance risks", exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
})
