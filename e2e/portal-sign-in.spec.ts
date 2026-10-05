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
    page.getByRole("heading", { level: 1, name: "Home" })
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
  await expect(page).toHaveURL(/\/business\/dashboard$/)
  await expect(
    page.getByRole("region", { name: "Business verification required" })
  ).toBeVisible()

  for (const pageDetails of [
    {
      navigation: "Staff",
      path: /\/business\/food-handlers$/,
      heading: "Staff",
    },
    {
      navigation: "Applications",
      path: /\/business\/applications$/,
      heading: "Applications",
    },
    {
      navigation: "Certificates",
      path: /\/business\/certificates$/,
      heading: "Certificates",
    },
  ]) {
    await page
      .getByRole("link", { name: pageDetails.navigation, exact: true })
      .click()
    await expect(page).toHaveURL(pageDetails.path)
    const pageHeader = page.locator('[data-slot="page-header"]')
    await expect(
      pageHeader.getByRole("heading", {
        level: 1,
        name: pageDetails.heading,
      })
    ).toBeVisible()
    await expect(
      page.getByRole("region", { name: "Business verification required" })
    ).toHaveCount(0)
  }

  await page.getByRole("link", { name: "Settings" }).click()
  await expect(page).toHaveURL(/\/business\/settings$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Settings" })
  ).toBeVisible()
  await expect(
    page.getByRole("region", { name: "Business verification required" })
  ).toBeVisible()
  for (const tab of [
    "Business profile",
    "Account",
    "Security",
    "Notifications",
    "Advanced",
  ]) {
    await expect(page.getByRole("tab", { name: tab })).toBeVisible()
  }
  await page.getByRole("tab", { name: "Account" }).click()
  await expect(page.getByLabel("Owner name")).toHaveValue("Amaka Nwosu")
  await expect(page.getByLabel("Workspace role")).toHaveValue("Business owner")
  await page.getByRole("tab", { name: "Security" }).click()
  await page
    .getByRole("button", { name: "Set up two-factor authentication" })
    .click()
  const twoFactorDialog = page.getByRole("dialog", {
    name: "Set up two-factor authentication",
  })
  await twoFactorDialog.getByLabel("Verification code").fill("123456")
  await twoFactorDialog.getByRole("button", { name: "Enable 2FA" }).click()
  await expect(
    page.getByText("Two-factor authentication is enabled")
  ).toBeVisible()
  await page.getByRole("tab", { name: "Business profile" }).click()
  await expect(
    page.getByRole("button", { name: "Upload business avatar or logo" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Premises and kitchen photos" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", {
      name: "Complete business verification (KYB)",
    })
  ).toHaveCount(0)
  await page.getByRole("link", { name: "Complete KYB" }).click()
  await expect(page).toHaveURL(/\/business\/settings#kyb$/)
  const kybDialog = page.getByRole("dialog", {
    name: "Complete business verification (KYB)",
  })
  await expect(kybDialog).toBeVisible()
  await expect(
    page.getByRole("heading", {
      name: "Complete business verification (KYB)",
    })
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
  await expect(
    kybDialog.getByRole("group", { name: "Business details" })
  ).toBeVisible()
  await expect(
    kybDialog.getByRole("group", { name: "Premises location" })
  ).toHaveCount(0)
  await kybDialog.getByRole("button", { name: "Continue" }).click()

  const premisesLocation = page.getByRole("group", {
    name: "Premises location",
  })
  await expect(premisesLocation).toBeVisible()
  await expect(
    kybDialog.getByRole("group", { name: "Business details" })
  ).toHaveCount(0)
  await page.getByLabel("Premises address").fill("12 Harbour Road")
  await page.getByLabel("Ward").fill("Old Township")
  await page.getByRole("combobox", { name: "Council" }).click()
  await page.getByRole("option", { name: "Port Harcourt City" }).click()
  await kybDialog.getByRole("button", { name: "Continue" }).click()

  const documentsAndReview = page.getByRole("group", {
    name: "Documents and review",
  })
  await expect(documentsAndReview).toBeVisible()
  await expect(premisesLocation).toHaveCount(0)
  await expect(
    kybDialog.getByRole("button", { name: "Complete KYB" })
  ).toBeVisible()

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(kybDialog).toBeVisible()
  await expect(documentsAndReview).toBeVisible()
  expect(await kybDialog.boundingBox()).toEqual({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
  })
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
  ).toHaveAttribute("aria-label", "Step 1 of 3: Business details")
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
      page.getByRole("heading", { name: "Sign-in details" })
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
  ).toHaveAttribute("aria-label", "Step 2 of 3: Sign-in details")
  await expect(page.getByLabel("Phone number")).toHaveCount(0)
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
  await expect(
    page.getByRole("heading", { name: "Welcome back, Ebi." })
  ).toBeVisible()
  expect(browserErrors).toEqual([])
})

