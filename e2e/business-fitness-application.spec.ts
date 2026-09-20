import { expect, test } from "@playwright/test"

test("fitness application uses a dedicated guided screen and confirms submission", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 819 })
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/business/sign-in")
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.evaluate(() => {
    localStorage.setItem(
      "ehrcms:fitness:v1:BUS-001",
      JSON.stringify({
        application: null,
        handlers: [
          {
            id: "handler-ada",
            fullName: "Ada Okafor",
            sex: "Female",
            dateOfBirth: "1991-04-12",
            role: "Cook",
            identityNumber: "TEST-1",
            phone: "08000000000",
            premisesName: "Riverside Kitchen",
            consent: true,
          },
          {
            id: "handler-bisi",
            fullName: "Bisi Bello",
            sex: "Female",
            dateOfBirth: "1995-05-10",
            role: "Assistant",
            identityNumber: "TEST-2",
            phone: "08001111111",
            premisesName: "Riverside Kitchen",
            consent: false,
          },
        ],
      })
    )
  })
  await page.goto("/business/fitness/apply")
  await expect(
    page.getByRole("heading", { name: "Select food handlers" })
  ).toBeVisible()
  await expect(
    page.getByRole("complementary", { name: "Application progress" })
  ).toBeVisible()
  await expect(
    page
      .getByRole("list", { name: "Application steps" })
      .getByRole("listitem")
      .first()
  ).toContainText("Select food handlers")
  await expect(
    page
      .getByRole("list", { name: "Application steps" })
      .getByRole("listitem")
      .nth(1)
  ).toContainText("Choose approved facility")
  await expect(
    page.getByRole("navigation", { name: "Business navigation" })
  ).toHaveCount(0)
  const form = page.locator(".fitness-flow > div").first()
  const progress = page.getByRole("complementary", {
    name: "Application progress",
  })
  const formBox = await form.boundingBox()
  const progressBox = await progress.boundingBox()
  expect(formBox && progressBox && formBox.x < progressBox.x).toBe(true)
  const table = page.getByRole("table", { name: /Food handlers at/ })
  await expect(table.getByRole("row")).toHaveCount(3)
  await expect(page.getByRole("status")).toHaveText("0 of 2 selected")
  await expect(table.getByRole("row", { name: /Bisi Bello/ })).toContainText(
    "Needs update"
  )
  await expect(page.getByText("Step 1 of 4")).toHaveCount(0)
  const guidanceBox = await progress
    .getByText("What happens next?")
    .locator("..")
    .boundingBox()
  expect(
    guidanceBox &&
      progressBox &&
      progressBox.y + progressBox.height - guidanceBox.y - guidanceBox.height <
        45
  ).toBe(true)

  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled()
  await page.getByRole("checkbox", { name: /Ada Okafor/ }).check()
  await expect(page.getByRole("status")).toHaveText("1 of 2 selected")
  await page.getByRole("button", { name: "Next" }).click()
  await expect(
    page.getByRole("heading", { name: "Choose an approved facility" })
  ).toBeVisible()
  await form.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  expect(await form.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  await expect(form).toHaveCSS("scrollbar-width", "none")
  expect((await progress.boundingBox())?.y).toBe(progressBox?.y)
  await expect(progress).toHaveCSS("height", "819px")
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await expect(
    page.getByText("Approved facilities", { exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByText(
      "Select from the list of approved facilities to perform the fitness assessment."
    )
  ).toBeVisible()
  await expect(page.getByText("Food-handler fitness assessment")).toHaveCount(0)
  const facilityPrice = page.getByText("₦12,500", { exact: true })
  await expect(facilityPrice).toHaveCSS("color", "rgb(211, 94, 36)")
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"])
  const phoneCopy = page.getByRole("button", {
    name: "Copy Port Harcourt City Health Centre phone number",
  })
  await phoneCopy.click()
  await expect(
    page.getByRole("button", {
      name: "Copied Port Harcourt City Health Centre phone number",
    })
  ).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "0803 555 0140"
  )
  await expect(phoneCopy).toBeVisible({ timeout: 4_000 })
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled()
  const facilityRadio = page.getByRole("radio", {
    name: /Port Harcourt City Health Centre/,
  })
  await expect(facilityRadio).not.toBeChecked()
  await expect(page.getByText("Total for 1 person")).toHaveCount(0)
  await page
    .locator('[data-slot="field"]')
    .filter({ has: facilityRadio })
    .click({ position: { x: 8, y: 8 } })
  await expect(facilityRadio).toBeChecked()
  await page.getByRole("button", { name: "Next" }).click()
  const summary = page.getByRole("region", { name: "Application summary" })
  await expect(summary.locator("dt")).toHaveText([
    "Premises",
    "Facility",
    "Service",
    "Food handlers · 1",
  ])
  await expect(summary.locator("ol > li")).toHaveText(["Ada Okafor · Cook"])
  await expect(summary.getByText("Total", { exact: true })).toBeVisible()
  await expect(summary.getByText("₦12,500")).toHaveCSS(
    "color",
    "rgb(211, 94, 36)"
  )
  await expect(
    page.getByRole("button", { name: "Change food handlers" })
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Next" }).click()
  await expect(
    page.getByRole("heading", { name: "Payment options" })
  ).toBeVisible()
  await expect(page.getByText("Civic Health Bank")).toBeVisible()
  await expect(page.getByTestId("bank-transfer-details")).toHaveCSS(
    "background-color",
    "rgb(238, 247, 252)"
  )
  await page.getByRole("button", { name: "Copy bank name" }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "Civic Health Bank"
  )
  await page.getByRole("button", { name: "Copy account number" }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "0000000000"
  )
  await page.getByRole("radio", { name: "Paystack" }).check()
  await expect(
    page.getByText("Paystack supports card and bank payments.")
  ).toBeVisible()
  await expect(page.getByText("Civic Health Bank")).toHaveCount(0)
  await page.getByRole("radio", { name: "Card payment" }).check()
  await expect(page.getByText("Pay with a debit or credit card.")).toBeVisible()
  await page.getByRole("button", { name: "I have made payment" }).click()
  await expect(
    page.getByRole("button", { name: "Checking payment…" })
  ).toBeDisabled()
  await expect(
    page.getByRole("dialog", { name: "Application submitted" })
  ).toHaveCount(0)
  const success = page.getByRole("dialog", { name: "Application submitted" })
  await expect(success).toBeVisible({ timeout: 8_000 })
  await expect(
    success.getByText(
      "Payment confirmed. Application submitted. Track it on the Applications page."
    )
  ).toBeVisible()
  await expect(
    success.getByText(/contact your selected facility/i)
  ).toHaveCount(0)
  const confetti = success.locator(".fitness-confetti")
  await expect(confetti).toHaveAttribute("aria-hidden", "true")
  await expect(confetti.locator(".fitness-confetti-piece")).toHaveCount(12)
  await expect(confetti.locator(".fitness-confetti-piece").first()).toHaveCSS(
    "animation-name",
    "fitness-confetti-burst"
  )
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(confetti).toBeHidden()
  await expect(
    success.getByRole("link", { name: "View application" })
  ).toBeVisible()
  await success.getByRole("link", { name: "View application" }).click()
  await expect(page).toHaveURL(/\/business\/fitness\/tracker$/)
  expect(browserErrors).toEqual([])
})

test("fitness application fits a 390px screen", async ({ page }) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/business/sign-in")
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.evaluate(() => {
    localStorage.setItem(
      "ehrcms:fitness:v1:BUS-001",
      JSON.stringify({
        application: null,
        handlers: [
          {
            id: "handler-ada",
            fullName: "Ada Okafor",
            sex: "Female",
            dateOfBirth: "1991-04-12",
            role: "Cook",
            identityNumber: "TEST-1",
            phone: "08000000000",
            premisesName: "Riverside Kitchen",
            consent: true,
          },
        ],
      })
    )
  })
  await page.goto("/business/fitness/apply")
  await expect(
    page.getByRole("heading", { name: "Select food handlers" })
  ).toBeVisible()
  await expect(
    page.getByRole("complementary", { name: "Application progress" })
  ).toBeVisible()
  await expect(
    page.getByRole("table", { name: /Food handlers at/ })
  ).toBeVisible()
  await page.getByRole("checkbox", { name: /Ada Okafor/ }).check()
  await page.getByRole("button", { name: "Next" }).click()
  await expect(
    page.getByRole("heading", { name: "Choose an approved facility" })
  ).toBeVisible()
  await page
    .getByRole("radio", { name: /Port Harcourt City Health Centre/ })
    .check()
  await page.getByRole("button", { name: "Next" }).click()
  await page.getByRole("button", { name: "Next" }).click()
  await expect(
    page.getByRole("heading", { name: "Payment options" })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  expect(browserErrors).toEqual([])
})
