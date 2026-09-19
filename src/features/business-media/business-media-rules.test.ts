import { expect, it } from "vitest"
import { validateBusinessImage } from "./business-media-rules"

it("accepts supported images and rejects empty, oversized, or unsupported files", () => {
  expect(
    validateBusinessImage(
      new File(["image"], "kitchen.png", { type: "image/png" })
    )
  ).toBeNull()
  expect(
    validateBusinessImage(new File([], "empty.jpg", { type: "image/jpeg" }))
  ).toContain("not empty")
  expect(
    validateBusinessImage(
      new File(["<svg/>"], "logo.svg", { type: "image/svg+xml" })
    )
  ).toContain("PNG, JPG, or WebP")
  expect(
    validateBusinessImage(
      new File([new Uint8Array(8 * 1024 * 1024 + 1)], "large.webp", {
        type: "image/webp",
      })
    )
  ).toContain("smaller than 8 MB")
})
