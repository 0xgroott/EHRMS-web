import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

function trackNavigation(page: Page) {
  const documents: string[] = []
  const errors: string[] = []
  page.on("request", (request) => {
    if (
      request.isNavigationRequest() &&
      request.resourceType() === "document"
    ) {
      documents.push(request.url())
    }
  })
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text())
  })
  return { documents, errors }
}

for (const width of [1440, 390]) {
  test(`business sign-in stays in the same document at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto("/business/sign-in")
    await expect(
      page.getByRole("region", { name: "Notifications" })
    ).toBeAttached()
    const { documents, errors } = trackNavigation(page)
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(
      page.getByRole("heading", { name: "Home", exact: true })
    ).toBeVisible()
    expect(documents).toEqual([])
    expect(errors).toEqual([])
  })

  test(`business registration, verification and resume avoid reloads at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto("/business/register")
    await expect(
      page.getByRole("region", { name: "Notifications" })
    ).toBeAttached()
    const { documents, errors } = trackNavigation(page)
    await page.getByLabel("Business name").fill("Harbour Foods")
    await page.getByLabel("Contact person's name").fill("Amaka Nwosu")
    await page.getByRole("button", { name: "Continue", exact: true }).click()
    await page
      .getByLabel("Email address", { exact: true })
      .fill("amaka@example.test")
    await page.getByLabel("Password", { exact: true }).fill("Test-password-123")
    await page
      .getByRole("checkbox", { name: "I accept the terms and privacy notice." })
      .check()
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click()
    await expect(
      page.getByRole("heading", { name: "Verify your email" })
    ).toBeVisible()
    await expect(
      page.getByText("Business account created", { exact: true })
    ).toBeVisible()
    expect(documents).toEqual([])

    await page.goto("/business/sign-in")
    await expect(
      page.getByRole("button", { name: "Continue saved registration" })
    ).toBeVisible()
    documents.length = 0
    await page
      .getByRole("button", { name: "Continue saved registration" })
      .click()
    await expect(
      page.getByRole("heading", { name: "Verify your email" })
    ).toBeVisible()
    await page.getByLabel("6-digit verification code").fill("123456")
    await page.getByRole("button", { name: "Verify and continue" }).click()
    await expect(
      page.getByRole("heading", { name: "Home", exact: true })
    ).toBeVisible()
    await expect(
      page.getByText("Email verified", { exact: true })
    ).toBeVisible()
    expect(documents).toEqual([])

    await page.goto("/business/sign-in")
    await expect(
      page.getByRole("button", { name: "Continue saved registration" })
    ).toBeVisible()
    documents.length = 0
    await page
      .getByRole("button", { name: "Continue saved registration" })
      .click()
    await expect(
      page.getByRole("heading", { name: "Home", exact: true })
    ).toBeVisible()
    expect(documents).toEqual([])
    expect(errors).toEqual([])
  })
}

test("business access guards redirect without a second document request", async ({
  page,
}) => {
  const { documents, errors } = trackNavigation(page)
  await page.goto("/business/dashboard")
  await expect(
    page.getByRole("button", { name: "Sign in as Riverside Kitchen" })
  ).toBeVisible()
  expect(documents).toHaveLength(1)
  expect(errors).toEqual([])
})
