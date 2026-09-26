import { expect, test } from "@playwright/test"

test("business user can open the dashboard from the sign-in page", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/business/sign-in")
  await expect(
    page.getByRole("button", { name: "Sign in as Riverside Kitchen" })
  ).toBeVisible()
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, {
      timeout: 1_000,
    })
  }).toPass({ timeout: 15_000 })
  await expect(
    page.getByRole("heading", { level: 1, name: "Business dashboard" })
  ).toBeVisible()
  expect(browserErrors).toEqual([])
})

test("reusable business credentials start fresh verified onboarding every time", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/business/register")
  await expect(
    page.getByRole("heading", { name: "Start a fresh registration" })
  ).toBeVisible()
  await expect(page.getByText("start@business.ehrcms.test")).toBeVisible()
  await expect(page.getByText("start-business")).toBeVisible()
  await page.getByRole("button", { name: "Go to sign in" }).click()

  await page
    .getByRole("textbox", { name: "Email or phone number" })
    .fill("start@business.ehrcms.test")
  await page.getByLabel("Password").fill("start-business")
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/business\/register$/)
  await expect(
    page.getByRole("heading", { name: "Tell us who is registering" })
  ).toBeVisible()
  await expect(page.getByText("Verify contact")).toHaveCount(0)

  await page.getByLabel("Business name").fill("Harbour Foods")
  await page.getByLabel("Your full name").fill("Amaka Nwosu")
  await page.getByRole("button", { name: "Continue" }).click()
  await expect(page).toHaveURL(/\/business\/setup$/)
  await expect(
    page.getByRole("heading", { name: "Tell us about your business" })
  ).toBeVisible()
  await expect(page.getByLabel("Premises name")).toHaveValue("Harbour Foods")
  const businessType = page.getByRole("combobox", { name: "Business type" })
  await expect(businessType).toContainText("Choose a business type")
  await businessType.click()
  await expect(page.getByRole("option", { name: "Restaurant" })).toBeVisible()
  await expect(page.getByRole("option", { name: "Bakery" })).toBeVisible()
  await expect(page.getByRole("option", { name: "Pharmacy" })).toBeVisible()
  await page.getByRole("option", { name: "Bakery" }).click()
  await expect(businessType).toContainText("Bakery")
  const premisesLocation = page.getByRole("group", {
    name: "Premises location",
  })
  const contactAndDocuments = page.getByRole("group", {
    name: "Contact and documents",
  })
  await expect(
    page.getByRole("group", { name: "Business details" })
  ).toBeVisible()
  await expect(premisesLocation).toBeVisible()
  await expect(contactAndDocuments).toBeVisible()
  await expect(
    page.getByRole("group", { name: "Registration details" })
  ).toHaveCount(0)
  expect(
    await premisesLocation.evaluate((element) => ({
      borderTopWidth: getComputedStyle(element).borderTopWidth,
      paddingTop: getComputedStyle(element).paddingTop,
    }))
  ).toEqual({ borderTopWidth: "1px", paddingTop: "40px" })

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(contactAndDocuments).toBeVisible()
  await expect(
    page
      .getByRole("navigation", { name: "Account setup progress" })
      .locator('[aria-current="step"]')
  ).toContainText("Step 02")
  await expect(
    page
      .getByRole("navigation", { name: "Account setup progress" })
      .locator('[aria-current="step"]')
  ).toHaveAttribute("aria-label", "Step 2 of 2: Business and premises")
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)

  await page.goto("/business/sign-in")
  await expect(
    page.getByRole("region", { name: "Notifications" })
  ).toBeAttached({ timeout: 15_000 })
  await page
    .getByRole("textbox", { name: "Email or phone number" })
    .fill("start@business.ehrcms.test")
  await page.getByLabel("Password").fill("start-business")
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/business\/register$/)
  await expect(page.getByLabel("Business name")).toHaveValue("")
  await expect(page.getByLabel("Your full name")).toHaveValue("")
  expect(browserErrors).toEqual([])
})

test("business registration uses two account pages with a fixed-height desktop brand panel", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.setViewportSize({ width: 1440, height: 600 })
  await page.goto("/business/register")
  await expect(
    page.getByRole("heading", { name: "Business details" })
  ).toBeVisible()
  await expect(
    page
      .getByRole("navigation", { name: "Account setup progress" })
      .locator('[aria-current="step"]')
  ).toContainText("Step 01")
  await expect(
    page
      .getByRole("navigation", { name: "Account setup progress" })
      .locator('[aria-current="step"]')
  ).toHaveAttribute("aria-label", "Step 1 of 4: Business details")
  await expect(page.getByLabel("Phone number")).toHaveCount(0)

  const brandPanel = page.getByRole("region", {
    name: "EHRCMS Business Portal",
  })
  const formPanel = page.getByRole("region", {
    name: "Create your business account",
  })
  expect(
    await brandPanel.evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      overflowY: getComputedStyle(element).overflowY,
      top: element.getBoundingClientRect().top,
    }))
  ).toEqual({ height: 600, overflowY: "hidden", top: 0 })
  await formPanel.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  expect((await brandPanel.boundingBox())?.y).toBe(0)

  await page.getByLabel("Business name").fill("Harbour Foods")
  await page.getByLabel("Contact person's name").fill("Amaka Nwosu")
  await expect(async () => {
    await page.getByRole("button", { name: "Continue" }).click()
    await expect(
      page.getByRole("heading", { name: "Account access" })
    ).toBeVisible({ timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await expect(
    page
      .getByRole("navigation", { name: "Account setup progress" })
      .locator('[aria-current="step"]')
  ).toContainText("Step 02")
  await expect(
    page
      .getByRole("navigation", { name: "Account setup progress" })
      .locator('[aria-current="step"]')
  ).toHaveAttribute("aria-label", "Step 2 of 4: Account access")
  await expect(page.getByLabel("Phone number")).toBeVisible()
  await expect(page.getByLabel("Business name")).toHaveCount(0)

  await page.getByRole("button", { name: "Back" }).click()
  await expect(page.getByLabel("Business name")).toHaveValue("Harbour Foods")
  await expect(page.getByLabel("Contact person's name")).toHaveValue(
    "Amaka Nwosu"
  )
  expect(browserErrors).toEqual([])
})

test("field officer can sign in with the assigned demo account", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/eho/sign-in")
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in as an EHO" })
  ).toBeVisible()
  await expect(async () => {
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(
      page.getByRole("textbox", { name: "Staff ID or email" })
    ).toHaveValue("EHO-001", { timeout: 1_000 })
  }).toPass({ timeout: 15_000 })
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/eho\/my-work$/)
  await expect(page.getByRole("heading", { name: /My Work/ })).toBeVisible()
  expect(browserErrors).toEqual([])
})

test("EHO dashboard separates inspections and follow-ups into tabs", async ({
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

  const inspections = page.getByRole("tab", { name: "Assigned inspections" })
  const followUps = page.getByRole("tab", { name: "Follow-up visits" })
  await expect(inspections).toHaveAttribute("aria-selected", "true")
  await expect(
    page.getByRole("heading", { name: "Garden City Cold Stores" })
  ).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(followUps).toBeVisible()
  await followUps.click()
  await expect(followUps).toHaveAttribute("aria-selected", "true")
  await expect(
    page.getByRole("heading", { name: "Creek View Bakery" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Garden City Cold Stores" })
  ).toBeHidden()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)

  await page.getByRole("button", { name: "Open follow-up" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-104\/follow-up$/)
  await expect(
    page.getByRole("heading", { name: "Follow-up verification" })
  ).toBeVisible()
  expect(browserErrors).toEqual([])
})
