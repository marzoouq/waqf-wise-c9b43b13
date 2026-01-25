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
      
      // ═══════════════════════════════════════════════════════════════
      // 🚫 قواعد صارمة: منع استخدام any نهائياً
      // STRICT RULES: No 'any' type allowed - EVER
      // ═══════════════════════════════════════════════════════════════
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "off", // يتطلب type-checking
      "@typescript-eslint/no-unsafe-member-access": "off", // يتطلب type-checking
      "@typescript-eslint/no-unsafe-call": "off", // يتطلب type-checking
      "@typescript-eslint/no-unsafe-return": "off", // يتطلب type-checking
      
      // ═══════════════════════════════════════════════════════════════
      // 🏗️ قواعد جودة الكود
      // Code Quality Rules
      // ═══════════════════════════════════════════════════════════════
      "no-console": ["error", { "allow": ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "no-duplicate-imports": "error",
      
      // ═══════════════════════════════════════════════════════════════
      // 🚫 منع الدوال الفارغة
      // No empty functions allowed
      // ═══════════════════════════════════════════════════════════════
      "@typescript-eslint/no-empty-function": ["error", {
        "allow": ["arrowFunctions", "constructors", "decoratedFunctions"]
      }],
    },
  },
  // ═══════════════════════════════════════════════════════════════
  // 🧪 استثناءات للاختبارات وأدوات التطوير
  // Exceptions for tests and dev tools
  // ═══════════════════════════════════════════════════════════════
  {
    files: [
      "e2e/**/*.ts",
      "tests/**/*.ts", 
      "**/*.spec.ts",
      "src/lib/logger/**/*.ts",
      "src/lib/errors/**/*.ts",
      "src/lib/sw-cleanup.ts",
      "src/lib/query-invalidation-manager.ts",
      "src/lib/ux-verification.ts",
      "src/components/developer/**/*.{ts,tsx}",
      "src/services/monitoring/**/*.ts",
      "src/services/realtime*.ts",
      "src/integrations/supabase/request-interceptor.ts",
      "src/hooks/system/**/*.ts",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // ═══════════════════════════════════════════════════════════════
  // 📝 Edge Functions - تستخدم Deno runtime بقيود أنواع مختلفة
  // Edge Functions use Deno runtime with different type constraints
  // These functions run in a Deno environment which has different
  // type handling than standard TypeScript/Node.js
  // ═══════════════════════════════════════════════════════════════
  {
    files: ["supabase/functions/**/*.ts"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
);
