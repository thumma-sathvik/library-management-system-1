import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescript from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: typescript.configs.recommended
});

export default [
  {
    plugins: {
      "@typescript-eslint": typescript
    },
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module"
      }
    }
  },
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [".next/*", "node_modules/*"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "off", // Turn off base rule as it can report incorrect errors
      "@next/next/no-img-element": "warn",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn"
    }
  }
];