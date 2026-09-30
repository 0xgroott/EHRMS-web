import { expect, test } from "@playwright/test"

test("EHO returns to the inspection overview after submitting fieldwork", async ({
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

  await page.goto("/eho/inspections/EIN-101")
  await expect(
    page.getByRole("heading", { level: 1, name: "Inspection overview" })
  ).toBeVisible()
  await page.evaluate(() => {
    const key = "ehrcms:eho:fieldwork:v1:EHO-001"
    const fieldwork = JSON.parse(localStorage.getItem(key) ?? "{}")
    fieldwork["EIN-101"] = {
      assignmentId: "EIN-101",
      status: "draft",
      answers: {
        "food-storage": "Satisfactory",
        "waste-control": "Satisfactory",
        "water-supply": "Satisfactory",
      },
      notes: {},
      issues: [],
      attendingOfficers: ["Ebi Briggs"],
    }
    localStorage.setItem(key, JSON.stringify(fieldwork))
  })
  await page.goto("/eho/inspections/EIN-101/review")
  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-101\/review$/)
  await page.getByRole("button", { name: "Submit inspection" }).click()

  await expect(page).toHaveURL(/\/eho\/inspections\/EIN-101$/)
  await expect(
    page.getByRole("heading", { level: 1, name: "Inspection overview" })
  ).toBeVisible()
  await expect(page.getByText("Inspection result submitted")).toBeVisible()
  expect(browserErrors).toEqual([])
})
