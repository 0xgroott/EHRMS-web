import { expect, test } from "@playwright/test"

test("app exposes its branded browser and touch icons", async ({
  page,
  request,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await expect(
    page.locator('head link[rel="icon"][type="image/svg+xml"]')
  ).toHaveAttribute("href", "/favicon/logo-green-48.svg")
  await expect(
    page.locator('head link[rel="apple-touch-icon"]')
  ).toHaveAttribute("href", "/favicon/icon-180.png")
  await expect(page.locator('head link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.json"
  )
  const svg = await request.get("/favicon/logo-green-48.svg")
  expect(svg.ok()).toBe(true)
  expect(svg.headers()["content-type"]).toContain("image/svg+xml")
  const ico = await request.get("/favicon.ico")
  expect(ico.ok()).toBe(true)
  const bytes = await ico.body()
  expect(bytes.readUInt16LE(2)).toBe(1)
  expect(bytes.readUInt16LE(4)).toBe(3)
  const manifest = await (await request.get("/manifest.json")).json()
  expect(manifest.short_name).toBe("EHRCMS")
  for (const path of [
    "/favicon/icon-180.png",
    ...manifest.icons.map((icon: { src: string }) => icon.src),
  ]) {
    const response = await request.get(path)
    expect(response.ok()).toBe(true)
    expect(response.headers()["content-type"]).toContain("image/png")
  }
  await page.goto("/business/sign-in")
  await expect(
    page.locator('head link[rel="icon"][type="image/svg+xml"]')
  ).toHaveAttribute("href", "/favicon/logo-green-48.svg")
  expect(errors).toEqual([])
})
