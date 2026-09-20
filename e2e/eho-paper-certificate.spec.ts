import { expect, test } from "@playwright/test"

test("EHO records a paper certificate without changing the digital certificate record", async ({
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
  await expect(
    page.getByRole("heading", { name: "Creek View Bakery" })
  ).toBeVisible()
  const certificates = page.getByRole("tabpanel", { name: "Certificates" })
  const healthApproval = certificates
    .getByText("HC-1004", { exact: false })
    .locator("../..")
  await expect(healthApproval.getByText("Not Found")).toBeVisible()
  await certificates
    .getByRole("button", { name: "Record paper certificate seen" })
    .click()
  await certificates.getByRole("button", { name: "Save observation" }).click()
  await expect(certificates.getByRole("alert")).toContainText(
    "Enter the reference printed"
  )
  await certificates.getByLabel("Certificate reference").fill("FIT-908")
  await certificates.getByLabel("Date seen").fill("2026-09-19")
  await certificates.getByLabel("Expiry date (if shown)").fill("2026-12-31")
  await certificates
    .getByLabel("Observation (optional)")
    .fill("Original shown by site manager")
  await certificates.getByRole("button", { name: "Save observation" }).click()
  await expect(certificates.getByText("Fitness · FIT-908")).toBeVisible()
  await expect(
    certificates.getByText("Original shown by site manager")
  ).toBeVisible()
  await page.reload()
  await expect(certificates.getByText("Fitness · FIT-908")).toBeVisible()
  await expect(healthApproval.getByText("Not Found")).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await certificates
    .getByRole("button", { name: "Record paper certificate seen" })
    .click()
  await expect(certificates.getByLabel("Certificate reference")).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
