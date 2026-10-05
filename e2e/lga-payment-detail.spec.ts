import { expect, test } from "@playwright/test"

for (const width of [1440, 390]) {
  test(`LGA payment details separate receipts and payouts and preserve filters at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })
    await page.setViewportSize({ width, height: 844 })
    await page.goto("/lga/sign-in")
    await page.getByRole("button", { name: "Use assigned account" }).click()
    await expect(page).toHaveURL(/\/lga\/dashboard$/)
    await page.goto("/lga/finance?service=Fitness&ward=Diobu")
    const rows = page
      .getByRole("table", { name: "Payments", exact: true })
      .locator("tbody tr")
    await expect(rows).toHaveCount(2)
    const count = 2
    const reference = await rows.first().getByRole("link").innerText()
    await rows.first().getByRole("cell").nth(1).click()
    await expect(page).toHaveURL(new RegExp(`/lga/finance/${reference}\\?`))
    await expect(
      page.getByRole("heading", { name: "Payment details", exact: true })
    ).toBeVisible()
    const breakdown = page.getByRole("region", { name: "Payment breakdown" })
    await expect(breakdown.locator("dd")).toHaveText([
      "₦15,000",
      "₦5,000",
      "₦10,000",
    ])
    const payout = page.getByRole("region", { name: "LGA payout" })
    await expect(payout.locator("dd")).toHaveText(["₦5,000", "₦0", "₦5,000"])
    await expect(
      page.getByText("Partially refunded", { exact: true })
    ).toBeVisible()
    await expect(
      page.getByText("No receipt attached to this payment.")
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: /Refund|Pay out|Download receipt/ })
    ).toHaveCount(0)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
    await page.reload()
    await expect(
      page.getByRole("heading", { name: "Payment details", exact: true })
    ).toBeVisible()
    await page.getByRole("link", { name: "View premises", exact: true }).click()
    await expect(page).toHaveURL(/\/lga\/premises\/PR-001/)
    await page.goBack()
    await page
      .getByRole("link", { name: "Back to finance", exact: true })
      .click()
    await expect(
      page.getByRole("combobox", { name: "Service", exact: true })
    ).toContainText("Fitness")
    await expect(
      page.getByRole("combobox", { name: "Ward", exact: true })
    ).toContainText("Diobu")
    await expect(rows).toHaveCount(count)
    const link = rows.first().getByRole("link")
    await link.focus()
    await page.keyboard.press("Enter")
    await expect(
      page.getByRole("heading", { name: "Payment details", exact: true })
    ).toBeVisible()
    await page.goBack()
    await expect(rows).toHaveCount(count)
    expect(errors).toEqual([])
  })
}

test("LGA payment direct links show paid-out records and reject foreign or unknown payments", async ({
  page,
}) => {
  await page.goto("/lga/sign-in")
  await page.getByRole("button", { name: "Use assigned account" }).click()
  await expect(page).toHaveURL(/\/lga\/dashboard$/)
  await page.goto("/lga/finance/PAY-PR-002-1")
  await expect(
    page.getByRole("region", { name: "LGA payout" }).locator("dd")
  ).toHaveText(["₦7,500", "₦7,500", "₦0"])
  await expect(
    page.getByText("The LGA share has been paid in full.")
  ).toBeVisible()
  for (const id of ["PAY-PR-005-1", "unknown"]) {
    await page.goto(`/lga/finance/${id}`)
    await expect(
      page.getByRole("heading", { name: "Payment not found", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("region", { name: "Payment breakdown" })
    ).toHaveCount(0)
    await page
      .getByRole("link", { name: "Back to finance", exact: true })
      .click()
    await expect(
      page.getByRole("heading", { name: "Finance", exact: true })
    ).toBeVisible()
  }
})
