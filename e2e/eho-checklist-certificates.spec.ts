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
  const certificates = page.getByRole("region", {
    name: "Certificate checks",
  })
  await expect(certificates.getByText("Health Approval")).toBeVisible()
  await expect(certificates.getByText("At Risk")).toBeVisible()
  await expect(certificates.getByText("Fumigation")).toBeVisible()
  await page.getByRole("radio", { name: "Satisfactory" }).first().check()
  await certificates
    .getByRole("link", { name: "View Health Approval certificate" })
    .click()
  await expect(page).toHaveURL(
    /\/eho\/premises\/PR-002\?inspection=EIN-101&certificate=HC-1002$/
  )
  await expect(
    page.getByRole("heading", { name: "Health Approval certificate" })
  ).toBeVisible()
  await page
    .getByRole("link", { name: "Back to premises certificates" })
    .click()
  await page.getByRole("button", { name: "Return to inspection" }).click()
  await page.getByRole("button", { name: "Continue inspection" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-101\/checklist$/)
  await expect(
    page.getByRole("radio", { name: "Satisfactory" }).first()
  ).toBeChecked()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(certificates.getByText("Health Approval")).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
