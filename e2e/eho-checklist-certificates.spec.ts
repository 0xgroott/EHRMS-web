import { expect, test } from "@playwright/test"

test("EHO checks certificate records from an inspection checklist", async ({
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

  await page.goto("/eho/inspections/EIN-101/checklist")
  await expect(
    page.getByRole("group", { name: "Assessment for Food storage" })
  ).toBeVisible()
  await page.getByRole("radio", { name: "Satisfactory" }).first().check()
  await page.getByRole("button", { name: "Back", exact: true }).click()
  const certificates = page.getByRole("region", { name: "Certificates" })
  await expect(
    certificates.getByText("Health Approval Certificate")
  ).toBeVisible()
  await expect(certificates.getByText("Fumigation Certificate")).toBeVisible()
  const popupPromise = page.waitForEvent("popup")
  await certificates
    .getByRole("link", {
      name: "View Health Approval Certificate in a new tab",
    })
    .click()
  const certificatePage = await popupPromise
  certificatePage.on("pageerror", (error) => browserErrors.push(error.message))
  certificatePage.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  await expect(certificatePage).toHaveURL(
    /\/eho\/premises\/PR-002\?inspection=EIN-101&certificate=HC-1002$/
  )
  await expect(
    certificatePage.getByRole("heading", {
      name: "Health Approval certificate",
    })
  ).toBeVisible()
  await certificatePage
    .getByRole("link", { name: "Back to premises certificates" })
    .click()
  await certificatePage
    .getByRole("button", { name: "Return to inspection" })
    .click()
  await certificatePage.close()
  await page.getByRole("button", { name: "Continue inspection" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-101\/checklist$/)
  await expect(
    page.getByRole("radio", { name: "Satisfactory" }).first()
  ).toBeChecked()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(
    page.getByRole("group", { name: "Assessment for Food storage" })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
