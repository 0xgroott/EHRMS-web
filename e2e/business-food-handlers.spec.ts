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

test("food handler drawer shows the branch and fits a 390px screen", async ({
  page,
}) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/business/sign-in")
  await expect(async () => {
    await page
      .getByRole("button", { name: "Sign in as Riverside Kitchen" })
      .click()
    await expect(page).toHaveURL(/\/business\/dashboard$/, {
      timeout: 1_000,
    })
  }).toPass({ timeout: 15_000 })

  await page.goto("/business/food-handler/new")
  const drawer = page.getByRole("dialog", { name: "Add food handler" })
  await expect(drawer).toBeVisible()
  const branch = drawer.getByRole("combobox", {
    name: "Business branch/location",
  })
  await expect(branch).toBeDisabled()
  await expect(branch).toContainText("Riverside Kitchen, Diobu")
  await expect(drawer.getByText("Food handler details")).toHaveCount(0)
  await expect(
    drawer.getByText("Record the details needed to include this person")
  ).toHaveCount(0)
  await expect(
    drawer.getByRole("button", { name: "Save and add another" })
  ).toHaveCount(0)
  await expect(drawer.getByRole("button", { name: "Cancel" })).toBeVisible()

  const fullName = await drawer
    .getByRole("textbox", { name: "Full name" })
    .boundingBox()
  const jobRole = await drawer
    .getByRole("textbox", { name: "Job role" })
    .boundingBox()
  expect(fullName && jobRole && Math.abs(fullName.x - jobRole.x) < 2).toBe(true)
  expect(fullName && jobRole && jobRole.y > fullName.y).toBe(true)
  const sex = await drawer.getByRole("combobox", { name: "Sex" }).boundingBox()
  const dateOfBirth = await drawer.getByLabel("Date of birth").boundingBox()
  expect(sex && dateOfBirth && Math.abs(sex.y - dateOfBirth.y) < 2).toBe(true)
  expect(sex && dateOfBirth && dateOfBirth.x > sex.x).toBe(true)
  expect(
    await drawer.evaluate((element) => {
      const header = element.querySelector('[data-slot="sheet-header"]')
      const body = header?.nextElementSibling
      return [header, body].map((node) =>
        node ? getComputedStyle(node).paddingLeft : null
      )
    })
  ).toEqual(["16px", "16px"])
  expect(
    await page.evaluate(() => {
      const sheet = document.querySelector('[data-slot="sheet-content"]')
      const content = sheet?.querySelector("[data-slot=sheet-header] + div")
      return (
        document.documentElement.scrollWidth <= window.innerWidth &&
        (!sheet || sheet.scrollWidth <= sheet.clientWidth) &&
        (!content || content.scrollWidth <= content.clientWidth)
      )
    })
  ).toBe(true)

  await page.setViewportSize({ width: 1280, height: 800 })
  const desktopName = await drawer
    .getByRole("textbox", { name: "Full name" })
    .boundingBox()
  const desktopRole = await drawer
    .getByRole("textbox", { name: "Job role" })
    .boundingBox()
  expect(
    desktopName &&
      desktopRole &&
      Math.abs(desktopName.x - desktopRole.x) < 2 &&
      desktopRole.y > desktopName.y
  ).toBe(true)
  const desktopSex = await drawer
    .getByRole("combobox", { name: "Sex" })
    .boundingBox()
  const desktopDob = await drawer.getByLabel("Date of birth").boundingBox()
  expect(
    desktopSex && desktopDob && Math.abs(desktopSex.y - desktopDob.y) < 2
  ).toBe(true)
  expect(
    await page.evaluate(() => {
      const sheet = document.querySelector('[data-slot="sheet-content"]')
      return !sheet || sheet.scrollWidth <= sheet.clientWidth
    })
  ).toBe(true)

  await drawer.getByRole("combobox", { name: "Sex" }).click()
  await expect(
    page.getByRole("option", { name: "Female", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("option", { name: "Male", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("option", { name: "Prefer not to say" })
  ).toHaveCount(0)
  await page.getByRole("option", { name: "Female", exact: true }).click()

  await drawer.getByRole("textbox", { name: "Full name" }).fill("Chidi Nwosu")
  await drawer.getByRole("button", { name: "Save food handler" }).click()
  await expect(page).toHaveURL(/\/business\/food-handlers$/)
  await expect(page.getByText("Chidi Nwosu")).toBeVisible()
  expect(browserErrors).toEqual([])
})
