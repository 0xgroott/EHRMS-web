import { describe, expect, it } from "vitest"

import { classifyTaskFiles } from "./lint-task-files.mjs"

describe("classifyTaskFiles", () => {
  it("keeps only supported files touched by the current task", () => {
    expect(
      classifyTaskFiles([
        "src/example.tsx",
        "src/styles.css",
        "docs/Colour_System.md",
        "src/example.tsx",
        "scripts/tool.mjs",
      ])
    ).toEqual({
      colourFiles: ["src/example.tsx", "src/styles.css", "scripts/tool.mjs"],
      eslintFiles: ["src/example.tsx", "scripts/tool.mjs"],
    })
  })
})
