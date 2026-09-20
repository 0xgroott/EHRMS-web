import { expect, test } from "@playwright/test"

test("EHO reviews captured findings without changing the council count", async ({
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
  await page
    .getByRole("link", { name: "Review findings" })
    .click({ timeout: 3_000 })
  await expect(page).toHaveURL(
    /\/eho\/premises\/PR-004\?source=search&tab=findings$/
  )
  const findings = page.getByRole("region", { name: "Premises findings" })
  await expect(findings.getByText("1 captured finding")).toBeVisible()
  await expect(
    findings.getByText(
      "Waste bins were left uncovered near the preparation area."
    )
  ).toBeVisible()
  await expect(
    findings.getByText("Provide covered bins and keep a daily disposal record.")
  ).toBeVisible()
  await expect(
    findings.getByText("Council outstanding findings: 0")
  ).toBeVisible()
  await page.reload()
  await expect(findings.getByText("1 captured finding")).toBeVisible()
  await findings
    .getByRole("link", { name: "View EIN-104 findings summary" })
    .click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-104\/findings$/)

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/eho/premises/PR-003?tab=findings")
  await expect(
    findings.getByText("Council outstanding findings: 4")
  ).toBeVisible()
  await expect(
    findings.getByText("No captured findings on this device")
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
