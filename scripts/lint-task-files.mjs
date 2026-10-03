import { access } from "node:fs/promises"
import { extname } from "node:path"
import { pathToFileURL } from "node:url"

import { ESLint } from "eslint"

import { runColourLint } from "./check-colour-system.mjs"

const colourExtensions = new Set([
  ".cjs",
  ".css",
  ".js",
  ".jsx",
  ".mjs",
  ".ts",
  ".tsx",
])
const eslintExtensions = new Set([".cjs", ".js", ".jsx", ".mjs", ".ts", ".tsx"])

export function classifyTaskFiles(fileArguments) {
  const uniqueFiles = [...new Set(fileArguments)]
  return {
    colourFiles: uniqueFiles.filter((file) =>
      colourExtensions.has(extname(file))
    ),
    eslintFiles: uniqueFiles.filter((file) =>
      eslintExtensions.has(extname(file))
    ),
  }
}

async function existingFiles(files) {
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        await access(file)
        return file
      } catch {
        return null
      }
    })
  )
  return results.filter(Boolean)
}

export async function lintTaskFiles(fileArguments) {
  const classified = classifyTaskFiles(fileArguments)
  const colourFiles = await existingFiles(classified.colourFiles)
  const eslintFiles = await existingFiles(classified.eslintFiles)

  if (colourFiles.length === 0 && eslintFiles.length === 0) {
    console.log("No lintable task files were supplied.")
    return true
  }

  const coloursPassed = await runColourLint(colourFiles)
  let eslintPassed = true

  if (eslintFiles.length > 0) {
    const eslint = new ESLint()
    const results = await eslint.lintFiles(eslintFiles)
    const formatter = await eslint.loadFormatter("stylish")
    const output = formatter.format(results)
    if (output) console.log(output)
    eslintPassed = results.every(
      (result) => result.errorCount === 0 && result.warningCount === 0
    )
  }

  return coloursPassed && eslintPassed
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const passed = await lintTaskFiles(process.argv.slice(2))
  if (!passed) process.exitCode = 1
}
