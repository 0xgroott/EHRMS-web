import { expect, test } from "@playwright/test"

test.use({
  launchOptions: { ignoreDefaultArgs: ["--disable-back-forward-cache"] },
})

for (const width of [1440, 390]) {
  test(`LGA links keep the session loaded through repeated visits and history at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90_000)
    const errors: string[] = []
    const documents: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/lga/sign-in")
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true })
    ).toBeVisible()
    page.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.resourceType() === "document"
      )
        documents.push(new URL(request.url()).pathname)
    })
    async function nav(label: string) {
      if (width === 390)
        await page.getByRole("button", { name: "Open LGA navigation" }).click()
      await page
        .getByRole("navigation", { name: "LGA navigation" })
        .getByRole("link", { name: label, exact: true })
        .click()
      await expect(
        page.getByRole("heading", { name: label, exact: true })
      ).toBeVisible()
    }
    await nav("Health approvals")
    const approvalView = page
      .getByRole("table", { name: "Health approvals" })
      .getByRole("link", { name: "View", exact: true })
      .first()
    for (let repeat = 0; repeat < 3; repeat++) {
      await approvalView.click()
      await expect(page).toHaveURL(/\/lga\/health-approvals\/HA-REV-/)
      await expect(
        page.getByRole("link", { name: "View premises", exact: true })
      ).toBeVisible()
      expect(
        documents,
        "Internal links must not restart session hydration"
      ).toEqual([])
      await page.goBack()
      await expect(
        page.getByRole("heading", { name: "Health approvals", exact: true })
      ).toBeVisible()
      await page.goForward()
      await expect(
        page.getByRole("link", { name: "View premises", exact: true })
      ).toBeVisible()
      await page
        .getByRole("link", { name: "View premises", exact: true })
        .click()
      await expect(
        page.locator('[data-slot="premises-workspace"]')
      ).toBeVisible()
      await page.goBack()
      await page
        .getByRole("link", { name: "Back to health approvals", exact: true })
        .click()
      await expect(
        page.getByRole("heading", { name: "Health approvals", exact: true })
      ).toBeVisible()
    }
    await nav("Inspections")
    await page
      .getByRole("table", { name: "Inspections" })
      .getByRole("link", { name: "View", exact: true })
      .first()
      .click()
    await expect(
      page.getByRole("link", { name: "View premises", exact: true })
    ).toBeVisible()
    await page.getByRole("link", { name: "View premises", exact: true }).click()
    await expect(page.locator('[data-slot="premises-workspace"]')).toBeVisible()
    await page.goBack()
    await page
      .getByRole("link", { name: "Back to inspections", exact: true })
      .click()
    await expect(
      page.getByRole("heading", { name: "Inspections", exact: true })
    ).toBeVisible()
    await nav("Finance")
    await page
      .getByRole("table", { name: "Payments" })
      .getByRole("link")
      .first()
      .click()
    await expect(page.locator('[data-slot="premises-workspace"]')).toBeVisible()
    await page.goBack()
    await nav("Reports")
    await page
      .getByRole("button", { name: /^View Revenue report/ })
      .first()
      .click()
    await expect(
      page.getByRole("region", { name: "Report document" })
    ).toBeVisible()
    await page.goBack()
    await nav("Dashboard")
    for (const label of [
      "Collections",
      "Registered premises",
      "Awaiting decision",
      "Inspections due",
    ]) {
      await page
        .getByRole("region", { name: "Council overview" })
        .getByRole("link", { name: new RegExp(label) })
        .click()
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
      await page.goBack()
      await expect(
        page.getByRole("heading", { name: "Dashboard", exact: true })
      ).toBeVisible()
    }
    await page
      .getByRole("tabpanel", { name: "Compliance risks", exact: true })
      .getByRole("link", { name: "View", exact: true })
      .first()
      .click()
    await expect(page.locator('[data-slot="premises-workspace"]')).toBeVisible()
    await page.goBack()
    await page
      .getByRole("tab", { name: "Expiring certificates", exact: true })
      .click()
    const expiryLinks = page
      .getByRole("tabpanel", { name: "Expiring certificates", exact: true })
      .getByRole("link")
    if (await expiryLinks.count()) {
      await expiryLinks.first().click()
      await expect(
        page.locator('[data-slot="premises-workspace"]')
      ).toBeVisible()
      await page.goBack()
    }
    expect(documents).toEqual([])
    expect(
      await page.evaluate(() => localStorage.getItem("ehrcms:lga:session:v1"))
    ).toBe("LGA-001")
    await page.reload()
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true })
    ).toBeVisible()
    expect(errors).toEqual([])
  })
}

test("LGA certificate return link keeps the workspace loaded", async ({
  page,
}) => {
  await page.goto("/lga/sign-in")
  await page.getByRole("button", { name: "Use assigned account" }).click()
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true })
  ).toBeVisible()
  await page.goto("/lga/premises/PR-001")
  await page.getByRole("tab", { name: /Certificates/ }).click()
  const popupPromise = page.waitForEvent("popup")
  await page
    .getByRole("link", { name: /^Open .*certificate/i })
    .first()
    .click()
  const certificate = await popupPromise
  const errors: string[] = []
  certificate.on("pageerror", (error) => errors.push(error.message))
  certificate.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  const back = certificate.getByRole("link", {
    name: "Back to premises certificates",
  })
  await expect(back).toBeVisible()
  const documents: string[] = []
  certificate.on("request", (request) => {
    if (request.isNavigationRequest() && request.resourceType() === "document")
      documents.push(request.url())
  })
  await back.click()
  await expect(
    certificate.locator('[data-slot="premises-workspace"]')
  ).toBeVisible()
  await certificate.goBack()
  await expect(back).toBeVisible()
  await back.click()
  await expect(
    certificate.locator('[data-slot="premises-workspace"]')
  ).toBeVisible()
  expect(documents).toEqual([])
  expect(errors).toEqual([])
})

for (const width of [1440, 390]) {
  test(`LGA directory, home and unavailable-record links stay usable at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = []
    const documents: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/lga/sign-in")
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true })
    ).toBeVisible()
    page.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.resourceType() === "document"
      )
        documents.push(request.url())
    })
    const navigation = page.getByRole("navigation", { name: "LGA navigation" })
    const openNavigation = async () => {
      if (width === 390)
        await page.getByRole("button", { name: "Open LGA navigation" }).click()
    }
    await openNavigation()
    await navigation
      .getByRole("link", { name: "Premises", exact: true })
      .click()
    for (let repeat = 0; repeat < 2; repeat++) {
      await page
        .getByRole("button", { name: "View", exact: true })
        .first()
        .click()
      await expect(
        page.locator('[data-slot="premises-workspace"]')
      ).toBeVisible()
      await page
        .getByRole("button", { name: "Back to premises", exact: true })
        .click()
      await expect(
        page.getByRole("heading", { name: "Premises", exact: true })
      ).toBeVisible()
    }
    for (let repeat = 0; repeat < 2; repeat++) {
      await openNavigation()
      await page
        .getByRole("link", { name: "EHRCMS LGA home", exact: true })
        .click()
      await expect(page).toHaveURL(/\/lga\/dashboard$/)
      if (width === 390) await expect(navigation).toBeHidden()
      await expect(
        page.getByRole("heading", { name: "Dashboard", exact: true })
      ).toBeVisible()
    }
    const skip = page.getByRole("link", {
      name: "Skip to content",
      exact: true,
    })
    await skip.focus()
    await skip.press("Enter")
    await expect(page.locator("#lga-content")).toBeFocused()
    expect(documents).toEqual([])

    for (const [path, title, backLabel, destination] of [
      [
        "premises/unknown",
        "Premises not found",
        "Back to premises",
        "Premises",
      ],
      [
        "health-approvals/unknown",
        "Health Approval not found",
        "Back to health approvals",
        "Health approvals",
      ],
      [
        "inspections/unknown",
        "Inspection not found",
        "Back to inspections",
        "Inspections",
      ],
    ]) {
      await page.goto(`/lga/${path}`)
      await expect(
        page.getByRole("heading", { name: title, exact: true })
      ).toBeVisible()
      documents.length = 0
      await page.getByRole("link", { name: backLabel, exact: true }).click()
      await expect(
        page.getByRole("heading", { name: destination, exact: true })
      ).toBeVisible()
      await page.goBack()
      await expect(
        page.getByRole("heading", { name: title, exact: true })
      ).toBeVisible()
      await page.getByRole("link", { name: backLabel, exact: true }).click()
      await expect(
        page.getByRole("heading", { name: destination, exact: true })
      ).toBeVisible()
      expect(documents).toEqual([])
    }
    expect(errors).toEqual([])
  })
}
