import { expect, test } from "@playwright/test"

test("MOH reviews an inspected business and records a denial reason", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/moh/sign-in")
  await expect(page.getByText("MOH-001", { exact: true })).toBeVisible()
  await expect(page.getByText("director-demo", { exact: true })).toBeVisible()
  await expect(page.getByText("246810", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Use assigned account" }).click()

  await expect(page).toHaveURL(/\/moh\/health-approvals$/)
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Health Approvals",
    })
  ).toBeVisible()
  await expect(
    page.getByRole("navigation", { name: "MOH navigation" })
  ).toBeVisible()
  await expect(
    page.locator("header").getByText("Health approvals")
  ).toBeVisible()
  await expect(page.getByRole("tab", { name: "Pending 12" })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Submitted businesses" })
  ).toHaveCount(0)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page
      .getByRole("tablist", { name: "Submission status" })
      .evaluate((tablist) => {
        const scroller = tablist.parentElement
        return scroller ? scroller.scrollHeight <= scroller.clientHeight : false
      })
  ).toBe(true)
  await page.setViewportSize({ width: 1280, height: 900 })
  await expect(
    page.getByRole("table", { name: "Submitted businesses" })
  ).toBeVisible()
  await page
    .getByRole("combobox", { name: "Sort submitted businesses" })
    .click()
  await page.getByRole("option", { name: "Business A–Z" }).click()
  await expect(
    page
      .getByRole("table", { name: "Submitted businesses" })
      .getByRole("row")
      .nth(1)
  ).toContainText("Borokiri Community Clinic")
  await page
    .getByRole("searchbox", { name: "Search submitted businesses" })
    .fill("Riverside Kitchen")
  await expect(page.getByText("Riverside Kitchen & Foods")).toBeVisible()
  const navigationEntry = await page.evaluate(
    () => performance.getEntriesByType("navigation")[0]?.name
  )
  await page.getByRole("link", { name: "Review" }).click()

  await expect(page).toHaveURL(/\/moh\/health-approvals\/HA-REV-001$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Riverside Kitchen & Foods" })
  ).toBeVisible()
  await expect(page.getByRole("status")).not.toBeVisible()
  expect(
    await page.evaluate(
      () => performance.getEntriesByType("navigation")[0]?.name
    )
  ).toBe(navigationEntry)
  await expect(page.getByText("Fumigation Certificate")).toBeVisible()
  await expect(page.getByText("14 of 14 staff certified")).toBeVisible()
  await expect(page.getByText("Inspection completed")).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(
    page.getByRole("button", { name: "Open MOH navigation" })
  ).toBeVisible()
  await page.getByRole("button", { name: "Deny approval" }).click()
  const dialog = page.getByRole("dialog", { name: "Deny Health Approval" })
  await dialog.getByRole("button", { name: "Submit denial" }).click()
  await expect(dialog.getByRole("alert")).toContainText(
    "Enter a reason for denying this Health Approval."
  )
  await dialog
    .getByLabel("Reason for denial")
    .fill("Cold storage controls require correction before approval.")
  await dialog.getByRole("button", { name: "Submit denial" }).click()

  await expect(page.getByText("Decision recorded")).toBeVisible()
  await expect(
    page.getByText("Cold storage controls require correction before approval.")
  ).toBeVisible()
  await page
    .getByRole("link", { name: "Health Approvals", exact: true })
    .click()
  await page.getByRole("tab", { name: "Rejected 1" }).click()
  await expect(page.getByText("Riverside Kitchen & Foods")).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})

test("MOH opens an approved Health Approval Certificate in a new tab", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/moh/sign-in")
  await page.getByRole("button", { name: "Use assigned account" }).click()
  await expect(page).toHaveURL(/\/moh\/health-approvals$/)
  const riversideRow = page
    .getByRole("row")
    .filter({ hasText: "Riverside Kitchen & Foods" })
  await riversideRow.getByRole("link", { name: "Review" }).click()
  await page.getByRole("button", { name: "Approve business" }).click()

  await expect(page.getByText("Certificate number: HAC-2026-001")).toBeVisible()
  const certificatePagePromise = page.waitForEvent("popup")
  await page.getByRole("link", { name: "View certificate" }).click()
  const certificatePage = await certificatePagePromise
  certificatePage.on("pageerror", (error) => browserErrors.push(error.message))
  certificatePage.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await expect(certificatePage).toHaveURL(
    /\/moh\/businesses\/HA-REV-001\/certificate$/
  )
  await expect(
    certificatePage.getByRole("heading", {
      level: 1,
      name: "Health Approval Certificate",
    })
  ).toBeVisible()
  await expect(certificatePage.getByText("HAC-2026-001")).toBeVisible()
  await expect(
    certificatePage.getByText("Riverside Kitchen & Foods")
  ).toBeVisible()
  await expect(certificatePage.getByTestId("certificate-qr-mark")).toBeVisible()
  await expect(
    certificatePage.getByRole("button", { name: "Download certificate" })
  ).toBeVisible()
  await expect(certificatePage.getByLabel("MOH navigation")).toHaveCount(0)
  await expect(certificatePage.getByLabel("MOH account")).toHaveCount(0)
  await expect(
    certificatePage.getByRole("link", { name: "Back to decision" })
  ).toHaveCount(0)
  const downloadPromise = certificatePage.waitForEvent("download")
  await certificatePage
    .getByRole("button", { name: "Download certificate" })
    .click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe(
    "health-approval-certificate-HAC-2026-001.html"
  )

  await certificatePage.setViewportSize({ width: 390, height: 844 })
  expect(
    await certificatePage.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
