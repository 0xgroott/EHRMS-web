import { expect, test } from "@playwright/test"

test("EHO opens a certificate record from premises compliance and returns", async ({
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
    await expect(page.getByLabel("Staff ID or email")).toHaveValue("EHO-001", {
      timeout: 1_000,
    })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/eho\/my-work$/)

  await page.goto("/eho/premises/PR-004?source=search")
  await page.getByRole("tab", { name: /Certificates ·/ }).click()
  await expect(
    page.getByRole("region", { name: "Health Approval" })
  ).toContainText("Not issued")
  await expect(
    page.getByRole("link", { name: /Open Health Approval/ })
  ).toHaveCount(0)
  await page.goto("/eho/premises/PR-004?source=search&certificate=HC-1004")
  await expect(page).toHaveURL(
    /\/eho\/premises\/PR-004\?source=search&certificate=HC-1004$/
  )
  await expect(
    page.getByRole("heading", { level: 1, name: "Health Approval certificate" })
  ).toBeVisible()
  await expect(page.getByText("Pending", { exact: true }).first()).toBeVisible()
  await page.reload()
  await expect(page.getByText("Pending", { exact: true }).first()).toBeVisible()
  await page
    .getByRole("link", { name: "Back to premises certificates" })
    .click()
  await expect(page).toHaveURL(/\/eho\/premises\/PR-004\?source=search$/)
  await expect(page.getByRole("tab", { name: /Certificates ·/ })).toBeVisible()

  await page.goto("/eho/premises/PR-004?certificate=HC-9999")
  await expect(page.getByText("Certificate record not found")).toBeVisible()
  await page.goto("/eho/premises/PR-005?certificate=HC-1005")
  await expect(page.getByText("Premises record not found")).toBeVisible()

  await page.goto("/eho/premises/PR-002?inspection=EIN-101")
  await page.getByRole("tab", { name: /Certificates ·/ }).click()
  const popupPromise = page.waitForEvent("popup")
  await page
    .getByRole("link", { name: "Open Fumigation Certificate FC-1002" })
    .click()
  const certificatePage = await popupPromise
  certificatePage.on("pageerror", (error) => browserErrors.push(error.message))
  certificatePage.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  await expect(certificatePage).toHaveURL(
    /\/eho\/premises\/PR-002\?inspection=EIN-101&certificate=FC-1002$/
  )
  await expect(
    certificatePage.getByRole("heading", { name: "Fumigation certificate" })
  ).toBeVisible()
  await certificatePage
    .getByRole("link", { name: "Back to premises certificates" })
    .click()
  await certificatePage.close()
  await page.getByRole("button", { name: "Return to inspection" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-101$/)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/eho/premises/PR-001?certificate=HC-1001")
  await expect(page.locator('[data-status="active"]')).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
