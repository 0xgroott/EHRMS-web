import { beforeEach, expect, it } from "vitest"
import {
  businessMediaStorageKey,
  createBusinessMediaStore,
  emptyBusinessMedia,
} from "./business-media-store"

beforeEach(() => localStorage.clear())

it("keeps the avatar and three photos scoped to one business profile", () => {
  const store = createBusinessMediaStore(localStorage)
  const media = emptyBusinessMedia()
  media.avatar = { name: "logo.webp", dataUrl: "data:image/webp;base64,AAAA" }
  media.photos[1] = {
    name: "kitchen.webp",
    dataUrl: "data:image/webp;base64,BBBB",
  }
  store.write("BUS-001", media)

  expect(store.read("BUS-001")).toEqual(media)
  expect(store.read("BUS-002")).toEqual(emptyBusinessMedia())
  expect(store.read("BUS-001").photos).toHaveLength(3)
})

it("ignores malformed saved media", () => {
  localStorage.setItem(businessMediaStorageKey("BUS-001"), "{bad-json")
  expect(createBusinessMediaStore(localStorage).read("BUS-001")).toEqual(
    emptyBusinessMedia()
  )
})
