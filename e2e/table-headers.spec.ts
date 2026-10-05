import { expect, test } from "@playwright/test"

test("shared and native table headers contrast in both themes and viewport sizes", async ({
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
  await page.evaluate(() => {
    localStorage.setItem(
      "ehrcms:fitness:v1:BUS-001",
      JSON.stringify({
        application: null,
        handlers: [
          {
            id: "header-test",
            fullName: "Ada Okafor",
            sex: "Female",
            dateOfBirth: "1991-04-12",
            role: "Cook",
            identityNumber: "TEST-1",
            phone: "08000000000",
            premisesName: "Riverside Kitchen",
            consent: true,
          },
        ],
      })
    )
  })
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 819 })
    for (const route of [
      "/business/dashboard",
      "/business/food-handlers",
      "/business/fitness/apply",
    ]) {
      await page.goto(route)
      const header = page.locator("th:visible").first()
      await expect(header).toBeVisible()
      for (const dark of [false, true]) {
        await page.evaluate(
          (value) => document.documentElement.classList.toggle("dark", value),
          dark
        )
        await expect(header).toHaveCSS(
          "background-color",
          dark ? "rgb(48, 58, 57)" : "rgb(240, 245, 243)"
        )
        await expect(header).toHaveCSS(
          "color",
          dark ? "rgb(242, 247, 245)" : "rgb(23, 32, 34)"
        )
        await header.hover()
        await expect(header).toHaveCSS(
          "background-color",
          dark ? "rgb(48, 58, 57)" : "rgb(240, 245, 243)"
        )
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth
          )
        ).toBe(true)
      }
    }
  }
  expect(errors).toEqual([])
})
