import { expect, test } from "@playwright/test"

for (const width of [1440, 390]) {
  test(`business Home navigation avoids a full reload at ${width}px`, async ({
    page,
  }) => {
    const browserErrors: string[] = []
    page.on("pageerror", (error) => browserErrors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text())
    })
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/business/sign-in")
    await expect(
      page.getByRole("region", { name: "Notifications" })
    ).toBeAttached()
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    const home = page.getByRole("heading", {
      level: 1,
      name: "Home",
      exact: true,
    })
    await expect(home).toBeVisible()
    const documentRequests: string[] = []
    page.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.resourceType() === "document"
      ) {
        documentRequests.push(new URL(request.url()).pathname)
      }
    })
    for (const label of ["Staff", "Applications", "Certificates", "Settings"]) {
      if (width === 390)
        await page
          .getByRole("button", { name: "Open business navigation" })
          .click()
      await page.getByRole("link", { name: label, exact: true }).click()
      await expect(
        page.getByRole("heading", { level: 1, name: label, exact: true })
      ).toBeVisible()
      if (width === 390)
        await page
          .getByRole("button", { name: "Open business navigation" })
          .click()
      await page.getByRole("link", { name: "Home", exact: true }).click()
      await expect(home).toBeVisible()
      await expect(page).toHaveURL("/business/dashboard")
      expect(
        documentRequests,
        "Returning Home must keep the application loaded"
      ).toEqual([])
      if (width === 390) await expect(page.getByRole("dialog")).toHaveCount(0)
    }
    if (width === 390)
      await page
        .getByRole("button", { name: "Open business navigation" })
        .click()
    await page.getByRole("link", { name: "Applications", exact: true }).click()
    await expect(
      page.getByRole("heading", { level: 1, name: "Applications", exact: true })
    ).toBeVisible()
    if (width === 390)
      await page
        .getByRole("button", { name: "Open business navigation" })
        .click()
    await page.getByRole("link", { name: "EHRCMS business home" }).click()
    await expect(home).toBeVisible()
    expect(documentRequests).toEqual([])
    if (width === 390) await expect(page.getByRole("dialog")).toHaveCount(0)
    expect(browserErrors).toEqual([])
  })
}

test("business links survive Back, reopening, and refresh", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.goto("/business/sign-in")
  await expect(
    page.getByRole("region", { name: "Notifications" })
  ).toBeAttached()
  await page
    .getByRole("button", { name: "Sign in as Riverside Kitchen" })
    .click()
  const home = page.getByRole("heading", {
    level: 1,
    name: "Home",
    exact: true,
  })
  await expect(home).toBeVisible()

  for (const destination of [
    { link: "View profile", path: "/business/settings", heading: "Settings" },
    {
      link: "Applications",
      path: "/business/applications",
      heading: "Applications",
    },
  ]) {
    for (let visit = 0; visit < 3; visit += 1) {
      await page
        .getByRole("link", { name: destination.link, exact: true })
        .click()
      await expect(page).toHaveURL(destination.path)
      const heading = page.getByRole("heading", {
        level: 1,
        name: destination.heading,
        exact: true,
      })
      await expect(heading).toBeVisible()
      await page.reload()
      await expect(heading).toBeVisible()
      await page.goBack()
      await expect(page).toHaveURL("/business/dashboard")
      await expect(home).toBeVisible()
    }
  }

  expect(browserErrors).toEqual([])
})

