import { readdir, readFile } from "node:fs/promises"
import { extname, relative, resolve } from "node:path"
import { pathToFileURL } from "node:url"

const projectRoot = resolve(import.meta.dirname, "..")
const sourceRoot = resolve(projectRoot, "src")
const supportedExtensions = new Set([
  ".cjs",
  ".css",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
])

const excludedFiles = new Set([
  // This module generates a standalone downloaded HTML document. App theme
  // variables are unavailable in that separate document context.
  "src/domain/business-document-downloads.ts",
  // This is the single source of truth where raw colour values are defined.
  "src/styles.css",
])

const rawHex = /#[\da-f]{3,8}\b/gi
const rawTailwindColour =
  /\b(?:bg|border|fill|ring|stroke|text)-(?:amber|blue|cyan|emerald|fuchsia|gray|green|indigo|lime|neutral|orange|pink|purple|red|rose|sky|slate|stone|teal|violet|yellow|zinc)-\d{2,3}(?:\/\d{1,3})?\b/gi
const manualDarkColour =
  /\bdark:(?:bg|border|fill|ring|stroke|text)-(?!\[?var\b)[^\s"'`]+/gi

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name)
      return entry.isDirectory() ? filesUnder(path) : [path]
    })
  )
  return files.flat()
}

function lineNumberFor(source, index) {
  return source.slice(0, index).split("\n").length
}

export async function findColourViolations(fileArguments = []) {
  const violations = []
  const files =
    fileArguments.length > 0
      ? fileArguments.map((file) => resolve(projectRoot, file))
      : await filesUnder(sourceRoot)

  for (const file of files) {
    if (!supportedExtensions.has(extname(file))) continue

    const projectPath = relative(projectRoot, file)
    if (excludedFiles.has(projectPath)) continue

    const source = await readFile(file, "utf8")
    const rules = [
      [rawHex, "raw hex colour"],
      [rawTailwindColour, "raw Tailwind palette colour"],
    ]

    // shadcn-owned primitives retain upstream state-specific dark variants.
    // Product and feature code must rely on semantic variables instead.
    if (!projectPath.startsWith("src/components/ui/")) {
      rules.push([manualDarkColour, "manual dark-mode colour override"])
    }

    for (const [pattern, label] of rules) {
      pattern.lastIndex = 0
      for (const match of source.matchAll(pattern)) {
        violations.push(
          `${projectPath}:${lineNumberFor(source, match.index)} ${label}: ${match[0]}`
        )
      }
    }
  }

  return violations
}

export async function runColourLint(fileArguments = []) {
  const violations = await findColourViolations(fileArguments)

  if (violations.length > 0) {
    console.error("Colour-system lint failed:\n")
    for (const violation of violations) console.error(`- ${violation}`)
    console.error(
      "\nUse semantic utilities or variables from docs/Colour_System.md. Define new colours only in src/styles.css."
    )
    return false
  }

  console.log("Colour-system lint passed.")
  return true
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const passed = await runColourLint(process.argv.slice(2))
  if (!passed) process.exitCode = 1
}
