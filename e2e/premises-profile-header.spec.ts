import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

function collectBrowserErrors(page: Page) {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  return errors
}

test("MOH sees the read-only premises workspace", async ({ page }) => {
  const browserErrors = collectBrowserErrors(page)
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:3100",
  })

  await page.goto("/moh/sign-in")
  await page.getByRole("button", { name: "Use assigned account" }).click()
  await expect(page).toHaveURL(/\/moh\/health-approvals$/)

  await page.goto("/moh/businesses/PR-015?source=search")
  const profile = page.getByRole("complementary", {
    name: "Business overview",
  })
  await expect(profile).toBeVisible()
  await expect(
    profile.getByRole("heading", { name: "Borokiri Community Clinic" })
  ).toBeVisible()
  await expect(profile.getByLabel("KYB verified")).toBeVisible()
  await expect(
    profile.getByRole("link", { name: "contact@borokiriclinic.ng" })
  ).toHaveAttribute("href", "mailto:contact@borokiriclinic.ng")
  await expect(
    profile.getByRole("link", { name: "0803 555 0115" })
  ).toHaveAttribute("href", "tel:08035550115")

  await profile.getByRole("button", { name: "Copy email address" }).click()
  await expect(
    profile.getByRole("button", { name: "Copied email address" })
  ).toBeVisible()

  const workspace = page.locator('[data-slot="premises-workspace"]')
  const panel = page.locator('[data-slot="premises-tab-panel"]')
  await expect(workspace).toHaveCSS("column-gap", "40px")
  await expect(panel).toHaveCSS("min-height", "504px")
  expect(await page.getByRole("tab").allTextContents()).toEqual([
    "Business info",
    "Inspection history · 1",
    "Certificates · 2",
    "Documents · 4",
  ])
  await expect(
    page.getByRole("region", { name: "Business information" })
  ).toBeVisible()
  await expect(page.getByRole("tablist")).toHaveAttribute(
    "data-variant",
    "default"
  )
  await page.getByRole("tab", { name: "Inspection history · 1" }).click()
  await expect(page.getByText("Open findings")).toBeVisible()
  expect((await panel.boundingBox())?.height).toBe(504)
  await page.getByRole("tab", { name: "Certificates · 2" }).click()
  await expect(
    page.getByRole("region", { name: "Health Approval" })
  ).toBeVisible()
  await expect(
    page.getByRole("region", { name: "Fumigation Certificate" })
  ).toBeVisible()
  const healthApproval = page.getByRole("link", {
    name: "Open Health Approval HC-1015",
  })
  await expect(healthApproval).toHaveAttribute("target", "_blank")
  await expect(
    healthApproval.getByRole("region", { name: "Health Approval" })
  ).toHaveAttribute("data-certificate-kind", "health-approval")
  await expect(
    page.getByRole("link", {
      name: "Open Fumigation Certificate FC-1015",
    })
  ).toHaveAttribute("target", "_blank")
  await page.getByRole("tab", { name: "Documents · 4" }).click()
  await expect(
    page.getByRole("heading", { name: "Premises and kitchen photos" })
  ).toBeVisible()
  await expect(
    workspace.getByRole("button", { name: /edit|upload|remove/i })
  ).toHaveCount(0)
  expect(browserErrors).toEqual([])
})

test("EHO sees the read-only premises workspace on mobile", async ({
  page,
}) => {
  const browserErrors = collectBrowserErrors(page)

  await page.goto("/eho/sign-in")
  await expect(async () => {
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page).toHaveURL(/\/eho\/my-work$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/eho/premises/PR-015?source=search")
  const panel = page.locator('[data-slot="premises-tab-panel"]')
  await expect(panel).toHaveCSS("min-height", "320px")
  const profile = page.getByRole("complementary", {
    name: "Business overview",
  })
  await expect(profile).toBeVisible()
  await expect(profile.getByLabel("KYB verified")).toBeVisible()
  await expect(
    page.getByText(/certificate and document details may be stale/i)
  ).toHaveCount(0)
  expect(await page.getByRole("tab").allTextContents()).toEqual([
    "Business info",
    "Inspection history · 1",
    "Certificates · 2",
    "Documents · 4",
  ])
  await expect(
    page.getByRole("region", { name: "Business information" })
  ).toBeVisible()
  await page.getByRole("tab", { name: "Inspection history · 1" }).click()
  await expect(page.getByText("Council findings")).toBeVisible()
  expect(
    await page.getByRole("tablist").evaluate((tablist) => {
      const scroller = tablist.parentElement
      return scroller ? scroller.scrollHeight <= scroller.clientHeight : false
    })
  ).toBe(true)
  await page.getByRole("tab", { name: "Certificates · 2" }).click()
  await expect(
    page.getByRole("region", { name: "Health Approval" })
  ).toBeVisible()
  await expect(
    page.getByRole("region", { name: "Fumigation Certificate" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", {
      name: "Open Health Approval HC-1015",
    })
  ).toHaveAttribute("target", "_blank")
  await expect(
    page.getByRole("button", { name: "Record paper certificate seen" })
  ).toBeVisible()
  await page.getByRole("tab", { name: "Documents · 4" }).click()
  await expect(
    page.getByRole("heading", { name: "Premises and kitchen photos" })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
