import { expect, test } from "@playwright/test"

test("business user can find, archive, and restore staff", async ({ page }) => {
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
  const records = page.getByRole("region", { name: "Staff list" })
  await expect(records).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Food handler records" })
  ).toHaveCount(0)
  await expect(page.getByText(/Readiness requires identity/)).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Next step" })).toHaveCount(0)
  await expect(
    page.getByRole("link", { name: "Start Fitness application" })
  ).toHaveCount(0)
  expect(
    await records.evaluate((element) => {
      const style = getComputedStyle(element)
      return [style.paddingLeft, style.paddingRight, style.borderTopWidth]
    })
  ).toEqual(["0px", "0px", "0px"])
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(records).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true)
  await page.setViewportSize({ width: 1280, height: 800 })
  const search = page.getByRole("searchbox", { name: "Search staff" })
  const filter = page.getByRole("combobox", { name: "Show" })
  await expect(page.getByText("Ada Okafor")).toBeVisible()
  await search.fill("bisi")
  await expect(page.getByText("Bisi Bello")).toBeVisible()
  await expect(page.getByText("Ada Okafor")).toBeHidden()
  await search.clear()
  await page.getByRole("button", { name: "Archive Ada Okafor" }).click()
  await expect(page.getByText("Ada Okafor")).toBeHidden()

  await page.reload()
  await filter.selectOption("archived")
  await expect(page.getByText("Ada Okafor")).toBeVisible()
  await page.getByRole("button", { name: "Restore Ada Okafor" }).click()
  await filter.selectOption("active")
  await expect(page.getByText("Ada Okafor")).toBeVisible()
  expect(browserErrors).toEqual([])
})

test("new staff dialog shows the branch and fits a 390px screen", async ({
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
  const dialog = page.getByRole("dialog", { name: "Add staff" })
  await expect(dialog).toBeVisible()
  const branch = dialog.getByRole("combobox", {
    name: "Business branch/location",
  })
  await expect(branch).toBeDisabled()
  await expect(branch).toContainText("Riverside Kitchen, Diobu")
  await expect(dialog.getByText("Food handler details")).toHaveCount(0)
  await expect(
    dialog.getByText("Record the details needed to include this person")
  ).toHaveCount(0)
  await expect(
    dialog.getByRole("button", { name: "Save and add another" })
  ).toHaveCount(0)
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeVisible()

  const fullName = await dialog
    .getByRole("textbox", { name: "Full name" })
    .boundingBox()
  const jobRole = await dialog
    .getByRole("textbox", { name: "Job role" })
    .boundingBox()
  expect(fullName && jobRole && Math.abs(fullName.x - jobRole.x) < 2).toBe(true)
  expect(fullName && jobRole && jobRole.y > fullName.y).toBe(true)
  const sex = await dialog.getByRole("combobox", { name: "Sex" }).boundingBox()
  const dateOfBirth = await dialog.getByLabel("Date of birth").boundingBox()
  expect(sex && dateOfBirth && Math.abs(sex.y - dateOfBirth.y) < 2).toBe(true)
  expect(sex && dateOfBirth && dateOfBirth.x > sex.x).toBe(true)
  expect(
    await page.evaluate(() => {
      const content = document.querySelector('[data-slot="dialog-content"]')
      return (
        document.documentElement.scrollWidth <= window.innerWidth &&
        (!content || content.scrollWidth <= content.clientWidth)
      )
    })
  ).toBe(true)

  await page.setViewportSize({ width: 1280, height: 800 })
  await expect
    .poll(() =>
      dialog.evaluate((element) => element.getBoundingClientRect().width)
    )
    .toBeLessThanOrEqual(456)
  const dialogGeometry = await dialog.evaluate((element) => {
    const box = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    return {
      width: box.width,
      height: box.height,
      radii: [
        style.borderTopLeftRadius,
        style.borderTopRightRadius,
        style.borderBottomRightRadius,
        style.borderBottomLeftRadius,
      ],
    }
  })
  expect(dialogGeometry.width).toBeLessThanOrEqual(456)
  expect(dialogGeometry.height).toBe(600)
  expect(new Set(dialogGeometry.radii).size).toBe(1)
  const desktopName = await dialog
    .getByRole("textbox", { name: "Full name" })
    .boundingBox()
  const desktopRole = await dialog
    .getByRole("textbox", { name: "Job role" })
    .boundingBox()
  expect(
    desktopName &&
      desktopRole &&
      Math.abs(desktopName.x - desktopRole.x) < 2 &&
      desktopRole.y > desktopName.y
  ).toBe(true)
  const desktopSex = await dialog
    .getByRole("combobox", { name: "Sex" })
    .boundingBox()
  const desktopDob = await dialog.getByLabel("Date of birth").boundingBox()
  expect(
    desktopSex && desktopDob && Math.abs(desktopSex.y - desktopDob.y) < 2
  ).toBe(true)
  expect(
    await page.evaluate(() => {
      const content = document.querySelector('[data-slot="dialog-content"]')
      if (!content) return false
      const box = content.getBoundingClientRect()
      return (
        content.scrollWidth <= content.clientWidth &&
        Math.abs(box.left + box.width / 2 - window.innerWidth / 2) < 2
      )
    })
  ).toBe(true)

  await dialog.getByRole("combobox", { name: "Sex" }).click()
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

  await dialog.getByRole("textbox", { name: "Full name" }).fill("Chidi Nwosu")
  const save = dialog.getByRole("button", { name: "Save staff member" })
  await expect(save).toBeDisabled()
  await expect(
    dialog.getByText(
      "Complete the required fields and confirm consent to save."
    )
  ).toBeVisible()
  await expect(page).toHaveURL(/\/business\/food-handler\/new$/)

  await dialog.getByRole("textbox", { name: "Job role" }).fill("Cook")
  await dialog.getByRole("textbox", { name: "Identity number" }).fill("NIN-123")
  await dialog
    .getByRole("textbox", { name: "Phone number" })
    .fill("08030000000")
  await dialog
    .getByRole("checkbox", { name: /Fitness Certificate process/i })
    .check()
  await expect(save).toBeEnabled()
  await save.click()
  await expect(page).toHaveURL(/\/business\/food-handlers$/)
  await expect(page.getByText("Chidi Nwosu")).toBeVisible()
  expect(browserErrors).toEqual([])
})
