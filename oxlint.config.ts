import { defineConfig } from "oxlint";

export default defineConfig({
  rules: {
    "typescript/no-explicit-any": "warn",
    "no-unused-vars": "warn",
  },
  ignorePatterns: ["website/**"],
});
