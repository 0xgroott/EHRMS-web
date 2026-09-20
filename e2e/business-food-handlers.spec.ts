import { expect, test } from "@playwright/test"

test("business user can find, archive, and restore a food handler", async ({
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
    localStorage.setItem(
      "ehrcms:fitness:v1:BUS-001",
      JSON.stringify({
        application: null,
        handlers: [
          {
            id: "handler-ada",
            fullName: "Ada Okafor",
            sex: "Female",
            dateOfBirth: "1991-04-12",
            role: "Cook",
            identityNumber: "DEMO-1",
            phone: "08000000000",
            premisesName: "Riverside Kitchen",
            consent: true,
          },
          {
            id: "handler-bisi",
            fullName: "Bisi Bello",
            sex: "Female",
            dateOfBirth: "1995-05-10",
            role: "Assistant",
            identityNumber: "",
            phone: "08001111111",
            premisesName: "Riverside Kitchen",
            consent: true,
          },
        ],
      })
    )
  })

  await page.goto("/business/food-handlers")
  const search = page.getByRole("searchbox", { name: "Search food handlers" })
  const filter = page.getByRole("combobox", { name: "Show" })
  await expect(page.getByText("Ada Okafor")).toBeVisible()
  await search.fill("bisi")
  await expect(page.getByText("Bisi Bello")).toBeVisible()
  await expect(page.getByText("Ada Okafor")).toBeHidden()
  await search.clear()
  await filter.selectOption("ready")
  await expect(page.getByText("Bisi Bello")).toBeHidden()
  await page.getByRole("button", { name: "Archive Ada Okafor" }).click()
  await expect(page.getByText("Ada Okafor")).toBeHidden()

  await page.reload()
  await filter.selectOption("archived")
  await expect(page.getByText("Ada Okafor")).toBeVisible()
  await page.getByRole("button", { name: "Restore Ada Okafor" }).click()
  await filter.selectOption("current")
  await expect(page.getByText("Ada Okafor")).toBeVisible()
  expect(browserErrors).toEqual([])
})