test("EHO dashboard separates jobs, follow-ups and completed work into searchable tables", async ({
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

  const myJobs = page.getByRole("tab", { name: "My Jobs" })
  const followUps = page.getByRole("tab", { name: "Follow-up" })
  const completed = page.getByRole("tab", { name: "Completed" })
  const myJobsPanel = page.getByRole("tabpanel", { name: "My Jobs" })
  const search = myJobsPanel.getByRole("searchbox", { name: "Search My Jobs" })
  await page.setViewportSize({ width: 1440, height: 819 })
  await expect(search).toBeVisible()
  const searchBounds = await search.boundingBox()
  const tabsBounds = await page.getByRole("tablist").boundingBox()
  const panelBounds = await myJobsPanel.boundingBox()
  expect(searchBounds!.width).toBe(448)
  expect(Math.abs(searchBounds!.y - tabsBounds!.y)).toBeLessThan(2)
  expect(
    Math.abs(
      searchBounds!.x +
        searchBounds!.width -
        panelBounds!.x -
        panelBounds!.width
    )
  ).toBeLessThan(2)
  const tabList = page.getByRole("tablist")
  const tabScroller = tabList.locator("..")
  await expect(tabScroller).toHaveCSS("overflow-x", "auto")
  await expect(tabScroller).toHaveCSS("overflow-y", "hidden")
  await expect(tabList).toHaveCSS("overflow-y", "visible")
  await expect(tabList.locator("svg")).toHaveCount(0)
  await expect(myJobs).toHaveAttribute("aria-selected", "true")
  expect(
    await myJobs.evaluate(
      (element) => getComputedStyle(element, "::after").opacity
    )
  ).toBe("1")
  await expect(page.locator('[data-slot="page-header"]')).toHaveCSS(
    "border-bottom-width",
    "0px"
  )
  await expect(
    page.getByRole("cell", { name: "Riverside Kitchen & Foods" })
  ).toHaveCount(0)
  await expect(myJobsPanel.getByText("No assigned jobs")).toBeVisible()
  await page.getByRole("button", { name: "Browse open jobs" }).click()
  const riversideJob = page.getByRole("row", {
    name: /Riverside Kitchen & Foods/,
  })
  await riversideJob.getByRole("link", { name: "Assign to me" }).click()
  await page.goto("/eho/my-work")
  await expect(
    myJobsPanel
      .getByRole("row", { name: /Riverside Kitchen & Foods/ })
      .getByRole("img", { name: "Riverside Kitchen & Foods avatar" })
  ).toBeVisible()
  await expect(myJobsPanel.getByText("EIN-103")).toHaveCount(0)
  await expect(myJobsPanel.getByText("Premises inspection")).toBeVisible()

  await myJobsPanel
    .getByRole("searchbox", { name: "Search My Jobs" })
    .fill("no match")
  await expect(myJobsPanel.getByText("No jobs match your search")).toBeVisible()
  await myJobsPanel.getByRole("searchbox", { name: "Search My Jobs" }).fill("")

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(search).toBeVisible()
  const mobileSearchBounds = await search.boundingBox()
  const mobileTabsBounds = await tabList.boundingBox()
  expect(mobileSearchBounds!.y).toBeGreaterThan(
    mobileTabsBounds!.y + mobileTabsBounds!.height
  )
  expect(mobileSearchBounds!.x + mobileSearchBounds!.width).toBeLessThanOrEqual(
    390
  )
  await expect(followUps).toBeVisible()
  await expect(completed).toBeVisible()
  await followUps.click()
  await expect(followUps).toHaveAttribute("aria-selected", "true")
  await expect(
    page.getByRole("cell", { name: "Creek View Bakery" })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true)

  await page.getByRole("link", { name: "Open follow-up" }).click()
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-104\/follow-up$/)
  await expect(
    page.getByRole("heading", { name: "Follow-up verification" })
  ).toBeVisible()
  expect(browserErrors).toEqual([])
})

test("EHO claims an open job and it becomes an assigned draft", async ({
  page,
}) => {
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

  await page.getByRole("button", { name: "Browse open jobs" }).click()
  await expect(
    page.getByRole("heading", { name: "Open inspections" })
  ).toBeVisible()
  await page
    .getByRole("row", { name: /Trans-Amadi Food Court/ })
    .getByRole("link", { name: "Assign to me" })
    .click()

  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-101$/)
  await page.goto("/eho/my-work")
  const claimedJob = page.getByRole("row", { name: /Trans-Amadi Food Court/ })
  await expect(claimedJob).toBeVisible()
  await expect(claimedJob.getByText("Assigned", { exact: true })).toBeVisible()
})
