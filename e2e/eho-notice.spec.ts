import { expect, test } from "@playwright/test"

test("EHO can review a notice before starting an assigned inspection", async ({
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

  await page.goto("/eho/inspections/EIN-102")
  await expect(
    page.getByRole("complementary", { name: "Inspection progress" })
  ).toHaveCount(0)
  const inspectionSummary = page.getByRole("region", {
    name: "Inspection summary",
  })
  await expect(
    inspectionSummary.getByRole("heading", { name: "Garden City Cold Stores" })
  ).toBeVisible()
  await expect(
    inspectionSummary.getByRole("button", {
      name: "View premises compliance",
    })
  ).toBeVisible()
  await page.getByRole("button", { name: "View notice" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-102\/notice$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Inspection notice" })
  ).toBeVisible()
  await expect(page.getByText("Awaiting service")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Start inspection" })
  ).toBeDisabled()

  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.getByRole("link", { name: "Inspection overview" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-102$/)
  await page.getByRole("button", { name: "Send notice" }).click()
  const noticeDialog = page.getByRole("dialog", {
    name: "Send inspection notice",
  })
  await expect(noticeDialog).toBeVisible()
  const noticeMessage = noticeDialog.getByRole("textbox", {
    name: "Notice message",
  })
  await expect(noticeMessage).toHaveValue(/Garden City Cold Stores/)
  await noticeMessage.fill(
    "Please acknowledge this notice so that the inspection can be scheduled."
  )
  await noticeDialog.getByRole("button", { name: "Send notice" }).click()
  await expect(page.getByText("Notice has been sent.")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Awaiting business acknowledgement" })
  ).toBeDisabled()
  await expect(
    page.getByText(
      "The business must acknowledge the notice in its portal before an appointment can be scheduled."
    )
  ).toBeVisible()
  await page.getByRole("button", { name: "Acknowledge", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Schedule appointment" })
  ).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Back", exact: true })
  ).toBeVisible()
  const certificates = page.getByRole("region", { name: "Certificates" })
  await expect(
    certificates.getByRole("link", {
      name: "View Health Approval Certificate in a new tab",
    })
  ).toHaveAttribute("target", "_blank")
  await expect(
    certificates
      .getByText("Fumigation Certificate")
      .locator("xpath=ancestor::article")
  ).toHaveAttribute("aria-disabled", "true")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.getByRole("button", { name: "View notice" }).click()
  await expect(page.getByText(/^Acknowledged /)).toBeVisible()
  await page.goto("/eho/inspections/EIN-101")
  await page.getByRole("button", { name: "View notice" }).click()
  await expect(page.getByText("Served 2026-09-17")).toBeVisible()
  await expect(page.getByText("Acknowledged 2026-09-18")).toBeVisible()
  await page.getByRole("button", { name: "Start inspection" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-101\/checklist$/)
  const journeyGuide = page.getByRole("complementary", {
    name: "Inspection progress",
  })
  await expect(journeyGuide).toBeVisible()
  await expect(
    page.getByRole("navigation", { name: "EHO navigation" })
  ).toHaveCount(0)
  await expect(page.getByText("Environmental Health Officer")).toHaveCount(0)
  await expect(
    page.getByRole("link", { name: "Back to inspection overview" })
  ).toBeVisible()
  await expect(
    journeyGuide.getByText(/Current step: Food storage/)
  ).toBeVisible()
  const foodStorage = page
    .getByRole("heading", { name: "Food storage" })
    .locator("xpath=ancestor::div[@data-slot='card']")
  await foodStorage.getByRole("radio", { name: "Contravention" }).check()
  await foodStorage
    .getByRole("button", { name: "Report contravention" })
    .click()
  const contraventionDialog = page.getByRole("dialog", {
    name: "Report contravention",
  })
  await expect(contraventionDialog).toBeVisible()
  await contraventionDialog
    .getByRole("textbox", { name: "Description of issue" })
    .fill("Food was stored above the safe temperature.")
  await contraventionDialog
    .getByRole("textbox", { name: "Required corrective action" })
    .fill("Restore cold storage and verify the temperature log.")
  await contraventionDialog.getByLabel("Deadline").fill("2026-10-03")
  await contraventionDialog.getByLabel("Evidence files").setInputFiles([
    {
      name: "cold-room.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("photo evidence"),
    },
    {
      name: "temperature-check.mp4",
      mimeType: "video/mp4",
      buffer: Buffer.from("video evidence"),
    },
  ])
  await expect(contraventionDialog.getByText("cold-room.jpg")).toBeVisible()
  await expect(
    contraventionDialog.getByText("temperature-check.mp4")
  ).toBeVisible()
  await contraventionDialog
    .getByRole("button", { name: "Save contravention" })
    .click()
  await expect(contraventionDialog).toBeHidden()
  await expect(foodStorage.getByText("1 issue recorded.")).toBeVisible()
  await page.getByRole("link", { name: "Next" }).click()
  await expect(page).toHaveURL(
    /\/eho\/inspections\/EIN-101\/checklist\/waste-control$/
  )
  await expect(
    page.getByRole("heading", { name: "Waste control" })
  ).toBeVisible()
  await expect(page.getByRole("heading", { name: "Food storage" })).toHaveCount(
    0
  )
  await page.getByRole("link", { name: "Back" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-101\/checklist$/)
  await foodStorage.getByRole("link", { name: "Review and edit" }).click()
  await expect(page).toHaveURL(
    /\/eho\/inspections\/EIN-101\/issues\/food-storage$/
  )
  await expect(
    page.getByRole("heading", { name: "Contravention · Food storage" })
  ).toBeVisible()
  await expect(
    page.getByText("Food was stored above the safe temperature.")
  ).toBeVisible()
  await page.goto("/eho/inspections/EIN-101/checklist")
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-101\/checklist$/)
  await page.goto("/eho/inspections/EIN-101")
  await page.getByRole("button", { name: "Reset flow" }).click()
  await page.getByRole("button", { name: "Reset inspection" }).click()
  await expect(page.getByRole("button", { name: "Send notice" })).toBeVisible()
  await expect(
    page.getByText("Inspection flow reset. Send a new notice to begin again.")
  ).toBeVisible()
  expect(browserErrors).toEqual([])
})
