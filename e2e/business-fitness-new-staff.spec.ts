import { expect, test } from "@playwright/test"

for (const width of [1440, 390]) {
  test(`a business applies for new staff at ${width}px while keeping its issued Fitness certificate`, async ({
    page,
  }) => {
    const browserErrors: string[] = []
    page.on("pageerror", (error) => browserErrors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text())
    })

    await page.setViewportSize({ width, height: width === 390 ? 844 : 819 })
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
          handlers: [
            {
              id: "ada",
              fullName: "Ada Okafor",
              sex: "Female",
              dateOfBirth: "1990-01-01",
              role: "Cook",
              identityNumber: "TEST-ADA",
              phone: "08030000000",
              premisesName: "Riverside Kitchen",
              consent: true,
            },
            {
              id: "bola",
              fullName: "Bola James",
              sex: "Female",
              dateOfBirth: "1995-01-01",
              role: "Server",
              identityNumber: "TEST-BOLA",
              phone: "08031111111",
              premisesName: "Riverside Kitchen",
              consent: true,
            },
          ],
          application: {
            id: "fitness-application-1",
            handlerIds: ["ada"],
            stage: "issued",
            certificate: {
              id: "FIT-CERT-1",
              handlerIds: ["ada"],
              councilId: "phc",
              issuedAt: "2026-01-01",
              expiresAt: "2099-01-01",
            },
          },
        })
      )
    })

    await page.goto("/business/applications")
    const applications = page.getByRole("region", {
      name: "Current applications",
    })
    const fitnessCard = applications.getByRole("region", {
      name: "Fitness application",
    })
    const fumigationCard = applications.getByRole("region", {
      name: "Fumigation application",
    })
    await expect(fitnessCard.getByText("Approved")).toHaveAttribute(
      "data-tone",
      "success"
    )
    await expect(fitnessCard.getByText("Approved")).toHaveAttribute(
      "data-variant",
      "success"
    )
    await expect(
      fitnessCard.getByRole("link", { name: "View Application" })
    ).toHaveAttribute("href", "/business/fitness/tracker")
    await expect(fumigationCard.getByText("Not started")).toHaveAttribute(
      "data-tone",
      "pending"
    )
    const fitnessBox = await fitnessCard.boundingBox()
    const fumigationBox = await fumigationCard.boundingBox()
    expect(fitnessBox).not.toBeNull()
    expect(fumigationBox).not.toBeNull()
    if (fitnessBox && fumigationBox) {
      if (width === 1440) {
        expect(Math.abs(fitnessBox.y - fumigationBox.y)).toBeLessThan(2)
        expect(fumigationBox.x).toBeGreaterThan(fitnessBox.x)
      } else {
        expect(fumigationBox.y).toBeGreaterThan(fitnessBox.y)
      }
    }
    const documentRequests: string[] = []
    page.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.resourceType() === "document"
      )
        documentRequests.push(request.url())
    })
    await page.getByRole("button", { name: "Apply for new staff" }).click()
    await expect(page).toHaveURL(/\/business\/fitness\/apply$/)
    expect(documentRequests).toEqual([])
    await expect(
      page.getByRole("heading", { name: "Select new food handlers" })
    ).toBeVisible()
    const table = page.getByRole("table", { name: /Food handlers at/ })
    await expect(table.getByRole("row", { name: /Bola James/ })).toBeVisible()
    await expect(table.getByRole("row", { name: /Ada Okafor/ })).toHaveCount(0)
    await page.getByRole("checkbox", { name: /Bola James/ }).check()
    await page.getByRole("button", { name: "Next" }).click()
    await expect(
      page.getByRole("heading", { name: "Choose an approved facility" })
    ).toBeVisible()

    await page.goto("/business/applications")
    await expect(
      page
        .getByRole("region", { name: "Fitness application" })
        .getByRole("link", { name: "View Application" })
    ).toHaveAttribute("href", "/business/fitness/apply")
    const history = page.getByRole("table", {
      name: "Application History",
    })
    await expect(history.getByText("fitness-application-1")).toBeVisible()
    await expect(history.getByText("Approved")).toBeVisible()
    await page.goto("/business/fitness/certificate")
    await expect(
      page.locator("#business-content").getByText("Ada Okafor")
    ).toBeVisible()
    expect(browserErrors).toEqual([])
  })
}