for (const width of [1440, 390]) {
  test(`business dashboard actions keep the app loaded at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    await page.goto("/business/sign-in")
    await expect(async () => {
      await page
        .getByRole("button", { name: "Sign in as Riverside Kitchen" })
        .click()
      await expect(page).toHaveURL(/\/business\/dashboard$/, { timeout: 1000 })
    }).toPass({ timeout: 15000 })
    const documents: string[] = []
    page.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.resourceType() === "document"
      )
        documents.push(request.url())
    })
    await page.getByRole("link", { name: "View profile", exact: true }).click()
    await expect(page).toHaveURL(/\/business\/settings$/)
    expect(documents).toEqual([])
    await page.goBack()
    await expect(
      page.getByRole("heading", { name: "Home", exact: true })
    ).toBeVisible()
    await page
      .getByRole("link", { name: "View all staff", exact: true })
      .click()
    await expect(page).toHaveURL(/\/business\/food-handlers$/)
    await page.getByRole("link", { name: "Add staff", exact: true }).click()
    await expect(page).toHaveURL(/\/business\/food-handler\/new$/)
    await page.goBack()
    await page.goBack()
    await page.getByRole("button", { name: "Get started", exact: true }).click()
    await page
      .getByRole("dialog")
      .getByRole("link", { name: /begin fumigation/i })
      .click()
    await expect(page).toHaveURL(/\/business\/fumigation\/apply$/)
    await expect(
      page.getByRole("heading", { name: "Application details", exact: true })
    ).toBeVisible()
    await page.goBack()
    await page.getByRole("button", { name: "Get started", exact: true }).click()
    await page
      .getByRole("dialog")
      .getByRole("link", { name: /add kitchen staff/i })
      .click()
    await expect(page).toHaveURL(/\/business\/food-handlers$/)
    expect(documents).toEqual([])
    expect(errors).toEqual([])
  })
}

for (const kind of ["fitness", "fumigation"] as const) {
  test(`${kind} tracker, renewal and draft links avoid document reloads`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    await page.goto("/business/sign-in")
    await expect(async () => {
      await page
        .getByRole("button", { name: "Sign in as Riverside Kitchen" })
        .click()
      await expect(page).toHaveURL(/\/business\/dashboard$/, { timeout: 1000 })
    }).toPass({ timeout: 15000 })
    await page.evaluate((type) => {
      const handler = {
        id: "ada",
        fullName: "Ada Okafor",
        sex: "Female",
        dateOfBirth: "1990-01-01",
        role: "Cook",
        identityNumber: "TEST-ADA",
        phone: "08030000000",
        premisesName: "Riverside Kitchen",
        consent: true,
      }
      const certificate = {
        id: `${type}-CERT-1`,
        handlerIds: ["ada"],
        councilId: "phc",
        issuedAt: "2026-01-01",
        expiresAt: "2099-01-01",
        workDate: "2026-01-01",
      }
      localStorage.setItem(
        `ehrcms:${type}:v1:BUS-001`,
        JSON.stringify({
          handlers: [handler],
          application: {
            id: `${type}-application-1`,
            handlerIds: ["ada"],
            stage: "issued",
            requestedPeriod: "2026-01",
            declaration: true,
            certificate,
          },
        })
      )
    }, kind)
    await page.goto("/business/applications")
    const documents: string[] = []
    page.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.resourceType() === "document"
      )
        documents.push(request.url())
    })
    const title = kind === "fitness" ? "Fitness" : "Fumigation"
    await page
      .getByRole("region", { name: `${title} application`, exact: true })
      .getByRole("link", { name: "View Application" })
      .click()
    await expect(page).toHaveURL(`/business/${kind}/tracker`)
    await page
      .getByRole("link", { name: `View ${title} Certificate`, exact: true })
      .click()
    await expect(page).toHaveURL(`/business/${kind}/certificate`)
    await page.getByRole("button", { name: "Start renewal" }).click()
    await expect(page).toHaveURL(`/business/${kind}/apply`)
    await expect(
      page.getByText(`${title} renewal started`, { exact: true })
    ).toBeVisible()
    expect(documents).toEqual([])
    const history = await page.evaluate(
      (type) =>
        JSON.parse(localStorage.getItem(`ehrcms:${type}:v1:BUS-001`) ?? "{}")
          .history,
      kind
    )
    expect(history[0].certificate.id).toBe(`${kind}-CERT-1`)
    await page.goBack()
    await expect(page).toHaveURL(`/business/${kind}/certificate`)
    await page.getByRole("link", { name: /continue renewal/i }).click()
    await expect(page).toHaveURL(`/business/${kind}/apply`)
    expect(documents).toEqual([])
    expect(errors).toEqual([])
  })
}

test("KYB opens, closes and reopens through client navigation", async ({
  page,
}) => {
  await page.goto("/business/sign-in")
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, { timeout: 1000 })
  }).toPass({ timeout: 15000 })
  await page.evaluate(() => {
    const state = JSON.parse(localStorage.getItem("ehrcms:business:v1")!)
    state.stage = "setup"
    localStorage.setItem("ehrcms:business:v1", JSON.stringify(state))
  })
  await page.reload()
  const documents: string[] = []
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.resourceType() === "document")
      documents.push(request.url())
  })
  for (let visit = 0; visit < 2; visit++) {
    await page.getByRole("link", { name: "Complete KYB", exact: true }).click()
    await expect(page).toHaveURL(/\/business\/settings#kyb$/)
    await expect(
      page.getByRole("dialog", { name: "Complete business verification (KYB)" })
    ).toBeVisible()
    await page
      .getByRole("button", { name: "Close business verification" })
      .click()
    await expect(page).toHaveURL(/\/business\/settings$/)
  }
  await page.getByRole("link", { name: "Home", exact: true }).click()
  await page.getByRole("link", { name: "View profile", exact: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Complete business verification (KYB)" })
  ).toBeVisible()
  expect(documents).toEqual([])
})
