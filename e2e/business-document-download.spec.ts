import { readFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"

test("downloads the saved Fitness certificate with its original premises details", async ({
  page,
}) => {
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
    await expect(page).toHaveURL(/\/business\/dashboard$/, {
      timeout: 1_000,
    })
  }).toPass({ timeout: 15_000 })

  await page.evaluate(() => {
    const handler = {
      id: "handler-ada",
      fullName: "Ada Okafor",
      sex: "Female",
      dateOfBirth: "1991-04-12",
      role: "Cook",
      identityNumber: "DEMO-1",
      phone: "08000000000",
      premisesName: "Original Kitchen",
      consent: true,
    }
    localStorage.setItem(
      "ehrcms:fitness:v1:BUS-001",
      JSON.stringify({
        handlers: [handler],
        application: {
          id: "fitness-application-1",
          handlerIds: [handler.id],
          handlerSnapshots: [handler],
          stage: "issued",
          paymentReference: "FIT-PAY-1",
          certificate: {
            id: "FIT-CERT-1",
            handlerIds: [handler.id],
            councilId: "phc",
            issuedAt: "2026-09-19",
            expiresAt: "2027-09-19",
            premisesSnapshot: {
              businessName: "Original Business",
              premisesName: "Original Kitchen",
              address: "1 Original Road",
            },
          },
        },
      })
    )
  })

  await page.goto("/business/fitness/certificate")
  await expect(
    page.getByRole("heading", { name: "Fitness Certificate", exact: true })
  ).toBeVisible()
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download certificate" }).click(),
  ])

  expect(download.suggestedFilename()).toBe(
    "fitness-certificate-FIT-CERT-1.html"
  )
  const path = await download.path()
  const content = await readFile(path, "utf8")
  expect(content).toContain("Original Kitchen")
  expect(content).toContain("Ada Okafor - Cook")
  expect(content).toContain("Portal record copy")
  expect(browserErrors).toEqual([])
})
