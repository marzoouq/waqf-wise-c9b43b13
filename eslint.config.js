import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "src/__tests__/**", "**/*.test.ts", "**/*.test.tsx"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      // STRICT: منع استخدام any - يجب استخدام أنواع محددة
      // الاستثناءات المسموحة فقط مع eslint-disable-next-line
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["error", { 
        "allow": ["warn", "error", "info"] 
      }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
);
