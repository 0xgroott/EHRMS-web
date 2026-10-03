import { expect, test } from "@playwright/test"

test("EHO reviews a fumigation report and keeps the decision after reload", async ({
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

  await page.goto("/eho/fumigation")
  await expect(page).toHaveURL(/\/eho\/fumigation$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Fumigation supervision" })
  ).toBeVisible()
  await page.getByRole("textbox", { name: "Search jobs" }).fill("Riverside")
  await expect(page.getByRole("button", { name: "Open job" })).toHaveCount(1)
  await page.getByRole("button", { name: "Open job" }).click()
  await expect(page).toHaveURL(/\/eho\/fumigation\/FUM-201$/)
  await expect(page.getByText("Targeted gel bait")).toBeVisible()
  await page.getByRole("button", { name: "Confirm report" }).click()
  await expect(page.getByRole("alert")).toContainText("Confirm attendance")
  await page
    .getByRole("checkbox", { name: "I attended and supervised this work" })
    .check()
  await page
    .getByRole("textbox", { name: "Officer note" })
    .fill("Treatment log checked on site")
  await page.reload()
  await expect(page.getByRole("textbox", { name: "Officer note" })).toHaveValue(
    "Treatment log checked on site"
  )
  await page.getByRole("button", { name: "Confirm report" }).click()
  await expect(page.getByRole("status")).toContainText("Report confirmed")
  await page.reload()
  await expect(page.getByRole("status")).toContainText("Report confirmed")
  await expect(
    page.getByRole("button", { name: "Confirm report" })
  ).toHaveCount(0)

  await page.setViewportSize({ width: 390, height: 844 })
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)
  await page.goto("/eho/fumigation/FUM-202")
  await expect(
    page.getByText("Provider report not submitted yet.")
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Confirm report" })
  ).toHaveCount(0)
  expect(browserErrors).toEqual([])
})

test("EHO can dispute a report without claiming attendance", async ({
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
  await page.goto("/eho/fumigation/FUM-201")
  await page.getByRole("button", { name: "Dispute report" }).click()
  await expect(page.getByRole("alert")).toContainText("Describe what differs")
  await page
    .getByRole("textbox", { name: "Officer note" })
    .fill("I did not attend; the listed areas need verification.")
  await page.getByRole("button", { name: "Dispute report" }).click()
  await expect(page.getByRole("status")).toContainText("Report disputed")
  expect(browserErrors).toEqual([])
})
