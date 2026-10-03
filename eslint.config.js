//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"
import { plugin as shadcn } from "@shadcn/lint"

export default [
  { ignores: [".worktrees/**", ".output/**", ".vercel/**"] },
  ...tanstackConfig,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { shadcn },
    settings: {
      shadcn: {
        note: "Use the approved tokens in docs/Colour_System.md. Define new product colours only in src/styles.css and document them in the same change.",
      },
    },
    rules: {
      "shadcn/no-raw-colors": [
        "error",
        {
          message:
            '"{{className}}" is outside the EHRMS colour system. Use a declared semantic colour from {{file}}. {{suggestions}}',
        },
      ],
    },
  },
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  {
    ignores: ["eslint.config.js", ".prettierrc"],
  },
]
