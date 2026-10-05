import { expect, test } from "@playwright/test"
import type { Locator, Page, Request } from "@playwright/test"

const errors = new WeakMap<Page, string[]>()
test.beforeEach(async ({ page }) => {
  const messages: string[] = []
  errors.set(page, messages)
  page.on("pageerror", (error) => messages.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") messages.push(message.text())
  })
  await page.setViewportSize({ width: 1440, height: 819 })
})
test.afterEach(({ page }) => {
  expect(errors.get(page)).toEqual([])
})

async function signIn(page: Page, portal: string) {
  await page.goto(`/${portal}/sign-in`)
  await expect(async () => {
    await page
      .getByRole("button", {
        name:
          portal === "business"
            ? "Sign in as Riverside Kitchen"
            : "Use assigned account",
      })
      .click()
    if (portal === "eho") {
      await expect(
        page.getByRole("textbox", { name: "Staff ID or email" })
      ).toHaveValue("EHO-001", { timeout: 1000 })
      await page.getByRole("button", { name: "Sign in", exact: true }).click()
    }
    await expect(page).toHaveURL(
      portal === "eho"
        ? /\/eho\/my-work$/
        : portal === "moh"
          ? /\/moh\/health-approvals$/
          : new RegExp(`/${portal}/dashboard$`),
      { timeout: 1000 }
    )
  }).toPass({ timeout: 15000 })
}

async function openRow(page: Page, row: Locator) {
  await expect(row).toBeVisible()
  const link = row.locator("a[href]")
  await expect(link).toHaveCount(1)
  const destination = new URL((await link.getAttribute("href"))!, page.url())
    .href
  const documents: string[] = []
  const record = (request: Request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame())
      documents.push(request.url())
  }
  page.on("request", record)
  await row
    .getByRole("cell")
    .first()
    .click({ position: { x: 8, y: 8 } })
  await expect(page).toHaveURL(destination)
  await page.goBack()
  page.off("request", record)
  expect(documents).toEqual([])
}
const firstRow = (page: Page) => page.locator("table:visible tbody tr").first()

test("Business: certificate rows open on desktop and mobile; staff rows do not", async ({
  page,
}) => {
  await signIn(page, "business")
  await page.evaluate(() =>
    localStorage.setItem(
      "ehrcms:fitness:v1:BUS-001",
      JSON.stringify({
        handlers: [
          {
            id: "row-staff",
            fullName: "Tari Briggs",
            sex: "Female",
            dateOfBirth: "1993-05-12",
            role: "Cook",
            identityNumber: "ID-001",
            phone: "08031230001",
            premisesName: "Riverside Kitchen",
            consent: true,
          },
        ],
        application: {
          id: "row-fitness",
          handlerIds: ["row-staff"],
          stage: "awaiting-facility",
          facilityId: "phc-health-centre",
          totalNgn: 12500,
          paymentReference: "ROW-FITNESS-001",
        },
      })
    )
  )
  await page.reload()
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 819 })
    await page.getByRole("tab", { name: "Certificates", exact: true }).click()
    await openRow(page, firstRow(page))
  }
  await page.goto("/business/food-handlers")
  const row = firstRow(page)
  await expect(
    row.getByRole("button", { name: "Archive Tari Briggs" })
  ).toBeVisible()
  await row.getByRole("cell").first().click()
  await expect(page).toHaveURL(/\/business\/food-handlers$/)
  await expect(
    row.getByRole("button", { name: "Archive Tari Briggs" })
  ).toBeVisible()
})

test("EHO: assigned jobs, available jobs and premises rows open", async ({
  page,
}) => {
  await signIn(page, "eho")
  await page.evaluate(() =>
    localStorage.setItem(
      "ehrcms:eho:fieldwork:v1:EHO-001",
      JSON.stringify({
        "EIN-103": {
          assignmentId: "EIN-103",
          status: "draft",
          answers: {},
          notes: {},
          issues: [],
          attendingOfficers: ["Ebi Briggs"],
        },
        "EIN-104": {
          assignmentId: "EIN-104",
          status: "queued",
          submittedAt: "2026-09-19T12:00:00.000Z",
          answers: {},
          notes: {},
          issues: [],
          attendingOfficers: ["Ebi Briggs"],
        },
      })
    )
  )
  await page.reload()
  await openRow(page, firstRow(page))
  await page.setViewportSize({ width: 390, height: 819 })
  await openRow(page, firstRow(page))
  await page.setViewportSize({ width: 1440, height: 819 })
  await page.getByRole("tab", { name: "Completed", exact: true }).click()
  await openRow(page, firstRow(page))
  await page.goto("/eho/inspections")
  await openRow(page, firstRow(page))
  await page.goto("/eho/premises-search")
  await openRow(page, firstRow(page))
})

test("MOH: approval, inspection and premises rows open", async ({ page }) => {
  await signIn(page, "moh")
  await openRow(page, firstRow(page))
  await page.goto("/moh/inspections")
  await openRow(page, firstRow(page))
  await page.goto("/moh/businesses")
  await openRow(page, firstRow(page))
})

test("LGA: dashboard, finance, approval, inspection and premises rows open", async ({
  page,
}) => {
  await signIn(page, "lga")
  await openRow(page, firstRow(page))
  await page
    .getByRole("tab", { name: "Expiring certificates", exact: true })
    .click()
  await openRow(page, firstRow(page))
  for (const path of [
    "finance",
    "health-approvals",
    "inspections",
    "premises",
  ]) {
    await page.goto(`/lga/${path}`)
    await openRow(page, firstRow(page))
  }
})

test("Operations: row modifier clicks open the existing destination in a new tab", async ({
  page,
  context,
}) => {
  await page.goto("/premises")
  const row = firstRow(page)
  const destination = new URL(
    (await row.locator("a[href]").getAttribute("href"))!,
    page.url()
  ).href
  for (const options of [
    { modifiers: ["ControlOrMeta" as const] },
    { button: "middle" as const },
  ]) {
    const popupPromise = context.waitForEvent("page")
    await row.getByRole("cell").nth(1).click(options)
    const popup = await popupPromise
    await expect(popup).toHaveURL(destination)
    await popup.close()
    await expect(page).toHaveURL(/\/premises$/)
  }
})
