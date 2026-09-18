import { describe, expect, it } from "vitest"
import { createStorage } from "./storage"

describe("mock storage", () => {
  it("falls back to seeds when persisted JSON is malformed", () => {
    localStorage.setItem("ehrcms:prototype:v1", "not-json")
    expect(createStorage().read().premises.length).toBeGreaterThan(0)
  })
})
